import React from 'react';
import { clsx } from 'clsx';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'brand' | 'white' | 'slate';
  className?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3 border',
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

const colorClasses = {
  brand: 'border-brand-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  slate: 'border-slate-400 border-t-transparent',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'brand',
  className,
}) => (
  <div
    role="status"
    aria-label="Loading"
    className={clsx(
      'animate-spin rounded-full',
      sizeClasses[size],
      colorClasses[color],
      className
    )}
  />
);

// Full page spinner
export const PageSpinner: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-brand-600 to-violet-600 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        Loading Dispatch...
      </p>
    </div>
  </div>
);
