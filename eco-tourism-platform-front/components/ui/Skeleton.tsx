"use client";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "h-4 bg-slate-100 rounded", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse ${className}`} />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 animate-pulse">
      <div className="h-4 bg-slate-100 rounded w-1/3" />
      <div className="h-8 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-slate-100 rounded flex-1 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}
