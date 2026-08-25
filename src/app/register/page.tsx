'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Mail,
  Lock,
  User,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Store,
  Phone,
  FileText,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  // Registration Role Type: 'user' or 'seller'
  const [accountType, setAccountType] = useState<'user' | 'seller'>('user');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Seller Specific Fields
  const [storeName, setStoreName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  const [sendingOtp, setSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle phone input sanitization (Digits only, max 11 digits)
  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    const clean = val.replace(/\D/g, '').slice(0, 11);
    setter(clean);
  };

  // Step 1: Request Backend API to Create & Send Email OTP, then Redirect to /verify-otp
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Prevent direct admin registration
    if (email.toLowerCase().includes('admin_override') || accountType === ('admin' as any)) {
      setErrorMessage('Admin accounts cannot be self-registered. Contact Super Admin.');
      return;
    }

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Check if email is already registered
    try {
      const supabase = createClient();
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        setErrorMessage('User with this email is already registered. Redirecting to sign in...');
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email.trim().toLowerCase())}&already_registered=true`);
        }, 1200);
        return;
      }
    } catch (err) {
      console.warn('Existing user check failed:', err);
    }

    // Password & Confirm Password Match Validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify password confirmation.');
      return;
    }

    // Phone Number 11-digit Validation
    const activePhone = accountType === 'seller' ? businessPhone : phone;
    if (accountType === 'seller' && (!activePhone || activePhone.length !== 11)) {
      setErrorMessage('Business mobile phone number must be exactly 11 digits (e.g. 01012345678).');
      return;
    }
    if (accountType === 'user' && phone && phone.length > 0 && phone.length !== 11) {
      setErrorMessage('Mobile phone number must be exactly 11 digits (e.g. 01012345678).');
      return;
    }

    // Call /api/auth/otp/send API Route with email
    setSendingOtp(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to send OTP verification email.');
        setSendingOtp(false);
        return;
      }

      // Store pending registration payload in sessionStorage
      const registrationPayload = {
        fullName,
        email,
        phone,
        password,
        accountType,
        storeName,
        companyName,
        businessPhone,
        taxId,
        storeDescription,
      };

      sessionStorage.setItem('aura_pending_registration', JSON.stringify(registrationPayload));

      // Redirect to dedicated OTP Verification Page!
      router.push('/verify-otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'API network error while requesting Email OTP.');
      setSendingOtp(false);
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
    <div className="max-w-xl mx-auto px-4 py-12 font-sans text-slate-900 bg-white min-h-screen">
      <div className="p-8 bg-white border border-slate-200 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            Create Account
          </h1>
          <p className="text-xs text-slate-600">
            Select your account type below to get started on AURA Platform.
          </p>
        </div>

        {/* ACCOUNT TYPE SELECTION TABS */}
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-50 border border-slate-200">
          <button
            type="button"
            onClick={() => setAccountType('user')}
            className={`py-3 px-3 text-xs font-black uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              accountType === 'user'
                ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                : 'bg-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Account</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('seller')}
            className={`py-3 px-3 text-xs font-black uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              accountType === 'seller'
                ? 'bg-emerald-600 text-white shadow-sm border border-emerald-700'
                : 'bg-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Seller / Vendor</span>
          </button>
        </div>

        {/* Account Type Notice */}
        <div className="p-3 text-xs bg-white border border-slate-200 flex items-start space-x-2">
          {accountType === 'user' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-900 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">
                <strong>Customer Account:</strong> Shop products, track orders, write reviews, and receive exclusive promotional offers.
              </span>
            </>
          ) : (
            <>
              <Store className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">
                <strong>Seller Account:</strong> Publish store products, manage inventory, and process customer orders on AURA Platform.
              </span>
            </>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold flex items-center gap-2 border border-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google OAuth Button (Only for User) */}
        {accountType === 'user' && (
          <>
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-900 text-xs font-bold text-slate-800 flex items-center justify-center space-x-2 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center space-x-3 text-xs text-slate-500 uppercase font-bold">
              <div className="flex-1 h-px bg-slate-200" />
              <span>or email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleInitiateRegister} className="space-y-4">
          
          {/* Full Name / Manager Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
              {accountType === 'seller' ? 'Manager / Contact Name *' : 'Full Name *'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={accountType === 'seller' ? 'Ahmed Mostafa' : 'Ahmed Ali'}
                className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* SELLER SPECIFIC FIELDS */}
          {accountType === 'seller' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                    Store Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Aura Tech Store"
                      className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                    />
                    <Store className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                    Company Trade Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Aura Retail Ltd"
                      className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                    Business Mobile Phone 
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      maxLength={11}
                      value={businessPhone}
                      onChange={(e) => handlePhoneChange(e.target.value, setBusinessPhone)}
                      placeholder="01012345678"
                      className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                    Commercial Reg / Tax ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="e.g. CR-99887766"
                      className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                    />
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                  Store Activity Description
                </label>
                <textarea
                  rows={2}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="e.g. Selling original electronics, laptops, and mobile accessories..."
                  className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
              {accountType === 'seller' ? 'Business Email Address *' : 'Email Address *'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={accountType === 'seller' ? 'store@company.com' : 'ahmed@aura.com'}
                className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Phone Number (For User - Digits only) */}
          {accountType === 'user' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                Mobile Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value, setPhone)}
                  placeholder="01012345678"
                  className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 py-2.5 pl-9 pr-10 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-900 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-900" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-white border py-2.5 pl-9 pr-10 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-500 focus:border-rose-600'
                      : 'border-slate-300 focus:border-slate-900'
                  }`}
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-900 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-900" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-rose-600 font-bold mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={sendingOtp}
            className={`w-full py-3.5 px-4 text-white text-xs font-black flex items-center justify-center space-x-2 transition-colors uppercase tracking-wider border cursor-pointer ${
              accountType === 'seller'
                ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800'
                : 'bg-slate-900 hover:bg-black border-slate-800'
            }`}
          >
            {sendingOtp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending Email OTP...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-white" />
                <span>Verify Email & Complete Registration</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-extrabold text-slate-900 hover:text-black underline">
              Sign In here
            </Link>
          </p>
          <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Admin registration is managed strictly via Super Admin portal.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
