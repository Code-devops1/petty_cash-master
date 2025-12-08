"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

// Sign in action
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = (createServerActionClient)({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Sign up action
export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")
  const phoneNumber = formData.get("phoneNumber")
  const employeeId = formData.get("employeeId")
  const role = formData.get("role")

  if (!email || !password || !fullName || !role) {
    return { error: "Email, password, full name, and role are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        data: {
          full_name: fullName.toString(),
          phone_number: phoneNumber?.toString() || null,
          employee_id: employeeId?.toString() || null,
          role: role.toString()
        },
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    // No need to insert into a separate users table
    // since user data is now stored in auth metadata

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUpWithEmail(email: string, password: string, full_name: string) {
  const supabase = createClient()
  
  // Sign up the user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role: "technician" // Default role for new users
      }
    }
  })
  
  if (error) {
    return { error: error.message }
  }
  
  // No need to insert into a separate users table since user data is stored in auth metadata
  return { data }
}

// Sign out action
export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function createTransaction(formData: FormData) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }
  
  // Extract form data
  const amount = Number(formData.get("amount"))
  const categoryId = formData.get("categoryId") as string
  const subcategoryId = formData.get("subcategoryId") as string
  const routeId = formData.get("routeId") as string
  const reason = formData.get("reason") as string
  const quantity = Number(formData.get("quantity")) || 1
  
  // Calculate total amount
  const totalAmount = amount * quantity
  
  // Insert transaction
  const { error } = await supabase
    .from("transactions")
    .insert({
      amount: amount,
      quantity: quantity,
      total_amount: totalAmount,
      reason: reason,
      user_id: user.id,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      route_id: routeId || null,
      status: "PENDING"
    })
  
  if (error) {
    throw new Error(error.message)
  }
  
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/transactions")
}
