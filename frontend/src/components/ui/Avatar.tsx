import React from 'react';
import * as RadixAvatar from '@radix-ui/react-avatar';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function getColorFromString(str: string): string {
  const colors = [
    'bg-rose-500',
    'bg-pink-500',
    'bg-fuchsia-500',
    'bg-purple-500',
    'bg-violet-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-green-500',
    'bg-lime-500',
    'bg-amber-500',
    'bg-orange-500',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  ring = false,
}) => {
  const initials = getInitials(fallback || alt);
  const bgColor = getColorFromString(fallback || alt || 'user');

  return (
    <RadixAvatar.Root
      className={clsx(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizeClasses[size],
        ring && 'ring-2 ring-white dark:ring-slate-800 ring-offset-1',
        className
      )}
    >
      <RadixAvatar.Image
        src={src ?? undefined}
        alt={alt ?? ''}
        className="h-full w-full object-cover"
      />
      <RadixAvatar.Fallback
        className={clsx(
          'flex h-full w-full items-center justify-center font-semibold text-white',
          bgColor
        )}
        delayMs={300}
      >
        {initials}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
};
