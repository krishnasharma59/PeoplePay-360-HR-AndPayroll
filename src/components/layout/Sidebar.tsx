import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  Calendar,
  CircleDollarSign,
  Receipt,
  Layers,
  Sliders,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { ModuleId, UserRole } from '../../types';
import { cn } from '../../utils/utils';
import { api } from '../../lib/api';
import { canAccessModule } from '../../lib/permissions';

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'brand' | 'warning' | 'neutral';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
  token: string;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'CORE HR',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'employees', label: 'Employees', icon: Users, badge: 248 },
      { id: 'contracts', label: 'Contracts', icon: FileText },
      { id: 'attendance', label: 'Attendance', icon: Clock },
      { id: 'time-off', label: 'Time Off', icon: Calendar, badge: 3, badgeVariant: 'warning' },
    ],
  },
  {
    title: 'PAYROLL & COMPENSATION',
    items: [
      { id: 'payroll', label: 'Payroll Runs', icon: CircleDollarSign, badgeVariant: 'brand' },
      { id: 'payslips', label: 'Payslips', icon: Receipt },
      { id: 'salary-structures', label: 'Salary Structures', icon: Layers },
      { id: 'salary-rules', label: 'Salary Rules', icon: Sliders },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      { id: 'settings', label: 'Settings & Policy', icon: Settings },
    ],
  },
];

export function Sidebar({
  currentModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  userRole,
  token,
}: SidebarProps) {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [payrollCount, setPayrollCount] = useState<number | null>(null);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const result = await api.employees(token);
        setEmployeeCount(result.data.length);
      } catch { setEmployeeCount(0); }
      try { setPayrollCount((await api.payrollRuns(token)).data.length); }
      catch { setPayrollCount(null); }
    };
    loadCounts();
    const refreshTimer = window.setInterval(loadCounts, 5000);
    window.addEventListener('peoplepay360-payroll-changed', loadCounts);
    return () => { window.clearInterval(refreshTimer); window.removeEventListener('peoplepay360-payroll-changed', loadCounts); };
  }, [token, userRole]);

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => canAccessModule(userRole, item.id))
      .map((item) => item.id === 'employees' ? { ...item, badge: employeeCount } : item.id === 'payroll' ? { ...item, badge: payrollCount === null ? undefined : `Cycle ${String(payrollCount).padStart(2, '0')}` } : item),
  })).filter((section) => section.items.length > 0);
  return (
    <aside
      className={cn(
        'relative flex flex-col bg-white border-r border-slate-200/90 select-none transition-all duration-300 ease-in-out z-30',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm font-bold text-base">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
                  People<span className="text-brand-600">Pay</span>360
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Enterprise HR & Payroll
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm font-bold text-base">
            P
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors',
            isCollapsed && 'absolute -right-3 top-5 bg-white border border-slate-200 shadow-sm rounded-full'
          )}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed ? (
              <h4 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h4>
            ) : (
              <div className="h-px bg-slate-100 my-3 mx-2" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-brand-600 rounded-r" />
                    )}
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge !== undefined && (
                      <span
                        className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0',
                          item.badgeVariant === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : item.badgeVariant === 'brand'
                            ? 'bg-brand-100 text-brand-800'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Compliance & Security Badge in Sidebar Footer */}
      {!isCollapsed ? (
        <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SOC 2 Type II Certified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Statutory tax compliance & encrypted payroll locks active.
          </p>
        </div>
      ) : (
        <div className="p-3 text-center border-t border-slate-100 text-emerald-600" title="SOC 2 Type II Certified">
          <ShieldCheck className="w-5 h-5 mx-auto" />
        </div>
      )}
    </aside>
  );
}
