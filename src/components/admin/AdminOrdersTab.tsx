"use client";

import React from "react";
import { ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface AdminOrdersTabProps {
  ordersList: any[];
  actionLoadingId: string | null;
  onOrderStatusChange: (id: string, status: string) => void;
  onDeleteOrder: (id: string) => void;
}

export function AdminOrdersTab({
  ordersList,
  actionLoadingId,
  onOrderStatusChange,
  onDeleteOrder,
}: AdminOrdersTabProps) {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-black uppercase text-slate-900">
          Orders & Tracking
        </h2>
        <p className="text-xs text-slate-600">
          Fulfillment management cards live from Supabase.
        </p>
      </div>

      {ordersList.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-300 bg-white text-center space-y-2">
          <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase">
            No orders registered yet in database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ordersList.map((ord) => (
            <div
              key={ord.id}
              className="p-4 border border-slate-200 bg-white space-y-4 flex flex-col justify-between hover:border-slate-900 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono font-black text-xs text-slate-900">
                    #{ord.id?.slice(0, 8)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(ord.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase">Total</span>
                  <span className="font-mono font-black text-base text-slate-900">
                    {formatPrice(ord.total_amount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase">Status</span>
                  <span
                    className={`px-2 py-0.5 font-bold text-[10px] uppercase border ${
                      ord.status === "delivered"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : ord.status === "shipped"
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : "bg-amber-50 text-amber-700 border-amber-300"
                    }`}
                  >
                    {ord.status || "pending"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <CustomSelect
                  value={ord.status || "pending"}
                  onChange={(val) => onOrderStatusChange(ord.id, val)}
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "processing", label: "Processing" },
                    { value: "shipped", label: "Shipped" },
                    { value: "delivered", label: "Delivered" },
                  ]}
                  className="flex-1"
                  triggerClassName="w-full justify-between"
                />
                <button
                  disabled={actionLoadingId === ord.id}
                  onClick={() => onDeleteOrder(ord.id)}
                  className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete Order"
                >
                  {actionLoadingId === ord.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
