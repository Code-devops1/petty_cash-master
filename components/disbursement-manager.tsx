"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, XCircle, Clock, Smartphone, AlertTriangle, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Transaction {
  id: string
  amount: number
  quantity: number
  total_amount: number
  reason: string
  status: string
  mpesa_receipt_id: string | null
  mpesa_request_id: string | null
  created_at: string
  updated_at: string
  user_id: string
  category_id: string
  subcategory_id: string | null
  route_id: string | null
  categories: { name: string } | null
  description: string
  users: {
    full_name: string
    phone_number: string | null
    employee_id: string | null
  }
}

interface DisbursementManagerProps {
  userRole: string
}

export default function DisbursementManager({ userRole }: DisbursementManagerProps) {
  const [approvedTransactions, setApprovedTransactions] = useState<Transaction[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchApprovedTransactions()
  }, [])

  const fetchApprovedTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          users!transactions_user_id_fkey(full_name, phone_number, employee_id),
          expenditure_categories(name)
        `)
        .eq("status", "approved")
        .order("approved_at", { ascending: true })

      if (error) throw error

      setApprovedTransactions(data as Transaction[])
    } catch (error) {
      console.error("Error fetching approved transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionSelect = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions((prev) => [...prev, transactionId])
    } else {
      setSelectedTransactions((prev) => prev.filter((id) => id !== transactionId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(approvedTransactions.map((t) => t.id))
    } else {
      setSelectedTransactions([])
    }
  }

  const initiateDisbursements = async () => {
    if (selectedTransactions.length === 0) return

    setProcessing(true)
    try {
      const response = await fetch("/api/disbursements/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionIds: selectedTransactions,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Disbursement initiated for ${result.summary.successful} transactions. ${result.summary.failed} failed.`)
        setSelectedTransactions([])
        fetchApprovedTransactions()
      } else {
        alert(`Failed to initiate disbursements: ${result.error}`)
      }
    } catch (error) {
      console.error("Error initiating disbursements:", error)
      alert("Failed to initiate disbursements")
    } finally {
      setProcessing(false)
    }
  }

  const isValidPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return false
    const cleaned = phoneNumber.replace(/\D/g, "")
    return /^(254|0)[17]\d{8}$/.test(cleaned)
  }

  const getPhoneNumberStatus = (phoneNumber: string) => {
    if (!phoneNumber) {
      return { valid: false, message: "No phone number" }
    }
    if (isValidPhoneNumber(phoneNumber)) {
      return { valid: true, message: "Valid" }
    }
    return { valid: false, message: "Invalid format" }
  }

  if (!["finance_admin", "super_admin"].includes(userRole)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-muted-foreground">You don't have permission to manage disbursements.</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading approved transactions...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>M-Pesa Disbursement Manager</span>
          </CardTitle>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground">
              {selectedTransactions.length} of {approvedTransactions.length} selected
            </span>
            <Button
              onClick={initiateDisbursements}
              disabled={selectedTransactions.length === 0 || processing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {processing ? "Processing..." : "Initiate Disbursements"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {approvedTransactions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-muted-foreground">No approved transactions pending disbursement</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center space-x-2 pb-2 border-b border-border">
              <Checkbox
                checked={selectedTransactions.length === approvedTransactions.length}
                onCheckedChange={handleSelectAll}
              />
              <label className="text-sm font-medium">Select All</label>
            </div>

            {/* Transaction List */}
            {approvedTransactions.map((transaction) => {
              const phoneStatus = getPhoneNumberStatus(transaction.users.phone_number || "")
              const isSelected = selectedTransactions.includes(transaction.id)

              return (
                <div
                  key={transaction.id}
                  className={`border border-border rounded-lg p-4 ${isSelected ? "bg-blue-50 border-blue-300" : ""}`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleTransactionSelect(transaction.id, checked as boolean)}
                      disabled={!phoneStatus.valid}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">User Information Unavailable</h3>
                          <p className="text-sm text-muted-foreground">
                            Employee ID N/A • {transaction.categories?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">KSh {transaction.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{transaction.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Phone:</span>
                          <span className="text-sm font-mono">{transaction.users.phone_number || "Not provided"}</span>
                          <Badge
                            className={`text-xs ${
                              phoneStatus.valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {phoneStatus.message}
                          </Badge>
                        </div>
                        {!phoneStatus.valid && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs">Cannot disburse</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
