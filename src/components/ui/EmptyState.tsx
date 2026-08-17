import React from 'react';
import { PackageSearch, FolderX, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({
  title = 'No Data Available',
  description = 'No items found matching your request at this time.',
  actionText,
  actionHref,
  onAction,
  icon: Icon = PackageSearch,
}: EmptyStateProps) {
  return (
    <div className="w-full p-12 bg-white border border-slate-200 text-center flex flex-col items-center justify-center space-y-4 font-sans text-slate-900 my-4">
      <div className="w-14 h-14 bg-slate-100 text-slate-900 flex items-center justify-center border border-slate-300">
        <Icon className="w-7 h-7 text-slate-900" />
      </div>

      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-black uppercase text-slate-900 tracking-wider">
          {title}
        </h3>
        <p className="text-xs text-slate-600 font-medium">
          {description}
        </p>
      </div>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider border border-slate-800 inline-block cursor-pointer transition-colors"
        >
          {actionText}
        </Link>
      )}

      {actionText && !actionHref && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider border border-slate-800 inline-block cursor-pointer transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
