"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resetPassword } from "@/lib/actions";
import { Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full py-6 text-base font-medium rounded-lg h-[52px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending Reset Link...
        </>
      ) : (
        "Send Reset Link"
      )}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      console.log("Password reset form submitted");
      const email = formData.get("email") as string;
      console.log("Reset requested for email:", email);
      
      const result = await resetPassword(email);
      console.log("Reset password action result:", result);
      return result;
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto bg-gradient-to-r from-primary to-secondary p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">CF</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">Reset your password</h2>
          <p className="mt-2 text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Card className="bg-background border-border shadow-lg">
          <form action={formAction}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Password Reset</CardTitle>
              <CardDescription>
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {state?.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {state.error}
                  </AlertDescription>
                </Alert>
              )}
              
              {state?.success && (
                <Alert>
                  <AlertDescription>
                    {state.success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="py-5"
                  onChange={(e) => console.log("Email input changed:", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <SubmitButton />
              <div className="text-center text-sm text-muted-foreground">
                <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        {/* Add debug information in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Debug Info:</p>
            <p>Status: {isPending ? 'Submitting...' : 'Idle'}</p>
            {state && <p>State: {JSON.stringify(state)}</p>}
          </div>
        )}
      </div>
    </div>
  );
}