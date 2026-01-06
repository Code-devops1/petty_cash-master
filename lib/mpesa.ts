"use server"

import { createClient } from "@/lib/supabase/server"

// M-Pesa API configuration
const MPESA_BASE_URL = process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke"
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET
const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || "174379"
const PASSKEY = process.env.MPESA_PASSKEY
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "https://your-app.vercel.app/api/mpesa/callback"

interface MpesaTokenResponse {
  access_token: string
  expires_in: string
}

interface MpesaB2CResponse {
  ConversationID: string
  OriginatorConversationID: string
  ResponseCode: string
  ResponseDescription: string
}

interface MpesaServiceConfig {
  consumerKey: string
  consumerSecret: string
  businessShortCode: string
  passkey: string
  callbackUrl: string
  baseUrl?: string
}

class MpesaService {
  private config: MpesaServiceConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: MpesaServiceConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || MPESA_BASE_URL,
    }
  }

  // Get M-Pesa access token
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString("base64")

    const response = await fetch(`${this.config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get M-Pesa token")
    }

    const data: MpesaTokenResponse = await response.json()
    this.accessToken = data.access_token

    // Set expiry time (usually 1 hour, but we'll refresh 5 minutes early)
    this.tokenExpiry = new Date(Date.now() + (Number.parseInt(data.expires_in) - 300) * 1000)

    return this.accessToken
  }

  // Generate security credential for B2C
  private generateSecurityCredential(): string {
    // In production, this should be properly encrypted using M-Pesa public key
    // For demo purposes, using a placeholder
    return "PLACEHOLDER_SECURITY_CREDENTIAL"
  }

  // Initiate B2C payment
  async initiateDisbursement(
    transactionId: string,
    phoneNumber: string,
    amount: number,
    remarks: string,
  ): Promise<{ success: boolean; message: string; mpesaResponse?: any }> {
    try {
      const supabase = createClient()

      // Validate and format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber)
      if (!isValidKenyanPhoneNumber(formattedPhone)) {
        throw new Error("Invalid phone number format")
      }

      // Get M-Pesa access token
      const accessToken = await this.getAccessToken()

      // Generate timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, -3)

      // Prepare B2C request
      const b2cPayload = {
        InitiatorName: "testapi",
        SecurityCredential: this.generateSecurityCredential(),
        CommandID: "BusinessPayment",
        Amount: amount,
        PartyA: this.config.businessShortCode,
        PartyB: formattedPhone,
        Remarks: remarks,
        QueueTimeOutURL: `${this.config.callbackUrl}/timeout`,
        ResultURL: `${this.config.callbackUrl}/result`,
        Occasion: `Transaction ${transactionId}`,
      }

      // Make B2C request
      const b2cResponse = await fetch(`${this.config.baseUrl}/mpesa/b2c/v1/paymentrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(b2cPayload),
      })

      const responseData: MpesaB2CResponse = await b2cResponse.json()

      // Record disbursement attempt
      const { error: disbursementError } = await supabase.from("disbursements").insert({
        transaction_id: transactionId,
        phone_number: formattedPhone,
        amount: amount,
        status: responseData.ResponseCode === "0" ? "processing" : "failed",
        mpesa_response: responseData,
        initiated_at: new Date().toISOString(),
        error_message: responseData.ResponseCode !== "0" ? responseData.ResponseDescription : null,
      })

      if (disbursementError) {
        console.error("Failed to record disbursement:", disbursementError)
      }

      // Update transaction status
      if (responseData.ResponseCode === "0") {
        await supabase.from("transactions").update({ status: "disbursed" }).eq("id", transactionId)

        return {
          success: true,
          message: "Disbursement initiated successfully",
          mpesaResponse: responseData,
        }
      } else {
        return {
          success: false,
          message: responseData.ResponseDescription || "Failed to initiate disbursement",
          mpesaResponse: responseData,
        }
      }
    } catch (error) {
      console.error("M-Pesa disbursement error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Process bulk disbursements (up to 5,000 transactions)
  async processBulkDisbursements(
    transactions: Array<{
      transactionId: string
      phoneNumber: string
      amount: number
      remarks: string
    }>,
  ): Promise<Array<{ success: boolean; message: string; transactionId: string }>> {
    const results = []
    const batchSize = 100

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      const batchPromises = batch.map(async (transaction) => {
        const result = await this.initiateDisbursement(
          transaction.transactionId,
          transaction.phoneNumber,
          transaction.amount,
          transaction.remarks,
        )
        return {
          ...result,
          transactionId: transaction.transactionId,
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      results.push(
        ...batchResults.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : {
                success: false,
                message: "Processing failed",
                transactionId: "unknown",
              },
        ),
      )

      if (i + batchSize < transactions.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  // Query transaction status
  async queryTransactionStatus(transactionId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()

      const queryPayload = {
        Initiator: "testapi",
        SecurityCredential: this.generateSecurityCredential(),
        CommandID: "TransactionStatusQuery",
        TransactionID: transactionId,
        PartyA: this.config.businessShortCode,
        IdentifierType: "1",
        ResultURL: `${this.config.callbackUrl}/query-result`,
        QueueTimeOutURL: `${this.config.callbackUrl}/query-timeout`,
        Remarks: "Transaction status query",
        Occasion: "Status check",
      }

      const response = await fetch(`${this.config.baseUrl}/mpesa/transactionstatus/v1/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryPayload),
      })

      return await response.json()
    } catch (error) {
      console.error("Error querying transaction status:", error)
      throw error
    }
  }
}

// Utility functions for phone number validation and formatting
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleanPhone = phoneNumber.replace(/\D/g, "")

  // Format to Kenyan international format
  if (cleanPhone.startsWith("254")) {
    return cleanPhone
  } else if (cleanPhone.startsWith("0")) {
    return "254" + cleanPhone.substring(1)
  } else if (cleanPhone.length === 9) {
    return "254" + cleanPhone
  } else {
    return cleanPhone
  }
}

export function isValidKenyanPhoneNumber(phoneNumber: string): boolean {
  const cleanPhone = phoneNumber.replace(/\D/g, "")

  // Check if it's a valid Kenyan number format
  const kenyanMobileRegex = /^254[71]\d{8}$/

  return kenyanMobileRegex.test(cleanPhone)
}

// Factory function to create M-Pesa service instance
export function createMpesaService(config?: Partial<MpesaServiceConfig>): MpesaService {
  const defaultConfig: MpesaServiceConfig = {
    consumerKey: CONSUMER_KEY || "",
    consumerSecret: CONSUMER_SECRET || "",
    businessShortCode: BUSINESS_SHORT_CODE || "",
    passkey: PASSKEY || "",
    callbackUrl: CALLBACK_URL || "",
    baseUrl: MPESA_BASE_URL,
  }

  return new MpesaService({ ...defaultConfig, ...config })
}
"use server"

import { createClient } from "@/lib/supabase/server"

// M-Pesa API configuration
const MPESA_BASE_URL = process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke"
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET
const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || "174379"
const PASSKEY = process.env.MPESA_PASSKEY
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "https://your-app.vercel.app/api/mpesa/callback"

interface MpesaTokenResponse {
  access_token: string
  expires_in: string
}

interface MpesaB2CResponse {
  ConversationID: string
  OriginatorConversationID: string
  ResponseCode: string
  ResponseDescription: string
}

interface MpesaServiceConfig {
  consumerKey: string
  consumerSecret: string
  businessShortCode: string
  passkey: string
  callbackUrl: string
  baseUrl?: string
}

class MpesaService {
  private config: MpesaServiceConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: MpesaServiceConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || MPESA_BASE_URL,
    }
  }

  // Get M-Pesa access token
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString("base64")

    const response = await fetch(`${this.config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get M-Pesa token")
    }

    const data: MpesaTokenResponse = await response.json()
    this.accessToken = data.access_token

    // Set expiry time (usually 1 hour, but we'll refresh 5 minutes early)
    this.tokenExpiry = new Date(Date.now() + (Number.parseInt(data.expires_in) - 300) * 1000)

    return this.accessToken
  }

  // Generate security credential for B2C
  private generateSecurityCredential(): string {
    // In production, this should be properly encrypted using M-Pesa public key
    // For demo purposes, using a placeholder
    return "PLACEHOLDER_SECURITY_CREDENTIAL"
  }

  // Initiate B2C payment
  async initiateDisbursement(
    transactionId: string,
    phoneNumber: string,
    amount: number,
    remarks: string,
  ): Promise<{ success: boolean; message: string; mpesaResponse?: any }> {
    try {
      const supabase = createClient()

      // Validate and format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber)
      if (!isValidKenyanPhoneNumber(formattedPhone)) {
        throw new Error("Invalid phone number format")
      }

      // Get M-Pesa access token
      const accessToken = await this.getAccessToken()

      // Generate timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, -3)

      // Prepare B2C request
      const b2cPayload = {
        InitiatorName: "testapi", // This should be your actual initiator name
        SecurityCredential: this.generateSecurityCredential(),
        CommandID: "BusinessPayment",
        Amount: amount,
        PartyA: this.config.businessShortCode,
        PartyB: formattedPhone,
        Remarks: remarks,
        QueueTimeOutURL: `${this.config.callbackUrl}/timeout`,
        ResultURL: `${this.config.callbackUrl}/result`,
        Occasion: `Transaction ${transactionId}`,
      }

      // Make B2C request
      const b2cResponse = await fetch(`${this.config.baseUrl}/mpesa/b2c/v1/paymentrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(b2cPayload),
      })

      const responseData: MpesaB2CResponse = await b2cResponse.json()

      // Record disbursement attempt
      const { error: disbursementError } = await supabase.from("disbursements").insert({
        transaction_id: transactionId,
        phone_number: formattedPhone,
        amount: amount,
        status: responseData.ResponseCode === "0" ? "processing" : "failed",
        mpesa_response: responseData,
        initiated_at: new Date().toISOString(),
        error_message: responseData.ResponseCode !== "0" ? responseData.ResponseDescription : null,
      })

      if (disbursementError) {
        console.error("Failed to record disbursement:", disbursementError)
      }

      // Update transaction status
      if (responseData.ResponseCode === "0") {
        await supabase.from("transactions").update({ status: "disbursed" }).eq("id", transactionId)

        return {
          success: true,
          message: "Disbursement initiated successfully",
          mpesaResponse: responseData,
        }
      } else {
        return {
          success: false,
          message: responseData.ResponseDescription || "Failed to initiate disbursement",
          mpesaResponse: responseData,
        }
      }
    } catch (error) {
      console.error("M-Pesa disbursement error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Process bulk disbursements (up to 5,000 transactions)
  async processBulkDisbursements(
    transactions: Array<{
      transactionId: string
      phoneNumber: string
      amount: number
      remarks: string
    }>,
  ): Promise<Array<{ success: boolean; message: string; transactionId: string }>> {
    const results = []
    const batchSize = 100 // Process in smaller batches to avoid overwhelming the API

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      const batchPromises = batch.map(async (transaction) => {
        const result = await this.initiateDisbursement(
          transaction.transactionId,
          transaction.phoneNumber,
          transaction.amount,
          transaction.remarks,
        )
        return {
          ...result,
          transactionId: transaction.transactionId,
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      results.push(
        ...batchResults.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : {
                success: false,
                message: "Processing failed",
                transactionId: "unknown",
              },
        ),
      )

      // Add delay between batches to respect API rate limits
      if (i + batchSize < transactions.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  // Query transaction status
  async queryTransactionStatus(transactionId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()

      const queryPayload = {
        Initiator: "testapi",
        SecurityCredential: this.generateSecurityCredential(),
        CommandID: "TransactionStatusQuery",
        TransactionID: transactionId,
        PartyA: this.config.businessShortCode,
        IdentifierType: "1",
        ResultURL: `${this.config.callbackUrl}/query-result`,
        QueueTimeOutURL: `${this.config.callbackUrl}/query-timeout`,
        Remarks: "Transaction status query",
        Occasion: "Status check",
      }

      const response = await fetch(`${this.config.baseUrl}/mpesa/transactionstatus/v1/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryPayload),
      })

      return await response.json()
    } catch (error) {
      console.error("Error querying transaction status:", error)
      throw error
    }
  }
}

// Utility functions for phone number validation and formatting
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleanPhone = phoneNumber.replace(/\D/g, "")

  // Format to Kenyan international format
  if (cleanPhone.startsWith("254")) {
    return cleanPhone
  } else if (cleanPhone.startsWith("0")) {
    return "254" + cleanPhone.substring(1)
  } else if (cleanPhone.length === 9) {
    return "254" + cleanPhone
  } else {
    return cleanPhone // Return as-is if format is unclear
  }
}

export function isValidKenyanPhoneNumber(phoneNumber: string): boolean {
  const cleanPhone = phoneNumber.replace(/\D/g, "")

  // Check if it's a valid Kenyan number format
  // Kenyan numbers: 254XXXXXXXXX (12 digits total)
  // Mobile networks: 254 7XX XXX XXX or 254 1XX XXX XXX
  const kenyanMobileRegex = /^254[71]\d{8}$/

  return kenyanMobileRegex.test(cleanPhone)
}

// Factory function to create M-Pesa service instance
export function createMpesaService(config?: Partial<MpesaServiceConfig>): MpesaService {
  const defaultConfig: MpesaServiceConfig = {
    consumerKey: CONSUMER_KEY || "",
    consumerSecret: CONSUMER_SECRET || "",
    businessShortCode: BUSINESS_SHORT_CODE || "",
    passkey: PASSKEY || "",
    callbackUrl: CALLBACK_URL || "",
    baseUrl: MPESA_BASE_URL,
  }

  return new MpesaService({ ...defaultConfig, ...config })
}

// Legacy function for backward compatibility
export async function initiateMpesaDisbursement(
  transactionId: string,
  phoneNumber: string,
  amount: number,
  remarks: string,
): Promise<{ success: boolean; message: string; mpesaResponse?: any }> {
  const mpesaService = createMpesaService()
  return mpesaService.initiateDisbursement(transactionId, phoneNumber, amount, remarks)
}

// Process M-Pesa callback
export async function processMpesaCallback(callbackData: any): Promise<void> {
  const supabase = createClient()

  try {
    const result = callbackData.Result
    const resultCode = result.ResultCode
    const resultDesc = result.ResultDesc
    const transactionId = result.TransactionID

    // Find disbursement record
    const { data: disbursement } = await supabase
      .from("disbursements")
      .select("*")
      .eq("mpesa_transaction_id", transactionId)
      .single()

    if (!disbursement) {
      console.error("Disbursement not found for transaction:", transactionId)
      return
    }

    // Update disbursement status
    const status = resultCode === 0 ? "completed" : "failed"
    await supabase
      .from("disbursements")
      .update({
        status,
        completed_at: new Date().toISOString(),
        mpesa_response: { ...disbursement.mpesa_response, callback: callbackData },
        error_message: resultCode !== 0 ? resultDesc : null,
      })
      .eq("id", disbursement.id)

    // Update transaction status
    if (resultCode === 0) {
      await supabase.from("transactions").update({ status: "completed" }).eq("id", disbursement.transaction_id)

      // Create notification
      await supabase.from("notifications").insert({
        user_id: disbursement.user_id,
        title: "Payment Completed",
        message: `Your payment of KSh ${disbursement.amount} has been successfully sent to ${disbursement.phone_number}`,
        type: "success",
        related_transaction_id: disbursement.transaction_id,
      })
    } else {
      // Create failure notification
      await supabase.from("notifications").insert({
        user_id: disbursement.user_id,
        title: "Payment Failed",
        message: `Payment of KSh ${disbursement.amount} failed: ${resultDesc}`,
        type: "error",
        related_transaction_id: disbursement.transaction_id,
      })
    }
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error)
  }
}
