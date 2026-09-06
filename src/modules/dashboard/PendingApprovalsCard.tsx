import React, { useState } from 'react';
import { Check, X, CheckCheck, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { PendingApproval } from '../../types';

interface PendingApprovalsCardProps {
  approvals: PendingApproval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingApprovalsCard({ approvals, onApprove, onReject }: PendingApprovalsCardProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const pendingItems = approvals.filter((a) => a.status === 'pending');
  const filteredItems = filterType === 'all'
    ? pendingItems
    : pendingItems.filter((a) => a.type === filterType);

  const typeBadges = {
    leave: { label: 'Time Off', variant: 'brand' as const },
    overtime: { label: 'Overtime', variant: 'warning' as const },
    bonus: { label: 'Commission', variant: 'purple' as const },
    off_cycle: { label: 'Off-Cycle', variant: 'danger' as const },
  };

  const tabs = [
    { id: 'all', label: 'All', count: pendingItems.length },
    { id: 'leave', label: 'Time Off', count: pendingItems.filter((a) => a.type === 'leave').length },
    { id: 'overtime', label: 'Overtime', count: pendingItems.filter((a) => a.type === 'overtime').length },
    { id: 'bonus', label: 'Commission', count: pendingItems.filter((a) => a.type === 'bonus').length },
    { id: 'off_cycle', label: 'Off-Cycle', count: pendingItems.filter((a) => a.type === 'off_cycle').length },
  ];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Actionable Approvals Queue</CardTitle>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {pendingItems.length} Pending
            </span>
          </div>
          <CardDescription>
            Requests requiring manager sign-off before payroll processing
          </CardDescription>
        </div>
        <Tabs
          tabs={tabs}
          activeTab={filterType}
          onChange={setFilterType}
          className="self-start sm:self-auto overflow-x-auto max-w-full"
        />
      </CardHeader>
      <CardContent className="p-0">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No items in this filter</p>
            <p className="text-xs text-slate-400 mt-0.5">All pending items for this category have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar name={item.requesterName} src={item.requesterAvatar} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900">{item.requesterName}</span>
                      <span className="text-[11px] text-slate-400">• {item.requesterDepartment}</span>
                      <Badge variant={typeBadges[item.type].variant} size="sm">
                        {typeBadges[item.type].label}
                      </Badge>
                    </div>

                    <p className="text-xs font-medium text-slate-700 mt-0.5">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.details}</p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">{item.amountOrDuration}</span>
                      <span>•</span>
                      <span>Target: {item.requestedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(item.id)}
                    className="text-slate-600 hover:text-rose-600 hover:border-rose-200"
                    title="Reject request"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApprove(item.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                    title="Approve request"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
