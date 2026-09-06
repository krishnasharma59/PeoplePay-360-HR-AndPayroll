import React from 'react';
import {
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
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Clock3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ModuleId } from '../../types';

interface ModulePlaceholderProps {
  moduleId: ModuleId;
  onBackToDashboard: () => void;
}

interface ModuleSpec {
  name: string;
  category: string;
  icon: React.ElementType;
  description: string;
  plannedFeatures: string[];
  targetRoles: string[];
  status: 'Ready for Implementation' | 'Architecture Staged';
}

const MODULE_SPECS: Record<ModuleId, ModuleSpec> = {
  profile: {
    name: 'My Profile',
    category: 'Account',
    icon: Users,
    description: 'Personal account and employment details.',
    plannedFeatures: [],
    targetRoles: ['All Roles'],
    status: 'Ready for Implementation',
  },
  dashboard: {
    name: 'Dashboard',
    category: 'Core HR',
    icon: Users,
    description: 'Executive overview of HR & Payroll metrics',
    plannedFeatures: [],
    targetRoles: ['All Roles'],
    status: 'Ready for Implementation',
  },
  employees: {
    name: 'Employees Directory',
    category: 'Core HR',
    icon: Users,
    description: 'Comprehensive personnel repository, profile management, and lifecycle events.',
    plannedFeatures: [
      'Searchable employee grid & tabular directory with custom filters',
      'Detailed employee dossier (personal details, compensation, tax identification)',
      'Department, designation, and managerial reporting hierarchies',
      'Onboarding, status transitions (Active / Leave / Terminated), and documents',
    ],
    targetRoles: ['HR Manager', 'Admin', 'HR Payroll Manager'],
    status: 'Ready for Implementation',
  },
  contracts: {
    name: 'Contracts Management',
    category: 'Core HR',
    icon: FileText,
    description: 'Digital employment contracts, fixed-term/permanent agreements, and salary terms.',
    plannedFeatures: [
      'Contract status tracking (Draft, Sent for Signatures, Active, Expired)',
      'Salary and compensation binding clauses linked to salary structures',
      'Probation period management and contract renewal triggers',
      'Digital signature tracking and PDF contract archival',
    ],
    targetRoles: ['HR Manager', 'Admin'],
    status: 'Ready for Implementation',
  },
  attendance: {
    name: 'Attendance Tracking',
    category: 'Core HR',
    icon: Clock,
    description: 'Timesheets, punch-in logs, biometric integrations, and shifts tracking.',
    plannedFeatures: [
      'Daily clock-in/out logs with GPS and IP verification stubs',
      'Shift scheduling, overtime hours auto-calculation, and deficit flags',
      'Monthly timesheet sign-off workflow for managers',
      'Automated feed into payroll gross-to-net overtime inputs',
    ],
    targetRoles: ['Employee', 'HR Manager', 'HR Payroll Specialist'],
    status: 'Ready for Implementation',
  },
  'time-off': {
    name: 'Time Off & Leave Management',
    category: 'Core HR',
    icon: Calendar,
    description: 'Leave policy enforcement, multi-level approvals, and balance accruals.',
    plannedFeatures: [
      'Leave balance ledger (Annual, Sick, Casual, Parental, Unpaid)',
      'Interactive team absence calendar and holiday schedule',
      'Manager review, multi-tier approval workflows, and leave encashment',
      'Direct synchronization with unpaid leave deductions in payroll',
    ],
    targetRoles: ['All Roles'],
    status: 'Ready for Implementation',
  },
  payroll: {
    name: 'Payroll Processing Engine',
    category: 'Payroll & Compensation',
    icon: CircleDollarSign,
    description: 'Regular and off-cycle payroll run execution, gross-to-net calculations, and approvals.',
    plannedFeatures: [
      'Automated payroll cycle creator (regular monthly, bi-weekly, or off-cycle bonuses)',
      'Multi-step wizard: Input reconciliation -> Calculations -> Review -> Approval -> Payout',
      'Variance analysis comparing current run vs. previous month',
      'Direct deposit batch export (NACHA / SEPA XML format)',
    ],
    targetRoles: ['HR Payroll Manager', 'HR Payroll Specialist', 'Admin'],
    status: 'Ready for Implementation',
  },
  payslips: {
    name: 'Payslips Portal & Archive',
    category: 'Payroll & Compensation',
    icon: Receipt,
    description: 'Itemized payslip generation, employee self-service view, and printable statements.',
    plannedFeatures: [
      'Itemized earnings breakdown (Basic, HRA, Conveyance, Overtime, Bonuses)',
      'Statutory withholdings breakdown (Federal/State Tax, Social Security, Healthcare)',
      'Year-to-date (YTD) cumulative summaries on every slip',
      '1-Click bulk payslip PDF generation and encrypted email dispatch',
    ],
    targetRoles: ['Employee', 'HR Payroll Specialist', 'HR Payroll Manager'],
    status: 'Ready for Implementation',
  },
  'salary-structures': {
    name: 'Salary Structures & Grades',
    category: 'Payroll & Compensation',
    icon: Layers,
    description: 'Designation pay grades, allowance matrices, and tiered compensation scales.',
    plannedFeatures: [
      'Base salary grading system across junior, mid, and executive levels',
      'Fixed vs. variable allowance definition (housing, transport, medical)',
      'Company contribution frameworks (401k match, pension, insurance)',
      'Structure assignment per employee contract',
    ],
    targetRoles: ['HR Payroll Manager', 'Admin'],
    status: 'Ready for Implementation',
  },
  'salary-rules': {
    name: 'Salary & Tax Rules Engine',
    category: 'Payroll & Compensation',
    icon: Sliders,
    description: 'Rule-based computation formulas for statutory withholdings, taxes, and deductions.',
    plannedFeatures: [
      'Rule builder with mathematical expressions and conditional logic',
      'Pre-tax vs. Post-tax deduction configuration',
      'Statutory tax brackets (Federal brackets, State taxes, FICA)',
      'Audit mode for dry-running rules against sample employee contracts',
    ],
    targetRoles: ['HR Payroll Manager', 'Admin'],
    status: 'Ready for Implementation',
  },
  reports: {
    name: 'Reports & Compliance Analytics',
    category: 'Administration',
    icon: BarChart3,
    description: 'Financial journals, statutory tax reports (941/W-2), and headcount analytics.',
    plannedFeatures: [
      'Payroll journal summary reports by cost center and department',
      'Tax liability and statutory compliance export reports',
      'Headcount turnover, retention, and compensation distribution analytics',
      'Scheduled recurring reports and CSV / Excel / PDF exports',
    ],
    targetRoles: ['Admin', 'HR Payroll Manager', 'HR Manager'],
    status: 'Ready for Implementation',
  },
  settings: {
    name: 'System Settings & Policies',
    category: 'Administration',
    icon: Settings,
    description: 'Company organization details, bank integrations, role permissions, and workflows.',
    plannedFeatures: [
      'Legal entity configuration, business locations, and currency settings',
      'Payroll bank disbursement settings & ACH credentials',
      'Role-based access control (RBAC) permission matrices',
      'Notification triggers and audit logging preferences',
    ],
    targetRoles: ['Admin'],
    status: 'Ready for Implementation',
  },
};

