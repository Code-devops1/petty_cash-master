"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LogOut,
  Settings,
  Activity,
  DollarSign,
  Users,
  Phone,
  TrendingUp,
  CreditCard,
  BarChart3,
  FileText,
  Send,
  Menu
} from "lucide-react";
import { signOut } from "@/lib/actions";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  href?: string;
  icon: ReactNode;
  onClick?: () => void;
}

interface User {
  full_name: string;
  role: string;
  is_active?: boolean;
}

interface ResponsiveSidebarProps {
  user: User;
  navItems: NavItem[];
  children?: ReactNode;
  sidebarTitle: string;
  sidebarSubtitle: string;
}

export default function ResponsiveSidebar({
  user,
  navItems,
  children,
  sidebarTitle,
  sidebarSubtitle,
}: ResponsiveSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size to determine mobile view
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Always show sidebar on larger screens, hide on mobile
      setSidebarOpen(window.innerWidth >= 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById("responsive-sidebar");
        const menuButton = document.querySelector("#menu-toggle");
        
        if (sidebar && menuButton && 
            !sidebar.contains(event.target as Node) && 
            !menuButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Close sidebar when a nav link is clicked
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <div className="md:hidden p-4 border-b flex items-center justify-between">
          <Button
            id="menu-toggle"
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-xl font-bold">{sidebarTitle}</h1>
          <div className="w-8"></div> {/* Empty element to balance the flex layout and center the title */}
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div
          id="responsive-sidebar"
          className={cn(
            "bg-background border-r border-border fixed md:static z-40 h-full transition-all duration-300 flex flex-col",
            sidebarOpen 
              ? "w-64 left-0" 
              : "w-0 -translate-x-full md:w-16 md:translate-x-0 overflow-hidden",
            isMobile ? "top-16" : "top-0"
          )}
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-primary">{sidebarTitle}</h2>
            <p className="text-sm text-muted-foreground">{sidebarSubtitle}</p>
          </div>
          
          <nav className={`flex-1 px-4 space-y-1 overflow-y-auto py-4 ${isMobile ? 'max-h-[50vh]' : ''}`}>
            {navItems.map((item, index) => {
              // If onClick is provided, use a button instead of Link
              if (item.onClick) {
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      item.onClick?.();
                      handleNavClick();
                    }}
                  >
                    {item.icon}
                    <span className={sidebarOpen ? "inline" : "hidden lg:hidden"}>{item.title}</span>
                  </Button>
                );
              }
              
              // Otherwise, use Link for navigation
              return (
                <Link 
                  key={index} 
                  href={item.href || '#'}
                  onClick={handleNavClick}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    {item.icon}
                    <span className={sidebarOpen ? "inline" : "hidden lg:hidden"}>{item.title}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section at Bottom */}
          <div className={`p-4 border-t border-border ${isMobile ? 'flex-shrink-0' : ''}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className={cn("flex-1 min-w-0", sidebarOpen ? "block" : "hidden lg:block")}>
                    <p className="text-sm font-medium truncate">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn("h-8 w-8 p-0", sidebarOpen ? "block" : "hidden lg:block")}
                    asChild
                  >
                    <Link href="/dashboard/settings" onClick={handleNavClick}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={signOut}>
                    <button type="submit" className="flex items-center space-x-2 w-full cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          sidebarOpen ? "md:ml-64" : "md:ml-0",
          isMobile ? "mt-0" : ""
        )}>
          {children}
        </div>
      </div>
    </>
  );
}