import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AnalyticsOverview from "@/components/analytics-overview"

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

  // Get analytics data
  const { data: transactions, error } = await supabase.from("transactions").select(`
    *,
    categories(name),
    subcategories(name)
  `)
  
  console.log("Analytics transactions data:", transactions);
  console.log("Analytics transactions error:", error);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <AnalyticsOverview 
        transactions={transactions || []} 
        disbursements={[]} 
      />
    </div>
  )
}