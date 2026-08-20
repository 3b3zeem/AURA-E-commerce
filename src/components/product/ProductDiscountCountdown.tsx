"use client";

import React, { useState, useEffect } from "react";
import { Clock, Zap } from "lucide-react";

interface ProductDiscountCountdownProps {
  targetDate?: string | null;
  discountPercent?: number | null;
  compact?: boolean;
}

export function ProductDiscountCountdown({
  targetDate,
  discountPercent,
  compact = false,
}: ProductDiscountCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    // If no targetDate provided, default to midnight tonight (end of day deal)
    let endMs: number;
    if (targetDate) {
      endMs = new Date(targetDate).getTime();
    } else {
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      endMs = midnight.getTime();
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const diff = endMs - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) return null;

  if (compact) {
    return (
      <div className="flex items-center space-x-1.5 bg-white text-slate-900 border border-slate-300 px-2 py-1 text-[10px] font-mono font-bold tracking-wider shadow-sm">
        <Clock className="w-3 h-3 text-slate-900 animate-pulse shrink-0" />
        <span className="text-slate-500 uppercase text-[9px] font-sans font-bold">
          Ends in:
        </span>
        <div className="flex items-center space-x-0.5 font-bold text-slate-900">
          {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
          <span>{String(timeLeft.hours).padStart(2, "0")}h:</span>
          <span>{String(timeLeft.minutes).padStart(2, "0")}m:</span>
          <span className="text-slate-900 font-black">
            {String(timeLeft.seconds).padStart(2, "0")}s
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-slate-900 p-3.5 border border-slate-200 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#f8fafc] text-slate-900 flex items-center justify-center font-black border border-slate-800">
            <Zap className="w-4 h-4 text-slate-900 fill-current animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
              Limited Time Offer
            </span>
            <span className="text-xs font-black tracking-tight text-slate-900 uppercase">
              {discountPercent
                ? `Save ${discountPercent}% OFF!`
                : "Discount Offer Expiring Soon"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-bold uppercase">
          <Clock className="w-3.5 h-3.5 text-slate-900" />
          <span className="text-[10px] text-slate-700">Offer Ends In:</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 pt-0.5 text-center font-mono font-black">
        {timeLeft.days > 0 ? (
          <div className="bg-[#f8fafc] text-slate-900 border border-slate-800 py-1.5 px-1">
            <div className="text-base text-slate-900">
              {String(timeLeft.days).padStart(2, "0")}
            </div>
            <div className="text-[9px] font-sans text-slate-400 font-bold uppercase">
              Days
            </div>
          </div>
        ) : null}
        <div className="bg-[#f8fafc] text-slate-900 border border-slate-800 py-1.5 px-1">
          <div className="text-base text-slate-900">
            {String(timeLeft.hours).padStart(2, "0")}
          </div>
          <div className="text-[9px] font-sans text-slate-400 font-bold uppercase">
            Hours
          </div>
        </div>
        <div className="bg-[#f8fafc] text-slate-900 border border-slate-800 py-1.5 px-1">
          <div className="text-base text-slate-900">
            {String(timeLeft.minutes).padStart(2, "0")}
          </div>
          <div className="text-[9px] font-sans text-slate-400 font-bold uppercase">
            Mins
          </div>
        </div>
        <div className="bg-[#f8fafc] text-slate-900 border border-slate-800 py-1.5 px-1">
          <div className="text-base text-slate-900">
            {String(timeLeft.seconds).padStart(2, "0")}
          </div>
          <div className="text-[9px] font-sans text-slate-400 font-bold uppercase">
            Secs
          </div>
        </div>
      </div>
    </div>
  );
}
