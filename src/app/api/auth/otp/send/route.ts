import { NextResponse } from "next/server";
import { generateAndStoreOtp } from "@/lib/services/otpService";
import { sendEmailOtp } from "@/lib/services/emailService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required for verification" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Generate 6-digit OTP code & store securely server-side
    const { code, expiresAt } = generateAndStoreOtp(cleanEmail);

    // 2. Dispatch Email OTP to the user's email address
    const emailResult = await sendEmailOtp({
      email: cleanEmail,
      code,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.error || "Failed to deliver OTP email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email OTP verification code sent to ${cleanEmail}`,
      expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send OTP request" },
      { status: 500 }
    );
  }
}
