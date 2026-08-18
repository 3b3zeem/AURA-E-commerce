"use client";

import React, { useState, useEffect } from "react";
import { Mail, Trash2, Download, Search, CheckCircle2, UserCheck, RefreshCw } from "lucide-react";
import { NewsletterSubscriber } from "@/types";
import { getNewsletterSubscribers, deleteNewsletterSubscriber } from "@/lib/services/db";
import toast from "react-hot-toast";

interface AdminNewsletterTabProps {
  onNotify: (msg: string) => void;
  onRefresh?: () => void;
}

export function AdminNewsletterTab({ onNotify, onRefresh }: AdminNewsletterTabProps) {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadSubscribers = async () => {
    setLoading(true);
    const data = await getNewsletterSubscribers();
    setSubscribers(data);
    setLoading(false);
    if (onRefresh) onRefresh();
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleDelete = async (id: string, email: string) => {
    try {
      setActionLoadingId(id);
      const success = await deleteNewsletterSubscriber(id);
      if (success) {
        onNotify(`Subscriber ${email} removed.`);
        await loadSubscribers();
      } else {
        toast.error("Failed to delete subscriber");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," + ["Email,Status,Subscribed At", ...subscribers.map((s) => `${s.email},${s.status},${s.created_at}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aura_newsletter_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify("Subscribers list exported as CSV!");
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-base font-black text-slate-900 uppercase font-mono tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-slate-900" />
            Newsletter Subscribers ({subscribers.length})
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage subscriber email list captured from the footer form and offers landing page.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadSubscribers}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase transition-colors border border-slate-300 cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase transition-colors flex items-center space-x-2 border border-slate-800 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-slate-200 shadow-sm flex items-center space-x-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter subscribers by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-900 font-mono font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="p-4">Subscriber Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Subscribed Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 font-mono">
                  Loading subscribers...
                </td>
              </tr>
            ) : filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 font-mono">
                  No subscribers match your search.
                </td>
              </tr>
            ) : (
              filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 font-mono">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>{sub.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase">
                      {sub.status || "active"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-[11px]">
                    {new Date(sub.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(sub.id, sub.email)}
                      disabled={actionLoadingId === sub.id}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Remove Subscriber"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
