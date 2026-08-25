"use client";

import React from "react";
import Link from "next/link";
import { Truck, Banknote, Loader2, Check, Plus } from "lucide-react";
import { UserAddress, Profile } from "@/types";
import { EGYPTIAN_GOVERNORATES, getShippingFee } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

interface CheckoutAddressSectionProps {
  profile: Profile | null;
  savedAddresses: UserAddress[];
  selectedAddressId: string | "new";
  loadingAddresses: boolean;
  shippingData: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    buildingNo: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    deliveryInstructions: string;
  };
  setShippingData: React.Dispatch<React.SetStateAction<any>>;
  handleSelectAddress: (id: string) => void;
  saveAddressToAccount: boolean;
  setSaveAddressToAccount: (val: boolean) => void;
  subtotal: number;
}

export function CheckoutAddressSection({
  profile,
  savedAddresses,
  selectedAddressId,
  loadingAddresses,
  shippingData,
  setShippingData,
  handleSelectAddress,
  saveAddressToAccount,
  setSaveAddressToAccount,
  subtotal,
}: CheckoutAddressSectionProps) {
  return (
    <div className="lg:col-span-2 space-y-6 font-sans text-slate-900">
      <div className="p-6 bg-white border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-900" />
            Shipping & Delivery Address
          </h3>

          {profile && savedAddresses.length > 0 && (
            <Link
              href="/addresses"
              className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline"
            >
              Manage Addresses
            </Link>
          )}
        </div>

        {/* Saved Addresses Picker */}
        {profile && savedAddresses.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select a saved shipping address for instant checkout:
            </p>

            {loadingAddresses ? (
              <div className="p-4 flex items-center space-x-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Loading saved addresses...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr.id)}
                      className={`p-3.5 border cursor-pointer transition-all flex flex-col justify-between space-y-2 text-xs ${
                        isSelected
                          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                          : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                          <span className="truncate pr-1">{addr.full_name}</span>
                          {addr.is_default && (
                            <span className="bg-slate-900 text-white px-1.5 py-0.5 text-[8px] font-black uppercase">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-slate-800 text-[11px] leading-snug">
                          {addr.street_address}
                          {addr.building_no ? `, Apt/Bldg ${addr.building_no}` : ""}
                        </p>
                        <p className="text-slate-500 font-mono text-[10px]">
                          {addr.city}, {addr.state_region}
                        </p>
                        <p className="text-slate-700 font-mono text-[10px]">
                          {addr.phone_number || (addr as any).phone}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 text-[10px] font-bold uppercase text-slate-900 pt-1 border-t border-slate-200/60">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-slate-900 bg-slate-900" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span>{isSelected ? "Selected" : "Deliver Here"}</span>
                      </div>
                    </div>
                  );
                })}

                <div
                  onClick={() => handleSelectAddress("new")}
                  className={`p-3.5 border border-dashed cursor-pointer transition-all flex items-center justify-center space-x-2 text-xs font-bold uppercase ${
                    selectedAddressId === "new"
                      ? "border-slate-900 bg-slate-50 text-slate-900"
                      : "border-slate-300 bg-white text-slate-600 hover:border-slate-900"
                  }`}
                >
                  <Plus className="w-4 h-4 text-slate-900" />
                  <span>Use New Address</span>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Input Form Fields */}
        {(!profile || savedAddresses.length === 0 || selectedAddressId === "new") && (
          <div className="space-y-4 pt-2">
            {profile && savedAddresses.length > 0 && (
              <h4 className="text-xs font-bold uppercase text-slate-900 border-t border-slate-100 pt-3">
                Enter Custom Address Details:
              </h4>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Vance"
                  value={shippingData.fullName}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, fullName: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {!profile && (
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={shippingData.email}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, email: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">
                  Phone Number (Egyptian)
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="01012345678"
                  value={shippingData.phone}
                  onChange={(e) =>
                    setShippingData({
                      ...shippingData,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 11),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                />
                <p className="text-[9px] text-slate-500 mt-0.5 font-mono normal-case">
                  11 digits starting with 010, 011, 012, or 015
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 742 Evergreen Terrace, Nasr City"
                  value={shippingData.street}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, street: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">
                  Apt / Bldg No.
                </label>
                <input
                  type="text"
                  placeholder="Apt 4B, Building 12"
                  value={shippingData.buildingNo}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, buildingNo: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">
                  Governorate
                </label>
                <select
                  value={shippingData.state}
                  onChange={(e) => {
                    const gov = EGYPTIAN_GOVERNORATES.find((g) => g.name === e.target.value);
                    setShippingData({
                      ...shippingData,
                      state: e.target.value,
                      city: gov ? gov.name.split(" ")[0] : shippingData.city,
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-sans"
                >
                  {EGYPTIAN_GOVERNORATES.map((gov) => (
                    <option key={gov.id} value={gov.name}>
                      {gov.name} ({gov.nameAr}) -{" "}
                      {subtotal >= 2000 ? "FREE" : formatPrice(gov.fee)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">
                  City / District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nasr City, Maadi, Smouha"
                  value={shippingData.city}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, city: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={shippingData.zipCode}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, zipCode: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 block mb-1 uppercase">
                  Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with doorman or call on arrival"
                  value={shippingData.deliveryInstructions}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, deliveryInstructions: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {profile && (
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="saveAddressCheck"
                  checked={saveAddressToAccount}
                  onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 border-slate-300 cursor-pointer"
                />
                <label
                  htmlFor="saveAddressCheck"
                  className="text-xs font-bold text-slate-800 uppercase cursor-pointer"
                >
                  Save this address to my account for future orders
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 bg-white border border-slate-200 space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
          <Banknote className="w-4 h-4 text-slate-900" /> Payment Method
        </h3>
        <div className="p-4 bg-slate-50 border border-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h4 className="text-xs font-black text-slate-900 uppercase">
              Cash on Delivery (COD)
            </h4>
            <p className="text-[11px] text-slate-600">
              Pay in cash right when your order arrives at your doorstep.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-300 uppercase">
            SELECTED
          </span>
        </div>
      </div>
    </div>
  );
}
