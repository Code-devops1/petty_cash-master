"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { sendSMS, generateVerificationCode, isTwilioConfigured } from "@/lib/sms"

// Sign in action
export async function signIn(prevState: any, formData: FormData) {
  console.log("=== SIGN IN PROCESS STARTED ===");
  
  if (!formData) {
    console.log("Form data is missing");
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    console.log("Email or password missing");
    return { error: "Email and password are required" }
  }

  console.log("Attempting sign in for email:", email);

  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    console.log("Supabase auth response:", { data, error });

    if (error) {
      console.log("Sign in error:", error.message);
      return { error: error.message }
    }

    // Check if user is verified
    if (data.user && !data.user.email_confirmed_at) {
      console.log("User not verified, email confirmation required");
      return { 
        error: "Please verify your email address before signing in. Check your inbox for the verification email." 
      };
    }

    console.log("Sign in successful for user:", data.user?.id);
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Google OAuth sign in
export async function signInWithGoogle() {
  console.log("=== GOOGLE SIGN IN PROCESS STARTED ===");
  
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
      },
    })

    if (error) {
      console.log("Google sign in error:", error.message);
      return { error: error.message }
    }

    console.log("Google sign in successful, redirecting to:", data.url);
    redirect(data.url)
  } catch (error) {
    console.error("Google sign in error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Google OAuth sign up
export async function signUpWithGoogle() {
  console.log("=== GOOGLE SIGN UP PROCESS STARTED ===");
  
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
      },
    })

    if (error) {
      console.log("Google sign up error:", error.message);
      return { error: error.message }
    }

    console.log("Google sign up successful, redirecting to:", data.url);
    redirect(data.url)
  } catch (error) {
    console.error("Google sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Sign up action
export async function signUp(prevState: any, formData: FormData) {
  console.log("=== SIGN UP PROCESS STARTED ===");
  
  if (!formData) {
    console.log("Form data is missing");
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")
  const phoneNumber = formData.get("phoneNumber")
  const employeeId = formData.get("employeeId")
  const role = formData.get("role")

  console.log("Form data received:", { email, fullName, phoneNumber, employeeId, role });

  if (!email || !password || !fullName || !role) {
    console.log("Missing required fields");
    return { error: "Email, password, full name, and role are required" }
  }

  const supabase = createClient()

  try {
    console.log("Checking if user already exists in auth system");

    // First check if user already exists in public.users table
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toString())
      .single();

    if (existingUser && !existingUserError) {
      console.log("User already exists in users table");
      return { error: "An account with this email already exists." };
    }

    console.log("Attempting to sign up user with Supabase Auth");
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

    console.log("Supabase auth response:", { authData, authError });

    if (authError) {
      console.log("Supabase auth error:", authError.message);
      return { error: authError.message }
    }

    // Check if user was created successfully
    if (!authData?.user) {
      console.log("User creation failed - no user data returned");
      return { error: "Failed to create user account. Please try again." };
    }

    console.log("User created successfully in auth system with ID:", authData.user.id);
    
    // Check if confirmation email will be sent
    if (authData.user.identities && authData.user.identities.length === 0) {
      console.log("User might already exist or there was an issue with identity creation");
      return { 
        error: "There was an issue creating your account. If you already have an account, please sign in instead." 
      };
    }

    // Also add the user to the public.users table
    console.log("Adding user to public.users table");
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email.toString(),
        full_name: fullName.toString(),
        phone_number: phoneNumber?.toString() || null,
        role: role.toString(),
        employee_id: employeeId?.toString() || null,
        // Department is not in the form, so we'll leave it null for now
        department: null
      });

    if (insertError) {
      console.log("Error inserting user into public.users table:", insertError);
      // This is not a critical error, but we should log it
      // The sync script can be run later to sync users
    } else {
      console.log("User successfully added to public.users table");
    }
    
    console.log("=== SIGN UP PROCESS COMPLETED SUCCESSFULLY ===");
    return { 
      success: "Account created successfully! Please check your email for verification instructions. If you don't see an email, check your spam folder.", 
      userId: authData.user.id 
    };
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
  const supabase = createClient();
  
  await supabase.auth.signOut()
  redirect("/auth/login")
}

// Password reset action
export async function resetPassword(email: string) {
  console.log("=== PASSWORD RESET PROCESS STARTED ===");
  console.log("Input email:", email);
  
  try {
    const supabase = createClient();
    console.log("Supabase client created successfully");
    
    // Check if user exists in the users table
    console.log("Checking if user exists in 'users' table");
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    console.log("Users table query result:", { userData, userError });
    
    if (userError || !userData) {
      console.log("User not found in users table:", userError?.message || "User record not found");
      // Still proceed with password reset as the user might exist in auth but not in users table
    } else {
      console.log("User found in users table:", userData);
    }
    
    // Check if user exists in auth system
    console.log("Checking if user exists in auth system");
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUserByEmail(email);
    console.log("Auth system query result:", { authUser, authError });
    
    if (authError || !authUser) {
      console.log("User not found in auth system:", authError?.message || "User not found in auth");
      return { error: "No account found with that email address." };
    }
    
    console.log("User found in auth system, proceeding with password reset");
    console.log("User ID:", authUser.id);
    console.log("User email:", authUser.email);

    // Send password reset email
    console.log("Sending password reset email to:", email);
    console.log("Redirect URL:", `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/update-password`);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/update-password`
    });

    console.log("Supabase resetPasswordForEmail response:", { data, error });

    if (error) {
      console.error("Password reset error from Supabase:", error);
      return { error: "Failed to send password reset email. Please try again." };
    }
    
    console.log("Password reset email sent successfully", data);
    console.log("=== PASSWORD RESET PROCESS COMPLETED ===");

    return { success: "If your email is registered, you'll receive a password reset link shortly." };
  } catch (error) {
    console.error("Unexpected error during password reset:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// Send verification code via SMS
export async function sendVerificationCode(phoneNumber: string) {
  try {
    // Validate phone number format (basic validation)
    if (!phoneNumber || phoneNumber.length < 10) {
      return { error: "Please provide a valid phone number" };
    }
    
    const supabase = createClient();

    // Generate verification code
    const code = generateVerificationCode();
    
    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Store code in database
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        phone_number: phoneNumber,
        code: code,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error("Error saving verification code:", insertError);
      return { error: "Failed to generate verification code. Please try again." };
    }

    // Send SMS with verification code
    const message = `Your verification code is: ${code}. This code will expire in 10 minutes.`;
    const smsResult = await sendSMS(phoneNumber, message);

    if (!smsResult.success) {
      console.error("Error sending SMS:", smsResult.error);
      // Even if SMS fails, we still return success because the code was generated
      // In a production app, you might want to handle this differently
      if (!isTwilioConfigured) {
        return { 
          success: "Verification code generated successfully. Check console logs for simulated SMS.", 
          code: isTwilioConfigured ? undefined : code // Only expose code in non-production environments
        };
      }
      return { error: "Failed to send verification SMS. Please try again." };
    }

    return { success: "Verification code sent successfully" };
  } catch (error) {
    console.error("Unexpected error during verification code generation:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// Verify SMS code
export async function verifyCode(phoneNumber: string, code: string) {
  try {
    const supabase = createClient();
    
    // Validate inputs
    if (!phoneNumber || !code) {
      return { error: "Phone number and code are required" };
    }

    // Find valid code for this phone number
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('code', code)
      .gte('expires_at', new Date().toISOString())
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { error: "Invalid or expired verification code" };
    }

    // Mark code as used
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', data.id);

    if (updateError) {
      console.error("Error marking code as used:", updateError);
      // Not returning error here as the verification was successful
    }

    return { success: "Phone number verified successfully" };
  } catch (error) {
    console.error("Unexpected error during code verification:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function syncAuthUsers() {
  console.log("=== SYNC AUTH USERS PROCESS STARTED ===");
  
  try {
    const supabase = createClient();
    
    // Get all users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log("Error fetching auth users:", authError);
      return { error: "Failed to fetch auth users" };
    }
    
    console.log(`Found ${authUsers?.length} users in auth system`);
    
    // Sync each user to public.users table
    let syncedCount = 0;
    let skippedCount = 0;
    
    for (const user of authUsers.users) {
      // Check if user already exists in public.users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (existingUser) {
        skippedCount++;
        continue;
      }
      
      // Insert user into public.users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          phone_number: user.user_metadata?.phone_number || null,
          role: user.user_metadata?.role || 'technician',
          employee_id: user.user_metadata?.employee_id || null,
          department: user.user_metadata?.department || null
        });
        
      if (insertError) {
        console.log(`Error inserting user ${user.id}:`, insertError);
      } else {
        syncedCount++;
      }
    }
    
    console.log(`Sync completed: ${syncedCount} users added, ${skippedCount} users already existed`);
    console.log("=== SYNC AUTH USERS PROCESS COMPLETED ===");
    
    return { 
      success: `Sync completed: ${syncedCount} users added, ${skippedCount} users already existed` 
    };
  } catch (error) {
    console.error("Sync error:", error);
    return { error: "An unexpected error occurred during sync" };
  }
}

export async function resendVerificationEmail(email: string) {
  console.log("=== RESEND VERIFICATION EMAIL PROCESS STARTED ===");
  console.log("Resending verification email for:", email);
  
  try {
    const supabase = createClient();
    
    // Request verification email resend
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`
      }
    });

    if (error) {
      console.log("Error resending verification email:", error.message);
      return { error: error.message };
    }

    console.log("Verification email resent successfully");
    console.log("=== RESEND VERIFICATION EMAIL PROCESS COMPLETED ===");
    return { success: "Verification email sent. Please check your inbox and spam folder." };
  } catch (error) {
    console.error("Error resending verification email:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function createTransaction(formData: FormData) {
  const supabase = createClient();
  
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

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  console.log("=== TOGGLE USER STATUS PROCESS STARTED ===");
  console.log("Toggling status for user:", userId);
  
  try {
    const supabase = createClient();
    
    // Update user status
    const { error } = await supabase
      .from('users')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    if (error) {
      console.log("Error toggling user status:", error.message);
      return { error: error.message };
    }

    console.log("User status updated successfully");
    console.log("=== TOGGLE USER STATUS PROCESS COMPLETED ===");
    return { success: "User status updated successfully" };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function addUser(userData: any) {
  console.log("=== ADD USER PROCESS STARTED ===");
  console.log("Adding new user:", userData);
  
  try {
    const supabase = createClient();
    
    // Insert new user
    const { error } = await supabase
      .from('users')
      .insert([userData]);

    if (error) {
      console.log("Error adding user:", error.message);
      return { error: error.message };
    }

    console.log("User added successfully");
    console.log("=== ADD USER PROCESS COMPLETED ===");
    return { success: "User added successfully" };
  } catch (error) {
    console.error("Add user error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function updateUser(userId: string, userData: any) {
  console.log("=== UPDATE USER PROCESS STARTED ===");
  console.log("Updating user:", userId, userData);
  
  try {
    const supabase = createClient();
    
    // Update user
    const { error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId);

    if (error) {
      console.log("Error updating user:", error.message);
      return { error: error.message };
    }

    console.log("User updated successfully");
    console.log("=== UPDATE USER PROCESS COMPLETED ===");
    return { success: "User updated successfully" };
  } catch (error) {
    console.error("Update user error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// Admin creates a new user
export async function adminCreateUser(
  email: string,
  password: string,
  fullName: string,
  phoneNumber: string | null,
  employeeId: string | null,
  role: string,
  department: string | null
) {
  console.log("=== ADMIN CREATE USER PROCESS STARTED ===");
  
  console.log("Creating user with data:", { email, fullName, phoneNumber, employeeId, role, department });

  const supabase = createClient();

  try {
    console.log("Checking if user already exists in auth system");
    // First check if user already exists in public.users table
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser && !existingUserError) {
      console.log("User already exists in users table");
      return { error: "An account with this email already exists." };
    }

    console.log("Attempting to create user with Supabase Auth");
    // Create the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber || null,
          employee_id: employeeId || null,
          role
        },
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
      },
    })

    console.log("Supabase auth response:", { authData, authError });

    if (authError) {
      console.log("Supabase auth error:", authError.message);
      return { error: authError.message }
    }

    // Check if user was created successfully
    if (!authData?.user) {
      console.log("User creation failed - no user data returned");
      return { error: "Failed to create user account. Please try again." };
    }

    console.log("User created successfully in auth system with ID:", authData.user.id);
    
    // Check if confirmation email will be sent
    if (authData.user.identities && authData.user.identities.length === 0) {
      console.log("User might already exist or there was an issue with identity creation");
      return { 
        error: "There was an issue creating the account. If the user already has an account, please use a different email." 
      };
    }

    // Also add the user to the public.users table
    console.log("Adding user to public.users table");
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone_number: phoneNumber || null,
        role,
        employee_id: employeeId || null,
        department: department || null
      });

    if (insertError) {
      console.log("Error inserting user into public.users table:", insertError);
      // This is not a critical error, but we should log it
      // The sync script can be run later to sync users
    } else {
      console.log("User successfully added to public.users table");
    }
    
    console.log("=== ADMIN CREATE USER PROCESS COMPLETED SUCCESSFULLY ===");
    return { 
      success: "User account created successfully! The user will receive an email with instructions to set their password.", 
      userId: authData.user.id 
    };
  } catch (error) {
    console.error("Admin create user error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}