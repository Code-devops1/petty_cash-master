"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart3 } from "lucide-react"

interface Transaction {
  amount: number
  created_at: string
  status: string
}

interface SpendingTrendsProps {
  transactions: Transaction[]
}

export default function SpendingTrends({ transactions }: SpendingTrendsProps) {
  // Group transactions by date (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentTransactions = transactions.filter(
    t => new Date(t.created_at) >= thirtyDaysAgo && t.status !== "rejected"
  )

  // Group by date and calculate daily totals
  const dailyTotals: { [key: string]: number } = {}
  
  recentTransactions.forEach(transaction => {
    const date = new Date(transaction.created_at).toISOString().split('T')[0]
    if (!dailyTotals[date]) {
      dailyTotals[date] = 0
    }
    dailyTotals[date] += Number(transaction.amount)
  })

  // Create array of last 30 days
  const dates = []
  const currentDate = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split('T')[0]
    dates.push({
      date: dateString,
      amount: dailyTotals[dateString] || 0
    })
  }

  // Calculate average daily spending
  const totalSpent = Object.values(dailyTotals).reduce((sum, amount) => sum + amount, 0)
  const avgDailySpending = totalSpent / 30

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">Spending Trend</CardTitle>
        <CardDescription className="text-muted-foreground">
          Daily spending over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No Spending Data</h3>
            <p className="text-muted-foreground mt-1">
              Your spending trend will appear here once you have approved transactions
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dates}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `KSh${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                />
                <Tooltip 
                  formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, "Amount"]}
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Average: </span>
                  <span className="text-sm font-medium text-foreground">KSh {avgDailySpending.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
