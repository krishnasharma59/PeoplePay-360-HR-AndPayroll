// Vite proxies /api to the local Express server during development.
const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr_manager' | 'hr_payroll_manager' | 'hr_payroll_user' | 'employee';
  employee?: string;
  avatarUrl?: string;
}

interface AuthResponse { user: SessionUser; token: string }

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({ message: 'The API returned an invalid response.' }));
  if (!response.ok) throw new Error(body.message || 'Request failed.');
  return body as T;
}

export const api = {
  login: (email: string, password: string) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  requestPasswordReset: (email: string) => request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload: { email: string; code: string; newPassword: string; confirmPassword: string }) => request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: { name: string; email: string; password: string; confirmPassword: string }) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  dashboard: (token: string) => request<{ data: { totalEmployees: number; pendingLeave: number; payrollRunCount: number; currentPayroll: any; recentActivity: any[]; personal?: { leaveRequests: number; publishedPayslips: number; attendanceStatus: string }; attendance: { totalEligible: number; presentTotal: number; inOffice: number; remote: number; onLeave: number } } }>('/dashboard/summary', {}, token),
  // Load the complete leave history so employees can see approved/rejected decisions.
  // The Time Off UI limits approval actions to records that are still pending.
  leaveRequests: (token: string) => request<{ data: any[] }>('/leave-requests', {}, token),
  decideLeave: (id: string, status: 'Approved' | 'Rejected', token: string, approverNotes = '') => request(`/leave-requests/${id}/decision`, { method: 'PATCH', body: JSON.stringify({ status, approverNotes }) }, token),
  employees: (token: string) => request<{ data: any[] }>('/employees', {}, token),
  createEmployee: (payload: Record<string, unknown>, token: string) => request<{ data: any }>('/employees', { method: 'POST', body: JSON.stringify(payload) }, token),
  updateEmployee: (id: string, payload: Record<string, unknown>, token: string) => request<{ data: any; account?: SessionUser | null }>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token),
  createLeaveRequest: (payload: Record<string, unknown>, token: string) => request<{ data: any }>('/leave-requests', { method: 'POST', body: JSON.stringify(payload) }, token),
  employeeAccounts: (token: string) => request<{ data: any[] }>('/employee-accounts', {}, token),
  updateEmployeeRole: (id: string, role: SessionUser['role'], token: string) => request<{ data: any }>(`/employee-accounts/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }, token),
  updateProfile: (payload: { name: string; avatarUrl: string }, token: string) => request<{ user: SessionUser }>('/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }, token),
  changePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }, token: string) => request<{ message: string }>('/auth/password', { method: 'PATCH', body: JSON.stringify(payload) }, token),
  attendance: (token: string) => request<{ data: any[] }>('/attendance', {}, token),
  recordAttendance: (payload: { date: string; status: string; overtimeHours: number; employee?: string }, token: string) => request<{ data: any }>('/attendance', { method: 'PUT', body: JSON.stringify(payload) }, token),
  payrollRuns: (token: string) => request<{ data: any[] }>('/payroll-runs', {}, token),
  createPayrollRun: (payload: { periodName: string; startDate: string; endDate: string; payDate: string }, token: string) => request<{ data: any }>('/payroll-runs', { method: 'POST', body: JSON.stringify(payload) }, token),
  calculatePayroll: (id: string, token: string) => request<{ data: any }>(`/payroll-runs/${id}/calculate`, { method: 'POST' }, token),
  approvePayroll: (id: string, token: string) => request<{ data: any; emailedCount: number; deliveryFailures: { payslipId: string; message: string }[] }>(`/payroll-runs/${id}/approve`, { method: 'POST' }, token),
  cancelPayroll: (id: string, token: string) => request<{ message: string }>(`/payroll-runs/${id}/cancel`, { method: 'POST' }, token),
  unapprovePayroll: (id: string, token: string) => request<{ data: any }>(`/payroll-runs/${id}/unapprove`, { method: 'POST' }, token),
  payslips: (runId: string, token: string) => request<{ data: any[] }>(`/payroll-runs/${runId}/payslips`, {}, token),
  approvePayslip: (id: string, token: string) => request<{ data: any }>(`/payslips/${id}/approve`, { method: 'POST' }, token),
  rejectPayslip: (id: string, reason: string, token: string) => request<{ data: any }>(`/payslips/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }, token),
  allPayslips: (token: string) => request<{ data: any[] }>('/payslips', {}, token),
  payslipPdf: async (id: string, token: string) => { const response = await fetch(`${API_URL}/payslips/${id}/pdf`, { headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message || 'Unable to open payslip PDF.'); } return response.blob(); },
  contracts: (token: string) => request<{ data: any[] }>('/contracts', {}, token),
  createContract: (payload: Record<string, unknown>, token: string) => request<{ data: any }>('/contracts', { method: 'POST', body: JSON.stringify(payload) }, token),
  salaryStructures: (token: string) => request<{ data: any[] }>('/salary-structures', {}, token),
  createSalaryStructure: (payload: Record<string, unknown>, token: string) => request<{ data: any }>('/salary-structures', { method: 'POST', body: JSON.stringify(payload) }, token),
  salaryRules: (token: string) => request<{ data: any[] }>('/salary-rules', {}, token),
  createSalaryRule: (payload: Record<string, unknown>, token: string) => request<{ data: any }>('/salary-rules', { method: 'POST', body: JSON.stringify(payload) }, token),
  updateSalaryRule: (id: string, payload: Record<string, unknown>, token: string) => request<{ data: any }>(`/salary-rules/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token),
};
