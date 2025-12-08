"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, AlertTriangle, Users, DollarSign, TrendingUp, Search, Eye, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Transaction {
  id: string
  amount: number
  quantity: number
  total_amount: number
  reason: string
  status: string
  mpesa_receipt_id: string | null
  mpesa_request_id: string | null
  created_at: string
  updated_at: string
  user_id: string
  category_id: string
  subcategory_id: string | null
  route_id: string | null
  categories: { name: string } | null
  description: string
  location?: string
  users: {
    full_name: string
    department?: string
  }
}

interface ManagerDashboardProps {
  user: any
  profile: any
}

export default function ManagerDashboard({ user, profile }: ManagerDashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const supabase = createClient()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          users(full_name, employee_id, department),
          expenditure_categories(name, allocation_percentage)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "approved" })
        .eq("id", transactionId)

      if (error) throw error
      fetchTransactions()
    } catch (error) {
      console.error("Error approving transaction:", error)
    }
  }

  const handleReject = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status: "rejected" })
        .eq("id", transactionId)

      if (error) throw error
      fetchTransactions()
    } catch (error) {
      console.error("Error rejecting transaction:", error)
    }
  }

  const uniqueDepartments = Array.from(new Set(transactions.map(t => t.users.department).filter(Boolean)))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
      case "approved":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>
      case "disbursed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><TrendingUp className="mr-1 h-3 w-3" /> Disbursed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.users.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    
    const matchesDepartment = departmentFilter === "all" || transaction.users.department === departmentFilter
    
    return matchesSearch && matchesStatus && matchesDepartment
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{transactions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Pending Approval</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {transactions.filter(t => t.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              KSh {transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-foreground">Expense Requests</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="all" className="text-foreground">All Statuses</SelectItem>
                  <SelectItem value="pending" className="text-foreground">Pending</SelectItem>
                  <SelectItem value="approved" className="text-foreground">Approved</SelectItem>
                  <SelectItem value="rejected" className="text-foreground">Rejected</SelectItem>
                  <SelectItem value="disbursed" className="text-foreground">Disbursed</SelectItem>
                </SelectContent>
              </Select>
              {uniqueDepartments.length > 0 && (
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="all" className="text-foreground">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept || ''} className="text-foreground">{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="border border-border rounded-lg p-4 bg-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{transaction.description}</h3>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        By User Information Unavailable • Department N/A • {transaction.categories?.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-foreground">KSh {transaction.amount.toLocaleString()}</span>
                        <span className="text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {transaction.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(transaction.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(transaction.id)}
                          className="border-border"
                        >
                          <XCircle className="mr-1 h-4 w-4" /> Reject
                        </Button>
                        <Link href={`/dashboard/transactions/${transaction.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                    {transaction.status !== "pending" && (
                      <Link href={`/dashboard/transactions/${transaction.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
