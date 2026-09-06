import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { UPCOMING_MILESTONES, CURRENT_PAYROLL_RUN } from '../../data/mockData';

export function PayrollTimelineCard() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <div>
          <CardTitle>Payroll Cycle Milestones</CardTitle>
          <CardDescription>{CURRENT_PAYROLL_RUN.cycleNumber} Timeline</CardDescription>
        </div>
        <Badge variant="brand" size="sm">
          {CURRENT_PAYROLL_RUN.status}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Reconciliation Status Bar */}
        <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
            <span>Cycle Reconciliation Progress</span>
            <span className="text-brand-600">{CURRENT_PAYROLL_RUN.reconciledPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all"
              style={{ width: `${CURRENT_PAYROLL_RUN.reconciledPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>{CURRENT_PAYROLL_RUN.employeeCount} Enrolled Staff</span>
            <span className="text-amber-600 font-medium">
              {CURRENT_PAYROLL_RUN.pendingAdjustmentsCount} pending adjustments
            </span>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {UPCOMING_MILESTONES.map((milestone, idx) => {
            const isFirst = idx === 0;
            return (
              <div key={milestone.id} className="relative">
                <div
                  className={`absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                    milestone.isUrgent
                      ? 'bg-amber-500'
                      : milestone.isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-slate-300'
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">{milestone.title}</span>
                    {milestone.isUrgent && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded">
                        4 days left
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{milestone.description}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{milestone.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}