"use client";

import React from "react";
import {
  Users,
  Search,
  SlidersHorizontal,
  UserCheck,
  Shield,
  RotateCcw,
  CheckCircle2,
  Check,
  Package,
  ShoppingCart,
  ShieldCheck,
  FileText,
  Layout,
  Megaphone,
  TrendingUp,
  MessageSquare,
  Tag,
  Loader2,
} from "lucide-react";
import { Role, Permission, Profile } from "@/types";

interface UserDirectPermissionsManagerProps {
  usersList: Profile[];
  filteredUsers: Profile[];
  selectedUserObj: Profile | null;
  onSelectUser: (userId: string) => void;
  userSearchTerm: string;
  onUserSearchChange: (term: string) => void;
  userRoleFilter: string;
  onUserRoleFilterChange: (role: string) => void;
  roles: Role[];
  permissions: Permission[];
  modules: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedModuleFilter: string;
  onModuleFilterChange: (mod: string) => void;
  onToggleUserPermission: (user: Profile, permCode: string) => void;
  savingUserPerm: string | null;
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

export function UserDirectPermissionsManager({
  usersList,
  filteredUsers,
  selectedUserObj,
  onSelectUser,
  userSearchTerm,
  onUserSearchChange,
  userRoleFilter,
  onUserRoleFilterChange,
  roles,
  permissions,
  modules,
  searchTerm,
  onSearchChange,
  selectedModuleFilter,
  onModuleFilterChange,
  onToggleUserPermission,
  savingUserPerm,
  isSuperAdmin,
}: UserDirectPermissionsManagerProps) {
  // Find role permissions for selected user
  const userRoleObj = roles.find((r) => r.code === selectedUserObj?.role);
  const rolePermissions = userRoleObj?.permissions || [];
  const customPermissions = selectedUserObj?.custom_permissions || [];

  // Filter permissions
  const filteredPermissions = permissions.filter((perm) => {
    const matchesSearch =
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (perm.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule =
      selectedModuleFilter === "ALL" || (perm.module || "General") === selectedModuleFilter;

    return matchesSearch && matchesModule;
  });

  // Group permissions by module
  const permissionsByModule = modules.reduce((acc, mod) => {
    const list = filteredPermissions.filter((p) => (p.module || "General") === mod);
    if (list.length > 0) acc[mod] = list;
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* User Selection Sidebar */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" /> Select User
            </h3>
            <p className="text-[11px] text-slate-500">Pick a user to manage direct overrides.</p>
          </div>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">
            {filteredUsers.length} Users
          </span>
        </div>

        {/* User Search & Role Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name/email..."
              value={userSearchTerm}
              onChange={(e) => onUserSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={userRoleFilter}
              onChange={(e) => onUserRoleFilterChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              {roles.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Cards List */}
        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No users found.</div>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedUserObj?.id === u.id;
              const hasCustom = u.custom_permissions && u.custom_permissions.length > 0;

              return (
                <div
                  key={u.id}
                  onClick={() => onSelectUser(u.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate tracking-tight">
                        {u.full_name || "Unnamed User"}
                      </h4>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right space-y-1">
                    <span
                      className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white border border-white/20"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {u.role || "user"}
                    </span>
                    {hasCustom && (
                      <div className="text-[9px] font-semibold text-emerald-400 flex items-center justify-end gap-1">
                        ● {u.custom_permissions?.length} Overrides
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Custom Permissions Toggle Panel */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        {selectedUserObj ? (
          <>
            {/* User Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                  {(selectedUserObj.full_name || selectedUserObj.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">
                      {selectedUserObj.full_name || "Unnamed User"}
                    </h3>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold uppercase">
                      ROLE: {selectedUserObj.role || "user"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedUserObj.email}</p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {customPermissions.length} Direct Overrides
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {rolePermissions.length} Role Inherited
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search capabilities..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <select
                value={selectedModuleFilter}
                onChange={(e) => onModuleFilterChange(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Modules ({modules.length})</option>
                {modules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Permissions Cards */}
            <div className="space-y-6">
              {Object.keys(permissionsByModule).length === 0 ? (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold">No capabilities match your search.</p>
                </div>
              ) : (
                Object.entries(permissionsByModule).map(([moduleName, perms]) => (
                  <div
                    key={moduleName}
                    className="border border-slate-200/90 rounded-xl overflow-hidden bg-slate-50/50"
                  >
                    <div className="px-5 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getModuleIcon(moduleName)}
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                          {moduleName}
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {perms.length} Capabilities
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {perms.map((p) => {
                        const isInherited = rolePermissions.includes(p.code);
                        const isCustomGranted = customPermissions.includes(p.code);
                        const isSuperRole = selectedUserObj.role === "super_admin";
                        const isEffective = isSuperRole || isInherited || isCustomGranted;
                        const isSaving = savingUserPerm === selectedUserObj.id;

                        return (
                          <div
                            key={p.code}
                            onClick={() => {
                              if (isSuperAdmin && !isSuperRole && !isSaving) {
                                onToggleUserPermission(selectedUserObj, p.code);
                              }
                            }}
                            className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                              isSuperAdmin && !isSuperRole ? "cursor-pointer select-none" : ""
                            } ${
                              isCustomGranted
                                ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200"
                                : isInherited
                                ? "bg-white border-slate-200"
                                : "bg-white/60 border-slate-200 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-slate-900">{p.name}</span>
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                  {p.code}
                                </span>
                              </div>

                              {/* Status Badge */}
                              <div>
                                {isSuperRole ? (
                                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                    SUPER ADMIN (FULL)
                                  </span>
                                ) : isCustomGranted ? (
                                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    ● DIRECT OVERRIDE GRANTED
                                  </span>
                                ) : isInherited ? (
                                  <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    INHERITED FROM ROLE ({selectedUserObj.role})
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-semibold text-slate-400">
                                    NOT GRANTED
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* iOS Style Toggle Switch */}
                            <div className="shrink-0 pt-0.5">
                              {isSuperRole ? (
                                <div className="w-10 h-6 bg-slate-900 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-slate-900" />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!isSuperAdmin || isSaving}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleUserPermission(selectedUserObj, p.code);
                                  }}
                                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                                    isEffective ? "bg-slate-900" : "bg-slate-300"
                                  } ${!isSuperAdmin ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                  <span
                                    className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform shadow-xs absolute top-1 ${
                                      isEffective ? "left-6" : "left-1"
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
                ))
              )}
            </div>
          </>
        ) : (
          <div className="p-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">Select a user from the sidebar to view & edit permissions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
