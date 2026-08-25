"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Role, Permission, Profile } from "@/types";
import {
  getRolesFromDb,
  getPermissionsFromDb,
  createRoleInDb,
  updateRoleInDb,
  deleteRoleInDb,
  createPermissionInDb,
  updateUserRoleInDb,
  updateUserPermissionsInDb,
} from "@/lib/services/db";

import { RoleCardSelector } from "./roles/RoleCardSelector";
import { RolePermissionsEditor } from "./roles/RolePermissionsEditor";
import { UserDirectPermissionsManager } from "./roles/UserDirectPermissionsManager";
import { RoleModals } from "./roles/RoleModals";

interface AdminRolesTabProps {
  currentUserRole?: string;
  usersList?: Profile[];
  onNotify?: (msg: string) => void;
  onRefreshUsers?: () => void;
}

export function AdminRolesTab({
  currentUserRole = "super_admin",
  usersList = [],
  onNotify,
  onRefreshUsers,
}: AdminRolesTabProps) {
  const [viewMode, setViewMode] = useState<"roles_matrix" | "user_custom_perms">("roles_matrix");
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [savingUserPerm, setSavingUserPerm] = useState<string | null>(null);

  // Selected active role in Role View Mode
  const [activeRoleCode, setActiveRoleCode] = useState<string>("admin");

  // Selected user in User Direct View Mode
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModuleFilter, setSelectedModuleFilter] = useState("ALL");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");

  // Modals
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isAddPermOpen, setIsAddPermOpen] = useState(false);
  const [isAssignUserModalOpen, setIsAssignUserModalOpen] = useState(false);

  // Form State - Add Role
  const [newRoleCode, setNewRoleCode] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [submittingRole, setSubmittingRole] = useState(false);

  // Form State - Add Permission
  const [newPermCode, setNewPermCode] = useState("");
  const [newPermName, setNewPermName] = useState("");
  const [newPermModule, setNewPermModule] = useState("Custom Modules");
  const [newPermDesc, setNewPermDesc] = useState("");
  const [submittingPerm, setSubmittingPerm] = useState(false);

  // Form State - User Role Assignment
  const [selectedUserForRole, setSelectedUserForRole] = useState<Profile | null>(null);
  const [selectedAssignedRole, setSelectedAssignedRole] = useState<string>("user");
  const [assigningRole, setAssigningRole] = useState(false);

  const isSuperAdmin = currentUserRole === "super_admin" || currentUserRole === "admin";

  const loadData = async () => {
    setLoading(true);
    try {
      const [rData, pData] = await Promise.all([
        getRolesFromDb(),
        getPermissionsFromDb(),
      ]);
      setRoles(rData);
      setPermissions(pData);

      if (rData.length > 0 && !activeRoleCode) {
        const firstNonSuper = rData.find((r) => r.code !== "super_admin") || rData[0];
        setActiveRoleCode(firstNonSuper.code);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Set default selected user when usersList loads
  useEffect(() => {
    if (usersList.length > 0 && !selectedUserId) {
      setSelectedUserId(usersList[0].id);
    }
  }, [usersList, selectedUserId]);

  // Unique modules list
  const modules = useMemo(() => {
    return Array.from(new Set(permissions.map((p) => p.module || "General")));
  }, [permissions]);

  // Active Role Object
  const activeRoleObj = useMemo(() => {
    return roles.find((r) => r.code === activeRoleCode) || roles[0];
  }, [roles, activeRoleCode]);

  // Filtered users for User Custom Permissions View
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const name = (u.full_name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const term = userSearchTerm.toLowerCase();

      const matchesSearch = name.includes(term) || email.includes(term);
      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearchTerm, userRoleFilter]);

  // Selected User Object
  const selectedUserObj = useMemo(() => {
    return usersList.find((u) => u.id === selectedUserId) || filteredUsers[0] || null;
  }, [usersList, selectedUserId, filteredUsers]);

  // Filtered permissions by search and module
  const filteredPermissions = useMemo(() => {
    return permissions.filter((perm) => {
      const matchesSearch =
        perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (perm.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule =
        selectedModuleFilter === "ALL" || (perm.module || "General") === selectedModuleFilter;

      return matchesSearch && matchesModule;
    });
  }, [permissions, searchTerm, selectedModuleFilter]);

  // Handle Toggling Role Permission
  const handleTogglePermission = async (roleCode: string, permCode: string) => {
    const targetRole = roles.find((r) => r.code === roleCode);
    if (!targetRole) return;

    const currentPerms = targetRole.permissions || [];
    const hasPerm = currentPerms.includes(permCode);
    const updatedPerms = hasPerm
      ? currentPerms.filter((code) => code !== permCode)
      : [...currentPerms, permCode];

    setSavingRole(roleCode);
    setRoles((prev) =>
      prev.map((r) => (r.code === roleCode ? { ...r, permissions: updatedPerms } : r))
    );

    try {
      const ok = await updateRoleInDb({ code: roleCode, permissions: updatedPerms });
      if (ok) {
        if (onNotify) onNotify(`Permission '${permCode}' updated for role '${roleCode}'`);
      } else {
        await loadData();
        if (onNotify) onNotify(`Failed to save permission for role '${roleCode}'`);
      }
    } catch {
      await loadData();
      if (onNotify) onNotify(`Error saving permission for role '${roleCode}'`);
    } finally {
      setSavingRole(null);
    }
  };

  // Handle Toggling User Custom Direct Permission
  const handleToggleUserPermission = async (user: Profile, permCode: string) => {
    setSavingUserPerm(user.id);
    const currentCustom = user.custom_permissions || [];
    const hasPerm = currentCustom.includes(permCode);
    const updated = hasPerm
      ? currentCustom.filter((p) => p !== permCode)
      : [...currentCustom, permCode];

    try {
      const ok = await updateUserPermissionsInDb(user.id, updated);
      if (ok) {
        if (onNotify) {
          onNotify(
            hasPerm
              ? `Revoked custom permission '${permCode}' from ${user.full_name || user.email}`
              : `Granted custom permission '${permCode}' to ${user.full_name || user.email}`
          );
        }
        if (onRefreshUsers) onRefreshUsers();
      } else {
        if (onNotify) onNotify("Failed to update user custom permissions");
      }
    } catch {
      if (onNotify) onNotify("Error updating user custom permissions");
    } finally {
      setSavingUserPerm(null);
    }
  };

  // Create Role Handler
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleCode || !newRoleName) return;

    setSubmittingRole(true);
    try {
      const created = await createRoleInDb({
        code: newRoleCode.toLowerCase().trim().replace(/\s+/g, "_"),
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        permissions: [],
      });

      if (created) {
        setRoles((prev) => [...prev, created]);
        setActiveRoleCode(created.code);
        setIsAddRoleOpen(false);
        setNewRoleCode("");
        setNewRoleName("");
        setNewRoleDesc("");
        if (onNotify) onNotify(`Role '${created.name}' created successfully`);
      } else {
        if (onNotify) onNotify("Failed to create role");
      }
    } catch {
      if (onNotify) onNotify("Error creating role");
    } finally {
      setSubmittingRole(false);
    }
  };

  // Create Permission Handler
  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermCode || !newPermName) return;

    setSubmittingPerm(true);
    try {
      const created = await createPermissionInDb({
        code: newPermCode.toLowerCase().trim().replace(/\s+/g, "_"),
        name: newPermName.trim(),
        module: newPermModule.trim() || "Custom Modules",
        description: newPermDesc.trim(),
      });

      if (created) {
        setPermissions((prev) => [...prev, created]);
        setIsAddPermOpen(false);
        setNewPermCode("");
        setNewPermName("");
        setNewPermModule("Custom Modules");
        setNewPermDesc("");
        if (onNotify) onNotify(`Permission '${created.name}' created successfully`);
      } else {
        if (onNotify) onNotify("Failed to create permission");
      }
    } catch {
      if (onNotify) onNotify("Error creating permission");
    } finally {
      setSubmittingPerm(false);
    }
  };

  // Delete Role Handler
  const handleDeleteRole = async (roleCode: string) => {
    if (roleCode === "super_admin") {
      if (onNotify) onNotify("Cannot delete Super Admin role");
      return;
    }
    if (!confirm(`Are you sure you want to delete role '${roleCode}'?`)) return;

    setSavingRole(roleCode);
    try {
      const ok = await deleteRoleInDb(roleCode);
      if (ok) {
        setRoles((prev) => prev.filter((r) => r.code !== roleCode));
        if (activeRoleCode === roleCode) {
          setActiveRoleCode("admin");
        }
        if (onNotify) onNotify(`Role '${roleCode}' deleted successfully`);
      } else {
        if (onNotify) onNotify(`Failed to delete role '${roleCode}'`);
      }
    } catch {
      if (onNotify) onNotify(`Error deleting role '${roleCode}'`);
    } finally {
      setSavingRole(null);
    }
  };

  // Assign Role Handler
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;

    setAssigningRole(true);
    try {
      const ok = await updateUserRoleInDb(selectedUserForRole.id, selectedAssignedRole);
      if (ok) {
        if (onNotify) {
          onNotify(`Assigned role '${selectedAssignedRole}' to ${selectedUserForRole.full_name || selectedUserForRole.email}`);
        }
        setIsAssignUserModalOpen(false);
        if (onRefreshUsers) onRefreshUsers();
      } else {
        if (onNotify) onNotify("Failed to assign role to user");
      }
    } catch {
      if (onNotify) onNotify("Error assigning role to user");
    } finally {
      setAssigningRole(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-900" />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading Roles & Permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Mode Toggle Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-900" />
            Permissions & Role Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage granular access control by configuring system role matrices or setting user-specific direct overrides.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setViewMode("roles_matrix")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === "roles_matrix"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Group Role Matrix
          </button>
          <button
            onClick={() => setViewMode("user_custom_perms")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === "user_custom_perms"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Individual User Overrides
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Group Role Matrix */}
      {viewMode === "roles_matrix" && (
        <div className="space-y-6">
          <RoleCardSelector
            roles={roles}
            activeRoleCode={activeRoleCode}
            onSelectRole={(code) => setActiveRoleCode(code)}
            isSuperAdmin={isSuperAdmin}
            onOpenAddRoleModal={() => setIsAddRoleOpen(true)}
            onOpenAddPermModal={() => setIsAddPermOpen(true)}
            onOpenAssignRoleModal={() => setIsAssignUserModalOpen(true)}
            onDeleteRole={handleDeleteRole}
            savingRole={savingRole}
          />

          <RolePermissionsEditor
            activeRoleObj={activeRoleObj}
            permissions={permissions}
            filteredPermissions={filteredPermissions}
            modules={modules}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedModuleFilter={selectedModuleFilter}
            onModuleFilterChange={setSelectedModuleFilter}
            onTogglePermission={handleTogglePermission}
            savingRole={savingRole}
            isSuperAdmin={isSuperAdmin}
          />
        </div>
      )}

      {/* VIEW MODE 2: Individual User Direct Permissions Overrides */}
      {viewMode === "user_custom_perms" && (
        <UserDirectPermissionsManager
          usersList={usersList}
          filteredUsers={filteredUsers}
          selectedUserObj={selectedUserObj}
          onSelectUser={(id) => setSelectedUserId(id)}
          userSearchTerm={userSearchTerm}
          onUserSearchChange={setUserSearchTerm}
          userRoleFilter={userRoleFilter}
          onUserRoleFilterChange={setUserRoleFilter}
          roles={roles}
          permissions={permissions}
          modules={modules}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedModuleFilter={selectedModuleFilter}
          onModuleFilterChange={setSelectedModuleFilter}
          onToggleUserPermission={handleToggleUserPermission}
          savingUserPerm={savingUserPerm}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* Dialog Modals */}
      <RoleModals
        isAddRoleOpen={isAddRoleOpen}
        onCloseAddRoleModal={() => setIsAddRoleOpen(false)}
        newRoleCode={newRoleCode}
        onNewRoleCodeChange={setNewRoleCode}
        newRoleName={newRoleName}
        onNewRoleNameChange={setNewRoleName}
        newRoleDesc={newRoleDesc}
        onNewRoleDescChange={setNewRoleDesc}
        submittingRole={submittingRole}
        onCreateRoleSubmit={handleCreateRole}
        isAddPermOpen={isAddPermOpen}
        onCloseAddPermModal={() => setIsAddPermOpen(false)}
        newPermCode={newPermCode}
        onNewPermCodeChange={setNewPermCode}
        newPermName={newPermName}
        onNewPermNameChange={setNewPermName}
        newPermModule={newPermModule}
        onNewPermModuleChange={setNewPermModule}
        newPermDesc={newPermDesc}
        onNewPermDescChange={setNewPermDesc}
        submittingPerm={submittingPerm}
        onCreatePermSubmit={handleCreatePermission}
        isAssignUserModalOpen={isAssignUserModalOpen}
        onCloseAssignUserModal={() => setIsAssignUserModalOpen(false)}
        usersList={usersList}
        roles={roles}
        selectedUserForRole={selectedUserForRole}
        onSelectedUserForRoleChange={setSelectedUserForRole}
        selectedAssignedRole={selectedAssignedRole}
        onSelectedAssignedRoleChange={setSelectedAssignedRole}
        assigningRole={assigningRole}
        onAssignRoleSubmit={handleAssignRole}
      />
    </div>
  );
}
