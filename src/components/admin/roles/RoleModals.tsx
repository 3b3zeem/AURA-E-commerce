"use client";

import React from "react";
import { X, ShieldCheck, KeyRound, UserCheck2, Loader2 } from "lucide-react";
import { Role, Profile } from "@/types";

interface RoleModalsProps {
  // Add Role Modal
  isAddRoleOpen: boolean;
  onCloseAddRoleModal: () => void;
  newRoleCode: string;
  onNewRoleCodeChange: (code: string) => void;
  newRoleName: string;
  onNewRoleNameChange: (name: string) => void;
  newRoleDesc: string;
  onNewRoleDescChange: (desc: string) => void;
  submittingRole: boolean;
  onCreateRoleSubmit: (e: React.FormEvent) => void;

  // Add Permission Modal
  isAddPermOpen: boolean;
  onCloseAddPermModal: () => void;
  newPermCode: string;
  onNewPermCodeChange: (code: string) => void;
  newPermName: string;
  onNewPermNameChange: (name: string) => void;
  newPermModule: string;
  onNewPermModuleChange: (module: string) => void;
  newPermDesc: string;
  onNewPermDescChange: (desc: string) => void;
  submittingPerm: boolean;
  onCreatePermSubmit: (e: React.FormEvent) => void;

  // Assign Role Modal
  isAssignUserModalOpen: boolean;
  onCloseAssignUserModal: () => void;
  usersList: Profile[];
  roles: Role[];
  selectedUserForRole: Profile | null;
  onSelectedUserForRoleChange: (user: Profile | null) => void;
  selectedAssignedRole: string;
  onSelectedAssignedRoleChange: (role: string) => void;
  assigningRole: boolean;
  onAssignRoleSubmit: (e: React.FormEvent) => void;
}

export function RoleModals({
  isAddRoleOpen,
  onCloseAddRoleModal,
  newRoleCode,
  onNewRoleCodeChange,
  newRoleName,
  onNewRoleNameChange,
  newRoleDesc,
  onNewRoleDescChange,
  submittingRole,
  onCreateRoleSubmit,

  isAddPermOpen,
  onCloseAddPermModal,
  newPermCode,
  onNewPermCodeChange,
  newPermName,
  onNewPermNameChange,
  newPermModule,
  onNewPermModuleChange,
  newPermDesc,
  onNewPermDescChange,
  submittingPerm,
  onCreatePermSubmit,

  isAssignUserModalOpen,
  onCloseAssignUserModal,
  usersList,
  roles,
  selectedUserForRole,
  onSelectedUserForRoleChange,
  selectedAssignedRole,
  onSelectedAssignedRoleChange,
  assigningRole,
  onAssignRoleSubmit,
}: RoleModalsProps) {
  return (
    <>
      {/* 1. Add Role Modal */}
      {isAddRoleOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Create System Role
              </h3>
              <button
                onClick={onCloseAddRoleModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onCreateRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Role Code (Identifier)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. content_editor"
                  value={newRoleCode}
                  onChange={(e) => onNewRoleCodeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Content Editor"
                  value={newRoleName}
                  onChange={(e) => onNewRoleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what this role is for..."
                  value={newRoleDesc}
                  onChange={(e) => onNewRoleDescChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCloseAddRoleModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRole}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  {submittingRole && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Permission Modal */}
      {isAddPermOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" /> Add New Capability
              </h3>
              <button
                onClick={onCloseAddPermModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onCreatePermSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Permission Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. products.export"
                  value={newPermCode}
                  onChange={(e) => onNewPermCodeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Export Product Reports"
                  value={newPermName}
                  onChange={(e) => onNewPermNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Module Category
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Catalog Management"
                  value={newPermModule}
                  onChange={(e) => onNewPermModuleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What action does this permission grant?"
                  value={newPermDesc}
                  onChange={(e) => onNewPermDescChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCloseAddPermModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPerm}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  {submittingPerm && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Assign Role Modal */}
      {isAssignUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <UserCheck2 className="w-4 h-4 text-emerald-600" /> Assign Role to User
              </h3>
              <button
                onClick={onCloseAssignUserModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onAssignRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select User
                </label>
                <select
                  required
                  value={selectedUserForRole?.id || ""}
                  onChange={(e) => {
                    const u = usersList.find((usr) => usr.id === e.target.value);
                    onSelectedUserForRoleChange(u || null);
                    if (u) onSelectedAssignedRoleChange(u.role || "user");
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">-- Choose User --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email} ({u.role || "user"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assigned Role
                </label>
                <select
                  required
                  value={selectedAssignedRole}
                  onChange={(e) => onSelectedAssignedRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {roles.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCloseAssignUserModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningRole || !selectedUserForRole}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  {assigningRole && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
