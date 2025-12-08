import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  amount: number
  description: string
  status: string
  created_at: string
  expenditure_categories: { name: string } | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const statusColors = {
  pending: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  disbursed: "bg-blue-100 text-blue-800",
  completed: "bg-slate-100 text-slate-800",
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900">Recent Transactions</CardTitle>
        <Link href="/dashboard/transactions">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No transactions yet</p>
            <Link href="/dashboard/transactions/new">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Create Your First Request</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-slate-900">{transaction.description}</h3>
                    <Badge className={statusColors[transaction.status as keyof typeof statusColors]}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span>KSh {Number(transaction.amount).toLocaleString()}</span>
                    <span>{transaction.expenditure_categories?.name}</span>
                    <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
