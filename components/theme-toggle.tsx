"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    try {
      setTheme(theme === "light" ? "dark" : "light")
    } catch (error) {
      console.error("Error toggling theme:", error)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-8 w-8 rounded-full hover:bg-primary/10"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}