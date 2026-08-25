"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { Profile } from "@/types";
import { useUserStore } from "@/store/useUserStore";

interface ProfileInfoTabProps {
  profile: Profile;
}

export function ProfileInfoTab({ profile }: ProfileInfoTabProps) {
  const { setProfile } = useUserStore();
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      setProfile({
        ...profile,
        full_name: fullName,
        phone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 space-y-6 font-sans text-slate-900">
      <h2 className="text-base font-black text-slate-900 uppercase">
        Personal Settings
      </h2>

      <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1 uppercase">
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="pt-2 flex items-center space-x-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center space-x-2 transition-colors uppercase border border-slate-800 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-bold">
              ✓ Profile updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
