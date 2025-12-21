"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendVerificationCode, verifyCode } from "@/lib/actions";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2, Phone } from "lucide-react";

interface SMSVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
}

export default function SMSVerification({ phoneNumber, onVerified }: SMSVerificationProps) {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendVerificationCode(phoneNumber);
      
      if (result.error) {
        setError(result.error);
      } else {
        setStep('verify');
        setSuccess("Verification code sent successfully!");
      }
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await verifyCode(phoneNumber, code);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Phone number verified successfully!");
        // Call the onVerified callback
        setTimeout(onVerified, 1000);
      }
    } catch (err) {
      setError("Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {step === 'send' ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>We'll send a verification code to {phoneNumber}</span>
          </div>
          
          <Button 
            onClick={handleSendCode} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Code...
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Enter Verification Code</Label>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
              pattern={REGEXP_ONLY_DIGITS}
              disabled={loading}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="w-12 h-12" />
                <InputOTPSlot index={1} className="w-12 h-12" />
                <InputOTPSlot index={2} className="w-12 h-12" />
                <InputOTPSlot index={3} className="w-12 h-12" />
                <InputOTPSlot index={4} className="w-12 h-12" />
                <InputOTPSlot index={5} className="w-12 h-12" />
              </InputOTPGroup>
            </InputOTP>
            
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to your phone
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleVerifyCode} 
              disabled={loading || code.length !== 6}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSendCode}
              disabled={loading}
            >
              Resend
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}