"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, User, MapPin, Calendar } from "lucide-react"

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
  location?: string
  transaction_type: string
  users: {
    full_name: string
  } | null
}

interface TransactionApprovalCardProps {
  transaction: Transaction
  onApprove: (transactionId: string, approved: boolean, rejectionReason?: string) => Promise<void>
}

const statusColors = {
  pending: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  disbursed: "bg-blue-100 text-blue-800",
  completed: "bg-slate-100 text-slate-800",
}

export default function TransactionApprovalCard({ transaction, onApprove }: TransactionApprovalCardProps) {
  const [loading, setLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const handleApprove = async () => {
    setLoading(true)
    try {
      await onApprove(transaction.id, true)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    setLoading(true)
    try {
      await onApprove(transaction.id, false, rejectionReason)
      setShowRejectForm(false)
      setRejectionReason("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-slate-900">{transaction.description}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{transaction.users?.full_name}</span>
              </div>
              {transaction.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{transaction.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Badge className={statusColors[transaction.status as keyof typeof statusColors]}>{transaction.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Amount</p>
            <p className="font-semibold text-slate-900">KSh {Number(transaction.amount).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">Category</p>
            <p className="font-semibold text-slate-900">{transaction.categories?.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Type</p>
            <p className="font-semibold text-slate-900 capitalize">{transaction.transaction_type}</p>
          </div>
          <div>
            <p className="text-slate-500">User</p>
            <p className="font-semibold text-slate-900">{transaction.users?.full_name || "N/A"}</p>
          </div>
        </div>

        {transaction.status === "pending" && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {!showRejectForm ? (
              <div className="flex space-x-3">
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Disburse
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  disabled={loading}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-white border-slate-300"
                  rows={3}
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleReject}
                    disabled={loading || !rejectionReason.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectForm(false)
                      setRejectionReason("")
                    }}
                    disabled={loading}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {transaction.status !== "pending" && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>
                {transaction.status === "approved" && "Approved - Payment processing"}
                {transaction.status === "disbursed" && "Payment sent via M-Pesa"}
                {transaction.status === "completed" && "Payment completed successfully"}
                {transaction.status === "rejected" && "Request rejected"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
