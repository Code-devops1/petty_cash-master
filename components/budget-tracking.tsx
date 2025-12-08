import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"

interface BudgetLimit {
  monthly_limit: number
  current_spent: number
  expenditure_categories: { name: string } | null
  users: { full_name: string } | null
}

interface Transaction {
  amount: number
  expenditure_categories: { name: string } | null
  created_at: string
  status: string
}

interface BudgetTrackingProps {
  budgetLimits: BudgetLimit[]
  transactions: Transaction[]
}

export default function BudgetTracking({ budgetLimits, transactions }: BudgetTrackingProps) {
  // Calculate current month spending by category
  const currentMonth = new Date()
  currentMonth.setDate(1)

  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.created_at) >= currentMonth && ["approved", "disbursed", "completed"].includes(t.status),
  )

  const budgetData = budgetLimits.map((budget) => {
    const categorySpending = currentMonthTransactions
      .filter((t) => t.expenditure_categories?.name === budget.expenditure_categories?.name)
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const utilizationRate = budget.monthly_limit > 0 ? (categorySpending / budget.monthly_limit) * 100 : 0

    return {
      category: budget.expenditure_categories?.name || "Unknown",
      user: budget.users?.full_name,
      limit: budget.monthly_limit,
      spent: categorySpending,
      remaining: Math.max(0, budget.monthly_limit - categorySpending),
      utilizationRate,
      status: utilizationRate >= 90 ? "danger" : utilizationRate >= 75 ? "warning" : "good",
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "danger":
        return "bg-red-500 dark:bg-red-600"
      case "warning":
        return "bg-orange-500 dark:bg-orange-600"
      default:
        return "bg-green-500 dark:bg-green-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Budget Tracking</CardTitle>
        <p className="text-sm text-muted-foreground">Current month budget utilization by category</p>
      </CardHeader>
      <CardContent>
        {budgetData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No budget limits configured</p>
          </div>
        ) : (
          <div className="space-y-6">
            {budgetData.map((budget, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(budget.status)}
                    <div>
                      <p className="font-medium text-slate-900">{budget.category}</p>
                      {budget.user && <p className="text-sm text-slate-500">{budget.user}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      KSh {budget.spent.toLocaleString()} / {budget.limit.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">{budget.utilizationRate.toFixed(1)}% used</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={Math.min(budget.utilizationRate, 100)} className="h-2" />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>KSh {budget.remaining.toLocaleString()} remaining</span>
                    <span>
                      {budget.utilizationRate >= 100
                        ? "Over budget"
                        : budget.utilizationRate >= 90
                          ? "Near limit"
                          : "Within budget"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
