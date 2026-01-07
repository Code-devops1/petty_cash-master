"use server"

import { createMpesaService } from "./mpesa-service"
import { createClient } from "@/lib/supabase/server"

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
    await (supabase
      .from("disbursements") as any)
      .update({
        status,
        completed_at: new Date().toISOString(),
        mpesa_response: { ...disbursement.mpesa_response, callback: callbackData },
        error_message: resultCode !== 0 ? resultDesc : null,
      })
      .eq("id", disbursement.id)

    // Update transaction status
    if (resultCode === 0) {
      await (supabase.from("transactions") as any).update({ status: "completed" }).eq("id", disbursement.transaction_id)

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
