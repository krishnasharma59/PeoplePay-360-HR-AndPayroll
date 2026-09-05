import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { QuickActionModal } from './QuickActionModal';
import { DashboardModule } from '../../modules/dashboard/DashboardModule';
import { ModulePlaceholder } from '../../modules/placeholders/ModulePlaceholder';
import { ModuleId, UserRole, PendingApproval } from '../../types';
import { INITIAL_APPROVALS } from '../../data/mockData';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export function AppShell() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Live interactive approvals state
  const [approvals, setApprovals] = useState<PendingApproval[]>(INITIAL_APPROVALS);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleApprove = (id: string) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a))
    );
    showToast(`Approved: ${item?.title || 'Request'} for ${item?.requesterName || 'Employee'}`);
  };

  const handleReject = (id: string) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' as const } : a))
    );
    showToast(`Rejected: ${item?.title || 'Request'} for ${item?.requesterName || 'Employee'}`);
  };

  const handleAddApproval = (newApproval: PendingApproval) => {
    setApprovals((prev) => [newApproval, ...prev]);
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userRole={userRole}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          currentModule={currentModule}
          userRole={userRole}
          onSelectRole={setUserRole}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        {/* Scrollable Module Workspace */}
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          {currentModule === 'dashboard' ? (
            <DashboardModule
              userRole={userRole}
              approvals={approvals}
              onApprove={handleApprove}
              onReject={handleReject}
              onNavigate={setCurrentModule}
              onOpenQuickAction={() => setIsQuickActionOpen(true)}
            />
          ) : (
            <ModulePlaceholder
              moduleId={currentModule}
              onBackToDashboard={() => setCurrentModule('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSuccessToast={showToast}
        onAddApproval={handleAddApproval}
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