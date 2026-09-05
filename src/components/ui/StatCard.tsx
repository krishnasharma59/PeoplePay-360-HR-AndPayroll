import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../utils/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  badgeText?: string;
  badgeVariant?: 'brand' | 'success' | 'warning' | 'neutral';
  accentColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badgeText,
  badgeVariant = 'brand',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-5 hover:border-slate-300 transition-all duration-150', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
            {badgeText && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {badgeText}
              </span>
            )}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-brand-600 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5 font-medium">
              {trend.isPositive === true ? (
                <span className="inline-flex items-center text-emerald-600 gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {trend.value}
                </span>
              ) : trend.isPositive === false ? (
                <span className="inline-flex items-center text-rose-600 gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {trend.value}
                </span>
              ) : (
                <span className="inline-flex items-center text-slate-500 gap-0.5">
                  <Minus className="w-3.5 h-3.5" />
                  {trend.value}
                </span>
              )}
              {trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}
            </div>
          ) : null}
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}