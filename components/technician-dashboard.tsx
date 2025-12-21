"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Plus, 
  Camera, 
  Navigation, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  CheckCircle 
} from "lucide-react"
interface TechnicianDashboardProps {
  profile: {
    full_name: string
    role: string
    email?: string
  }
  monthlyStats: {
    totalCount: number
    totalAmount: number
    approvedCount: number
    pendingCount: number
  }
}

export default function TechnicianDashboard({ 
  profile, 
  monthlyStats 
}: TechnicianDashboardProps) {
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {profile.full_name}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Stats and Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Monthly Stats */}
            <Card className="bg-gradient-card-light dark:bg-gradient-card-dark border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-card-foreground">This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold text-foreground">{monthlyStats.totalCount}</p>
                  </div>
                  <div className="p-2 bg-gradient-primary rounded-full">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Requested</p>
                    <p className="text-2xl font-bold text-foreground">KSh {monthlyStats.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-gradient-primary rounded-full">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-foreground">{monthlyStats.approvedCount}</p>
                  </div>
                  <div className="p-2 bg-gradient-primary rounded-full">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-card-light dark:bg-gradient-card-dark border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/transactions/new">
                  <Button className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-14 flex-col bg-transparent border-border text-foreground hover:bg-muted">
                    <Camera className="h-5 w-5 mb-1" />
                    <span className="text-xs">Scan Receipt</span>
                  </Button>
                  <Button variant="outline" className="h-14 flex-col bg-transparent border-border text-foreground hover:bg-muted">
                    <Navigation className="h-5 w-5 mb-1" />
                    <span className="text-xs">Route Fare</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests Alert */}
            {monthlyStats.pendingCount > 0 && (
              <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        {monthlyStats.pendingCount} Pending Request{monthlyStats.pendingCount > 1 ? "s" : ""}
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Awaiting manager approval</p>
                      <Link href="/dashboard/transactions?status=pending">
                        <Button variant="outline" size="sm" className="mt-2 bg-white border-amber-300 text-amber-700 hover:bg-amber-50 dark:bg-amber-900/50 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-800/50">
                          View Requests
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Recent Transactions */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card-light dark:bg-gradient-card-dark border-border shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-card-foreground">
                    <span>Recent Requests</span>
                  </CardTitle>
                  <Link href="/dashboard/transactions">
                    <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mx-auto bg-gradient-primary p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No Recent Requests</h3>
                  <p className="text-muted-foreground mt-1">
                    Your recent petty cash requests will appear here
                  </p>
                  <Link href="/dashboard/transactions/new">
                    <Button className="mt-4 bg-gradient-primary hover:opacity-90 text-primary-foreground">
                      Create Request
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
