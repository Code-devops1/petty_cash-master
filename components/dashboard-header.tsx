"use client"

import { Button } from "@/components/ui/button"
import { DollarSign, LogOut, User, Settings, Menu } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/lib/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardHeaderProps {
  user: {
    full_name: string
    role: string
    email?: string
  }
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

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
          <Link className="mr-6 flex items-center space-x-2" href="/dashboard">
            <div className="bg-gradient-to-r from-primary to-secondary p-1 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block text-foreground">CashFlow</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium text-foreground">
            <Link href="/dashboard" className="transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link href="/dashboard/transactions" className="transition-colors hover:text-primary">
              Transactions
            </Link>
            {(['admin', 'ADMIN', 'manager', 'MANAGER'].includes(user.role)) && (
              <Link href="/dashboard/analytics" className="transition-colors hover:text-primary">
                Analytics
              </Link>
            )}
            {(user.role === "admin" || user.role === "manager") && (
              <Link href="/dashboard/admin" className="transition-colors hover:text-primary">
                {user.role === "admin" ? "Admin" : "Management"}
              </Link>
            )}
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
              href="/dashboard"
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
                  href="/dashboard" 
                  onOpenChange={setMobileMenuOpen}
                  className="text-foreground hover:text-primary"
                >
                  Dashboard
                </MobileLink>
                <MobileLink 
                  href="/dashboard/transactions" 
                  onOpenChange={setMobileMenuOpen}
                  className="text-foreground hover:text-primary"
                >
                  Transactions
                </MobileLink>
                {(['admin', 'ADMIN', 'manager', 'MANAGER'].includes(user.role)) && (
                  <MobileLink 
                    href="/dashboard/analytics" 
                    onOpenChange={setMobileMenuOpen}
                    className="text-foreground hover:text-primary"
                  >
                    Analytics
                  </MobileLink>
                )}
                {(user.role === "admin" || user.role === "manager") && (
                  <MobileLink 
                    href="/dashboard/admin" 
                    onOpenChange={setMobileMenuOpen}
                    className="text-foreground hover:text-primary"
                  >
                    {user.role === "admin" ? "Admin" : "Management"}
                  </MobileLink>
                )}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full hover:bg-primary/10"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-primary to-secondary">
                      <User className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {user.full_name || user.email || "User"}
                    </p>
                    {user.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}