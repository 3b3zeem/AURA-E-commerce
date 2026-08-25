"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, AlertCircle, ThumbsUp, RefreshCw } from "lucide-react";
import { fetchAIReviewSummary, AIReviewSummaryResult } from "@/lib/services/productsService";

interface AIReviewSummaryCardProps {
  productId: string;
}

export function AIReviewSummaryCard({ productId }: AIReviewSummaryCardProps) {
  const [summary, setSummary] = useState<AIReviewSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSummary() {
      setLoading(true);
      const res = await fetchAIReviewSummary(productId);
      if (isMounted) {
        setSummary(res);
        setLoading(false);
      }
    }
    if (productId) {
      loadSummary();
    }
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="p-6 bg-white text-slate-900 border border-slate-200 space-y-4 my-6 animate-pulse font-sans shadow-xs">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
          <span className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider">
            AURA AI Generating Review Sentiment Analysis...
          </span>
        </div>
      </div>
    );
  }

  if (!summary || summary.hasReviews === false || summary.totalReviews === 0) return null;

  return (
    <div className="p-6 bg-white text-slate-900 border border-slate-200 space-y-5 my-6 font-sans relative overflow-hidden shadow-xs">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-slate-100 text-amber-400 rounded-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              AI Customer Sentiment Summary
              {summary.isAIPreview && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[9px] uppercase border border-slate-200">
                  AI Hardware Analysis
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500 font-mono">
              Automated synthesis based on verified customer feedback & hardware specs
            </p>
          </div>
        </div>

        {/* Rating Score Badge */}
        <div className="flex items-center space-x-3 self-start sm:self-auto bg-slate-50 border border-slate-200 px-3.5 py-1.5 font-mono">
          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">
            {summary.recommendationRate}% Recommend
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-black text-amber-600">
            {summary.sentimentScore} / 5.0 ⭐
          </span>
        </div>
      </div>

      {/* AI Verdict Overview */}
      <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 border border-slate-200">
        {summary.aiVerdict}
      </p>

      {/* Pros & Cons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Key Pros */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Top Key Highlights (Pros)
          </span>
          <ul className="space-y-1.5">
            {summary.pros.map((pro, i) => (
              <li
                key={i}
                className="text-xs text-slate-800 flex items-start space-x-2 bg-emerald-50/70 border border-emerald-200 p-2.5"
              >
                <span className="text-emerald-700 font-bold font-mono">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Cons */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Things to Keep in Mind (Cons)
          </span>
          <ul className="space-y-1.5">
            {summary.cons.map((con, i) => (
              <li
                key={i}
                className="text-xs text-slate-800 flex items-start space-x-2 bg-amber-50/70 border border-amber-200 p-2.5"
              >
                <span className="text-amber-700 font-bold font-mono">!</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
