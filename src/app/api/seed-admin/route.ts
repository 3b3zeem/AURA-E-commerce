import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase URL or Key missing in environment variables' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const email = 'admin@aura.eg';
    const password = 'adminpassword123';

    // 1. Try signing in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInData?.user) {
      const userId = signInData.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email,
          full_name: 'AURA Super Admin',
          role: 'admin',
          loyalty_points: 5000,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        message: 'Admin account logged in and profile set to ADMIN!',
        profile,
      });
    }

    // 2. Try regular sign up without metadata trigger interference
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpErr) {
      return NextResponse.json({
        error: signUpErr.message,
        hint: 'If database trigger failed, please run the SQL snippet in Supabase SQL Editor to make your registered user an Admin.',
      }, { status: 400 });
    }

    if (signUpData?.user) {
      const userId = signUpData.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email,
          full_name: 'AURA Super Admin',
          role: 'admin',
          loyalty_points: 5000,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        message: 'Admin account created successfully!',
        profile,
      });
    }

    return NextResponse.json({ error: 'Could not create account' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
