import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ComprehensiveAdminDashboard from "@/components/comprehensive-admin-dashboard"
import TechnicianDashboard from "@/components/technician-dashboard"

export default async function DashboardPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Get the user from the server
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile from auth metadata (since there's no separate users table in this schema)
  const userProfile = {
    id: user?.id,
    email: user?.email,
    full_name: user?.user_metadata?.full_name || user?.email,
    role: user?.user_metadata?.role || "technician", // Default to technician if no role specified
    phone_number: user?.user_metadata?.phone_number || ""
  }

  // For admin users, prepare additional data
  if (
    userProfile?.role === "admin" ||
    userProfile?.role === "ADMIN" ||
    userProfile?.role === "super_admin" ||
    userProfile?.role === "finance_admin" ||
    userProfile?.role === "manager" ||
    userProfile?.role === "MANAGER"
  ) {
    // Get all transactions for admin view
    let allTransactions = [];
    let systemStats = {
      totalAmount: 0,
      pendingCount: 0,
      completedCount: 0
    };
    let disbursements = [];
    
    try {
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select(`
          *,
          user_id:user_id
        `)
        .order("created_at", { ascending: false })
        .limit(100)
      
      allTransactions = transactionsData || []
      
      // Get system-wide statistics
      const totalAmount = allTransactions.reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0)
      const pendingCount = allTransactions.filter((t: any) => t.status === "PENDING").length
      const completedCount = allTransactions.filter((t: any) => t.status === "COMPLETED").length
      
      systemStats = {
        totalAmount,
        pendingCount,
        completedCount
      }
      
      // Get disbursements data
      const { data: disbursementsData } = await supabase
        .from("transactions")
        .select("*")
        .neq("mpesa_receipt_id", null)
        .order("created_at", { ascending: false })
        .limit(50)
      
      disbursements = disbursementsData || []
    } catch (error) {
      console.error('Error fetching admin data:', error)
    }

    return (
      <ComprehensiveAdminDashboard
        user={user}
        profile={userProfile}
        transactions={allTransactions}
        users={[]} // Empty array since we can't access users table
        systemStats={systemStats}
        disbursements={disbursements}
      />
    )
  }

  // Get user statistics by querying transactions directly
  let userTransactions = [];
  try {
    // Simplified query to test
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("id, status")
      .eq("user_id", user?.id)
      .limit(100); // Limit the results to avoid performance issues
    
    if (transactionsError) {
      console.error('Error fetching user transactions:', transactionsError);
      // Provide empty array as fallback to prevent app crash
      userTransactions = [];
    } else {
      userTransactions = transactionsData || [];
    }
  } catch (error) {
    console.error('Unexpected error fetching user transactions:', error instanceof Error ? error.message : JSON.stringify(error));
    // Provide empty array as fallback to prevent app crash
    userTransactions = [];
  }

  // Calculate stats from the transactions data
  const totalRequested = userTransactions.length;
  const totalApproved = userTransactions.filter((t: any) => 
    t.status?.toUpperCase() === "COMPLETED"
  ).length;
  const pendingCount = userTransactions.filter((t: any) => 
    t.status?.toUpperCase() === "PENDING"
  ).length;

  const safeStats = {
    totalRequested,
    totalApproved,
    pendingCount
  }

  // Render different dashboards based on user role
  if (userProfile?.role === "technician" || userProfile?.role === "user" || userProfile?.role === "TECHNICIAN") {
    return (
      <TechnicianDashboard 
        profile={userProfile}
        monthlyStats={{
          totalCount: safeStats.totalRequested,
          totalAmount: 0, // Would need to calculate actual amount
          approvedCount: safeStats.totalApproved,
          pendingCount: safeStats.pendingCount,
        }}
      />
    )
  }

  // Default fallback
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Welcome to the Dashboard</h1>
        <p className="text-muted-foreground">Your role is: {userProfile?.role || "Unknown"}</p>
      </div>
    </div>
  )
}