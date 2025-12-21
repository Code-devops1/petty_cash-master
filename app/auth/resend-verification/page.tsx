"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import ResendVerificationForm from "@/components/resend-verification";

export default function ResendVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto bg-gradient-to-r from-primary to-secondary p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">CF</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">Resend Verification</h2>
          <p className="mt-2 text-muted-foreground">
            Enter your email to resend the verification email
          </p>
        </div>

        <ResendVerificationForm />

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}