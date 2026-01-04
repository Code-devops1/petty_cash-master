"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import Link from "next/link"
import { signOut, toggleUserStatus, addUser, updateUser } from "@/lib/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { CreateUserModal } from "@/components/create-user-modal"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  UserPlus as UserPlusIcon,
  Shield as ShieldIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Import the new responsive sidebar
import ResponsiveSidebar from "@/components/responsive-sidebar"

// Dynamically import icons to reduce bundle size
const Activity = dynamic(() => import("lucide-react").then(mod => mod.Activity))
const ArrowUpRight = dynamic(() => import("lucide-react").then(mod => mod.ArrowUpRight))
const CreditCard = dynamic(() => import("lucide-react").then(mod => mod.CreditCard))
const DollarSign = dynamic(() => import("lucide-react").then(mod => mod.DollarSign))
const Users = dynamic(() => import("lucide-react").then(mod => mod.Users))
const Search = dynamic(() => import("lucide-react").then(mod => mod.Search))
const Eye = dynamic(() => import("lucide-react").then(mod => mod.Eye))
const Clock = dynamic(() => import("lucide-react").then(mod => mod.Clock))
const TrendingUp = dynamic(() => import("lucide-react").then(mod => mod.TrendingUp))
const BarChart3 = dynamic(() => import("lucide-react").then(mod => mod.BarChart3))
const PieChartIcon = dynamic(() => import("lucide-react").then(mod => mod.PieChart))
const FileText = dynamic(() => import("lucide-react").then(mod => mod.FileText))
const Settings = dynamic(() => import("lucide-react").then(mod => mod.Settings))
const Download = dynamic(() => import("lucide-react").then(mod => mod.Download))
const AlertCircle = dynamic(() => import("lucide-react").then(mod => mod.AlertCircle))
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart))
const Line = dynamic(() => import("recharts").then(mod => mod.Line))
const LogOut = dynamic(() => import("lucide-react").then(mod => mod.LogOut))

// Dynamically import the Phone and MapPin icons
const Phone = dynamic(() => import("lucide-react").then(mod => mod.Phone))
const MapPin = dynamic(() => import("lucide-react").then(mod => mod.MapPin))

// Dynamically import recharts components to reduce bundle size
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart))
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie))
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell))
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer))
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip))
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid))
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis))
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis))

// Dynamically import dialog components
const Dialog = dynamic(() => import("@/components/ui/dialog").then(mod => mod.Dialog))
const DialogContent = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogContent))
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogHeader))
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogTitle))
const DialogDescription = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogDescription))

// Loading component for dynamic icons
const IconFallback = () => <div className="w-4 h-4" />

interface ComprehensiveAdminDashboardProps {
  user: User
  profile: any
  transactions: any[]
  users: any[]
  systemStats: any
  disbursements: any[]
}

