"use client";

import React, { useState } from "react";
import { Plus, Search, MapPin, Edit, Trash2, Loader2, X, Check } from "lucide-react";
import { UserAddress } from "@/types";
import { createAdminAddress, updateAdminAddress, deleteAdminAddress } from "@/lib/services/db";

interface AdminAddressesTabProps {
  addressesList: UserAddress[];
  onRefresh?: () => void;
  onNotify?: (msg: string) => void;
}

export function AdminAddressesTab({
  addressesList,
  onRefresh,
  onNotify,
}: AdminAddressesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Egypt");
  const [instructions, setInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredAddresses = addressesList.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      (a.full_name || "").toLowerCase().includes(term) ||
      (a.phone_number || a.phone_number || "").toLowerCase().includes(term) ||
      (a.city || "").toLowerCase().includes(term) ||
      (a.street_address || "").toLowerCase().includes(term)
    );
  });

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName("");
    setPhone("");
    setStreetAddress("");
    setBuildingNo("");
    setCity("Cairo");
    setStateRegion("Cairo");
    setZipCode("11511");
    setCountry("Egypt");
    setInstructions("");
    setIsDefault(false);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: UserAddress) => {
    setEditingAddress(addr);
    setFullName(addr.full_name || "");
    setPhone(addr.phone_number || (addr as any).phone || "");
    setStreetAddress(addr.street_address || "");
    setBuildingNo(addr.building_no || "");
    setCity(addr.city || "");
    setStateRegion(addr.state_region || "");
    setZipCode(addr.zip_code || "");
    setCountry(addr.country || "Egypt");
    setInstructions(addr.delivery_instructions || "");
    setIsDefault(addr.is_default || false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !streetAddress || !city) return;

    setSubmitting(true);
    const payload = {
      full_name: fullName,
      phone_number: phone,
      street_address: streetAddress,
      building_no: buildingNo,
      city,
      state_region: stateRegion,
      zip_code: zipCode,
      country,
      delivery_instructions: instructions,
      is_default: isDefault,
      user_id: editingAddress?.user_id || "usr-admin-manual",
    };

    if (editingAddress) {
      const updated = await updateAdminAddress({ id: editingAddress.id, ...payload });
      if (updated) {
        onNotify?.(`Address for ${fullName} updated successfully.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    } else {
      const created = await createAdminAddress(payload);
      if (created) {
        onNotify?.(`New address for ${fullName} created successfully.`);
        onRefresh?.();
        setIsModalOpen(false);
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    setActionLoadingId(id);
    const ok = await deleteAdminAddress(id);
    if (ok) {
      onNotify?.(`Address for "${name}" deleted.`);
      onRefresh?.();
    }
    setActionLoadingId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-900" />
            Customer Shipping Addresses
          </h2>
          <p className="text-xs text-slate-600">
            Manage customer delivery destinations and instructions ({filteredAddresses.length} records).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase border border-slate-800 transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by name, city, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAddresses.map((addr) => {
          const ph = addr.phone_number || (addr as any).phone || "N/A";
          return (
            <div
              key={addr.id}
              className="p-4 border border-slate-200 bg-white flex flex-col justify-between space-y-3 hover:border-slate-900 transition-all text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <span className="truncate pr-2">{addr.full_name}</span>
                  {addr.is_default && (
                    <span className="bg-slate-900 text-white px-2 py-0.5 text-[9px] font-black uppercase border border-slate-800 flex-shrink-0">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-slate-800 font-medium">
                  {addr.street_address}{addr.building_no ? `, Apt/Bldg ${addr.building_no}` : ""}
                </p>
                <p className="text-slate-600 font-mono">
                  {addr.city}, {addr.state_region} {addr.zip_code} - {addr.country}
                </p>
                <p className="text-slate-700 font-mono font-bold">
                  📞 {ph}
                </p>
                {addr.delivery_instructions && (
                  <p className="text-[11px] italic text-slate-500 bg-slate-50 p-2 border border-slate-200 mt-2">
                    Note: {addr.delivery_instructions}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEditModal(addr)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold uppercase text-[11px] border border-slate-300 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  disabled={actionLoadingId === addr.id}
                  onClick={() => handleDelete(addr.id, addr.full_name)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-bold uppercase text-[11px] border border-slate-200 flex items-center space-x-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {actionLoadingId === addr.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-4 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black uppercase text-slate-900">
                {editingAddress ? "Edit Shipping Address" : "Add New Shipping Address"}
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
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">Bldg / Apt</label>
                  <input
                    type="text"
                    value={buildingNo}
                    onChange={(e) => setBuildingNo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">State/Region</label>
                  <input
                    type="text"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Delivery Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Call before arrival"
                  className="w-full p-2 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultAdmin"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 border-slate-300 cursor-pointer"
                />
                <label htmlFor="isDefaultAdmin" className="text-xs text-slate-800 cursor-pointer">
                  Set as Default Primary Address
                </label>
              </div>

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
                  {submitting ? "Saving..." : editingAddress ? "Save Changes" : "Create Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
