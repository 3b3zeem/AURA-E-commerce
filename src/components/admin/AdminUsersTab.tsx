"use client";

import React, { useState } from "react";
import { Plus, Search, Trash2, Edit, Loader2, ShieldCheck, User, X, Lock } from "lucide-react";
import { Profile, UserRole } from "@/types";
import { createUserInDb, updateUserInDb } from "@/lib/services/db";

interface AdminUsersTabProps {
  currentUserRole?: string;
  usersList: Profile[];
  actionLoadingId: string | null;
  onChangeUserRole: (userId: string, newRole: string) => void;
  onDeleteUser: (id: string) => void;
  onRefresh?: () => void;
  onNotify?: (msg: string) => void;
}

export function AdminUsersTab({
  currentUserRole,
  usersList,
  actionLoadingId,
  onChangeUserRole,
  onDeleteUser,
  onRefresh,
  onNotify,
}: AdminUsersTabProps) {
  const isSuperAdmin = currentUserRole === "super_admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [loyaltyPoints, setLoyaltyPoints] = useState("100");
  const [submitting, setSubmitting] = useState(false);

  const filteredUsers = usersList.filter((usr) => {
    const term = searchTerm.toLowerCase();
    return (
      (usr.full_name || "").toLowerCase().includes(term) ||
      (usr.email || "").toLowerCase().includes(term) ||
      (usr.role || "").toLowerCase().includes(term) ||
      (usr.phone || "").toLowerCase().includes(term)
    );
  });

  const getRoleBadgeStyle = (usrRole: string) => {
    switch (usrRole) {
      case "super_admin":
        return "bg-amber-500 text-slate-950 font-black border-amber-600 shadow-sm";
      case "admin":
        return "bg-slate-900 text-white font-bold border-slate-800";
      case "seller":
        return "bg-emerald-600 text-white font-bold border-emerald-700";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 font-semibold";
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("user");
    setLoyaltyPoints("100");
    setIsModalOpen(true);
  };

  const openEditModal = (usr: Profile) => {
    setEditingUser(usr);
    setFullName(usr.full_name || "");
    setEmail(usr.email || "");
    setPhone(usr.phone || "");
    setRole(usr.role || "user");
    setLoyaltyPoints(String(usr.loyalty_points || 0));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    const payload: any = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      loyalty_points: parseInt(loyaltyPoints) || 0,
    };

    // Only allow role submission if Super Admin
    if (isSuperAdmin) {
      payload.role = role;
    }

    if (editingUser) {
      const updated = await updateUserInDb({ id: editingUser.id, ...payload });
      if (updated) {
        onNotify?.(`User "${email}" updated successfully.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    } else {
      const created = await createUserInDb(payload);
      if (created) {
        onNotify?.(`User "${email}" created successfully.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-900" />
            Users & Privilege Control
          </h2>
          <p className="text-xs text-slate-600">
            Manage registered accounts, roles, and loyalty points ({filteredUsers.length} total).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New User</span>
        </button>
      </div>

      {!isSuperAdmin && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center space-x-2">
          <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>Notice: Changing user roles is restricted to Super Admin only.</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by name, email, role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
        />
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((usr) => (
          <div
            key={usr.id}
            className="p-4 border border-slate-200 bg-white space-y-3 flex flex-col justify-between hover:border-slate-900 transition-all text-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm truncate pr-2">
                  {usr.full_name || "Customer"}
                </h3>
                <span
                  className={`px-2 py-0.5 text-[9px] uppercase border flex-shrink-0 ${getRoleBadgeStyle(
                    usr.role
                  )}`}
                >
                  {usr.role === "super_admin"
                    ? "Super Admin"
                    : usr.role === "admin"
                    ? "Admin"
                    : usr.role === "seller"
                    ? "Seller"
                    : "User"}
                </span>
              </div>
              <p className="p-2 bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 truncate">
                {usr.email}
              </p>
              {usr.phone && (
                <p className="font-mono text-[11px] text-slate-700">
                  Phone: {usr.phone}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 pt-1">
                <span>Loyalty Points:</span>
                <span className="font-bold text-slate-900">{usr.loyalty_points || 0} PTS</span>
              </div>
            </div>

            {/* Role Control & Actions Row */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between gap-1.5">
                {/* ROLE SELECTOR DROPDOWN */}
                <div className="flex-1 relative">
                  <select
                    disabled={!isSuperAdmin || actionLoadingId === usr.id}
                    value={usr.role}
                    onChange={(e) => onChangeUserRole(usr.id, e.target.value)}
                    className={`w-full py-1.5 px-2 border text-[11px] font-bold uppercase transition-all ${
                      isSuperAdmin
                        ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900 cursor-pointer focus:border-slate-900"
                        : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                    title={isSuperAdmin ? "Change User Role" : "Only Super Admin can change roles"}
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="seller">Seller / Vendor</option>
                    <option value="user">Customer / Buyer</option>
                  </select>

                  {actionLoadingId === usr.id && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900 absolute right-2 top-2" />
                  )}
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(usr)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors cursor-pointer inline-flex items-center"
                  title="Edit User Details"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  disabled={actionLoadingId === usr.id || !isSuperAdmin}
                  onClick={() => onDeleteUser(usr.id)}
                  className={`p-1.5 border transition-colors inline-flex items-center ${
                    isSuperAdmin
                      ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-200 cursor-pointer"
                      : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  }`}
                  title={isSuperAdmin ? "Delete User Account" : "Super Admin Only"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {!isSuperAdmin && (
                <div className="flex items-center space-x-1 text-[10px] text-slate-600 font-mono">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Role locked (Super Admin required)</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 text-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black uppercase text-slate-900">
                {editingUser ? "Edit User Account" : "Create New User Profile"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold uppercase">
              <div>
                <label className="block text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmed Mostafa"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+201011223344"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 flex items-center justify-between">
                    <span>Account Role</span>
                    {!isSuperAdmin && <Lock className="w-3 h-3 text-amber-600 inline" />}
                  </label>
                  <select
                    disabled={!isSuperAdmin}
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className={`w-full p-2 border text-xs focus:outline-none font-bold ${
                      isSuperAdmin
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 cursor-pointer"
                        : "bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="seller">Seller / Vendor</option>
                    <option value="user">Customer / Buyer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Loyalty Points</label>
                <input
                  type="number"
                  min="0"
                  value={loyaltyPoints}
                  onChange={(e) => setLoyaltyPoints(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                />
              </div>

              {!isSuperAdmin && (
                <p className="text-[10px] text-amber-700 font-mono">
                  * Note: Only Super Admin can modify account role privileges.
                </p>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold uppercase border border-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold uppercase border border-slate-800 hover:bg-black cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
