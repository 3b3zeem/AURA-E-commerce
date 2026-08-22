"use client";

import { AdminNotificationCenter } from "./AdminNotificationCenter";

interface AdminHeaderProps {
  isAdmin: boolean;
}

export function AdminHeader({
  isAdmin,
}: AdminHeaderProps) {
  return (
    <div className="bg-white text-slate-900 px-6 py-6 border-b border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider border border-slate-800">
              System Control Center
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
          <AdminNotificationCenter />
        </div>
      </div>
    </div>
  );
}
