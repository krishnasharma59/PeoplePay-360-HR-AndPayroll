import React from 'react';
import {
  Users,
  DollarSign,
  CalendarCheck,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PendingApprovalsCard } from './PendingApprovalsCard';
import { AttendanceSnapshotCard } from './AttendanceSnapshotCard';
import { RecentActivityCard } from './RecentActivityCard';
import {
  USER_ROLES,
} from '../../data/mockData';
import { formatCurrency } from '../../utils/utils';
import { PendingApproval, UserRole, ModuleId } from '../../types';
import { SessionUser } from '../../lib/api';

interface DashboardModuleProps {
  userRole: UserRole;
  user: SessionUser;
  approvals: PendingApproval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onNavigate: (module: ModuleId) => void;
  onOpenQuickAction: () => void;
  liveSummary: { totalEmployees: number; pendingLeave: number; payrollRunCount: number; currentPayroll: any; recentActivity: any[]; personal?: { leaveRequests: number; publishedPayslips: number; attendanceStatus: string }; attendance: { totalEligible: number; presentTotal: number; inOffice: number; remote: number; onLeave: number } } | null;
}

export function DashboardModule({
  userRole,
  user,
  approvals,
  onApprove,
  onReject,
  onNavigate,
  onOpenQuickAction,
  liveSummary,
}: DashboardModuleProps) {
  const currentUser = USER_ROLES.find((r) => r.id === userRole) || USER_ROLES[0];
  const firstName = user.name.trim().split(/\s+/)[0] || 'there';
  // Only HR roles may review leave. Employee dashboards must never expose the
  // approval queue (including requests submitted by the logged-in employee).
  const canReviewApprovals = ['admin', 'hr_manager', 'hr_payroll_manager', 'hr_payroll_user'].includes(user.role);
  const isEmployee = user.role === 'employee';
  const pendingCount = canReviewApprovals ? approvals.filter((a) => a.status === 'pending').length : 0;
  const payroll = liveSummary?.currentPayroll;
  return (
    <div className="space-y-6 pb-12">
      {/* Context Welcome Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900">
              Welcome back, {firstName}
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              <Sparkles className="w-3 h-3 text-brand-600" />
              {currentUser.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Acme Global Technologies Inc. — {payroll ? <>pay cycle <strong>{payroll.periodName}</strong> is active.</> : 'No payroll cycle has been created yet.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {payroll && <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('payroll')}
            className="text-xs"
          >
            <FileCheck className="w-4 h-4 text-brand-600" />
            <span>Review Payroll Run</span>
          </Button>}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenQuickAction}
            className="text-xs"
          >
            <span>+ Quick Action</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isEmployee ? <>
          <button type="button" onClick={() => onNavigate('profile')} className="text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"><StatCard title="My Profile" value={firstName} badgeText="Employee" icon={Users} trend={{ value: 'View', isPositive: true, label: 'personal details' }} subtitle="Open my profile" /></button>
          <button type="button" onClick={() => onNavigate('time-off')} className="text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"><StatCard title="My Leave Requests" value={liveSummary?.personal?.leaveRequests ?? 0} badgeText={`${liveSummary?.pendingLeave ?? 0} Pending`} badgeVariant="warning" icon={CalendarCheck} trend={{ value: liveSummary?.pendingLeave ? 'Needs review' : 'Up to date', isPositive: !liveSummary?.pendingLeave, label: 'leave requests' }} subtitle="View leave status" /></button>
          <button type="button" onClick={() => onNavigate('payslips')} className="text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"><StatCard title="My Payslips" value={liveSummary?.personal?.publishedPayslips ?? 0} badgeText="Available" icon={DollarSign} trend={{ value: 'Open', isPositive: true, label: 'approved statements' }} subtitle="View payslips" /></button>
          <button type="button" onClick={() => onNavigate('attendance')} className="text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"><StatCard title="My Attendance Today" value={liveSummary?.personal?.attendanceStatus ?? 'Not recorded'} badgeText={liveSummary?.attendance.presentTotal ? 'Recorded' : 'Action needed'} badgeVariant={liveSummary?.attendance.presentTotal ? 'success' : 'warning'} icon={Clock} trend={{ value: liveSummary?.attendance.presentTotal ? 'Recorded' : 'Not recorded', isPositive: Boolean(liveSummary?.attendance.presentTotal), label: 'today' }} subtitle="Open attendance" /></button>
        </> : <>
          <button type="button" onClick={() => onNavigate('employees')} className="text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"><StatCard title="Total Headcount" value={liveSummary?.totalEmployees ?? 0} badgeText="Active Staff" icon={Users} trend={{ value: 'Live', isPositive: true, label: 'active employees' }} subtitle="Open employee directory" /></button>
          <button type="button" onClick={() => onNavigate('payroll')} className="text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"><StatCard title="Monthly Payroll Outflow" value={formatCurrency(payroll?.totals?.gross ?? 0)} badgeText="Gross" icon={DollarSign} trend={{ value: payroll ? 'Live total' : 'No data', isPositive: payroll ? true : undefined, label: payroll ? 'current payroll cycle' : 'create a payroll run' }} subtitle={`Net Payout: ${formatCurrency(payroll?.totals?.net ?? 0)}`} /></button>
          <button type="button" onClick={() => onNavigate('payroll')} className="text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"><StatCard title="Payroll Cycle Status" value={payroll?.status || 'Not started'} badgeText={`Cycle ${String(liveSummary?.payrollRunCount ?? 0).padStart(2, '0')}`} badgeVariant="warning" icon={CalendarCheck} trend={{ value: payroll ? 'In progress' : 'No cycle', isPositive: undefined, label: payroll ? payroll.periodName : 'create a payroll run' }} subtitle={`${liveSummary?.pendingLeave ?? 0} pending requests`} /></button>
          <button type="button" onClick={() => onNavigate('attendance')} className="text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30"><StatCard title="Attendance Today" value={`${liveSummary?.attendance.presentTotal ?? 0} Present`} badgeText={liveSummary?.attendance.totalEligible ? `${((liveSummary.attendance.presentTotal / liveSummary.attendance.totalEligible) * 100).toFixed(1)}%` : '0%'} badgeVariant="success" icon={Clock} trend={{ value: `${liveSummary?.attendance.onLeave ?? 0} on leave`, isPositive: undefined, label: 'today' }} subtitle="Open attendance tracking" /></button>
        </>}
      </div>

      {/* Leave approvals are an HR-only workflow. */}
      {canReviewApprovals && <div className="grid grid-cols-1 gap-6">
        <PendingApprovalsCard
          approvals={approvals}
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AttendanceSnapshotCard metrics={liveSummary?.attendance} onNavigate={onNavigate} />
        <RecentActivityCard activities={liveSummary?.recentActivity || []} />
      </div>
    </div>
  );
}
