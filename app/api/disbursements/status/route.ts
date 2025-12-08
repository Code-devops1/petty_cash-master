import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transactionId")
    const status = searchParams.get("status")

    const supabase = createClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase
      .from("disbursements")
      .select(`
        *,
        transactions!inner(
          description,
          users!inner(full_name, employee_id)
        )
      `)
      .order("initiated_at", { ascending: false })

    // Filter by transaction ID if provided
    if (transactionId) {
      query = query.eq("transaction_id", transactionId)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status)
    }

    const { data: disbursements, error } = await query

    if (error) {
      console.error("Error fetching disbursements:", error)
      return NextResponse.json({ error: "Failed to fetch disbursements" }, { status: 500 })
    }

    return NextResponse.json({ disbursements })
  } catch (error) {
    console.error("Error in disbursements status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
