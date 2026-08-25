"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function OfferCountdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const target = new Date(endsAt).getTime();

    const calculate = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!timeLeft) {
    return (
      <div className="inline-flex items-center space-x-1 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 text-[11px] font-mono font-bold uppercase">
        <Clock className="w-3.5 h-3.5 text-rose-600" />
        <span>Offer Expired</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1 text-xs font-mono font-bold">
      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
      <span className="text-[10px] uppercase font-sans text-amber-800 font-extrabold mr-1">
        Ends in:
      </span>
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
