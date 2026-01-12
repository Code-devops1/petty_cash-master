"use client";

import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";
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
import ResponsiveSidebar from "@/components/responsive-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateUserModal } from "@/components/create-user-modal";
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
  MapPin,
  Send,
  Menu
} from "lucide-react";

// Import recharts wrapper components to avoid dynamic import type issues
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis
} from "@/components/recharts-wrapper";

// Dynamically import dialog components
const Dialog = dynamic(() => import("@/components/ui/dialog").then(mod => mod.Dialog)) as any;
const DialogContent = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogContent)) as any;
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogHeader)) as any;
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogTitle)) as any;
const DialogDescription = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogDescription)) as any;

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Handle click outside to collapse expanded transactions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setExpandedTransactionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const supabase = createClient();

  // Define status colors mapping
  const statusColors = {
    pending: "bg-orange-100 text-orange-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    disbursed: "bg-blue-100 text-blue-800",
    completed: "bg-slate-100 text-slate-800",
  };

  // Define navigation items for the sidebar
  const navItems = [
    { 
      href: "#overview", 
      title: "Overview", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <Activity className="mr-2 h-4 w-4" />
        </Suspense>
      ),
      onClick: () => setActiveTab("overview")
    },
    { 
      href: "#transactions", 
      title: "Transactions", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <DollarSign className="mr-2 h-4 w-4" />
        </Suspense>
      ),
      onClick: () => setActiveTab("transactions")
    },
    { 
      href: "#team", 
      title: "Team Management", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <Users className="mr-2 h-4 w-4" />
        </Suspense>
      ),
      onClick: () => setActiveTab("team")
    },
    { 
      href: "#analytics", 
      title: "Analytics", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <TrendingUp className="mr-2 h-4 w-4" />
        </Suspense>
      ),
      onClick: () => setActiveTab("analytics")
    },
    { 
      href: "#reports", 
      title: "Reports", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <FileText className="mr-2 h-4 w-4" />
        </Suspense>
      ),
      onClick: () => setActiveTab("reports")
    },
    { 
      href: "#communication", 
      title: "Communication", 
      icon: (
        <Suspense fallback={<IconFallback />}>
          <Send className="mr-2 h-4 w-4" />
        </Suspense>
      ),
      onClick: () => setActiveTab("communication")
    },
  ];

  // Calculate department-specific stats
  const enhancedStats = {
    totalRequests: transactions.length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    pendingApprovals: transactions.filter(t => 
      t.status?.toLowerCase() === "pending" || 
      t.status?.toLowerCase() === "PENDING"
    ).length,
    teamMembersCount: teamMembers?.length || 0,
    completionRate: 
      transactions.length > 0 
        ? (((transactions.filter(t => 
            t.status?.toLowerCase() !== "pending" && 
            t.status?.toLowerCase() !== "PENDING"
          ).length) / transactions.length) * 100).toFixed(1) 
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
    const matchesStatus = statusFilter === "all" || 
                         transaction.status?.toLowerCase() === statusFilter.toLowerCase() ||
                         (statusFilter === "pending" && transaction.status?.toLowerCase() === "PENDING") ||
                         (statusFilter === "PENDING" && transaction.status?.toLowerCase() === "pending") ||
                         (statusFilter === "completed" && transaction.status?.toLowerCase() === "COMPLETED") ||
                         (statusFilter === "COMPLETED" && transaction.status?.toLowerCase() === "completed");
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

      // Update the local state to reflect the approval
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: 'approved' } 
          : transaction
      );

      // Update the enhancedStats to reflect the change
      setNotification({type: "success", message: "Transaction approved successfully!"});
      
      // Update the page to reflect the changes without reloading
      window.location.reload(); // For now, keeping reload until we update props properly
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

      // Update the local state to reflect the rejection
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: 'rejected' } 
          : transaction
      );

      // Update the enhancedStats to reflect the change
      setNotification({type: "success", message: "Transaction rejected successfully!"});
      
      // Update the page to reflect the changes without reloading
      window.location.reload(); // For now, keeping reload until we update props properly
    } catch (error: any) {
      console.error("Error rejecting transaction:", error);
      setNotification({type: "error", message: `Error rejecting transaction: ${error.message}`});
    }
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // State for delegation form
  const [delegateTo, setDelegateTo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  return (
    <ResponsiveSidebar
      user={{
        full_name: profile?.full_name || user?.email || "Manager",
        role: "Manager",
      }}
      navItems={navItems}
      sidebarTitle="EasyNet Solutions "
      sidebarSubtitle="Manager Portal"
    >
      <div ref={dashboardRef} className="flex-1">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">EasyNet</h1>
              <p className="text-muted-foreground">Manage your department's petty cash operations</p>
            </div>
            <div className="flex items-center gap-3">
             
              <ThemeToggle />
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                </Link>
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
                        data={(() => {
                          // Group transactions by month and calculate totals
                          const monthlyData: {[key: string]: {transactions: number, amount: number}} = {};
                          
                          transactions.forEach(transaction => {
                            const date = new Date(transaction.created_at);
                            const month = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
                            
                            if (!monthlyData[month]) {
                              monthlyData[month] = { transactions: 0, amount: 0 };
                            }
                            
                            monthlyData[month].transactions += 1;
                            monthlyData[month].amount += transaction.amount || 0;
                          });
                          
                          // Convert to array and sort by date
                          return Object.entries(monthlyData)
                            .map(([month, data]) => ({ month, ...data }))
                            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
                        })()}
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
                          label={({ name, percent }: { name?: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
                  <div key={transaction.id}>
                    <Card className="hover:shadow-md transition-shadow">
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
                              onClick={() => setExpandedTransactionId(
                                expandedTransactionId === transaction.id ? null : transaction.id
                              )}
                            >
                              {expandedTransactionId === transaction.id ? "Hide Details" : "View Details"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Expanded Transaction Details */}
                    {expandedTransactionId === transaction.id && (
                      <div className="mt-2 border rounded-lg p-4 bg-muted">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-sm font-medium">Amount</label>
                            <p className="text-lg font-bold text-primary">KSh {transaction.amount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <Badge className="mt-1">{transaction.status}</Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Submitted By</label>
                            <p>{transaction.user_profiles?.full_name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Date</label>
                            <p>{new Date(transaction.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="text-sm font-medium">Description</label>
                          <p className="mt-1">{transaction.description || transaction.reason || "No description provided"}</p>
                        </div>
                        {transaction.receipt_url && (
                          <div>
                            <label className="text-sm font-medium">Receipt</label>
                            <img
                              src={transaction.receipt_url || "/placeholder.svg"}
                              alt="Receipt"
                              className="mt-2 max-w-full h-auto rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                  <Button onClick={() => setIsAddMemberModalOpen(true)}>
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
              
              {/* Approval Delegation Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Approval Delegation</CardTitle>
                  <CardDescription>Delegate your approval authority when unavailable</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Delegate To</label>
                        <Select value={delegateTo} onValueChange={setDelegateTo}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers
                              .filter((member: any) => member.id !== user.id)
                              .map((member: any) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.full_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Delegation Period</label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input 
                              type="date" 
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              placeholder="Start date" 
                            />
                          </div>
                          <div className="flex-1">
                            <Input 
                              type="date" 
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              placeholder="End date" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Reason for Delegation</label>
                      <Input 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Brief explanation for delegation..." 
                      />
                    </div>
                    
                    <Button 
                      className="w-full sm:w-auto" 
                      onClick={async () => {
                        try {
                          // Prepare the delegation data
                          const delegationData = {
                            delegator_id: user.id, // Current user is the delegator
                            delegate_id: delegateTo, // Selected user is the delegate
                            start_date: startDate,
                            end_date: endDate,
                            reason: reason
                          };
                          
                          // Validate that all required fields are present
                          if (!delegationData.delegator_id || !delegationData.delegate_id || 
                              !delegationData.start_date || !delegationData.end_date || 
                              !delegationData.reason) {
                            setNotification({type: "error", message: "Please fill in all fields"});
                            return;
                          }
                          
                          // Send the delegation data to our API route
                          const response = await fetch('/api/delegations', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(delegationData),
                          });
                          
                          const result = await response.json();
                          
                          if (!response.ok) {
                            console.error("Delegation API error:", result);
                            throw new Error(result.error || `HTTP error! status: ${response.status}`);
                          }
                          
                          // Show success notification
                          setNotification({type: "success", message: "Delegation set successfully!"});
                          
                          // Reset form after successful submission
                          setDelegateTo("");
                          setStartDate("");
                          setEndDate("");
                          setReason("");
                        } catch (error: any) {
                          console.error("Error setting delegation:", error);
                          setNotification({type: "error", message: `Failed to set delegation: ${error.message || error}`});
                        }
                      }}
                    >
                      <UserPlusIcon className="mr-2 h-4 w-4" />
                      Set Delegation
                    </Button>
                    
                    {/* Current Delegations */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Current Delegations</h3>
                      <div className="space-y-3">
                        {(() => {
                          // This would be replaced with actual delegation data from the database
                          // For now, showing an empty state since no delegations exist
                          return (
                            <div className="text-center py-4 text-muted-foreground">
                              <p>No active delegations</p>
                              <p className="text-sm mt-1">Set up delegation when you're unavailable</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
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
                          data={(() => {
                            // Group transactions by month
                            const monthlyData: any = {};
                            
                            transactions.forEach((transaction: any) => {
                              if (transaction.created_at) {
                                const date = new Date(transaction.created_at);
                                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                
                                if (!monthlyData[monthYear]) {
                                  monthlyData[monthYear] = 0;
                                }
                                
                                monthlyData[monthYear] += Number(transaction.amount) || 0;
                              }
                            });
                            
                            // Convert to chart data format
                            return Object.entries(monthlyData).map(([monthYear, amount]) => {
                              const [year, month] = monthYear.split('-');
                              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                              return {
                                month: `${monthNames[parseInt(month) - 1]} ${year}`,
                                amount: amount as number
                              };
                            }).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
                          })()}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: any, name: any) => [`KSh ${Number(value).toLocaleString()}`, 'Amount']} />
                          <Line type="monotone" dataKey="amount" stroke="#84cc16" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Budget Utilization</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        {(() => {
                          const approvedAmount = transactions
                            .filter((t: any) => t.status === 'approved' || t.status === 'completed')
                            .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

                          const monthlyBudget = 500000;
                          const remaining = Math.max(0, monthlyBudget - approvedAmount);

                          const pieData = [
                            { name: "Used", value: approvedAmount, fill: "#ef4444" },
                            { name: "Remaining", value: remaining, fill: "#10b981" },
                          ];

                          const cells = pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ));

                          return (
                            <PieChart>
                              <Pie
                                data={pieData}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                label
                              >
                                {cells}
                              </Pie>
                              <Tooltip formatter={(value: any, name: any) => [`KSh ${Number(value).toLocaleString()}`, 'Amount']} />
                            </PieChart>
                          );
                        })()}
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
                      {(() => {
                        // Calculate expense categories from transactions
                        const categoryTotals: Record<string, number> = {};
                        
                        transactions.forEach((transaction: any) => {
                          const category = transaction.category || 'Uncategorized';
                          const amount = Number(transaction.amount) || 0;
                          
                          if (!categoryTotals[category]) {
                            categoryTotals[category] = 0;
                          }
                          categoryTotals[category] += amount;
                        });
                        
                        // Sort categories by amount and get top 5
                        const sortedCategories = Object.entries(categoryTotals)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([category, amount]) => ({ category, amount }));
                        
                        // Calculate total amount for percentage calculation
                        const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
                        
                        return sortedCategories.map((item, index) => {
                          const percentage = totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0;
                          
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">{item.category}</span>
                                <span className="text-sm font-medium">KSh {item.amount.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        });
                      })()}
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
                        const totalAmount = memberTransactions.reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);
                        
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
                      {(() => {
                        // Calculate compliance metrics from transactions
                        const totalTransactions = transactions.length;
                        if (totalTransactions === 0) {
                          return (
                            <>
                              <div className="flex justify-between">
                                <span>Expense Reports</span>
                                <span className="font-medium">0%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>Receipt Attachments</span>
                                <span className="font-medium">0%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>Policy Violations</span>
                                <span className="font-medium">0%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>On-time Submissions</span>
                                <span className="font-medium">0%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                              </div>
                            </>
                          );
                        }
                        
                        // Calculate compliance metrics
                        const hasReceipts = transactions.filter((t: any) => t.receipt_image).length;
                        const approvedTransactions = transactions.filter((t: any) => t.status === 'approved' || t.status === 'completed').length;
                        const violations = transactions.filter((t: any) => t.status === 'rejected').length;
                        
                        const expenseReportRate = totalTransactions > 0 ? Math.round((approvedTransactions / totalTransactions) * 100) : 0;
                        const receiptAttachmentRate = totalTransactions > 0 ? Math.round((hasReceipts / totalTransactions) * 100) : 0;
                        const violationRate = totalTransactions > 0 ? Math.round((violations / totalTransactions) * 100) : 0;
                        const onTimeRate = 100 - violationRate; // Simplified calculation
                        
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Expense Reports</span>
                              <span className="font-medium">{expenseReportRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${expenseReportRate}%` }}></div>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Receipt Attachments</span>
                              <span className="font-medium">{receiptAttachmentRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${receiptAttachmentRate}%` }}></div>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Policy Violations</span>
                              <span className="font-medium">{violationRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${violationRate}%` }}></div>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>On-time Submissions</span>
                              <span className="font-medium">{onTimeRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${onTimeRate}%` }}></div>
                            </div>
                          </>
                        );
                      })()}
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
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const now = new Date();
                          return `Generated: ${now.toLocaleDateString()}`
                        })()}
                      </span>
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
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const now = new Date();
                          return `Updated: ${now.toLocaleDateString()}`
                        })()}
                      </span>
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
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const now = new Date();
                          return `Updated: ${now.toLocaleDateString()}`
                        })()}
                      </span>
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
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const now = new Date();
                          return `Updated: ${now.toLocaleDateString()}`
                        })()}
                      </span>
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
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const now = new Date();
                          return `Updated: ${now.toLocaleDateString()}`
                        })()}
                      </span>
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
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const now = new Date();
                          return `Updated: ${now.toLocaleDateString()}`
                        })()}
                      </span>
                      <Button size="sm">Generate Report</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Communication Tools Tab */}
          {activeTab === "communication" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h2 className="text-xl font-bold text-foreground">Communication Tools</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Send Message to Team</CardTitle>
                  <CardDescription>Send notifications or requests to your team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Recipients</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team members" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Team Members</SelectItem>
                          <SelectItem value="pending">Members with Pending Expenses</SelectItem>
                          {teamMembers?.map((member: any) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                      <Input placeholder="Enter message subject..." />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                      <Textarea 
                        placeholder="Type your message here..." 
                        className="min-h-[120px]"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                      <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your department's latest activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredTransactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id}>
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="font-medium">{transaction.description || transaction.reason}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.user_profiles?.full_name || "Unknown User"} •{" "}
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">KSh {Number(transaction.amount).toLocaleString()}</span>
                              <Badge 
                                className={statusColors[transaction.status as keyof typeof statusColors]}
                                variant="secondary"
                              >
                                {transaction.status}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setExpandedTransactionId(
                                  expandedTransactionId === transaction.id ? null : transaction.id
                                )}
                              >
                                {expandedTransactionId === transaction.id ? "Hide" : "View"}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Expanded Transaction Details */}
                          {expandedTransactionId === transaction.id && (
                            <div className="mt-2 border rounded-lg p-4 bg-muted col-span-full">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="text-sm font-medium">Amount</label>
                                  <p className="text-lg font-bold text-primary">KSh {transaction.amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <Badge className="mt-1">{transaction.status}</Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Submitted By</label>
                                  <p>{transaction.user_profiles?.full_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Date</label>
                                  <p>{new Date(transaction.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="mb-4">
                                <label className="text-sm font-medium">Description</label>
                                <p className="mt-1">{transaction.description || transaction.reason || "No description provided"}</p>
                              </div>
                              {transaction.receipt_url && (
                                <div>
                                  <label className="text-sm font-medium">Receipt</label>
                                  <img
                                    src={transaction.receipt_url || "/placeholder.svg"}
                                    alt="Receipt"
                                    className="mt-2 max-w-full h-auto rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab("transactions")}
                    >
                      View All Transactions
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Communications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { 
                          id: 1, 
                          sender: "System", 
                          subject: "Pending Approvals Reminder", 
                          time: "2 hours ago",
                          read: false
                        },
                        { 
                          id: 2, 
                          sender: "Jane Smith", 
                          subject: "Expense Clarification Needed", 
                          time: "Yesterday",
                          read: true
                        },
                        { 
                          id: 3, 
                          sender: "John Doe", 
                          subject: "Out of Office - Delegate Approval", 
                          time: "May 12, 2024",
                          read: true
                        }
                      ].map((message) => (
                        <div 
                          key={message.id} 
                          className={`p-3 rounded-lg border ${!message.read ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}
                        >
                          <div className="flex justify-between">
                            <div className="font-medium">{message.subject}</div>
                            <div className="text-sm text-muted-foreground">{message.time}</div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <div>From: {message.sender}</div>
                            {!message.read && (
                              <Badge variant="secondary">New</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Urgent Approvals</CardTitle>
                    <CardDescription>Transactions requiring immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions
                        .filter((t: any) => t.status === 'pending')
                        .slice(0, 3)
                        .map((transaction: any) => (
                          <div key={transaction.id}>
                            <div className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{transaction.description}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {transaction.user_profiles?.full_name || 'User'} • KSh {transaction.amount?.toLocaleString()}
                                  </p>
                                </div>
                                <Badge variant="destructive">Urgent</Badge>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleApproveTransaction(transaction.id)}
                                >
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
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => setExpandedTransactionId(
                                    expandedTransactionId === transaction.id ? null : transaction.id
                                  )}
                                >
                                  {expandedTransactionId === transaction.id ? "Hide Details" : "View Details"}
                                </Button>
                              </div>
                            </div>
                            
                            {/* Expanded Transaction Details */}
                            {expandedTransactionId === transaction.id && (
                              <div className="mt-2 border rounded-lg p-4 bg-muted">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="text-sm font-medium">Amount</label>
                                    <p className="text-lg font-bold text-primary">KSh {transaction.amount?.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Badge className="mt-1">{transaction.status}</Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Submitted By</label>
                                    <p>{transaction.user_profiles?.full_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Date</label>
                                    <p>{new Date(transaction.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <label className="text-sm font-medium">Description</label>
                                  <p className="mt-1">{transaction.description || transaction.reason || "No description provided"}</p>
                                </div>
                                {transaction.receipt_url && (
                                  <div>
                                    <label className="text-sm font-medium">Receipt</label>
                                    <img
                                      src={transaction.receipt_url || "/placeholder.svg"}
                                      alt="Receipt"
                                      className="mt-2 max-w-full h-auto rounded-lg"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      
                      {transactions.filter((t: any) => t.status === 'pending').length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No urgent approvals required</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateUserModal 
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
        onUserCreated={() => {
          // Refresh the page to show the new user in the team list
          window.location.reload();
        }}
      />
      
      {/* Removed the unnecessary delegation modal - using the existing form in the Approval Delegation section */}
    </ResponsiveSidebar>
  );
}