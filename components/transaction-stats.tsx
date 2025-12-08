import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Clock } from "lucide-react"

interface TransactionStatsProps {
  totalRequested: number
  totalApproved: number
  pendingCount: number
}

export default function TransactionStats({ totalRequested, totalApproved, pendingCount }: TransactionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Requested</CardTitle>
          <DollarSign className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">KSh {totalRequested.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">All time requests</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Approved</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">KSh {totalApproved.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Approved & disbursed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
        </CardContent>
      </Card>
    </div>
  )
}
