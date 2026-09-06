export type UserRole =
  | 'admin'
  | 'hr_manager'
  | 'hr_payroll_manager'
  | 'hr_payroll_user'
  | 'employee';

export interface UserRoleInfo {
  id: UserRole;
  name: string;
  badge: string;
  description: string;
  avatar: string;
}

export type ModuleId =
  | 'dashboard'
  | 'profile'
  | 'employees'
  | 'contracts'
  | 'attendance'
  | 'time-off'
  | 'payroll'
  | 'payslips'
  | 'salary-structures'
  | 'salary-rules'
  | 'reports'
  | 'settings';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  title: string;
  department: string;
  role: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contractor';
  status: 'Active' | 'Onboarding' | 'On Leave' | 'Terminated';
  joinDate: string;
  salary: number;
  location: string;
}

export interface PayrollRun {
  id: string;
  cycleNumber: string;
  periodName: string;
  startDate: string;
  endDate: string;
  payDate: string;
  cutoffDate: string;
  status: 'Draft' | 'In Review' | 'Approved' | 'Processing' | 'Paid';
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  employerTaxes: number;
  employeeCount: number;
  reconciledPercentage: number;
  pendingAdjustmentsCount: number;
}

export interface PendingApproval {
  id: string;
  type: 'leave' | 'overtime' | 'bonus' | 'off_cycle';
  title: string;
  requesterName: string;
  requesterRole: string;
  requesterAvatar?: string;
  requesterDepartment: string;
  requestedDate: string;
  amountOrDuration: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PayrollTrendData {
  month: string;
  baseSalary: number;
  bonuses: number;
  overtime: number;
  employerTaxes: number;
  totalOutflow: number;
}

export interface DepartmentDistribution {
  department: string;
  headcount: number;
  totalCost: number;
  color: string;
}

export interface AttendanceMetrics {
  totalEligible: number;
  presentTotal: number;
  inOffice: number;
  remote: number;
  onLeave: number;
  pendingApprovals: number;
}

export interface TimelineMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'payroll' | 'compliance' | 'review' | 'people';
  isUrgent?: boolean;
  isCompleted?: boolean;
}

export interface ActivityAuditItem {
  id: string;
  actorName: string;
  actorRole: string;
  actorAvatar?: string;
  action: string;
  target: string;
  timestamp: string;
  category: 'payroll' | 'contract' | 'employee' | 'timeoff';
}

export interface CelebrationItem {
  id: string;
  employeeName: string;
  avatarUrl?: string;
  department: string;
  type: 'birthday' | 'anniversary';
  date: string;
  years?: number;
}

export interface Payslip {
  id: string;
  payslipNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  payrollRunId: string;
  period: string;
  payDate: string;
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    special: number;
  };
  bonuses: number;
  overtimePay: number;
  grossEarnings: number;
  deductions: {
    taxWithholding: number;
    socialSecurity: number;
    medicare: number;
    pension401k: number;
    healthInsurance: number;
  };
  totalDeductions: number;
  netPay: number;
  paymentMethod: 'Direct Deposit' | 'Check' | 'Wire Transfer';
  status: 'Draft' | 'Published' | 'Paid';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Parental' | 'Unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  approverNotes?: string;
}

export interface SalaryStructure {
  id: string;
  gradeCode: string;
  gradeName: string;
  level: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  currency: string;
  fixedAllowancesTotal: number;
  variableBonusTargetPercent: number;
  activeContractsCount: number;
}

export interface SalaryRule {
  id: string;
  ruleCode: string;
  name: string;
  category: 'Allowance' | 'Statutory Withholding' | 'Deduction' | 'Employer Tax';
  calculationType: 'Fixed' | 'Percentage of Basic' | 'Percentage of Gross' | 'Formula';
  value: number;
  formulaDescription?: string;
  isTaxExempt: boolean;
  isActive: boolean;
}

export interface Contract {
  id: string;
  contractNumber: string;
  employeeId: string;
  employeeName: string;
  contractType: 'Permanent' | 'Fixed-Term' | 'Executive' | 'Probationary';
  startDate: string;
  endDate?: string;
  probationEndDate?: string;
  baseSalary: number;
  salaryStructureId: string;
  noticePeriodDays: number;
  status: 'Active' | 'Under Review' | 'Expired' | 'Draft';
}
