import { NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/services/otpService';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Email, OTP code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify OTP Code
    const isValidOtp = verifyOtpCode(cleanEmail, otp);
    if (!isValidOtp) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification OTP code.' },
        { status: 400 }
      );
    }

    // 2. Find User in Profiles Table
    const supabaseAdmin = createAdminClient();
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User account profile not found.' },
        { status: 404 }
      );
    }

    // 3. Update User Password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userProfile.id, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message || 'Failed to update user password.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred while resetting password.' },
      { status: 500 }
    );
  }
}
