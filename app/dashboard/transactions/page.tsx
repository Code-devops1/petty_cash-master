import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TransactionList from "@/components/transaction-list"

export default async function TransactionsPage() {
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
  console.log("Error details:", JSON.stringify(error, null, 2));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Transactions</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold">Error loading transactions:</h2>
          <p>Message: {error.message}</p>
          <p>Code: {error.code}</p>
          <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      <TransactionList transactions={transactions || []} />
    </div>
  )
}