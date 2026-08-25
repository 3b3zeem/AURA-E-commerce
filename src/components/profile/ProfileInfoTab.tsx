"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Save, Loader2, CheckCircle2, AlertCircle, Store, Camera, User, Upload, Trash2 } from "lucide-react";
import { Profile } from "@/types";
import { useUserStore } from "@/store/useUserStore";
import { updateUserInDb } from "@/lib/services/db";

interface ProfileInfoTabProps {
  profile: Profile;
}

export function ProfileInfoTab({ profile }: ProfileInfoTabProps) {
  const { setProfile } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Profile Fields
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  // Seller Business Fields
  const [storeName, setStoreName] = useState(profile?.store_name || "");
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [businessPhone, setBusinessPhone] = useState(profile?.business_phone || "");
  const [taxId, setTaxId] = useState(profile?.tax_id || "");
  const [storeDescription, setStoreDescription] = useState(profile?.store_description || "");

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
      setPhone(profile.phone || "");
      setStoreName(profile.store_name || "");
      setCompanyName(profile.company_name || "");
      setBusinessPhone(profile.business_phone || "");
      setTaxId(profile.tax_id || "");
      setStoreDescription(profile.store_description || "");
    }
  }, [profile]);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB.");
      return;
    }

    setUploadingImage(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setAvatarUrl(base64Url);
      }
      setUploadingImage(false);
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read image file.");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);

    const updatePayload: Partial<Profile> & Record<string, any> = {
      id: profile.id,
      full_name: fullName.trim(),
      avatar_url: avatarUrl.trim() || null,
      phone: phone.trim() || null,
    };

    if (profile.role === "seller") {
      updatePayload.store_name = storeName.trim() || null;
      updatePayload.company_name = companyName.trim() || null;
      updatePayload.business_phone = businessPhone.trim() || null;
      updatePayload.tax_id = taxId.trim() || null;
      updatePayload.store_description = storeDescription.trim() || null;
    }

    try {
      const updated = await updateUserInDb(updatePayload);

      if (updated) {
        const mergedProfile: Profile = {
          ...profile,
          ...updatePayload,
        };
        setProfile(mergedProfile);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        setErrorMessage("Failed to update profile in database. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 space-y-6 font-sans text-slate-900">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-black text-slate-900 uppercase">
          Personal Account Settings
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Upload your avatar photo and edit your account details saved in your AURA account.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile changes saved successfully to your account!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
        
        {/* AVATAR PHOTO FILE UPLOAD & PREVIEW */}
        <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
          <label className="text-xs font-bold text-slate-700 block uppercase flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-slate-900" />
            <span>Profile Photo / Avatar</span>
          </label>

          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-300 flex items-center justify-center flex-shrink-0 shadow-sm">
              {uploadingImage ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageFileUpload}
                className="hidden"
                id="avatar-file-input"
              />

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase border border-slate-800 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>Upload Image File</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold uppercase border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500 font-mono">
                Supported formats: JPG, PNG, WEBP (Max size 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Read-only Account Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              disabled
              value={profile.email || ""}
              className="w-full bg-slate-100 border border-slate-300 p-2.5 text-xs font-mono text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
              Role Privilege (Read-only)
            </label>
            <input
              type="text"
              disabled
              value={
                profile.role === "super_admin"
                  ? "Super Admin"
                  : profile.role === "admin"
                  ? "Admin"
                  : profile.role === "seller"
                  ? "Seller / Vendor"
                  : "Customer / Buyer"
              }
              className="w-full bg-slate-100 border border-slate-300 p-2.5 text-xs font-bold uppercase text-slate-700 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
          />
        </div>

        {/* Mobile Phone */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
            Mobile Phone Number
          </label>
          <input
            type="tel"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="01012345678"
            className="w-full bg-white border border-slate-300 p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </div>

        {/* SELLER SPECIFIC EDITABLE FIELDS */}
        {profile.role === "seller" && (
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Seller Store & Business Profile Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                  Store Display Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Aura Tech Store"
                  className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                  Company Trade Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Aura Retail Ltd"
                  className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                  Business Contact Phone
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="01012345678"
                  className="w-full bg-white border border-slate-300 p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                  Tax Registration / CR ID
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. CR-99887766"
                  className="w-full bg-white border border-slate-300 p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
                Store Activity Description
              </label>
              <textarea
                rows={3}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="Describe your store activity, warranty policy..."
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        )}

        {/* Password & Security Section */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Security & Password Settings
          </h3>
          <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-900">Account Password</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Reset your account password securely using a 6-digit Email OTP verification code.
              </p>
            </div>
            <Link
              href={`/forgot-password`}
              className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-900 text-slate-900 text-xs font-bold uppercase transition-colors flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Reset Password via Email OTP</span>
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors uppercase border border-slate-800 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
