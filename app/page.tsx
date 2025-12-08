import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import icons to reduce bundle size
const DollarSign = dynamic(() => import("lucide-react").then((mod) => mod.DollarSign))
const Shield = dynamic(() => import("lucide-react").then((mod) => mod.Shield))
const Smartphone = dynamic(() => import("lucide-react").then((mod) => mod.Smartphone))
const TrendingUp = dynamic(() => import("lucide-react").then((mod) => mod.TrendingUp))

import Link from "next/link"

export default async function HomePage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Setup Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <CardDescription className="text-base text-muted-foreground">
              Connect Supabase to get started with the Petty Cash Management System
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Please configure your Supabase environment variables to enable all features.
            </p>
            <div className="pt-4">
              <Link href="https://github.com/vercel/next.js/issues/54754" target="_blank">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  View Setup Guide
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">CashFlow</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight">
              Manage Petty Cash with <span className="text-gradient">Precision</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-muted-foreground">
              Streamline your organization's petty cash management with our intuitive platform.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Everything you need to manage finances</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Powerful features designed to simplify your petty cash workflow.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-card-light dark:bg-gradient-card-dark border-border shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-gradient-primary p-3 rounded-full w-14 h-14 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-center text-foreground">Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Enterprise-grade security to protect your financial data.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card-light dark:bg-gradient-card-dark border-border shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-gradient-primary p-3 rounded-full w-14 h-14 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-center text-foreground">Mobile Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Access and manage your petty cash from any device.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card-light dark:bg-gradient-card-dark border-border shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-gradient-primary p-3 rounded-full w-14 h-14 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-center text-foreground">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Gain insights with real-time reporting and analytics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-blue-100">
            Join thousands of organizations streamlining their petty cash management.
          </p>
          <div className="mt-8">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-primary hover:bg-blue-50 px-8">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">CashFlow</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              &copy; {new Date().getFullYear()} Petty Cash Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}