export default function ComprehensiveAdminDashboard({
  user,
  profile,
  transactions,
  users,
  systemStats,
  disbursements,
}: ComprehensiveAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isProcessingDisbursement, setIsProcessingDisbursement] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)

  const supabase = createClient()

  // Define navigation items for the sidebar
  const navItems = [
    { 
      href: "#overview", 
      title: "Overview", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <Activity className="mr-2 h-4 w-4" />
        </Suspense>
      ) 
    },
    { 
      href: "#transactions", 
      title: "Transactions", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <DollarSign className="mr-2 h-4 w-4" />
        </Suspense>
      ) 
    },
    { 
      href: "#users", 
      title: "User Management", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <Users className="mr-2 h-4 w-4" />
        </Suspense>
      ) 
    },
    { 
      href: "#disbursements", 
      title: "M-Pesa Disbursements", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <Phone className="mr-2 h-4 w-4" />
        </Suspense>
      ) 
    },
    { 
      href: "#analytics", 
      title: "Advanced Analytics", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <TrendingUp className="mr-2 h-4 w-4" />
        </Suspense>
      ) 
    },
    { 
      href: "#system", 
      title: "System Configuration", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <Settings className="mr-2 h-4 w-4" />
        </Suspense>
      ) 
    },
  ];

  const enhancedStats = {
    totalTransactions: transactions.length,
    totalAmount: systemStats?.totalAmount || 0,
    pendingApprovals: systemStats?.pendingCount || 0,
    activeUsers: users && Array.isArray(users) ? users.filter((u) => u.status === "active").length : 0,
    completionRate:
      transactions.length > 0 ? (((systemStats?.completedCount || 0) / transactions.length) * 100).toFixed(1) : 0,
    avgProcessingTime: "2.3 hours", // This would be calculated from actual data
    monthlyGrowth: "+12.5%", // This would be calculated from historical data
    systemHealth: "Excellent",
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Filter users based on search term, status, and role
  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && user.is_active !== false) ||
      (statusFilter === "inactive" && user.is_active === false)
    
    const matchesRole = 
      roleFilter === "all" || 
      user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  }) || []

  const handleApproveTransaction = async (transactionId: string, phoneNumber: string, amount: number) => {
    setIsProcessingDisbursement(true)
    try {
      const response = await fetch("/api/transactions/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          action: "approve",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to approve transaction")
      }

      alert("Transaction approved and disbursement record created successfully!")

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error processing approval:", error)
      alert(`Error processing approval: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessingDisbursement(false)
    }
  }

  return (
    <ResponsiveSidebar 
      user={profile} 
      navItems={navItems} 
      sidebarTitle="Easy Net Solutions"
      sidebarSubtitle="Admin Portal"
    >
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Remove the .000000000 class that was causing extra zeros */}
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile.full_name}</p>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm">
                <Suspense fallback={<IconFallback />}>
                  <Download className="mr-2 h-4 w-4" />
                </Suspense>
                Export Data
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    <Suspense fallback={<IconFallback />}>
                      <DollarSign className="h-4 w-4 text-primary" />
                    </Suspense>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{enhancedStats.totalTransactions}</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                    <Suspense fallback={<IconFallback />}>
                      <TrendingUp className="h-4 w-4 text-secondary" />
                    </Suspense>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">
                      KSh {enhancedStats.totalAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">{enhancedStats.monthlyGrowth} from last month</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <Suspense fallback={<IconFallback />}>
                      <Clock className="h-4 w-4 text-orange-500" />
                    </Suspense>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-500">{enhancedStats.pendingApprovals}</div>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Suspense fallback={<IconFallback />}>
                      <Users className="h-4 w-4 text-green-500" />
                    </Suspense>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{enhancedStats.activeUsers}</div>
                    <p className="text-xs text-muted-foreground">System health: {enhancedStats.systemHealth}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Trends</CardTitle>
                    <CardDescription>Monthly transaction volume and amounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={[
                          { month: "Jan", transactions: 45, amount: 125000 },
                          { month: "Feb", transactions: 52, amount: 142000 },
                          { month: "Mar", transactions: 48, amount: 138000 },
                          { month: "Apr", transactions: 61, amount: 165000 },
                          { month: "May", transactions: 55, amount: 158000 },
                          { month: "Jun", transactions: 67, amount: 182000 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="transactions" stroke="#15803d" strokeWidth={2} />
                        <Line type="monotone" dataKey="amount" stroke="#84cc16" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>Expense breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div className="h-80 flex items-center justify-center">Loading chart...</div>}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Transport", value: 64, fill: "#15803d" },
                              { name: "Food", value: 17, fill: "#84cc16" },
                              { name: "Materials", value: 12, fill: "#22c55e" },
                              { name: "Emergency", value: 7, fill: "#16a34a" },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          ></Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredTransactions.map((transaction) => (
                  <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{transaction.description}</h3>
                            <Badge
                              variant={
                                transaction.status === "completed"
                                  ? "default"
                                  : transaction.status === "approved"
                                    ? "secondary"
                                    : transaction.status === "pending"
                                      ? "outline"
                                      : "destructive"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            By: {transaction.user_profiles?.full_name} •{" "}
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              KSh {transaction.amount?.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Suspense fallback={<IconFallback />}>
                                <Phone className="h-3 w-3" />
                              </Suspense>
                              {transaction.user_profiles?.phone_number}
                            </span>
                            {transaction.location && (
                              <span className="flex items-center gap-1">
                                <Suspense fallback={<IconFallback />}>
                                  <MapPin className="h-3 w-3" />
                                </Suspense>
                                {transaction.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {transaction.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleApproveTransaction(
                                    transaction.id,
                                    transaction.user_profiles?.phone_number,
                                    transaction.amount,
                                  )
                                }
                                disabled={isProcessingDisbursement}
                              >
                                <CheckCircleIcon className="mr-1 h-3 w-3" />
                                Approve & Disburse
                              </Button>
                              <Button size="sm" variant="outline">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setSelectedTransaction(transaction)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other tabs would be implemented similarly with comprehensive functionality */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name, email, or employee ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setIsCreateUserModalOpen(true)}>
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              {/* User Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">All registered users</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {users?.filter((u: any) => u.is_active !== false)?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Currently active</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                    <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {users?.filter((u: any) => u.role === "admin")?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Administrators</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recently Joined</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {users?.filter((u: any) => {
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return new Date(u.created_at) > oneWeekAgo;
                      })?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">In the last 7 days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>Manage all users in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="font-medium">{user.full_name || "N/A"}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {user.email 
                                    ? `${user.email.substring(0, 2)}***${user.email.substring(user.email.lastIndexOf("@"))}` 
                                    : "N/A"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {user.phone_number 
                                    ? `${user.phone_number.substring(0, 4)}****${user.phone_number.substring(user.phone_number.length - 4)}` 
                                    : "N/A"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={`capitalize ${
                                    user.role === "admin" 
                                      ? "bg-purple-100 text-purple-800 hover:bg-purple-100" 
                                      : user.role === "manager" 
                                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100" 
                                        : "bg-green-100 text-green-800 hover:bg-green-100"
                                  }`}
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.department || "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={user.is_active === false ? "destructive" : "secondary"}
                                  className="capitalize"
                                >
                                  {user.is_active === false ? "Inactive" : "Active"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => console.log("Edit user:", user.id)}
                                  >
                                    <EditIcon className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className={user.is_active === false ? "text-green-600" : "text-red-600"}
                                    onClick={async () => {
                                      const result = await toggleUserStatus(user.id, user.is_active);
                                      if (result.success) {
                                        // Refresh the page to show updated data
                                        window.location.reload();
                                      } else {
                                        alert(`Error: ${result.error}`);
                                      }
                                    }}
                                  >
                                    {user.is_active === false ? (
                                      <CheckCircleIcon className="h-4 w-4" />
                                    ) : (
                                      <XCircleIcon className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-1">No users found</h3>
                                <p className="text-muted-foreground">
                                  {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                                    ? "No users match your search criteria"
                                    : "No users have been added to the system yet"}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {users && users.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredUsers.length} of {users.length} users
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "disbursements" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">M-Pesa Disbursements</h2>
              <p className="text-muted-foreground">Advanced disbursement tracking and management...</p>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>
              <p className="text-muted-foreground">Comprehensive analytics and reporting dashboard...</p>
            </div>
          )}

          {activeTab === "system" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">System Configuration</h2>
              <p className="text-muted-foreground">M-Pesa API configuration and system settings...</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>Complete information for transaction #{selectedTransaction.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <p className="text-lg font-bold text-primary">KSh {selectedTransaction.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className="mt-1">{selectedTransaction.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Submitted By</label>
                  <p>{selectedTransaction.user_profiles?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p>{new Date(selectedTransaction.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="mt-1">{selectedTransaction.description}</p>
              </div>
              {selectedTransaction.receipt_url && (
                <div>
                  <label className="text-sm font-medium">Receipt</label>
                  <img
                    src={selectedTransaction.receipt_url || "/placeholder.svg"}
                    alt="Receipt"
                    className="mt-2 max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <CreateUserModal 
        open={isCreateUserModalOpen}
        onOpenChange={setIsCreateUserModalOpen}
        onUserCreated={() => {
          // Refresh the page to show the new user
          window.location.reload()
        }}
      />
    </ResponsiveSidebar>
  )
}