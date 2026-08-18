"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { UserAddress } from "@/types";
import toast from "react-hot-toast";
import {
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from "@/lib/services/db";
import {
  Plus,
  ChevronRight,
  MapPin,
  X,
  CheckCircle2,
  Lock,
  Edit2,
  Trash2,
} from "lucide-react";

export default function AddressesPage() {
  const router = useRouter();
  const { profile } = useUserStore();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [editingInstructionId, setEditingInstructionId] = useState<
    string | null
  >(null);
  const [instructionText, setInstructionText] = useState("");

  // Form State
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [streetAddress, setStreetAddress] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Egypt");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const fetchAddresses = async () => {
    setLoading(true);
    const data = await getUserAddresses();
    setAddresses(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!profile) {
      router.push('/login?redirect=/addresses');
    } else {
      fetchAddresses();
    }
  }, [profile, router]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 11);
    setPhone(clean);
    if (clean.length > 0 && !clean.startsWith("0")) {
      setPhoneError("Egyptian number must start with 0");
    } else if (clean.length >= 3 && !/^(010|011|012|015)/.test(clean)) {
      setPhoneError("Must start with 010, 011, 012, or 015");
    } else if (clean.length > 0 && clean.length < 11) {
      setPhoneError(`Must be 11 digits (${clean.length}/11)`);
    } else {
      setPhoneError("");
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName(profile?.full_name || "");
    setPhone(profile?.phone || "");
    setStreetAddress("");
    setBuildingNo("");
    setCity("Cairo");
    setStateRegion("Cairo");
    setZipCode("11511");
    setCountry("Egypt");
    setDeliveryInstructions("");
    setIsDefault(addresses.length === 0);
    setPhoneError("");
    setShowModal(true);
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
    setDeliveryInstructions(addr.delivery_instructions || "");
    setIsDefault(addr.is_default || false);
    setPhoneError("");
    setShowModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress || !city || !phone) return;

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 11 || !/^(010|011|012|015)\d{8}$/.test(cleanPhone)) {
      setPhoneError("Valid 11-digit Egyptian number required (010, 011, 012, 015)");
      return;
    }

    setSaving(true);
    const payload = {
      user_id: profile?.id || "usr-guest",
      full_name: fullName || profile?.full_name || "Customer Name",
      street_address: streetAddress,
      building_no: buildingNo,
      city: city,
      state_region: stateRegion,
      zip_code: zipCode,
      country: country,
      phone_number: cleanPhone,
      delivery_instructions: deliveryInstructions,
      is_default: isDefault,
    };

    let result = null;
    if (editingAddress) {
      result = await updateUserAddress({ id: editingAddress.id, ...payload });
    } else {
      result = await createUserAddress({
        ...payload,
        is_default: isDefault || addresses.length === 0,
      });
    }

    if (result) {
      toast.success(editingAddress ? "Address updated successfully" : "New address added");
      await fetchAddresses();
      setShowModal(false);
    } else {
      toast.error("Failed to save address");
    }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    toast(
      (t) => (
        <div className="space-y-2 font-sans text-xs">
          <p className="font-bold text-slate-900 uppercase tracking-tight">
            Delete this shipping address?
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await deleteUserAddress(id);
                toast.success("Address removed");
                await fetchAddresses();
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-wider cursor-pointer border border-rose-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-[10px] uppercase tracking-wider cursor-pointer border border-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 6000, position: "top-center" }
    );
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultUserAddress(id);
    toast.success("Default address updated");
    await fetchAddresses();
  };

  if (!profile) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#f8fafc] text-slate-900 font-sans space-y-4">
        <div className="p-4 bg-white text-slate-900 border border-slate-200">
          <Lock className="w-8 h-8 text-slate-900" />
        </div>
        <h2 className="text-xl font-black uppercase text-slate-900">Authentication Required</h2>
        <p className="text-xs text-slate-600 max-w-sm">Please sign in to your account to view and manage your saved shipping addresses.</p>
        <Link
          href="/login?redirect=/addresses"
          className="px-6 py-3 bg-slate-900 text-white hover:bg-black text-xs font-bold uppercase border border-slate-800 transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans text-slate-900">
      {/* Breadcrumb Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-600">
          <Link href="/profile" className="hover:text-slate-900 transition-colors">
            Your Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900">Your Addresses</span>
        </div>
        <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tight">
          Your Addresses
        </h1>
      </div>

      {/* Main Grid: Add Box + Addresses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Add Address Box */}
        <button
          onClick={openAddModal}
          className="h-64 border-2 border-dashed border-slate-300 hover:border-slate-900 hover:bg-white transition-all flex flex-col items-center justify-center p-6 space-y-3 cursor-pointer group text-center bg-slate-50"
        >
          <div className="w-12 h-12 bg-white text-slate-900 flex items-center justify-center border border-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-800 transition-colors">
            <Plus className="w-8 h-8" />
          </div>
          <span className="text-lg font-black uppercase tracking-wider text-slate-900 group-hover:text-slate-900 transition-colors">
            Add Address
          </span>
        </button>

        {/* Saved Addresses Cards */}
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="h-full border border-slate-200 bg-white p-5 flex flex-col justify-between relative space-y-3 text-left font-sans"
          >
            {/* Top Header Row with Default Badge */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                Default:{" "}
                <span className="text-slate-900 font-black font-mono">aura</span>
              </span>
              {addr.is_default && (
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider border border-slate-800">
                  Primary
                </span>
              )}
            </div>

            {/* Address Body Information */}
            <div className="space-y-1 text-xs flex-1 overflow-y-auto pt-1">
              <p className="font-black text-sm uppercase text-slate-900">
                {addr.full_name}
              </p>
              <p className="text-slate-800 font-bold">
                {addr.street_address}
              </p>
              {addr.building_no && (
                <p className="text-slate-600">{addr.building_no}</p>
              )}
              <p className="text-slate-700">
                {addr.city} {addr.state_region} {addr.zip_code}
              </p>
              <p className="text-slate-700 font-bold">{addr.country}</p>
              <p className="text-slate-700 pt-1">
                Phone number:{" "}
                <span className="font-mono font-bold text-slate-900">
                  {addr.phone_number}
                </span>
              </p>

              {/* Delivery instructions toggle */}
              <div className="pt-2">
                {editingInstructionId === addr.id ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder="e.g. Leave with security guard"
                      value={instructionText}
                      onChange={(e) => setInstructionText(e.target.value)}
                      className="w-full text-xs p-1.5 border border-slate-300 bg-slate-50 text-slate-900"
                    />
                    <button
                      onClick={() => {
                        addr.delivery_instructions = instructionText;
                        setEditingInstructionId(null);
                      }}
                      className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase border border-slate-800"
                    >
                      Save Instruction
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingInstructionId(addr.id);
                      setInstructionText(addr.delivery_instructions || "");
                    }}
                    className="text-xs text-slate-900 underline hover:text-black font-bold uppercase cursor-pointer"
                  >
                    {addr.delivery_instructions
                      ? `Note: ${addr.delivery_instructions}`
                      : "Add delivery instructions"}
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Actions Row: Edit | Remove | Set as Default */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold uppercase">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(addr)}
                  className="text-slate-900 underline hover:text-black cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-800" />
                  <span>Edit</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-rose-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {!addr.is_default && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-slate-900 underline hover:text-black cursor-pointer"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add or Edit Address */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 font-sans backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 w-full max-w-xl p-6 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-slate-900" />
                <h2 className="text-lg font-black uppercase text-slate-900">
                  {editingAddress ? "Edit Shipping Address" : "Add New Address"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSaveAddress}
              className="space-y-4 text-xs font-bold uppercase"
            >
              <div className="space-y-1">
                <label className="block text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ahmed Mostafa"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700">Phone Number (Egyptian)</label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="01012345678"
                  className={`w-full p-2.5 bg-slate-50 border text-slate-900 text-xs font-mono focus:outline-none ${
                    phoneError ? "border-rose-500 focus:border-rose-600" : "border-slate-300 focus:border-slate-900"
                  }`}
                />
                {phoneError ? (
                  <p className="text-[10px] text-rose-600 font-bold mt-1 lowercase normal-case">{phoneError}</p>
                ) : (
                  <p className="text-[9px] text-slate-500 mt-0.5 font-mono normal-case">11 digits starting with 010, 011, 012, or 015</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700">Street Address</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="شارع رشيد بجوار مدرسة الصنايع"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-700">
                    Building / Flat / Apt
                  </label>
                  <input
                    type="text"
                    value={buildingNo}
                    onChange={(e) => setBuildingNo(e.target.value)}
                    placeholder="1111"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Minya El Qamh"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-700">State / Region</label>
                  <input
                    type="text"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="Ash Sharqia"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Call before delivery"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 border-slate-300 rounded-none cursor-pointer"
                />
                <label
                  htmlFor="isDefault"
                  className="text-xs text-slate-700 cursor-pointer"
                >
                  Make this my default address
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs font-bold uppercase border border-slate-300 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-slate-900 text-white hover:bg-black text-xs font-bold uppercase border border-slate-800 cursor-pointer transition-colors"
                >
                  {saving ? "Saving..." : editingAddress ? "Save Changes" : "Add Address"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </div>
  );
}
