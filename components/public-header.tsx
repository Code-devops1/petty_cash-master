"use client"

import { Button } from "@/components/ui/button"
import { DollarSign, Menu } from "lucide-react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const MobileLink = ({ 
    href, 
    onOpenChange, 
    children, 
    className 
  }: { 
    href: string; 
    onOpenChange: (open: boolean) => void; 
    children: React.ReactNode;
    className?: string;
  }) => (
    <Link 
      href={href} 
      onClick={() => onOpenChange(false)}
      className={className}
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <div className="bg-gradient-to-r from-primary to-secondary p-1 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block text-foreground">CashFlow</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium text-foreground">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/#features" className="transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="/#pricing" className="transition-colors hover:text-primary">
              Pricing
            </Link>
          </nav>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6 text-foreground" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 bg-background">
            <MobileLink
              href="/"
              className="flex items-center text-foreground"
              onOpenChange={setMobileMenuOpen}
            >
              <div className="bg-gradient-to-r from-primary to-secondary p-1 rounded-md mr-2">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">CashFlow</span>
            </MobileLink>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                <MobileLink 
                  href="/" 
                  onOpenChange={setMobileMenuOpen}
                  className="text-foreground hover:text-primary"
                >
                  Home
                </MobileLink>
                <MobileLink 
                  href="/#features" 
                  onOpenChange={setMobileMenuOpen}
                  className="text-foreground hover:text-primary"
                >
                  Features
                </MobileLink>
                <MobileLink 
                  href="/#pricing" 
                  onOpenChange={setMobileMenuOpen}
                  className="text-foreground hover:text-primary"
                >
                  Pricing
                </MobileLink>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search functionality can be added here */}
          </div>
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}