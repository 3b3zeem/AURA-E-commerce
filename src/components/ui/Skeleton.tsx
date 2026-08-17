import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-slate-200 border border-slate-300 animate-pulse ${className}`}
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white border border-slate-200 p-4 space-y-4 font-sans">
      <Skeleton className="w-full aspect-square bg-slate-100" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
