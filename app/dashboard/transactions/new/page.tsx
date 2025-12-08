import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TransactionForm from "@/components/transaction-form"

export default async function NewTransactionPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile from auth metadata
  const userProfile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email,
    role: user.user_metadata?.role || "technician"
  }

  // Get expenditure categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">New Transaction Request</h1>
        <TransactionForm categories={categories || []} userId={user.id} />
      </main>
    </div>
  )
}
