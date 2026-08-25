import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateAndStoreOtp } from '@/lib/services/otpService';
import { sendEmailOtp } from '@/lib/services/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify user exists in database profiles or auth
    const supabaseAdmin = createAdminClient();
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (!userProfile) {
      // Fallback check in Supabase Auth users
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = authData?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );

        if (authUser) {
          const userRole =
            authUser.user_metadata?.role ||
            authUser.user_metadata?.accountType ||
            authUser.user_metadata?.account_type ||
            'user';

          // Auto-sync profile safely without destroying seller fields
          await supabaseAdmin.from('profiles').upsert(
            {
              id: authUser.id,
              email: cleanEmail,
              full_name: authUser.user_metadata?.full_name || cleanEmail.split('@')[0],
              role: userRole,
              store_name: authUser.user_metadata?.store_name || null,
              created_at: authUser.created_at,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id', ignoreDuplicates: true }
          );
        } else {
          return NextResponse.json(
            { success: false, message: 'No account found with this email address.' },
            { status: 404 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, message: 'No account found with this email address.' },
          { status: 404 }
        );
      }
    }

    // 2. Generate 6-digit OTP code & store securely server-side
    const { code, expiresAt } = generateAndStoreOtp(cleanEmail);

    // 3. Dispatch Email OTP to the user's email inbox
    const emailResult = await sendEmailOtp({
      email: cleanEmail,
      code,
      type: 'password_reset',
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.error || 'Failed to deliver password reset OTP email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password reset OTP verification code sent to ${cleanEmail}`,
      expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process forgot password request.' },
      { status: 500 }
    );
  }
}
