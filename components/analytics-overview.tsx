import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface Transaction {
  amount: number
  status: string
  created_at: string
}

interface Disbursement {
  amount: number
  status: string
  initiated_at: string
}

interface AnalyticsOverviewProps {
  transactions: Transaction[]
  disbursements: Disbursement[]
}

export default function AnalyticsOverview({ transactions, disbursements }: AnalyticsOverviewProps) {
  // Calculate current month vs previous month
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const currentMonthTransactions = transactions.filter((t) => new Date(t.created_at) >= currentMonth)
  const previousMonthTransactions = transactions.filter(
    (t) => new Date(t.created_at) >= previousMonth && new Date(t.created_at) < currentMonth,
  )

  const currentMonthAmount = currentMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
  const previousMonthAmount = previousMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

  const monthlyGrowth =
    previousMonthAmount > 0 ? ((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100 : 0

  // Calculate other metrics
  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
  const approvedAmount = transactions
    .filter((t) => ["approved", "disbursed", "completed"].includes(t.status.toLowerCase()))
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const approvalRate = totalAmount > 0 ? (approvedAmount / totalAmount) * 100 : 0

  const avgTransactionAmount = transactions.length > 0 ? totalAmount / transactions.length : 0

  const disbursementSuccessRate =
    disbursements.length > 0
      ? (disbursements.filter((d) => d.status === "completed").length / disbursements.length) * 100
      : 0

  // Fix: Count pending requests with case-insensitive comparison
  const pendingCount = transactions.filter((t) => t.status.toLowerCase() === "pending").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Monthly Spending</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">KSh {currentMonthAmount.toLocaleString()}</div>
          <div className="flex items-center space-x-1 text-xs mt-1">
            {monthlyGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={monthlyGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {Math.abs(monthlyGrowth).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{approvalRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">KSh {approvedAmount.toLocaleString()} approved</p>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Transaction</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">KSh {avgTransactionAmount.toLocaleString()}</div>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">{transactions.length} total requests</p>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Pending Requests</CardTitle>
          <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{pendingCount}</div>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Awaiting approval</p>
        </CardContent>
      </Card>
    </div>
  )
}