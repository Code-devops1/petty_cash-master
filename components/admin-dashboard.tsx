"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { PendingApprovals } from "./pending-approvals"
import { RecentActivity } from "./recent-activity"

interface AdminStats {
  totalTransactions: number
  pendingApprovals: number
  totalDisbursed: number
  thisMonthSpending: number
  approvalRate: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalTransactions: 0,
    pendingApprovals: 0,
    totalDisbursed: 0,
    thisMonthSpending: 0,
    approvalRate: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      // Fetch all stats in parallel
      const [transactionsResult, disbursementsResult] = await Promise.all([
        supabase.from("transactions").select("id, amount, status, created_at"),
        supabase.from("disbursements").select("amount, status"),
      ])

      const transactions = transactionsResult.data || []
      const disbursements = disbursementsResult.data || []

      const pending = transactions.filter((t) => t.status === "pending").length
      const approved = transactions.filter((t) => t.status === "approved").length
      const totalDisbursed = disbursements
        .filter((d) => d.status === "completed")
        .reduce((sum, d) => sum + Number(d.amount), 0)

      const thisMonth = new Date()
      const thisMonthSpending = transactions
        .filter((t) => {
          const transactionDate = new Date(t.created_at)
          return (
            transactionDate.getMonth() === thisMonth.getMonth() &&
            transactionDate.getFullYear() === thisMonth.getFullYear() &&
            t.status === "approved"
          )
        })
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const approvalRate = transactions.length > 0 ? (approved / transactions.length) * 100 : 0

      setStats({
        totalTransactions: transactions.length,
        pendingApprovals: pending,
        totalDisbursed,
        thisMonthSpending,
        approvalRate,
      })
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading admin dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KSh {stats.totalDisbursed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Successfully paid out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {stats.thisMonthSpending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Requests approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Quick access to management functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/admin">
              <Button variant="default">
                <Clock className="h-4 w-4 mr-2" />
                Review Approvals
              </Button>
            </Link>
            <Link href="/dashboard/admin/users">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingApprovals transactions={[]} />
        <RecentActivity activities={[]} />
      </div>
    </div>
  )
}
