"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Clock, CheckCircle, XCircle, DollarSign, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  amount: number
  description: string
  status: string
  created_at: string
  category: { name: string }
}

interface EmployeeDashboardProps {
  userId: string
}

export default function EmployeeDashboard({ userId }: EmployeeDashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    thisMonth: 0,
    totalAmount: 0,
    approvedAmount: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchTransactions()
  }, [userId])

  const fetchTransactions = async () => {
    try {
      const { data, error }: { data: RawTransaction[] | null; error: any } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          description,
          status,
          created_at,
          categories (name)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      // Transform the data to match the Transaction interface
      const transformedData = data?.map(item => ({
        id: item.id,
        amount: item.amount,
        description: item.description,
        status: item.status,
        created_at: item.created_at,
        category: item.categories && item.categories.length > 0 ? { name: item.categories[0].name } : { name: '' }
      })) || []

      setTransactions(transformedData)

      const total = transformedData?.length || 0
      const pending = transformedData?.filter((t) => t.status === "pending").length || 0
      const approved = transformedData?.filter((t) => t.status === "approved" || t.status === "disbursed").length || 0
      const thisMonth =
        transformedData?.filter((t) => {
          const transactionDate = new Date(t.created_at)
          const now = new Date()
          return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()
        }).length || 0

      const totalAmount = transformedData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
      const approvedAmount =
        transformedData
          ?.filter((t) => t.status === "approved" || t.status === "disbursed")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0

      setStats({ total, pending, approved, thisMonth, totalAmount, approvedAmount })
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "approved":
      case "disbursed":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline"
      case "approved":
      case "disbursed":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">KSh {stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total requested</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">KSh {stats.approvedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.approved} requests approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Quick Actions</CardTitle>
          <CardDescription>Submit a new petty cash request quickly and easily</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/expense/new" className="flex-1">
              <Button className="w-full h-12 text-base">
                <Plus className="h-5 w-5 mr-2" />
                New Expense Request
              </Button>
            </Link>
            <Link href="/dashboard/transactions" className="flex-1">
              <Button variant="outline" className="w-full h-12 text-base bg-transparent">
                <Eye className="h-5 w-5 mr-2" />
                View All Requests
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Your latest petty cash requests and their status</CardDescription>
          </div>
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                <p className="text-muted-foreground mb-4">Submit your first petty cash request to get started!</p>
                <Link href="/dashboard/expense/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Request
                  </Button>
                </Link>
              </div>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.category?.name} • {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-lg">KSh {transaction.amount.toLocaleString()}</span>
                        <Badge variant={getStatusVariant(transaction.status)}>{transaction.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Define the shape of raw data from Supabase
interface RawTransaction {
  id: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  categories: Array<{ name: string }> | null;
}
