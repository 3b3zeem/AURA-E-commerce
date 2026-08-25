"use client";

import React from "react";
import {
  ShieldCheck,
  Shield,
  Plus,
  Trash2,
  Lock,
  KeyRound,
  UserCheck2,
  Users,
} from "lucide-react";
import { Role } from "@/types";

interface RoleCardSelectorProps {
  roles: Role[];
  activeRoleCode: string;
  onSelectRole: (roleCode: string) => void;
  isSuperAdmin: boolean;
  onOpenAddRoleModal: () => void;
  onOpenAddPermModal: () => void;
  onOpenAssignRoleModal: () => void;
  onDeleteRole: (roleCode: string) => void;
  savingRole: string | null;
}

export function RoleCardSelector({
  roles,
  activeRoleCode,
  onSelectRole,
  isSuperAdmin,
  onOpenAddRoleModal,
  onOpenAddPermModal,
  onOpenAssignRoleModal,
  onDeleteRole,
  savingRole,
}: RoleCardSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            1. Select System Role
          </h3>
          <p className="text-xs text-slate-500">
            Choose a role below to configure module permissions for all assigned users.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isSuperAdmin && (
            <>
              <button
                onClick={onOpenAddRoleModal}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                New Role
              </button>
              <button
                onClick={onOpenAddPermModal}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                New Permission
              </button>
            </>
          )}
          <button
            onClick={onOpenAssignRoleModal}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <UserCheck2 className="w-3.5 h-3.5" />
            Assign Role to User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {roles.map((r) => {
          const isActive = r.code === activeRoleCode;
          const isSuper = r.code === "super_admin";
          const permCount = r.permissions ? r.permissions.length : 0;

          return (
            <div
              key={r.code}
              onClick={() => onSelectRole(r.code)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900 ring-offset-2"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`p-2 rounded-lg ${
                      isActive
                        ? "bg-white/10 text-white"
                        : isSuper
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {isSuper ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </span>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white border border-white/20"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {isSuper ? "FULL ACCESS" : `${permCount} Perms`}
                    </span>

                    {!isSuper && isSuperAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRole(r.code);
                        }}
                        disabled={savingRole === r.code}
                        className={`p-1 rounded-md transition-colors ${
                          isActive
                            ? "hover:bg-rose-500/20 text-white/70 hover:text-white"
                            : "hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                        }`}
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-sm tracking-tight">{r.name}</h4>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${
                    isActive ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {r.description || "No description provided."}
                </p>
              </div>

              <div
                className={`mt-4 pt-2.5 border-t text-[10px] font-mono font-medium flex items-center justify-between ${
                  isActive ? "border-white/10 text-slate-400" : "border-slate-100 text-slate-400"
                }`}
              >
                <span>Code: {r.code}</span>
                {isActive && <span className="font-semibold text-emerald-400">● Active View</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
