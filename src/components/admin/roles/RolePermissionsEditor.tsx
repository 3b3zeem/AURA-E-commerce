"use client";

import React from "react";
import {
  Lock,
  Search,
  CheckCircle2,
  Package,
  ShoppingCart,
  Users,
  ShieldCheck,
  FileText,
  Layout,
  Megaphone,
  TrendingUp,
  MessageSquare,
  Tag,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import { Role, Permission } from "@/types";

interface RolePermissionsEditorProps {
  activeRoleObj: Role;
  permissions: Permission[];
  filteredPermissions: Permission[];
  modules: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedModuleFilter: string;
  onModuleFilterChange: (mod: string) => void;
  onTogglePermission: (roleCode: string, permCode: string) => void;
  savingRole: string | null;
  isSuperAdmin: boolean;
}

// Module Icon Helper
function getModuleIcon(moduleName: string) {
  const mod = moduleName.toLowerCase();
  if (mod.includes("product") || mod.includes("catalog")) return <Package className="w-4 h-4 text-emerald-600" />;
  if (mod.includes("order") || mod.includes("address")) return <ShoppingCart className="w-4 h-4 text-sky-600" />;
  if (mod.includes("user") || mod.includes("customer")) return <Users className="w-4 h-4 text-purple-600" />;
  if (mod.includes("role")) return <ShieldCheck className="w-4 h-4 text-amber-600" />;
  if (mod.includes("content") || mod.includes("blog")) return <FileText className="w-4 h-4 text-indigo-600" />;
  if (mod.includes("design") || mod.includes("bento") || mod.includes("stories")) return <Layout className="w-4 h-4 text-rose-600" />;
  if (mod.includes("market") || mod.includes("promo") || mod.includes("newsletter")) return <Megaphone className="w-4 h-4 text-orange-600" />;
  if (mod.includes("analytics")) return <TrendingUp className="w-4 h-4 text-teal-600" />;
  if (mod.includes("support")) return <MessageSquare className="w-4 h-4 text-blue-600" />;
  return <Tag className="w-4 h-4 text-slate-600" />;
}

export function RolePermissionsEditor({
  activeRoleObj,
  permissions,
  filteredPermissions,
  modules,
  searchTerm,
  onSearchChange,
  selectedModuleFilter,
  onModuleFilterChange,
  onTogglePermission,
  savingRole,
  isSuperAdmin,
}: RolePermissionsEditorProps) {
  if (!activeRoleObj) return null;

  const isSuperRole = activeRoleObj.code === "super_admin";
  const rolePerms = activeRoleObj.permissions || [];

  // Group filtered permissions by module
  const permissionsByModule = modules.reduce((acc, mod) => {
    const list = filteredPermissions.filter((p) => (p.module || "General") === mod);
    if (list.length > 0) acc[mod] = list;
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      {/* Header Info & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider">
              ROLE: {activeRoleObj.name}
            </span>
            {isSuperRole && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Unrestricted Access
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Toggle capabilities on/off to update role permissions in database real-time.
          </p>
        </div>

        {/* Search & Module Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-lg">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={selectedModuleFilter}
              onChange={(e) => onModuleFilterChange(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">All Modules ({modules.length})</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Super Admin Full Access Banner */}
      {isSuperRole && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-3 text-amber-900 text-xs font-medium">
          <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            The <strong>Super Admin</strong> role automatically inherits all current and future system permissions by default. Individual toggles are disabled.
          </span>
        </div>
      )}

      {/* Module Grouped Permission Cards */}
      <div className="space-y-6">
        {Object.keys(permissionsByModule).length === 0 ? (
          <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No permissions match your filter.</p>
          </div>
        ) : (
          Object.entries(permissionsByModule).map(([moduleName, perms]) => {
            const enabledInModule = perms.filter((p) => rolePerms.includes(p.code)).length;
            const isAllEnabled = enabledInModule === perms.length;

            return (
              <div
                key={moduleName}
                className="border border-slate-200/90 rounded-xl overflow-hidden bg-slate-50/50"
              >
                {/* Module Card Header */}
                <div className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getModuleIcon(moduleName)}
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                      {moduleName}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {perms.length} Capabilities
                    </span>
                  </div>

                  {!isSuperRole && isSuperAdmin && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span>{enabledInModule} / {perms.length} Active</span>
                    </div>
                  )}
                </div>

                {/* Permissions Toggles Grid */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perms.map((p) => {
                    const isEnabled = isSuperRole || rolePerms.includes(p.code);
                    const isSaving = savingRole === activeRoleObj.code;

                    return (
                      <div
                        key={p.code}
                        onClick={() => {
                          if (!isSuperRole && isSuperAdmin && !isSaving) {
                            onTogglePermission(activeRoleObj.code, p.code);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          !isSuperRole && isSuperAdmin ? "cursor-pointer select-none" : ""
                        } ${
                          isEnabled
                            ? "bg-white border-slate-900/20 shadow-2xs hover:border-slate-900/40"
                            : "bg-white/60 border-slate-200 hover:border-slate-300 opacity-75"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{p.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {p.code}
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {p.description}
                            </p>
                          )}
                        </div>

                        {/* iOS Style Toggle Switch */}
                        <div className="shrink-0 pt-0.5">
                          {isSuperRole ? (
                            <div className="w-10 h-6 bg-slate-900 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-slate-900" />
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={!isSuperAdmin || isSaving}
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePermission(activeRoleObj.code, p.code);
                              }}
                              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                                isEnabled ? "bg-slate-900" : "bg-slate-300"
                              } ${!isSuperAdmin ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span
                                className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform shadow-xs absolute top-1 ${
                                  isEnabled ? "left-6" : "left-1"
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return <CheckCircle2 className={className} />;
}
