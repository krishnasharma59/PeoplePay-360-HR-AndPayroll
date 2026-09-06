import { ModuleId, UserRole } from '../types';

const MODULES_BY_ROLE: Record<UserRole, ModuleId[]> = {
  employee: ['dashboard', 'profile', 'attendance', 'time-off', 'payslips', 'settings'],
  hr_manager: ['dashboard', 'profile', 'employees', 'contracts', 'attendance', 'time-off', 'settings'],
  hr_payroll_user: ['dashboard', 'profile', 'employees', 'contracts', 'attendance', 'time-off', 'payroll', 'payslips', 'salary-structures', 'salary-rules', 'settings'],
  hr_payroll_manager: ['dashboard', 'profile', 'employees', 'contracts', 'attendance', 'time-off', 'payroll', 'payslips', 'salary-structures', 'salary-rules', 'reports', 'settings'],
  admin: ['dashboard', 'profile', 'employees', 'contracts', 'attendance', 'time-off', 'payroll', 'payslips', 'salary-structures', 'salary-rules', 'reports', 'settings'],
};

export function canAccessModule(role: UserRole, moduleId: ModuleId) {
  return MODULES_BY_ROLE[role].includes(moduleId);
}
