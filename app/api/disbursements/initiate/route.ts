import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createClient()
  
  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // In this schema, user info is stored in auth metadata, not a separate users table
  const userProfile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email,
    role: user.user_metadata?.role || "technician"
  }
  
  // Check if user has permission to initiate disbursements
  if (userProfile.role !== "admin" && userProfile.role !== "ADMIN" && userProfile.role !== "finance_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const body = await request.json()
  const { transaction_id } = body
  
  try {
    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transaction_id)
      .single()
      
    if (transactionError) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }
    
    // Here you would implement the actual M-Pesa disbursement logic
    // For now, we'll just simulate a successful response
    
    // Update transaction status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ 
        status: "COMPLETED",
        mpesa_receipt_id: "SIMULATED_MPESA_" + Date.now()
      })
      .eq("id", transaction_id)
      
    if (updateError) {
      return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Disbursement initiated successfully",
      transaction_id 
    })
  } catch (error) {
    console.error("Error initiating disbursement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}