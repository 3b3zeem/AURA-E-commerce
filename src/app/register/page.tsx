'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/store/useUserStore';
import { Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Registration failed. Please check your credentials.');
        return;
      }

      if (!data?.user) {
        setErrorMessage('Failed to create account. Please try again.');
        return;
      }

      // Post profile to DB
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.user.id,
          email,
          full_name: fullName,
          role: email.includes('admin') ? 'admin' : 'customer',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setErrorMessage(errJson.error || 'Failed to initialize user profile.');
        return;
      }

      // Ensure user signs in through /login page
      await supabase.auth.signOut().catch(() => {});
      router.push('/login?registered=true');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/profile` },
      });
      if (error) setErrorMessage(error.message);
    } catch (err: any) {
      setErrorMessage('Google Signup failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans text-slate-900 bg-[#f8fafc]">
      <div className="p-8 bg-white border border-slate-200 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Create Account</h1>
          <p className="text-xs text-slate-600">Register to track your orders and manage wishlist.</p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold flex items-center gap-2 border border-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-900 text-xs font-bold text-slate-800 flex items-center justify-center space-x-2 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center space-x-3 text-xs text-slate-500 uppercase font-bold">
          <div className="flex-1 h-px bg-slate-200" />
          <span>or email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ahmed Ali"
                className="w-full bg-slate-50 border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmed@aura.eg"
                className="w-full bg-slate-50 border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 py-2.5 pl-9 pr-10 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-900 focus:outline-none cursor-pointer"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-slate-900" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white text-xs font-black flex items-center justify-center space-x-2 transition-colors uppercase tracking-wider border border-slate-800 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-extrabold text-slate-900 hover:text-black underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
