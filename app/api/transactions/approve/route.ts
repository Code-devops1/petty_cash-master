import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
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
  
  // Check if user has permission to approve transactions
  if (userProfile.role !== "admin" && userProfile.role !== "ADMIN" && userProfile.role !== "manager" && userProfile.role !== "MANAGER") {
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
    
    // Update transaction status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ 
        status: "COMPLETED",
        approved_at: new Date().toISOString()
      })
      .eq("id", transaction_id)
      
    if (updateError) {
      return NextResponse.json({ error: "Failed to approve transaction" }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Transaction approved successfully",
      transaction_id 
    })
  } catch (error) {
    console.error("Error approving transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}