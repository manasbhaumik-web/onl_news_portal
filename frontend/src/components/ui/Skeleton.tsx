import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, width, height }) => (
  <div
    className={clsx('skeleton rounded', className)}
    style={{ width, height }}
    role="status"
    aria-label="Loading..."
  />
);

// Article Card Skeleton
export const ArticleCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
    <Skeleton className="w-full h-48" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  </div>
);

// Hero Skeleton
export const HeroSkeleton: React.FC = () => (
  <div className="relative w-full h-[480px] md:h-[580px] bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden">
    <Skeleton className="absolute inset-0" />
    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-5 w-full max-w-lg" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  </div>
);

// Sidebar Skeleton
export const SidebarSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 space-y-4">
      <Skeleton className="h-6 w-32" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 space-y-3">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  </div>
);

// Trending Widget Skeleton
export const TrendingWidgetSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

// Comment Skeleton
export const CommentSkeleton: React.FC = () => (
  <div className="flex items-start gap-3">
    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  </div>
);
export default Skeleton;
