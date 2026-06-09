import React from 'react';
import { clsx } from 'clsx';
import { Zap } from 'lucide-react';

type BadgeVariant = 'category' | 'breaking' | 'trending' | 'status' | 'default' | 'format';

interface BadgeProps {
  variant?: BadgeVariant;
  color?: string; // For category badges — hex color
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  color,
  children,
  className,
  pulse = false,
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1';

  if (variant === 'breaking') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 font-bold uppercase tracking-widest rounded-full',
          'bg-red-600 text-white shadow-glow-breaking',
          sizeClass,
          pulse && 'animate-breaking-pulse',
          className
        )}
      >
        <Zap size={10} className="fill-current" />
        {children}
      </span>
    );
  }

  if (variant === 'trending') {
    return (
      <span
        className={clsx(
          'inline-flex items-center font-bold uppercase tracking-wide rounded-full',
          'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
          sizeClass,
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === 'category' && color) {
    // Use the category's stored color as background with white text
    return (
      <span
        className={clsx(
          'inline-flex items-center font-semibold uppercase tracking-wide rounded-full text-white',
          sizeClass,
          className
        )}
        style={{ backgroundColor: color }}
      >
        {children}
      </span>
    );
  }

  if (variant === 'status') {
    return (
      <span
        className={clsx(
          'inline-flex items-center font-medium rounded-full',
          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
          sizeClass,
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === 'format') {
    return (
      <span
        className={clsx(
          'inline-flex items-center font-semibold rounded-lg',
          'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400',
          sizeClass,
          className
        )}
      >
        {children}
      </span>
    );
  }

  // Default
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        sizeClass,
        className
      )}
    >
      {children}
    </span>
  );
};
