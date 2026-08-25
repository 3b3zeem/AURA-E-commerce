import { NextResponse } from "next/server";
import { verifyOtpCode } from "@/lib/services/otpService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email address and OTP code are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = verifyOtpCode(cleanEmail, otp);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, message: result.message || "OTP verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email address verified successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify OTP request" },
      { status: 500 }
    );
  }
}
