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

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (message: string) => void;
  onAddApproval?: (approval: PendingApproval) => void;
}

type ActionType = 'off_cycle' | 'new_employee' | 'leave_request';

export function QuickActionModal({
  isOpen,
  onClose,
  onSuccessToast,
  onAddApproval,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();

      if (activeTab === 'off_cycle') {
        const payoutAmount = amount ? `$${Number(amount).toLocaleString('en-US')}.00` : '$1,500.00';
        const empName = employeeName || 'Sophia Rodriguez';
        if (onAddApproval) {
          onAddApproval({
            id: `app-${Date.now()}`,
            type: 'off_cycle',
            title: `Off-Cycle Payout: ${empName}`,
            requesterName: empName,
            requesterRole: 'Product Designer',
            requesterDepartment: department,
            requestedDate: 'Sep 06, 2026',
            amountOrDuration: payoutAmount,
            details: reason || 'Urgent off-cycle payroll disbursement processed via Quick Action.',
            status: 'pending',
          });
        }
        onSuccessToast(`Off-cycle payment of ${payoutAmount} queued for approval.`);
      } else if (activeTab === 'new_employee') {
        onSuccessToast(`Draft profile created for ${employeeName || 'New Hire'}. Invitation sent.`);
      } else {
        const empName = employeeName || 'Sophia Rodriguez';
        if (onAddApproval) {
          onAddApproval({
            id: `app-${Date.now()}`,
            type: 'leave',
            title: `${leaveCategory} (${empName})`,
            requesterName: empName,
            requesterRole: 'Senior Product Designer',
            requesterDepartment: department || 'Product & Design',
            requestedDate: `${startDate} - ${endDate}`,
            amountOrDuration: '5 Days (Paid)',
            details: reason || 'Submitted leave request awaiting managerial sign-off.',
            status: 'pending',
          });
        }
        onSuccessToast(`Leave request for ${empName} submitted successfully.`);
      }

      // Reset
      setEmployeeName('');
      setAmount('');
      setReason('');
    }, 500);
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
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
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

          <button
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
          </button>

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
                  <option value="Sophia Rodriguez">Sophia Rodriguez (Product Designer)</option>
                  <option value="Tariq Al-Mansoor">Tariq Al-Mansoor (DevOps Lead)</option>
                  <option value="Kenji Sato">Kenji Sato (ML Engineer)</option>
                  <option value="David Chen">David Chen (Software Engineer)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gross Payout Amount ($)
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

          {activeTab === 'new_employee' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="alex@acmeglobal.com"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product & Design</option>
                    <option value="Sales">Sales & BD</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations & HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Engineer"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                    <option>Full-Time Regular</option>
                    <option>Part-Time</option>
                    <option>Independent Contractor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Base Salary ($)</label>
                  <input
                    type="number"
                    placeholder="120000"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
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
                  <option value="Sophia Rodriguez">Sophia Rodriguez (Product Designer)</option>
                  <option value="David Chen">David Chen (Senior Software Engineer)</option>
                  <option value="Liam Gallagher">Liam Gallagher (HR Payroll Specialist)</option>
                  <option value="Rachel Green-Cross">Rachel Green-Cross (Account Executive)</option>
                  <option value="Sarah Jenkins">Sarah Jenkins (Lead Developer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={leaveCategory}
                  onChange={(e) => setLeaveCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="Annual Paid Vacation">Annual Paid Vacation (Balance: 16 days)</option>
                  <option value="Sick & Medical Leave">Sick & Medical Leave (Balance: 8 days)</option>
                  <option value="Casual Time Off">Casual Time Off (Balance: 3 days)</option>
                  <option value="Unpaid Sabbatical">Unpaid Sabbatical</option>
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