export function ModulePlaceholder({ moduleId, onBackToDashboard }: ModulePlaceholderProps) {
  const spec = MODULE_SPECS[moduleId] || MODULE_SPECS.dashboard;
  const Icon = spec.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={onBackToDashboard}
        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Executive Dashboard</span>
      </button>

      {/* Module Overview Card */}
      <Card className="p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-600">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{spec.name}</h2>
                <Badge variant="brand" size="sm">
                  {spec.category}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">{spec.description}</p>
            </div>
          </div>

          <Badge variant="warning" size="md" dot>
            {spec.status}
          </Badge>
        </div>

        <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Planned Capabilities & Workflows
            </h4>
            <ul className="space-y-2.5">
              {spec.plannedFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Authorized Enterprise Roles
              </h4>
              <div className="flex flex-wrap gap-2">
                {spec.targetRoles.map((role) => (
                  <span
                    key={role}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <Clock3 className="w-4 h-4 text-amber-600" />
                <span>Modular Build Sequence</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                As per system design, PeoplePay360 is built module by module. Phase 1 (App Shell, Layout,
                Design System & Dashboard) is live. Awaiting user instruction to implement this module.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Current Module: <code className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono">/ {moduleId}</code>
          </span>
          <Button variant="primary" size="sm" onClick={onBackToDashboard}>
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
