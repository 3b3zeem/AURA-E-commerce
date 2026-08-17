"use client";

import React from "react";

interface AdminAddressesTabProps {
  addressesList: any[];
}

export function AdminAddressesTab({ addressesList }: AdminAddressesTabProps) {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-black uppercase text-slate-900">
          User Shipping Addresses
        </h2>
        <p className="text-xs text-slate-600">
          Customer saved addresses and delivery instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addressesList.map((addr) => (
          <div
            key={addr.id}
            className="p-4 border border-slate-200 bg-white space-y-2 text-xs text-slate-700 hover:border-slate-900 transition-all"
          >
            <div className="flex justify-between font-mono font-bold text-slate-900">
              <span>
                {addr.full_name} ({addr.phone})
              </span>
              {addr.is_default && (
                <span className="bg-slate-900 text-white px-2 py-0.5 text-[9px] border border-slate-800">
                  DEFAULT
                </span>
              )}
            </div>
            <p className="text-slate-600">
              {addr.street_address}, {addr.building_no}, {addr.city},{" "}
              {addr.state_region}
            </p>
            {addr.delivery_instructions && (
              <p className="text-[11px] italic text-slate-500 border-t border-slate-200 pt-1">
                Note: {addr.delivery_instructions}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
