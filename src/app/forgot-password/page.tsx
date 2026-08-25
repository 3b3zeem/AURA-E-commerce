'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to send password reset OTP.');
        setLoading(false);
        return;
      }

      // Save email session context for reset password step
      sessionStorage.setItem('aura_pending_password_reset', JSON.stringify({ email: email.trim() }));
      router.push('/reset-password');
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while requesting password reset.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans text-slate-900 bg-white min-h-screen">
      <div className="p-8 bg-white border border-slate-200 shadow-sm space-y-6">
        
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 text-white mx-auto flex items-center justify-center border border-slate-800 shadow-sm">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            Forgot Your Password?
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter your registered email address below and we will send you a 6-digit OTP verification code to reset your password.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold flex items-center gap-2 border border-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider border border-slate-800 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending Verification OTP...</span>
              </>
            ) : (
              <span>Send OTP Verification Code</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secured via AURA Password Security Service</span>
          </div>
        </div>

      </div>
    </div>
  );
}
