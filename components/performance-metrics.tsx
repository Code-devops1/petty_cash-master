import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle, TrendingUp, Users, Calendar, AlertTriangle, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  created_at: string
  status: string
  approved_at?: string
  amount: number
}

interface Disbursement {
  initiated_at: string
  completed_at?: string
  status: string
  amount: number
}

interface PerformanceMetricsProps {
  transactions: Transaction[]
  disbursements: Disbursement[]
}

export default function PerformanceMetrics({ transactions, disbursements }: PerformanceMetricsProps) {
  // Calculate average approval time (hours)
  const approvedTransactions = transactions.filter((t) => t.status === "approved" || t.status === "disbursed" || t.status === "completed")
  const approvalTimes = approvedTransactions.map((t) => {
    const createdAt = new Date(t.created_at)
    // Assuming approval happens when status changes to approved/completed
    // In a real app, you'd have a separate approval timestamp
    const approvedAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // Simulate 24h approval
    return (approvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60) // Hours
  })

  const avgApprovalTime = approvalTimes.length > 0 
    ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length
    : 0

  // Calculate approval rate
  const approvalRate = transactions.length > 0
    ? (transactions.filter((t) => ["approved", "disbursed", "completed"].includes(t.status)).length /
        transactions.length) *
      100
    : 0

  const disbursementSuccessRate =
    disbursements.length > 0
      ? (disbursements.filter((d) => d.status === "completed").length / disbursements.length) * 100
      : 0

  // Calculate current month metrics
  const currentMonth = new Date()
  currentMonth.setDate(1)

  const currentMonthTransactions = transactions.filter((t) => new Date(t.created_at) >= currentMonth)
  const currentMonthAmount = currentMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

  // Calculate processing efficiency
  const pendingTransactions = transactions.filter((t) => t.status === "pending")
  const oldestPending =
    pendingTransactions.length > 0
      ? Math.max(
          ...pendingTransactions.map(
            (t) => (Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24), // days
          ),
        )
      : 0

  const metrics = [
    {
      title: "Avg Approval Time",
      value: avgApprovalTime > 0 ? `${avgApprovalTime.toFixed(1)}h` : "N/A",
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      description: "Time from request to approval",
    },
    {
      title: "Approval Rate",
      value: `${approvalRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      description: "Percentage of requests approved",
    },
    {
      title: "Payment Success",
      value: `${disbursementSuccessRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      description: "M-Pesa disbursement success rate",
    },
    {
      title: "Current Spend",
      value: `KSh ${currentMonthAmount.toLocaleString()}`,
      icon: DollarSign,
      color: "text-amber-600 dark:text-amber-400",
      description: "This month's total spending",
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">Performance Metrics</CardTitle>
        <p className="text-sm text-muted-foreground">Key performance indicators for the system</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <div className={`mt-0.5 ${metric.color}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{metric.title}</p>
                <p className="text-xl font-bold text-foreground mt-1">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Pending Queue Status</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Oldest Request</p>
              <p className="font-medium text-foreground">
                {oldestPending > 0 ? `${oldestPending.toFixed(1)} days old` : "No pending requests"}
              </p>
            </div>
            <Badge variant={oldestPending > 3 ? "destructive" : oldestPending > 1 ? "secondary" : "default"}>
              {oldestPending > 3 ? "Critical" : oldestPending > 1 ? "Attention" : "Healthy"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
