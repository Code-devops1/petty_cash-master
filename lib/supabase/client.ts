import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null

export const createClient = () => {
  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    throw new Error("Supabase environment variables are not configured")
  }

  // Return the existing instance if it exists
  if (clientInstance) {
    return clientInstance
  }

  // Create a new instance and store it
  clientInstance = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return clientInstance
}

export const supabase = () => {
  // Check if Supabase is configured before trying to create a client
  if (!isSupabaseConfigured) {
    // Return a dummy client that will throw errors only when methods are called
    return {
      auth: {
        getUser: () => Promise.reject(new Error("Supabase not configured")),
        getSession: () => Promise.reject(new Error("Supabase not configured")),
        getSessionOrUser: () => Promise.reject(new Error("Supabase not configured")),
      },
      from: () => {
        throw new Error("Supabase is not configured")
      },
      rpc: () => Promise.reject(new Error("Supabase not configured")),
    } as any
  }
  
  return createClient()
}

export default supabase