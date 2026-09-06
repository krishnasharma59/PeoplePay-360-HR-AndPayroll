import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  LogOut,
  Settings,
  UserRound,
} from 'lucide-react';
import { ModuleId, UserRole } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { SessionUser } from '../../lib/api';

interface TopNavbarProps {
  currentModule: ModuleId;
  userRole: UserRole;
  user: SessionUser;
  onOpenQuickAction: () => void;
  pendingApprovalsCount: number;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

const MODULE_TITLES: Record<ModuleId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Executive Overview', subtitle: 'Real-time HR & Payroll Operations' },
  profile: { title: 'My Profile', subtitle: 'Your account and employment details' },
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
  user,
  onOpenQuickAction,
  pendingApprovalsCount,
  onOpenSettings,
  onOpenProfile,
  onLogout,
}: TopNavbarProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
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

      {/* Right Actions: Quick Action, Notifications, Profile */}
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
                      Review open items before the current payroll cutoff.
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
        <div className="relative pl-2 border-l border-slate-200" ref={profileRef}>
          <button onClick={() => setIsProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-slate-50" aria-expanded={isProfileOpen} aria-haspopup="menu">
          <Avatar
            name={user.name}
            src={user.avatarUrl}
            size="md"
            statusIndicator="online"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
          </div>
          </button>
          {isProfileOpen && <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-dropdown z-50" role="menu"><div className="px-3 py-2 border-b border-slate-100"><p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p><p className="text-[11px] text-slate-500 truncate">{user.email}</p></div><button onClick={() => { onOpenProfile(); setIsProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"><UserRound className="w-4 h-4" />My profile</button><button onClick={() => { onOpenSettings(); setIsProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"><Settings className="w-4 h-4" />Settings</button><div className="my-1 border-t border-slate-100" /><button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-rose-700 hover:bg-rose-50"><LogOut className="w-4 h-4" />Log out</button></div>}
        </div>
      </div>
    </header>
  );
}
