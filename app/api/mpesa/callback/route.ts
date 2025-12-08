import { type NextRequest, NextResponse } from "next/server"
import { processMpesaCallback } from "@/lib/mpesa"

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()

    // Process the callback
    await processMpesaCallback(callbackData)

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    })
  } catch (error) {
    console.error("M-Pesa callback error:", error)

    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc: "Failed to process callback",
      },
      { status: 500 },
    )
  }
}
