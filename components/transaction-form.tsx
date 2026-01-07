"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  description: string
}

interface TransactionFormProps {
  categories: Category[]
  userId: string
}

export default function TransactionForm({ categories, userId }: TransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    console.log("Form submission started");
    console.log("User ID:", userId);

    try {
      const amount = formData.get("amount")
      const description = formData.get("description")
      const categoryId = formData.get("categoryId")
      const location = formData.get("location")
      const transactionType = formData.get("transactionType")
      
      console.log("Form data:", { amount, description, categoryId, location, transactionType });

      if (!amount || !description || !categoryId || !transactionType) {
        throw new Error("Please fill in all required fields")
      }

      const supabase = createClient()
      console.log("Checking if user exists in auth.users...");
      
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
        
      console.log("User check result:", { userData, userError });
      
      if (userError) {
        console.error("User check error:", userError);
      }

      console.log("Inserting transaction...");
      
      const transactionData = {
        user_id: userId,
        category_id: categoryId.toString(),
        amount: Number(amount),
        description: description?.toString() || "",
        location: location?.toString() || null,
        transaction_type: transactionType?.toString() || "",
        status: "pending",
      };
      
      console.log("Transaction data to insert:", transactionData);
      
      const { error: insertError, data: insertData } = await supabase
        .from("transactions")
        // Type assertion to work around type mismatch
        .insert([transactionData] as any)
        .select();
      
      console.log("Insert result:", { insertError, insertData });
      
      // Let's also check if we can retrieve the transaction we just inserted
      if (!insertError) {
        console.log("Checking if transaction was inserted...");
        const { data: checkData, error: checkError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .limit(5);
          
        console.log("Check query result:", { checkData, checkError });
      }

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error(insertError.message || "Failed to insert transaction");
      }

      console.log("Redirecting to transactions page...");
      router.push("/dashboard/transactions")
    } catch (err) {
      console.error("Error in form submission:", err);
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">New Expense Request</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/dashboard/transactions")}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">Amount (KSh)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1000.00"
                required
                className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-foreground">Category</Label>
              <Select name="categoryId" required>
                <SelectTrigger className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      className="text-foreground hover:bg-accent"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionType" className="text-foreground">Transaction Type</Label>
            <Select name="transactionType" required>
              <SelectTrigger className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="fuel" className="text-foreground hover:bg-accent">Fuel</SelectItem>
                <SelectItem value="transport" className="text-foreground hover:bg-accent">Transport</SelectItem>
                <SelectItem value="meals" className="text-foreground hover:bg-accent">Meals</SelectItem>
                <SelectItem value="materials" className="text-foreground hover:bg-accent">Materials</SelectItem>
                <SelectItem value="emergency" className="text-foreground hover:bg-accent">Emergency</SelectItem>
                <SelectItem value="other" className="text-foreground hover:bg-accent">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the expense in detail..."
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">Location (Optional)</Label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="Where was this expense incurred?"
              className="h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/dashboard/transactions")}
              disabled={loading}
              className="flex-1 h-12 border-border"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}