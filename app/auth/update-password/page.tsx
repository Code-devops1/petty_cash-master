"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    console.log("Update password page loaded, checking session");
    // Check if there's a valid session for password reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session check result:", session ? "Valid session found" : "No valid session");
      
      // If no session, redirect to login
      if (!session) {
        console.log("No session found, redirecting to login");
        router.push("/auth/login");
      }
    };

    checkSession();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password update form submitted");
    setLoading(true);
    setError(null);

    // Validate passwords
    if (password.length < 6) {
      const errorMsg = "Password must be at least 6 characters long";
      console.log("Password validation failed:", errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = "Passwords do not match";
      console.log("Password validation failed:", errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      console.log("Updating user password");
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Password update error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log("Password updated successfully");
      setSuccess(true);
      setLoading(false);
      
      // Redirect to login after a short delay
      console.log("Setting redirect timeout to login page");
      setTimeout(() => {
        console.log("Redirecting to login page");
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      const errorMsg = "An unexpected error occurred. Please try again.";
      console.error("Unexpected error during password update:", err);
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto bg-gradient-to-r from-primary to-secondary p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">CF</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">Update Password</h2>
          <p className="mt-2 text-muted-foreground">
            Create a new password for your account
          </p>
        </div>

        <Card className="bg-background border-border shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">New Password</CardTitle>
              <CardDescription>
                Please enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert>
                  <AlertDescription>Password updated successfully! Redirecting to login...</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    console.log("Password input changed, length:", e.target.value.length);
                  }}
                  placeholder="Enter new password"
                  required
                  className="py-5"
                  disabled={loading || success}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    console.log("Confirm password input changed");
                  }}
                  placeholder="Confirm new password"
                  required
                  className="py-5"
                  disabled={loading || success}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                disabled={loading || success}
                className="w-full py-6 text-base font-medium rounded-lg h-[52px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}