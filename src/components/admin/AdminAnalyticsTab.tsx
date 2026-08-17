"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";

interface AdminAnalyticsTabProps {
  productsCount: number;
  usersCount: number;
  ordersCount: number;
}

export function AdminAnalyticsTab({
  productsCount,
  usersCount,
  ordersCount,
}: AdminAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 border border-slate-200 bg-white space-y-2 hover:border-slate-900 transition-all">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
            Total Revenue
          </span>
          <p className="text-2xl font-black text-slate-900">{formatPrice(149500)}</p>
        </div>
        <div className="p-5 border border-slate-200 bg-white space-y-2 hover:border-slate-900 transition-all">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
            Products In Stock
          </span>
          <p className="text-2xl font-black text-slate-900">{productsCount}</p>
        </div>
        <div className="p-5 border border-slate-200 bg-white space-y-2 hover:border-slate-900 transition-all">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
            Active Users
          </span>
          <p className="text-2xl font-black text-slate-900">{usersCount}</p>
        </div>
        <div className="p-5 border border-slate-200 bg-white space-y-2 hover:border-slate-900 transition-all">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
            Total Orders
          </span>
          <p className="text-2xl font-black text-slate-900">{ordersCount}</p>
        </div>
      </div>
    </div>
  );
}
