"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { resendVerificationEmail } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Resend Verification Email"
      )}
    </Button>
  );
}

export default function ResendVerificationForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const email = formData.get("email") as string;
      console.log("Resend verification requested for email:", email);
      return await resendVerificationEmail(email);
    },
    null
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Resend Verification Email</CardTitle>
          <CardDescription>
            Enter your email address to resend the verification email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          
          {state?.success && (
            <Alert>
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}