import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Building,
  Check,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ModuleId, UserRole } from '../../types';
import { USER_ROLES } from '../../data/mockData';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface TopNavbarProps {
  currentModule: ModuleId;
  userRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenQuickAction: () => void;
  pendingApprovalsCount: number;
}

const MODULE_TITLES: Record<ModuleId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Executive Overview', subtitle: 'Real-time HR & Payroll Operations' },
  employees: { title: 'Employee Directory', subtitle: 'Personnel management & records' },
  contracts: { title: 'Employment Contracts', subtitle: 'Agreements, compensation & digital signatures' },
  attendance: { title: 'Attendance Tracking', subtitle: 'Work logs, clock-in records & shifts' },
  'time-off': { title: 'Time Off & Leave Management', subtitle: 'Leave balances, requests & holiday calendar' },
  payroll: { title: 'Payroll Processing', subtitle: 'Gross-to-net calculation, cycles & payouts' },
  payslips: { title: 'Payslip Archive', subtitle: 'Digital disbursement & salary breakdown' },
  'salary-structures': { title: 'Salary Structures', subtitle: 'Grade ladders, allowances & components' },
  'salary-rules': { title: 'Salary & Tax Rules', subtitle: 'Statutory withholdings, deductions & formulas' },
  reports: { title: 'Reports & Analytics', subtitle: 'Payroll summaries, tax filings & workforce costs' },
  settings: { title: 'System Settings', subtitle: 'Organization profile, workflows & policies' },
};

export function TopNavbar({
  currentModule,
  userRole,
  onSelectRole,
  onOpenQuickAction,
  pendingApprovalsCount,
}: TopNavbarProps) {
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentUser = USER_ROLES.find((r) => r.id === userRole) || USER_ROLES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setIsRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Breadcrumbs & Current Page Info */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Acme Global Tech</span>
            <span>/</span>
            <span className="text-slate-600 capitalize">{currentModule.replace('-', ' ')}</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            {MODULE_TITLES[currentModule]?.title || 'PeoplePay360'}
          </h2>
        </div>
      </div>

      {/* Middle: Global Quick Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employees, payroll runs, payslips... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-white text-slate-400 border border-slate-200 rounded px-1 py-0.5 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions: Role Switcher, Quick Action, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenQuickAction}
          className="hidden sm:flex shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Action</span>
        </Button>

        {/* Role Switcher (Previewing Multi-role view) */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            title="Switch User Role to test permissions & views"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline text-slate-500 font-normal">Role:</span>
            <span className="font-semibold text-slate-900">{currentUser.badge}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-dropdown border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select User Perspective
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Simulate enterprise role permissions & viewports
                </p>
              </div>
              <div className="py-1">
                {USER_ROLES.map((role) => {
                  const isSelected = role.id === userRole;
                  return (
                    <button
                      key={role.id}
                      onClick={() => {
                        onSelectRole(role.id);
                        setIsRoleMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <Avatar name={role.name} src={role.avatar} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900">{role.name}</p>
                          {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                        </div>
                        <p className="text-[11px] font-medium text-brand-600">{role.badge}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{role.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">
                  {pendingApprovalsCount} new
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-slate-50 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      Payroll Cutoff in 4 days
                    </p>
                    <p className="text-[11px] text-slate-500">
                      September 2026 Regular Cycle cutoff is Sep 09.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                  </div>
                </div>

                <div className="px-4 py-3 hover:bg-slate-50 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-brand-50 text-brand-700 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      3 Pending Leave Requests
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sophia Rodriguez and 2 others requested leave.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                  </div>
                </div>

                <div className="px-4 py-3 hover:bg-slate-50 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      Tax Rule California SDI Synchronized
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Automated rate updates completed for FY2026.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <Avatar
            name={currentUser.name}
            src={currentUser.avatar}
            size="md"
            statusIndicator="online"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400">{currentUser.badge}</p>
          </div>
        </div>
      </div>
    </header>
  );
}