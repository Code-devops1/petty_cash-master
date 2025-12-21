"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, DollarSign } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full py-6 text-base font-medium rounded-lg h-[52px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Creating account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      // Auto-redirect after successful sign up
      const timer = setTimeout(() => {
        router.push("/auth/login")
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [state, router])

  return (
    <Card className="w-full shadow-lg border-border">
      <form action={formAction}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
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
              <AlertDescription>
                {state.success}
                <br />
                <span className="text-sm">
                  <strong>Note:</strong> If you don't receive an email:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Check your spam/junk folder</li>
                    <li>Contact your administrator to configure email delivery</li>
                    <li>Emails may take a few minutes to arrive</li>
                  </ul>
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              name="employeeId"
              type="text"
              placeholder="EMP-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue="technician">
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <SubmitButton />
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}