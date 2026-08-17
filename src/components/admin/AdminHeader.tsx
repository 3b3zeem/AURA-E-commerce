"use client";

import React from "react";
import { RefreshCw, KeyRound } from "lucide-react";

interface AdminHeaderProps {
  loading: boolean;
  isAdmin: boolean;
  onRefresh: () => void;
  onMakeMeAdmin: () => void;
}

export function AdminHeader({
  loading,
  isAdmin,
  onRefresh,
  onMakeMeAdmin,
}: AdminHeaderProps) {
  return (
    <div className="bg-white text-slate-900 px-6 py-6 border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider border border-slate-800">
              System Control Center
            </span>
            <span className="text-slate-500 text-xs font-mono">
              v2.0 • Supabase Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
            AURA Control Center
          </h1>
          <p className="text-xs text-slate-600">
            Manage database tables: Products, Orders, Users, Categories, Stories, Searches, and Logistics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold uppercase border border-slate-300 transition-all flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-900 ${loading ? "animate-spin" : ""}`}
            />
            <span>Sync Supabase</span>
          </button>

          {!isAdmin && (
            <button
              onClick={onMakeMeAdmin}
              className="px-4 py-2 bg-slate-900 text-white font-black text-xs uppercase hover:bg-black border border-slate-800 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-white" />
              <span>Grant Admin Privilege</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
