'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createUserInDb } from '@/lib/services/userService';
import {
  Mail,
  AlertCircle,
  RotateCw,
  Loader2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function VerifyOtpPage() {
  const router = useRouter();

  // Registration data from session
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // 6 Single-digit OTP inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // States
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load registration context on mount
  useEffect(() => {
    try {
      const rawData = sessionStorage.getItem('aura_pending_registration');
      if (!rawData) {
        router.push('/register');
        return;
      }

      const parsed = JSON.parse(rawData);
      setRegistrationData(parsed);
      setUserEmail(parsed.email || '');
    } catch {
      router.push('/register');
    }
  }, [router]);

  // Helper to send OTP code to email
  const sendOtpToEmail = async (emailToUse: string) => {
    setSendingOtp(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to send OTP verification email.');
        return;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while requesting Email OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle single digit input change with auto-advance
  const handleDigitChange = (index: number, value: string) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleanDigit;
    setOtpDigits(updated);

    // Auto-advance to next input if digit entered
    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown for backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste full 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const updated = ['', '', '', '', '', ''];
    digits.forEach((d, idx) => {
      if (idx < 6) updated[idx] = d;
    });
    setOtpDigits(updated);

    // Focus last filled box or next box
    const nextFocusIndex = Math.min(digits.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  // Resend OTP Code API
  const handleResendOtp = async () => {
    if (!canResend || sendingOtp || !userEmail) return;

    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(30);
    setCanResend(false);
    await sendOtpToEmail(userEmail);
    inputRefs.current[0]?.focus();
  };

  // Verify OTP and complete Registration API
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit OTP code received in your email.');
      return;
    }

    setVerifyingOtp(true);

    try {
      // 1. Verify via API /api/auth/otp/verify
      const verifyRes = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: fullCode }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setErrorMessage(verifyData.message || 'Invalid or expired Email OTP code.');
        setVerifyingOtp(false);
        return;
      }

      // 2. Complete Supabase User Registration
      if (!registrationData) {
        setErrorMessage('Registration session expired. Please register again.');
        setVerifyingOtp(false);
        return;
      }

      const { email, password, fullName, phone, accountType, storeName, companyName, businessPhone, taxId, storeDescription } = registrationData;

      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: accountType,
            store_name: accountType === 'seller' ? storeName : null,
          },
        },
      });

      if (error || !data?.user) {
        const errMsg = error?.message || 'Failed to create user account.';
        const isAlreadyRegistered =
          errMsg.toLowerCase().includes('already registered') ||
          errMsg.toLowerCase().includes('already exists') ||
          errMsg.toLowerCase().includes('already created');

        if (isAlreadyRegistered) {
          setErrorMessage('User already registered. Redirecting to sign in page...');
          sessionStorage.removeItem('aura_pending_registration');
          setTimeout(() => {
            router.push(`/login?email=${encodeURIComponent(email)}&already_registered=true`);
          }, 1200);
          return;
        }

        setErrorMessage(errMsg);
        setVerifyingOtp(false);
        return;
      }

      // Create Profile in Database
      const profilePayload: Record<string, any> = {
        id: data.user.id,
        email,
        full_name: fullName,
        phone: phone || businessPhone || null,
        role: accountType,
      };

      if (accountType === 'seller') {
        profilePayload.store_name = storeName || fullName + ' Store';
        profilePayload.company_name = companyName || storeName;
        profilePayload.business_phone = businessPhone || phone;
        profilePayload.tax_id = taxId || null;
        profilePayload.store_description = storeDescription || null;
      }

      const ok = await createUserInDb(profilePayload);
      if (!ok) {
        setErrorMessage('Failed to initialize user database profile.');
        setVerifyingOtp(false);
        return;
      }

      // Clear Session Storage and Redirect
      sessionStorage.removeItem('aura_pending_registration');
      await supabase.auth.signOut().catch(() => {});
      router.push(`/login?registered=true&role=${accountType}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during verification.');
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans text-slate-900 bg-white min-h-screen">
      <div className="p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Back Link */}
        <Link
          href="/register"
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Registration</span>
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 text-white mx-auto flex items-center justify-center border border-slate-800 shadow-sm">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            Verify Your Email Address
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter the 6-digit verification code sent to{' '}
            <strong className="text-slate-900 font-mono">{userEmail || 'your email'}</strong>
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold flex items-center gap-2 border border-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* OTP FORM WITH 6 SEPARATE SINGLE-DIGIT INPUTS */}
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block text-center uppercase tracking-wider">
              Enter 6-Digit Email OTP Code
            </label>

            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-11 h-13 sm:w-12 sm:h-14 bg-slate-50 border-2 border-slate-300 text-center text-xl font-mono font-black text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* Resend Code Section */}
          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-100">
            <span className="text-slate-500">
              {resendTimer > 0 ? `Resend email in ${resendTimer}s` : 'Did not receive email?'}
            </span>
            <button
              type="button"
              disabled={!canResend || sendingOtp}
              onClick={handleResendOtp}
              className="text-slate-900 font-bold uppercase hover:underline flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
            >
              {sendingOtp ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
              ) : (
                <RotateCw className="w-3.5 h-3.5 text-slate-900" />
              )}
              <span>Resend Email</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={verifyingOtp || otpDigits.join('').length !== 6}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider border border-slate-800 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {verifyingOtp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Email OTP...</span>
              </>
            ) : (
              <span>Verify & Complete Registration</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secured via AURA Email Security Service</span>
          </div>
        </div>

      </div>
    </div>
  );
}
