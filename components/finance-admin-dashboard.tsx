"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Settings,
  Users,
  BarChart3,
  FileText,
  Shield,
  Smartphone,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import DashboardHeader from "@/components/dashboard-header"

interface Transaction {
  id: string
  amount: number
  description: string
  status: string
  created_at: string
  user_id: string
  users: {
    full_name: string
  }
}

interface Disbursement {
  id: string
  amount: number
  status: string
  created_at: string
  mpesa_transaction_id: string
  transaction_id: string
  transactions: {
    users: {
      full_name: string
    }
  }
}

interface FinanceAdminDashboardProps {
  user: any
  profile: any
}

const COLORS = ["#0891b2", "#f97316", "#10b981", "#8b5cf6", "#ec4899"]

export default function FinanceAdminDashboard({ user, profile }: FinanceAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const supabase = createClient()

  // Sample data - in a real app, this would come from your API
  const trendData = [
    { date: "Jan", amount: 4000 },
    { date: "Feb", amount: 3000 },
    { date: "Mar", amount: 2000 },
    { date: "Apr", amount: 2780 },
    { date: "May", amount: 1890 },
    { date: "Jun", amount: 2390 },
    { date: "Jul", amount: 3490 },
  ]

  const categoryData = [
    { name: "Office Supplies", amount: 400 },
    { name: "Travel", amount: 300 },
    { name: "Meals", amount: 300 },
    { name: "Equipment", amount: 200 },
  ]

  const COLORS = ["#5483B3", "#7DA0CA", "#C1E844", "#052659"]

  const approvedTransactions = 120
  const disbursedTransactions = 95
  const failedDisbursements = 5

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader user={profile || { full_name: user.email, role: "finance_admin" }} />
      
      <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Finance Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage financial transactions</p>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-background border border-border rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="disbursements" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Disbursements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-card-foreground">Spending Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `KSh ${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`KSh ${value}`, "Amount"]}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ stroke: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-card-foreground">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`KSh ${value}`, "Amount"]}
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Approved Transactions</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{approvedTransactions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for disbursement</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Disbursed Transactions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{disbursedTransactions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Successfully paid</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Failed Disbursements</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{failedDisbursements}</div>
                  <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disbursements" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-card-foreground">Recent Disbursements</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Latest M-Pesa transactions processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">Disbursement System Active</h3>
                  <p className="text-muted-foreground mt-1">
                    All systems operational
                  </p>
                  <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Process New Disbursement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
