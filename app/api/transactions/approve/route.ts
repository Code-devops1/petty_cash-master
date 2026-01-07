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
  
  // Check if user has permission to approve transactions
  if (userProfile.role !== "admin" && userProfile.role !== "ADMIN" && userProfile.role !== "manager" && userProfile.role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  const body = await request.json()
  const { transactionId, action } = body // Using transactionId instead of transaction_id
  
  try {
    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single()
      
    if (transactionError) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }
    
    let updateData: any = {};
    
    if (action === "approve") {
      // For approval, set status to 'approved' (not 'COMPLETED' as this is just approval)
      updateData = { 
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString()
      }
    } else if (action === "reject") {
      // For rejection, set status to 'rejected'
      updateData = { 
        status: "rejected"
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
    
    // Update transaction status
    const { error: updateError } = await (supabase
      .from("transactions") as any)
      .update(updateData)
      .eq("id", transactionId)
      
    if (updateError) {
      return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Transaction ${action === "approve" ? "approved" : "rejected"} successfully`,
      transactionId 
    })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}