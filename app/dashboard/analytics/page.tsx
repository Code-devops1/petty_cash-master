import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AnalyticsOverview from "@/components/analytics-overview"
import SpendingTrends from "@/components/spending-trends"
import CategoryBreakdown from "@/components/category-breakdown"
import PerformanceMetrics from "@/components/performance-metrics"

export default async function AnalyticsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile from auth metadata
  const userProfile = {
    id: user?.id,
    email: user?.email,
    full_name: user?.user_metadata?.full_name || user?.email,
    role: user?.user_metadata?.role || "technician"
  }

  // Redirect if not authenticated
  if (!user) {
    redirect("/auth/login")
  }

  // Only allow admin and manager roles to access analytics
  const allowedRoles = ['admin', 'ADMIN', 'manager', 'MANAGER']
  if (!allowedRoles.includes(userProfile.role)) {
    // Redirect technicians to their dashboard
    redirect("/dashboard")
  }

  // Get transactions data with related info
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select(`
      *,
      categories(name),
      users(full_name, department)
    `)
  
  // Get disbursements data
  const { data: disbursements, error: disbursementsError } = await supabase
    .from("disbursements")
    .select(`
      *,
      transactions(amount, status, created_at)
    `)
  
  // Get categories data
  const { data: categories, error: categoriesError } = await supabase
    .from("expenditure_categories")
    .select("*")

  // Get users data for department analysis
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, full_name, department")

  console.log("Analytics data:", { 
    transactions, 
    disbursements, 
    categories, 
    users,
    errors: {
      transactionsError,
      disbursementsError,
      categoriesError,
      usersError
    }
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      {/* Key Metrics Overview */}
      <AnalyticsOverview 
        transactions={transactions || []} 
        disbursements={disbursements || []} 
      />
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <SpendingTrends transactions={transactions || []} />
        <CategoryBreakdown 
          transactions={transactions || []} 
          categories={categories || []} 
        />
      </div>
      
      {/* Performance Metrics */}
      <div className="mt-6">
        <PerformanceMetrics 
          transactions={transactions || []} 
          disbursements={disbursements || []} 
        />
      </div>
    </div>
  )
}