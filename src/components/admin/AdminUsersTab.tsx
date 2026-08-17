"use client";

import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Profile } from "@/types";

interface AdminUsersTabProps {
  usersList: Profile[];
  actionLoadingId: string | null;
  onToggleUserRole: (user: Profile) => void;
  onDeleteUser: (id: string) => void;
}

export function AdminUsersTab({
  usersList,
  actionLoadingId,
  onToggleUserRole,
  onDeleteUser,
}: AdminUsersTabProps) {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-black uppercase text-slate-900">
          Users & Access Control
        </h2>
        <p className="text-xs text-slate-600">
          User accounts and privilege cards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {usersList.map((usr) => (
          <div
            key={usr.id}
            className="p-4 border border-slate-200 bg-white space-y-3 flex flex-col justify-between hover:border-slate-900 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {usr.full_name || "Customer"}
                </h3>
                <span
                  className={`px-2 py-0.5 text-[9px] font-black uppercase border ${
                    usr.role === "admin"
                      ? "bg-slate-900 text-white border-slate-800"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {usr.role}
                </span>
              </div>
              <p className="p-2 bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 truncate">
                {usr.email}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between space-x-2">
              <button
                disabled={actionLoadingId === usr.id}
                onClick={() => onToggleUserRole(usr)}
                className="px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold uppercase hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50 flex-1 inline-flex items-center justify-center space-x-1"
              >
                {actionLoadingId === usr.id ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1 inline-block text-slate-900" />
                ) : null}
                <span>
                  {usr.role === "admin" ? "Demote to Customer" : "Make Admin"}
                </span>
              </button>
              <button
                disabled={actionLoadingId === usr.id}
                onClick={() => onDeleteUser(usr.id)}
                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-slate-200 transition-colors cursor-pointer inline-flex items-center disabled:opacity-50"
                title="Delete User"
              >
                {actionLoadingId === usr.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
