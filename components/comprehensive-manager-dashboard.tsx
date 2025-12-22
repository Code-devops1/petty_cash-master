"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { signOut } from "@/lib/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  UserPlus as UserPlusIcon,
  Shield as ShieldIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Activity,
  CreditCard,
  DollarSign,
  Users,
  Search,
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Settings,
  Download,
  AlertCircle,
  LogOut,
  Phone,
  MapPin
} from "lucide-react";

// Dynamically import recharts components to reduce bundle size
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart));
const Line = dynamic(() => import("recharts").then(mod => mod.Line));
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart));
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie));
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell));
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer));
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip));
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid));
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis));
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis));

// Loading component for dynamic icons
const IconFallback = () => <div className="w-4 h-4" />

interface ComprehensiveManagerDashboardProps {
  user: User;
  profile: any;
  transactions: any[];
  users: any[];
  departmentStats: any;
  teamMembers: any[];
}

export default function ComprehensiveManagerDashboard({
  user,
  profile,
  transactions,
  users,
  departmentStats,
  teamMembers,
}: ComprehensiveManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);

  const supabase = createClient();

  // Calculate department-specific stats
  const enhancedStats = {
    totalRequests: transactions.length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    pendingApprovals: transactions.filter(t => t.status === "pending").length,
    teamMembersCount: teamMembers?.length || 0,
    completionRate: 
      transactions.length > 0 
        ? (((transactions.filter(t => t.status !== "pending").length) / transactions.length) * 100).toFixed(1) 
        : 0,
    avgProcessingTime: "2.3 hours", // Would be calculated from actual data
    monthlyGrowth: "+8.2%", // Would be calculated from historical data
    departmentHealth: "Good",
  };

  // Filter transactions based on search term and status
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter team members based on search term and department
  const filteredTeamMembers = teamMembers?.filter((member: any) => {
    const matchesSearch = 
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === "all" || 
      member.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  }) || [];

  const handleApproveTransaction = async (transactionId: string) => {
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
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to approve transaction");
      }

      // Show success notification
      setNotification({type: "success", message: "Transaction approved successfully!"});
      
      // Refresh data after approval
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error approving transaction:", error);
      setNotification({type: "error", message: `Error approving transaction: ${error.message}`});
    }
  };

  const handleRejectTransaction = async (transactionId: string) => {
    try {
      const response = await fetch("/api/transactions/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          action: "reject",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reject transaction");
      }

      // Show success notification
      setNotification({type: "success", message: "Transaction rejected successfully!"});
      
      // Refresh data after rejection
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error rejecting transaction:", error);
      setNotification({type: "error", message: `Error rejecting transaction: ${error.message}`});
    }
  };

  // Close notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for larger screens, collapsible on mobile */}
      <div className="hidden md:w-64 bg-card border-r border-border md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary">Easy Net Solutions</h2>
          <p className="text-sm text-muted-foreground">Manager Portal</p>
        </div>
        <nav className="px-4 space-y-2 flex-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("overview")}
          >
            <Activity className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "transactions" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("transactions")}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Transactions
          </Button>
          <Button
            variant={activeTab === "team" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("team")}
          >
            <Users className="mr-2 h-4 w-4" />
            Team Management
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("analytics")}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "reports" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("reports")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </nav>

        {/* User Profile Section at Bottom */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={signOut}>
                  <button type="submit" className="flex items-center space-x-2 w-full cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile sidebar - shown when mobileSidebarOpen is true */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden flex flex-col`}>
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary">Easy Net Solutions</h2>
          <p className="text-sm text-muted-foreground">Manager Portal</p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => { setActiveTab("overview"); setMobileSidebarOpen(false); }}
          >
            <Activity className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "transactions" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => { setActiveTab("transactions"); setMobileSidebarOpen(false); }}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Transactions
          </Button>
          <Button
            variant={activeTab === "team" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => { setActiveTab("team"); setMobileSidebarOpen(false); }}
          >
            <Users className="mr-2 h-4 w-4" />
            Team Management
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => { setActiveTab("analytics"); setMobileSidebarOpen(false); }}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "reports" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => { setActiveTab("reports"); setMobileSidebarOpen(false); }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </nav>
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={signOut}>
                  <button type="submit" className="flex items-center space-x-2 w-full cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden p-4 border-b border-border flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <h1 className="text-xl font-bold text-foreground">Manager Dashboard</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            notification.type === "success" 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            <div className="flex items-center">
              {notification.type === "success" ? (
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 mr-2 text-red-600" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Manager Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile.full_name}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{enhancedStats.totalRequests}</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                    <TrendingUp className="h-4 w-4 text-secondary" />
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
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-500">{enhancedStats.pendingApprovals}</div>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                    <Users className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{enhancedStats.teamMembersCount}</div>
                    <p className="text-xs text-muted-foreground">Department health: {enhancedStats.departmentHealth}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Trends</CardTitle>
                    <CardDescription>Monthly transaction volume and amounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={[
                          { month: "Jan", transactions: 25, amount: 85000 },
                          { month: "Feb", transactions: 32, amount: 102000 },
                          { month: "Mar", transactions: 28, amount: 98000 },
                          { month: "Apr", transactions: 41, amount: 125000 },
                          { month: "May", transactions: 35, amount: 118000 },
                          { month: "Jun", transactions: 47, amount: 142000 },
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
                    <CardTitle>Expense Distribution</CardTitle>
                    <CardDescription>Department expense breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Transport", value: 34, fill: "#15803d" },
                            { name: "Food", value: 17, fill: "#84cc16" },
                            { name: "Materials", value: 22, fill: "#22c55e" },
                            { name: "Emergency", value: 27, fill: "#16a34a" },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: "Transport", value: 34, fill: "#15803d" },
                            { name: "Food", value: 17, fill: "#84cc16" },
                            { name: "Materials", value: 22, fill: "#22c55e" },
                            { name: "Emergency", value: 27, fill: "#16a34a" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Activity Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest transactions and team activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              By {transaction.user_profiles?.full_name} • {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
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
                          <span className="font-medium">KSh {transaction.amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
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
                  <SelectTrigger className="w-full sm:w-48">
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
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              KSh {transaction.amount?.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {transaction.user_profiles?.phone_number}
                            </span>
                            {transaction.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {transaction.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {transaction.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveTransaction(transaction.id)}
                              >
                                <CheckCircleIcon className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRejectTransaction(transaction.id)}
                              >
                                <XCircleIcon className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setSelectedTransaction(transaction)}
                          >
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

          {/* Team Management Tab */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search team members by name, email, or employee ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              </div>

              {/* Team Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamMembers?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">All team members</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                    <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teamMembers?.filter((m: any) => m.is_active !== false)?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Currently active</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teamMembers?.reduce((count: number, member: any) => {
                        return count + transactions.filter((t: any) => 
                          t.user_id === member.id && t.status === 'pending'
                        ).length;
                      }, 0) || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Awaiting approval</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.3 hrs</div>
                    <p className="text-xs text-muted-foreground">Faster than last month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Team Members Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Directory</CardTitle>
                  <CardDescription>Manage team members in your department</CardDescription>
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
                          <TableHead>Expenses</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeamMembers.length > 0 ? (
                          filteredTeamMembers.map((member: any) => {
                            const memberTransactions = transactions.filter((t: any) => t.user_id === member.id);
                            const pendingCount = memberTransactions.filter((t: any) => t.status === 'pending').length;
                            
                            return (
                              <TableRow key={member.id}>
                                <TableCell>
                                  <div className="font-medium">{member.full_name || "N/A"}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {member.email 
                                      ? `${member.email.substring(0, 2)}***${member.email.substring(member.email.lastIndexOf("@"))}` 
                                      : "N/A"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {member.phone_number 
                                      ? `${member.phone_number.substring(0, 4)}****${member.phone_number.substring(member.phone_number.length - 4)}` 
                                      : "N/A"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    className={`capitalize ${
                                      member.role === "admin" 
                                        ? "bg-purple-100 text-purple-800 hover:bg-purple-100" 
                                        : member.role === "manager" 
                                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100" 
                                          : "bg-green-100 text-green-800 hover:bg-green-100"
                                    }`}
                                  >
                                    {member.role}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {member.department || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={member.is_active === false ? "destructive" : "secondary"}
                                    className="capitalize"
                                  >
                                    {member.is_active === false ? "Inactive" : "Active"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>Total: {memberTransactions.length}</span>
                                    {pendingCount > 0 && (
                                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                        Pending: {pendingCount}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => console.log("View user:", member.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => console.log("Edit user:", member.id)}
                                    >
                                      <EditIcon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-1">No team members found</h3>
                                <p className="text-muted-foreground">
                                  {searchTerm || departmentFilter !== "all"
                                    ? "No team members match your search criteria"
                                    : "No team members have been assigned to you yet"}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {teamMembers && teamMembers.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredTeamMembers.length} of {teamMembers.length} team members
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>
                          Previous
                        </Button>
                        <Button variant="outline" size="sm">
                          1
                        </Button>
                        <Button variant="outline" size="sm">
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Expense Analytics</CardTitle>
                  <CardDescription>Detailed analytics for your department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Spending Trends</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={[
                            { month: "Jan", amount: 85000 },
                            { month: "Feb", amount: 102000 },
                            { month: "Mar", amount: 98000 },
                            { month: "Apr", amount: 125000 },
                            { month: "May", amount: 118000 },
                            { month: "Jun", amount: 142000 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="amount" stroke="#84cc16" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Budget Utilization</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Used", value: 75, fill: "#ef4444" },
                              { name: "Remaining", value: 25, fill: "#10b981" },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            label
                          >
                            {[
                              { name: "Used", value: 75, fill: "#ef4444" },
                              { name: "Remaining", value: 25, fill: "#10b981" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                        <div className="mt-4 text-center">
                          <p className="text-2xl font-bold">75%</p>
                          <p className="text-sm text-muted-foreground">of department budget used</p>
                        </div>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Expense Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { category: "Transport", amount: 35000, percentage: 32 },
                        { category: "Materials", amount: 28000, percentage: 26 },
                        { category: "Food", amount: 18000, percentage: 17 },
                        { category: "Emergency", amount: 12000, percentage: 11 },
                        { category: "Others", amount: 15000, percentage: 14 }
                      ].map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{item.category}</span>
                            <span className="text-sm font-medium">KSh {item.amount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers?.slice(0, 5).map((member: any, index: number) => {
                        const memberTransactions = transactions.filter((t: any) => t.user_id === member.id);
                        const totalAmount = memberTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
                        
                        return (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold text-sm">
                                  {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{member.full_name}</p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">KSh {totalAmount.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{memberTransactions.length} expenses</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Policy Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Expense Reports</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Receipt Attachments</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "87%" }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Policy Violations</span>
                        <span className="font-medium">5%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "5%" }}></div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>On-time Submissions</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h2 className="text-xl font-bold text-foreground">Department Reports</h2>
                <div className="flex gap-2 flex-wrap">
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export All
                  </Button>
                  <Button variant="outline">
                    Schedule Report
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Monthly Summary
                    </CardTitle>
                    <CardDescription>Overview of department expenses for the month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last generated: May 15, 2024</span>
                      <Button size="sm">Generate Report</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Expense Trends
                    </CardTitle>
                    <CardDescription>Track spending patterns over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last updated: Today</span>
                      <Button size="sm">Generate Report</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      Category Breakdown
                    </CardTitle>
                    <CardDescription>Expenses by category and department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last updated: Yesterday</span>
                      <Button size="sm">Generate Report</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Team Performance
                    </CardTitle>
                    <CardDescription>Team member expense analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last updated: May 12, 2024</span>
                      <Button size="sm">Generate Report</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Compliance Report
                    </CardTitle>
                    <CardDescription>Policy adherence and violations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last updated: May 10, 2024</span>
                      <Button size="sm">Generate Report</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Budget Forecast
                    </CardTitle>
                    <CardDescription>Predictive budget analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last updated: May 8, 2024</span>
                      <Button size="sm">Generate Report</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}