"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TransactionApprovalCard from "@/components/transaction-approval-card"
import { AlertCircle } from "lucide-react"

interface Transaction {
  id: string
  user_id: string
  category_id: string
  amount: number
  description: string
  receipt_url?: string | null
  location?: string | null
  transaction_type: string
  status: string
  approved_by?: string | null
  approved_at?: string | null
  rejection_reason?: string | null
  created_at: string
  updated_at: string
  users: {
    full_name: string
    department?: string
  } | null
  expenditure_categories?: { name: string } | null
}

interface PendingApprovalsProps {
  transactions: Transaction[]
}

function PendingApprovals({ transactions: initialTransactions }: PendingApprovalsProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [loading, setLoading] = useState<string | null>(null)

  const handleApproval = async (transactionId: string, approved: boolean, rejectionReason?: string) => {
    setLoading(transactionId)

    try {
      const response = await fetch("/api/transactions/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          approved,
          rejectionReason,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process approval")
      }

      const result = await response.json()

      // Remove the transaction from the pending list
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId))

      // Show success message
      alert(result.message)
    } catch (error) {
      console.error("Approval error:", error)
      alert("Failed to process approval. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No pending approvals</p>
          <p className="text-sm text-slate-400 mt-2">All transactions have been processed</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">Pending Approvals</h2>
        <div className="text-sm text-slate-600">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} awaiting approval
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className={loading === transaction.id ? "opacity-50 pointer-events-none" : ""}>
            <TransactionApprovalCard transaction={transaction} onApprove={handleApproval} />
          </div>
        ))}
      </div>
    </div>
  )
}

export { PendingApprovals }
export default PendingApprovals