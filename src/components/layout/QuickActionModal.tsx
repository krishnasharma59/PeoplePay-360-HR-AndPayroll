import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  DollarSign,
  UserPlus,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

import { PendingApproval } from '../../types';
import { api } from '../../lib/api';
import { UserRole } from '../../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (message: string) => void;
  onAddApproval?: (approval: PendingApproval) => void;
  token: string;
  onRefresh: () => Promise<void>;
  userRole: UserRole;
}

type ActionType = 'off_cycle' | 'new_employee' | 'leave_request';

export function QuickActionModal({
  isOpen,
  onClose,
  onSuccessToast,
  onAddApproval,
  token,
  onRefresh,
  userRole,
}: QuickActionModalProps) {
  const [activeTab, setActiveTab] = useState<ActionType>('off_cycle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [leaveCategory, setLeaveCategory] = useState('Annual Paid Vacation');
  const [startDate, setStartDate] = useState('2026-09-14');
  const [endDate, setEndDate] = useState('2026-09-18');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Part-time' | 'Contractor'>('Full-time');
  const [employmentStatus, setEmploymentStatus] = useState<'Active' | 'Onboarding' | 'On Leave' | 'Terminated'>('Active');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fixedAllowances, setFixedAllowances] = useState('0');
  const [location, setLocation] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const canCreateEmployee = userRole === 'admin' || userRole === 'hr_manager';

  React.useEffect(() => {
    if (!isOpen) return;
    api.employees(token).then((result) => setEmployees(result.data)).catch(() => setEmployees([]));
  }, [isOpen, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTab === 'new_employee') {
        if (!canCreateEmployee) throw new Error('Only an HR Manager or Administrator can add an employee.');
        if (!firstName || !lastName || !email || !department || !title || !joinDate || !salary || Number(salary) <= 0 || !location || Number(fixedAllowances) < 0) throw new Error('Please complete every employee field with valid values.');
        await api.createEmployee({ firstName, lastName, email, department, title, employmentType, status: employmentStatus, joinDate, baseSalary: Number(salary), fixedAllowances: Number(fixedAllowances), location }, token);
        onSuccessToast(`${firstName} ${lastName} was added. Their login password is admin123.`);
      } else if (activeTab === 'leave_request') {
        const employee = employees.find((item) => item._id === employeeName);
        if (!employee) throw new Error('Select an employee for this leave request.');
        const totalDays = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1);
        await api.createLeaveRequest({ employee: employee._id, leaveType: leaveCategory, startDate, endDate, totalDays, reason: reason || 'Leave request submitted from dashboard.' }, token);
        onSuccessToast(`Leave request for ${employee.firstName} ${employee.lastName} was submitted.`);
      } else {
        throw new Error('Off-cycle payouts are not available yet. Use Payroll Processing to create a payroll run.');
      }
      await onRefresh();
      onClose(); setEmployeeName(''); setEmail(''); setTitle(''); setSalary(''); setFirstName(''); setLastName(''); setFixedAllowances('0'); setLocation(''); setAmount(''); setReason('');
    } catch (error) {
      onSuccessToast(error instanceof Error ? error.message : 'Unable to process this action.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Execute Quick Action"
      description="Quickly trigger standard HR and payroll workflows"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Action Type Selector */}
        <div className={`grid ${canCreateEmployee ? 'grid-cols-3' : 'grid-cols-2'} gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80`}>
          <button
            type="button"
            onClick={() => setActiveTab('off_cycle')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'off_cycle'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 mb-1 text-brand-600" />
            <span>Off-Cycle Pay</span>
          </button>

          {canCreateEmployee && <button
            type="button"
            onClick={() => setActiveTab('new_employee')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'new_employee'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 mb-1 text-brand-600" />
            <span>New Employee</span>
          </button>}

          <button
            type="button"
            onClick={() => setActiveTab('leave_request')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'leave_request'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 mb-1 text-brand-600" />
            <span>Request Leave</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'off_cycle' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>
                  Off-cycle payroll runs bypass the regular monthly schedule and are subject to immediate
                  gross-to-net tax recalculations.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Employee
                </label>
                <select
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="">Select an employee...</option>
                  {employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.firstName} {employee.lastName} ({employee.title})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gross Payout Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disbursement Category
                  </label>
                  <select className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                    <option>Relocation / Moving Bonus</option>
                    <option>Retroactive Pay Correction</option>
                    <option>Severance Payout</option>
                    <option>Performance Spot Bonus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Justification / Audit Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide brief context for finance audit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'new_employee' && canCreateEmployee && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Vedansh"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input type="text" placeholder="e.g. Sharma" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="vedansh@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label><select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as typeof employmentType)} className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"><option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contractor">Contractor</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label><select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value as typeof employmentStatus)} className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"><option value="Active">Active</option><option value="Onboarding">Onboarding</option><option value="On Leave">On Leave</option><option value="Terminated">Terminated</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-700 mb-1">Join Date</label><input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg" /></div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1">Location</label><input type="text" placeholder="e.g. Noida, India" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-700 mb-1">Annual Base Salary (₹)</label><input type="number" min="1" placeholder="800000" value={salary} onChange={(e) => setSalary(e.target.value)} required className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg" /></div>
                <div><label className="block text-xs font-semibold text-slate-700 mb-1">Fixed Allowances (₹)</label><input type="number" min="0" value={fixedAllowances} onChange={(e) => setFixedAllowances(e.target.value)} required className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg" /></div>
              </div>
            </div>
          )}

          {activeTab === 'leave_request' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Applicant Employee
                </label>
                <select
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="">Select an employee...</option>
                  {employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.firstName} {employee.lastName} ({employee.title})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={leaveCategory}
                  onChange={(e) => setLeaveCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="Annual">Annual</option>
                  <option value="Sick">Sick</option>
                  <option value="Casual">Casual</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason & Coverage</label>
                <textarea
                  rows={2}
                  placeholder="Notes for your manager and team handover..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Process</span>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
