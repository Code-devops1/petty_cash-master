import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  reason: string
  description: string
  status: string
  created_at: string
  location?: string
  categories: { name: string } | null
  subcategories: { name: string } | null
  users: { full_name: string } | null
}

interface TransactionListProps {
  transactions: Transaction[]
}

const statusColors = {
  pending: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  disbursed: "bg-blue-100 text-blue-800",
  completed: "bg-slate-100 text-slate-800",
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-slate-500 mb-4">No transactions found</p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create Your First Request</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Description</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Category</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Date</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-slate-900">{transaction.reason || transaction.description}</p>
                      {transaction.location && <p className="text-sm text-slate-500">Location: "{transaction.location}"</p>}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-900">
                    KSh {Number(transaction.amount).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-slate-600">{transaction.categories?.name || "N/A"}</td>
                  <td className="py-4 px-6">
                    <Badge className={statusColors[transaction.status as keyof typeof statusColors]}>
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{new Date(transaction.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}