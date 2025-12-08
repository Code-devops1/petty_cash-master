import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check admin permissions using auth metadata
  const userProfile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email,
    role: user.user_metadata?.role || "technician"
  }

  if (userProfile.role !== "admin" && userProfile.role !== "ADMIN" && userProfile.role !== "manager" && userProfile.role !== "MANAGER") {
    redirect("/dashboard")
  }

  // Get statistics
  const { data: transactions } = await supabase.from("transactions").select("*")
  const { data: disbursements } = await supabase.from("disbursements").select("*")
  
  const totalTransactions = transactions?.length || 0
  const pendingTransactions = transactions?.filter((t: any) => t.status === "pending").length || 0
  const completedDisbursements = disbursements?.filter((d: any) => d.status === "completed").length || 0

  return (
    <AdminDashboard />
  )
}
