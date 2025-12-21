"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import DashboardHeader from "@/components/dashboard-header"
import PublicHeader from "@/components/public-header"

interface UserProfile {
  id: string
  email?: string
  full_name: string
  role: string
}

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  
  // Check if we're on an auth page
  const isAuthPage = pathname?.startsWith('/auth') || false
  const isDashboardPage = pathname?.startsWith('/dashboard') || false

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
          const profile: UserProfile = {
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email || '',
            role: authUser.user_metadata?.role || 'user'
          }
          setUser(profile)
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

  // Determine which header to show
  // For dashboard pages, let the page component handle the header
  // For public pages, show the public header only if user is not authenticated
  const showDashboardHeader = isDashboardPage && user
  const showPublicHeader = !isDashboardPage && !isAuthPage

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showDashboardHeader && user && <DashboardHeader user={user} />}
      {showPublicHeader && <PublicHeader />}
      <main className="flex-1 bg-background">{children}</main>
    </div>
  )
}