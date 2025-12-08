import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function UsersPage() {
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

  if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  // Since there's no separate users table, we can't display a user list
  // In a real application, you might query the auth.users table directly if you have permissions

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        <div className="bg-card border-border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-foreground">User Management Not Available</h2>
          <p className="text-muted-foreground">
            User management is not available in this demo version. 
            In a production environment, this would connect to the authentication system to manage users.
          </p>
        </div>
      </div>
    </div>
  )
}
