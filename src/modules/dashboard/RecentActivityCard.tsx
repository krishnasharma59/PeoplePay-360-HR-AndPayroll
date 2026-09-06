import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';

import { cn } from '../../utils/utils';

const roleLabel = (role?: string) => ({
  admin: 'Administrator',
  hr_manager: 'HR Manager',
  hr_payroll_manager: 'HR Payroll Manager',
  hr_payroll_user: 'HR Payroll User',
  employee: 'Employee',
}[role || ''] || role || 'System');

const activityTarget = (activity: any) => {
  if (activity.resource === 'AttendanceRecord') {
    const date = activity.details?.date ? new Date(activity.details.date).toLocaleDateString() : 'today';
    return `${activity.details?.employeeName || 'Employee'} · ${activity.details?.status || 'attendance'} on ${date}${activity.details?.overtimeHours ? ` (${activity.details.overtimeHours} overtime hrs)` : ''}`;
  }
  return `${activity.details?.name || activity.targetName || activity.details?.email || activity.resource}${activity.details?.role ? ` → ${roleLabel(activity.details.role)}` : ''}`;
};

export function RecentActivityCard({ className, activities = [] }: { className?: string; activities?: any[] }) {
  return (
    <Card className={cn('col-span-1', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-600" />
          <CardTitle>System & Operations Audit Log</CardTitle>
        </div>
        <CardDescription>Recent governance actions and payroll transactions</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {activities.length === 0 ? <div className="p-8 text-center text-xs text-slate-400">No live audit activity yet.</div> : activities.map((act) => (
            <div key={act.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
              <Avatar name={act.actor?.name || 'System'} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-800">
                    <span className="font-semibold text-slate-900">{act.actor?.name || 'System'}</span>{' '}
                    <span className="text-slate-500">({roleLabel(act.actor?.role)})</span>
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">{new Date(act.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-700 mt-0.5">
                  {act.action}: <span className="font-medium text-slate-900">{activityTarget(act)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
