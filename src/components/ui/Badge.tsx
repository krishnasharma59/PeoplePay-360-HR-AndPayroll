import React from 'react';
import { cn } from '../../utils/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({ className, variant = 'neutral', size = 'md', dot = false, children, ...props }: BadgeProps) {
  const variants = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200/70',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/70',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/70',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/70',
  };

  const dotColors = {
    brand: 'bg-brand-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-rose-600',
    neutral: 'bg-slate-500',
    purple: 'bg-purple-600',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full leading-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}