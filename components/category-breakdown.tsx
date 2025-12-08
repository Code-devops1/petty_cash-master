"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { PieChart as PieChartIcon } from "lucide-react"

interface Transaction {
  amount: number
  expenditure_categories: { name: string } | null
  status: string
}

interface Category {
  name: string
  allocation_percentage: number
}

interface CategoryBreakdownProps {
  transactions: Transaction[]
  categories: Category[]
}

export default function CategoryBreakdown({ transactions, categories }: CategoryBreakdownProps) {
  // Aggregate spending by category
  const categoryTotals = categories.map(category => {
    const categoryTransactions = transactions.filter(
      t => t.expenditure_categories?.name === category.name && t.status !== "rejected"
    )
    
    const totalAmount = categoryTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    )
    
    return {
      name: category.name,
      amount: totalAmount,
      count: categoryTransactions.length
    }
  }).filter(category => category.amount > 0) // Only show categories with spending

  // Sort by amount descending
  categoryTotals.sort((a, b) => b.amount - a.amount)

  // Define colors for the chart
  const COLORS = ["#5483B3", "#7DA0CA", "#C1E844", "#052659", "#94a3b8"]

  function CustomLegend({ categories, colors }: { categories: any[], colors: string[] }) {
    return (
      <div className="flex flex-col space-y-2">
      {categories.map((category, index) => (
        <div key={category.name} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-sm text-foreground">{category.name}</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {((category.amount / categories.reduce((sum, cat) => sum + cat.amount, 0)) * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">Category Breakdown</CardTitle>
        <CardDescription className="text-muted-foreground">
          Spending distribution by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        {categoryTotals.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <PieChartIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No Category Data</h3>
            <p className="text-muted-foreground mt-1">
              Spending by category will appear here once you have approved transactions
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, "Amount"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem"
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    content={<CustomLegend categories={categoryTotals} colors={COLORS} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {categoryTotals.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="font-medium text-foreground">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.count} transactions</p>
                    </div>
                  </div>
                  <p className="font-medium text-foreground">KSh {category.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
