'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RotateCw,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string>('');

  // 6 Single-digit OTP inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Passwords
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load session context on mount
  useEffect(() => {
    try {
      const rawData = sessionStorage.getItem('aura_pending_password_reset');
      if (!rawData) {
        router.push('/forgot-password');
        return;
      }

      const parsed = JSON.parse(rawData);
      if (!parsed.email) {
        router.push('/forgot-password');
        return;
      }
      setUserEmail(parsed.email);
    } catch {
      router.push('/forgot-password');
    }
  }, [router]);

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

  // Single digit input change handler with auto-advance
  const handleDigitChange = (index: number, value: string) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleanDigit;
    setOtpDigits(updated);

    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Keydown handler for backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste handler for 6-digit code
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

    const nextFocusIndex = Math.min(digits.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend || sendingOtp || !userEmail) return;

    setSendingOtp(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to resend password reset OTP.');
        setSendingOtp(false);
        return;
      }

      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(30);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while requesting OTP resend.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Reset Password Submit Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit OTP code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    setResettingPassword(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          otp: fullCode,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to reset password.');
        setResettingPassword(false);
        return;
      }

      // Clear session & redirect to login
      sessionStorage.removeItem('aura_pending_password_reset');
      router.push(`/login?reset=success&email=${encodeURIComponent(userEmail)}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while resetting password.');
      setResettingPassword(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans text-slate-900 bg-white min-h-screen">
      <div className="p-8 bg-white border border-slate-200 shadow-sm space-y-6">
        
        {/* Back Link */}
        <Link
          href="/forgot-password"
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Email Address</span>
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 text-white mx-auto flex items-center justify-center border border-slate-800 shadow-sm">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            Set New Password
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter the 6-digit OTP code sent to{' '}
            <strong className="text-slate-900 font-mono">{userEmail || 'your email'}</strong> and choose your new password.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold flex items-center gap-2 border border-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* RESET PASSWORD FORM */}
        <form onSubmit={handleResetPassword} className="space-y-5">
          
          {/* OTP DIGITS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block text-center uppercase tracking-wider">
              Enter 6-Digit Email OTP Code *
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

            {/* Resend OTP inline */}
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="text-slate-500">
                {resendTimer > 0 ? `Resend email in ${resendTimer}s` : 'Did not receive code?'}
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
                <span>Resend Code</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-4">
            {/* New Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-10 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-10 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={resettingPassword || otpDigits.join('').length !== 6 || !newPassword}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider border border-slate-800 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {resettingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Resetting Password...</span>
              </>
            ) : (
              <span>Confirm & Reset Password</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Protected via AURA Account Security Service</span>
          </div>
        </div>

      </div>
    </div>
  );
}
