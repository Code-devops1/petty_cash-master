"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, MapPin, Upload, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Category {
  id: string
  name: string
  allocation_percentage: number
  monthly_limit: number
}

interface ExpenseFormProps {
  categories: Category[]
  userId: string
}

export default function ExpenseForm({ categories, userId }: ExpenseFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCategory = searchParams.get("category")

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category_id: "",
    location: "",
    receipt_url: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  // Set preselected category if available
  useState(() => {
    if (preselectedCategory) {
      const category = categories.find((c) => c.name.toLowerCase().includes(preselectedCategory))
      if (category) {
        setFormData((prev) => ({ ...prev, category_id: category.id }))
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Define the transaction data
      const transactionData = {
        user_id: userId,
        amount: Number.parseFloat(formData.amount),
        description: formData.description,
        category_id: formData.category_id,
        location: formData.location,
        receipt_url: formData.receipt_url,
        status: "pending",
        transaction_type: "expense",
      };

      const { error: insertError } = await supabase
        .from("transactions")
        .insert([transactionData] as any); // Type assertion only for this specific operation

      if (insertError) throw insertError

      router.push("/dashboard?success=expense-submitted")
    } catch (err: any) {
      setError(err.message || "Failed to submit expense")
    } finally {
      setLoading(false)
    }
  }

  const getLocationFromGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Amount Input */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold text-foreground">Expense Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <Label htmlFor="amount" className="text-foreground">Amount (KSh)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                className="text-lg h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold text-foreground">Expense Category</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
              required
            >
              <SelectTrigger className="h-12 bg-background border-border text-foreground">
                <SelectValue placeholder="Select expense category" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {categories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    className="text-foreground hover:bg-accent"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{category.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{category.allocation_percentage}%</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold text-foreground">Description</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              placeholder="Describe the expense (e.g., Transport from office to client site)"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="min-h-20 bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold text-foreground">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter location or use GPS"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="flex-1 h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={getLocationFromGPS}
                className="border-border"
              >
                <MapPin className="h-4 w-4" />
                <span className="sr-only">Get location</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Upload */}
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold text-foreground">Receipt (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 bg-transparent border-border hover:bg-accent"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 bg-transparent border-border hover:bg-accent"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            type="submit" 
            className="flex-1 h-12 text-base"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Expense Request"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/dashboard")}
            className="flex-1 h-12 border-border"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
