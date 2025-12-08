"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import DashboardHeader from "@/components/dashboard-header"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  
  // Check if we're on an auth page
  const isAuthPage = pathname.startsWith('/auth')

  useEffect(() => {
    const fetchUser = async () => {
      // Don't fetch user data on auth pages
      if (isAuthPage) {
        setLoading(false)
        return
      }
      
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Get user profile from auth metadata
          const userProfile = {
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email,
            role: authUser.user_metadata?.role || "technician"
          }
          setUser(userProfile)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [isAuthPage, pathname])

  // Show loading state while checking auth status
  if (loading && !isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Always show header except on auth pages
  const showHeader = !isAuthPage

  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && user && <DashboardHeader user={user} />}
      <main className="flex-1">{children}</main>
    </div>
  )
}