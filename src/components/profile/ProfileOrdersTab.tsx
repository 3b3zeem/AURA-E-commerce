"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface ProfileOrdersTabProps {
  userOrders: any[];
}

export function ProfileOrdersTab({ userOrders }: ProfileOrdersTabProps) {
  return (
    <div className="p-6 bg-white border border-slate-200 space-y-6 font-sans text-slate-900">
      <h2 className="text-base font-black text-slate-900 uppercase">Recent Orders</h2>

      {userOrders.length === 0 ? (
        <p className="text-xs text-slate-600 font-mono">
          No order history found for this account.
        </p>
      ) : (
        userOrders.map((ord) => (
          <div
            key={ord.id}
            className="p-4 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-slate-900">
                  {ord.id || ord.tracking_number}
                </span>
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase border border-slate-800">
                  {ord.status}
                </span>
              </div>
              <p className="text-slate-600">Placed on {formatDate(ord.created_at)}</p>
              <p className="font-mono font-bold text-slate-900 text-sm">
                {formatPrice(ord.total_amount)}
              </p>
            </div>

            <Link
              href="/order-tracking"
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold flex items-center space-x-1.5 hover:bg-black border border-slate-800 uppercase transition-colors"
            >
              <span>Track Order</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
