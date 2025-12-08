import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ExpenseForm from "@/components/expense-form"

export default async function NewExpensePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get expense categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <h1 className="text-xl font-semibold text-foreground">Submit New Expense</h1>
      </header>

      <div className="p-4">
        <ExpenseForm categories={categories || []} userId={user.id} />
      </div>
    </div>
  )
}
