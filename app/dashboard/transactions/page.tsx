import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TransactionList from "@/components/transaction-list"

export default async function TransactionsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if user is not authenticated
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

  // Get all user's transactions
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(`
      *,
      categories(name),
      subcategories(name)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  console.log("Transactions query result:", { transactions, error });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Transactions</h1>
      <TransactionList transactions={transactions || []} />
    </div>
  )
}