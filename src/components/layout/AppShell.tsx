import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { QuickActionModal } from './QuickActionModal';
import { DashboardModule } from '../../modules/dashboard/DashboardModule';
import { ModuleId, UserRole, PendingApproval } from '../../types';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { api, SessionUser } from '../../lib/api';
import { AuthScreen } from '../auth/AuthScreen';
import { SettingsModule } from '../../modules/settings/SettingsModule';
import { EmployeesModule } from '../../modules/employees/EmployeesModule';
import { canAccessModule } from '../../lib/permissions';
import { OperationsModule } from '../../modules/operations/OperationsModule';
import { ProfileModule } from '../../modules/profile/ProfileModule';

export function AppShell() {
  const [currentModule, setCurrentModule] = useState<ModuleId>(() => {
    const saved = localStorage.getItem('peoplepay360_current_module');
    const validModules: ModuleId[] = ['dashboard', 'profile', 'employees', 'contracts', 'attendance', 'time-off', 'payroll', 'payslips', 'salary-structures', 'salary-rules', 'reports', 'settings'];
    return saved && validModules.includes(saved as ModuleId) ? saved as ModuleId : 'dashboard';
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('peoplepay360_user');
    return saved ? (JSON.parse(saved) as SessionUser).role : 'employee';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Live interactive approvals state
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [token, setToken] = useState(() => localStorage.getItem('peoplepay360_token'));
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => {
    const saved = localStorage.getItem('peoplepay360_user');
    return saved ? JSON.parse(saved) as SessionUser : null;
  });
  const [liveSummary, setLiveSummary] = useState<{ totalEmployees: number; pendingLeave: number; payrollRunCount: number; currentPayroll: any; recentActivity: any[]; personal?: { leaveRequests: number; publishedPayslips: number; attendanceStatus: string }; attendance: { totalEligible: number; presentTotal: number; inOffice: number; remote: number; onLeave: number } } | null>(null);

  const refreshDashboard = async (activeToken = token) => {
    if (!activeToken) return;
    const [summary, leaveRequests] = await Promise.all([api.dashboard(activeToken), api.leaveRequests(activeToken)]);
    setLiveSummary(summary.data);
    setApprovals(leaveRequests.data.map((leave) => ({
      id: leave._id,
      type: 'leave' as const,
      title: `${leave.leaveType} Leave Request`,
      requesterName: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`.trim() || 'Employee',
      requesterRole: leave.employee?.employeeCode || 'Employee',
      requesterDepartment: leave.employee?.department || '—',
      requestedDate: `${new Date(leave.startDate).toLocaleDateString()} – ${new Date(leave.endDate).toLocaleDateString()}`,
      amountOrDuration: `${leave.totalDays} day${leave.totalDays === 1 ? '' : 's'}`,
      details: leave.reason,
      status: 'pending' as const,
    })));
  };

  useEffect(() => {
    const loadDashboard = () => refreshDashboard().catch((error) => {
      if (error instanceof Error && /token is invalid|token.*expired|bearer token/i.test(error.message)) {
        handleLogout();
        return;
      }
      showToast(error instanceof Error ? error.message : 'Unable to load dashboard data.');
    });
    loadDashboard();
    const refreshTimer = window.setInterval(loadDashboard, 15000);
    return () => window.clearInterval(refreshTimer);
  }, [token]);

  useEffect(() => {
    localStorage.setItem('peoplepay360_current_module', currentModule);
  }, [currentModule]);

  const handleAuth = async ({ email, password }: { email: string; password: string }) => {
    const session = await api.login(email, password);
    localStorage.setItem('peoplepay360_token', session.token);
    localStorage.setItem('peoplepay360_user', JSON.stringify(session.user));
    setToken(session.token); setSessionUser(session.user); setUserRole(session.user.role);
    const savedModule = localStorage.getItem('peoplepay360_current_module') as ModuleId | null;
    setCurrentModule(savedModule && canAccessModule(session.user.role, savedModule) ? savedModule : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('peoplepay360_token');
    localStorage.removeItem('peoplepay360_user');
    setToken(null);
    setSessionUser(null);
    setLiveSummary(null);
    setApprovals([]);
  };

  const handleUserUpdated = (user: SessionUser) => {
    localStorage.setItem('peoplepay360_user', JSON.stringify(user));
    setSessionUser(user);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleApprove = async (id: string) => {
    const item = approvals.find((a) => a.id === id);
    try {
      if (token) await api.decideLeave(id, 'Approved', token);
      setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a)));
      await refreshDashboard();
      showToast(`Approved: ${item?.title || 'Request'} for ${item?.requesterName || 'Employee'}`);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to approve this request.'); }
  };

  const handleReject = async (id: string) => {
    const item = approvals.find((a) => a.id === id);
    try {
      if (token) await api.decideLeave(id, 'Rejected', token);
      setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'rejected' as const } : a)));
      await refreshDashboard();
      showToast(`Rejected: ${item?.title || 'Request'} for ${item?.requesterName || 'Employee'}`);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to reject this request.'); }
  };

  const handleAddApproval = (newApproval: PendingApproval) => {
    setApprovals((prev) => [newApproval, ...prev]);
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  if (!token || !sessionUser) return <AuthScreen onSubmit={handleAuth} />;

  const visibleModule = canAccessModule(userRole, currentModule) ? currentModule : 'dashboard';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={visibleModule}
        onSelectModule={setCurrentModule}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userRole={userRole}
        token={token}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          currentModule={currentModule}
          userRole={userRole}
          user={sessionUser}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          pendingApprovalsCount={pendingApprovalsCount}
          onOpenSettings={() => setCurrentModule('settings')}
          onOpenProfile={() => setCurrentModule('profile')}
          onLogout={handleLogout}
        />

        {/* Scrollable Module Workspace */}
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          {visibleModule === 'dashboard' ? (
          <DashboardModule
            userRole={userRole}
            user={sessionUser}
              approvals={approvals}
              onApprove={handleApprove}
              onReject={handleReject}
              onNavigate={setCurrentModule}
              onOpenQuickAction={() => setIsQuickActionOpen(true)}
              liveSummary={liveSummary}
            />
          ) : visibleModule === 'employees' ? (
            <EmployeesModule user={sessionUser} token={token} onActivity={refreshDashboard} onUserUpdated={handleUserUpdated} />
          ) : visibleModule === 'settings' ? (
            <SettingsModule user={sessionUser} token={token} onLogout={handleLogout} onUserUpdated={handleUserUpdated} />
          ) : visibleModule === 'profile' ? (
            <ProfileModule user={sessionUser} token={token} onUserUpdated={handleUserUpdated} />
          ) : <OperationsModule moduleId={visibleModule} user={sessionUser} token={token} onNavigate={setCurrentModule} />}
        </main>
      </div>

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSuccessToast={showToast}
        onAddApproval={handleAddApproval}
        token={token}
        onRefresh={refreshDashboard}
        userRole={userRole}
      />

      {/* Subtle Enterprise Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-dropdown text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150 max-w-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
