// Check what Twilio credentials are provided
const hasAccountSid = typeof process.env.TWILIO_ACCOUNT_SID === "string" && process.env.TWILIO_ACCOUNT_SID.length > 0;
const hasAuthToken = typeof process.env.TWILIO_AUTH_TOKEN === "string" && process.env.TWILIO_AUTH_TOKEN.length > 0;
const hasPhoneNumber = typeof process.env.TWILIO_PHONE_NUMBER === "string" && process.env.TWILIO_PHONE_NUMBER.length > 0;

const isTwilioConfigured = hasAccountSid && hasAuthToken && hasPhoneNumber;

let twilio: any;
let client: any;

// Only import and initialize Twilio if all credentials are provided
if (isTwilioConfigured) {
  try {
    twilio = require('twilio').default;
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log("Twilio initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Twilio:", error);
    twilio = null;
    client = null;
  }
} else {
  if (hasAccountSid || hasAuthToken || hasPhoneNumber) {
    console.log("Partial Twilio configuration detected:");
    if (!hasAccountSid) console.log("- Missing TWILIO_ACCOUNT_SID");
    if (!hasAuthToken) console.log("- Missing TWILIO_AUTH_TOKEN");
    if (!hasPhoneNumber) console.log("- Missing TWILIO_PHONE_NUMBER");
    console.log("Twilio will be simulated until all credentials are provided");
  } else {
    console.log("Twilio not configured - SMS will be simulated");
  }
  twilio = null;
  client = null;
}

/**
 * Send an SMS message
 * @param to - Recipient phone number
 * @param body - Message content
 * @returns Promise with message SID or error
 */
export async function sendSMS(to: string, body: string) {
  try {
    // If Twilio is not fully configured, simulate SMS sending
    if (!isTwilioConfigured || !twilio || !client) {
      console.log(`SIMULATED SMS to ${to}: ${body}`);
      
      if (!hasAccountSid || !hasAuthToken || !hasPhoneNumber) {
        console.log("To enable real SMS, provide all of the following in your environment variables:");
        if (!hasAccountSid) console.log("- TWILIO_ACCOUNT_SID");
        if (!hasAuthToken) console.log("- TWILIO_AUTH_TOKEN");
        if (!hasPhoneNumber) console.log("- TWILIO_PHONE_NUMBER");
      }
      
      return { success: true, sid: 'simulated-sid-' + Date.now() };
    }

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    console.log(`SMS sent successfully to ${to}. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send SMS' };
  }
}

/**
 * Generate a random verification code
 * @returns 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Export configuration status
export { isTwilioConfigured };

export default {
  sendSMS,
  generateVerificationCode,
  isTwilioConfigured
};