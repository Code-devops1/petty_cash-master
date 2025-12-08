import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, TrendingUp, TrendingDown, Smartphone, CheckCircle, XCircle } from "lucide-react"

interface AdminStatsProps {
  totalTransactions: number
  totalAmount: number
  pendingAmount: number
  approvedAmount: number
  totalDisbursements: number
  completedDisbursements: number
  failedDisbursements: number
}

export default function AdminStats({
  totalTransactions,
  totalAmount,
  pendingAmount,
  approvedAmount,
  totalDisbursements,
  completedDisbursements,
  failedDisbursements,
}: AdminStatsProps) {
  const successRate = totalDisbursements > 0 ? (completedDisbursements / totalDisbursements) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Transactions</CardTitle>
          <FileText className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{totalTransactions}</div>
          <p className="text-xs text-slate-500 mt-1">All time requests</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">KSh {totalAmount.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">All requests combined</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pending Approval</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">KSh {pendingAmount.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Awaiting your review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Approved Amount</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">KSh {approvedAmount.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Approved & disbursed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">M-Pesa Disbursements</CardTitle>
          <Smartphone className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalDisbursements}</div>
          <p className="text-xs text-slate-500 mt-1">Payment attempts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
          <p className="text-xs text-slate-500 mt-1">{completedDisbursements} successful</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Failed Payments</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{failedDisbursements}</div>
          <p className="text-xs text-slate-500 mt-1">Require attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Approval Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {totalTransactions > 0 ? ((approvedAmount / totalAmount) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">By amount approved</p>
        </CardContent>
      </Card>
    </div>
  )
}
