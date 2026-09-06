import React, { useEffect, useState } from 'react';
import { Pencil, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { api, SessionUser } from '../../lib/api';

const ROLE_LABELS: Record<SessionUser['role'], string> = {
  admin: 'Administrator', hr_manager: 'HR Manager', hr_payroll_manager: 'Payroll Manager', hr_payroll_user: 'Payroll Specialist', employee: 'Employee',
};

interface EmployeesModuleProps { token: string; user: SessionUser; onActivity: () => Promise<void>; onUserUpdated: (user: SessionUser) => void; }

export function EmployeesModule({ token, user, onActivity, onUserUpdated }: EmployeesModuleProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [pendingRoleChange, setPendingRoleChange] = useState<{ id: string; name: string; role: SessionUser['role'] } | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [confirmEmployeeSave, setConfirmEmployeeSave] = useState(false);
  const load = async () => {
    try {
      setError('');
      const employeeResult = await api.employees(token);
      setEmployees(employeeResult.data);
      if (user.role === 'admin') setAccounts((await api.employeeAccounts(token)).data);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load employees.'); }
  };
  useEffect(() => { load(); }, [token, user.role]);
  const changeRole = async () => {
    if (!pendingRoleChange) return;
    try { await api.updateEmployeeRole(pendingRoleChange.id, pendingRoleChange.role, token); await Promise.all([load(), onActivity()]); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to update role.'); }
    finally { setPendingRoleChange(null); }
  };
  const canChangeEmploymentStatus = user.role === 'admin' || user.role === 'hr_manager';
  const updateEmploymentStatus = async (employeeId: string, status: string) => {
    try {
      setError('');
      await api.updateEmployee(employeeId, { status }, token);
      await Promise.all([load(), onActivity()]);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update employment status.'); }
  };
  const saveEmployee = async (event: React.FormEvent) => {
    event.preventDefault();
    setConfirmEmployeeSave(true);
  };
  const applyEmployeeChanges = async () => {
    if (!editingEmployee) return;
    try {
      setError('');
      const { _id, employeeCode, avatarUrl, ...updates } = editingEmployee;
      const result = await api.updateEmployee(_id, updates, token);
      if (result.account && result.account.id === user.id) onUserUpdated(result.account);
      setConfirmEmployeeSave(false);
      setEditingEmployee(null);
      await Promise.all([load(), onActivity()]);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update employee.'); }
  };
  // The employee directory contains only complete HR employee profiles.
  // Account-only users remain visible only in Admin account management.
  const directoryEntries = employees;
  return <div className="max-w-6xl mx-auto space-y-6 pb-12">
    <div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-brand-50 text-brand-700"><Users className="w-5 h-5" /></div><div><h1 className="text-xl font-bold text-slate-900">Employee Directory</h1><p className="text-xs text-slate-500">{directoryEntries.length} employee{directoryEntries.length === 1 ? '' : 's'} in the local HRMS database.</p></div></div>
    {error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
    <Card><CardHeader><CardTitle>Employees</CardTitle><CardDescription>Registered accounts and complete employee profiles.</CardDescription></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Employee</th><th className="p-4">Department</th><th className="p-4">Job title</th><th className="p-4">Employment Status</th>{user.role === 'admin' && <th className="p-4">Action</th>}</tr></thead><tbody className="divide-y divide-slate-100">{directoryEntries.length ? directoryEntries.map((employee) => { const isFullProfile = employee.employeeCode !== 'Profile pending'; const isOwnProfile = String(user.employee || '') === String(employee._id); const editable = canChangeEmploymentStatus && isFullProfile && !(user.role === 'hr_manager' && isOwnProfile); return <tr key={employee._id}><td className="p-4"><div className="flex items-center gap-2"><Avatar name={`${employee.firstName} ${employee.lastName}`} src={employee.avatarUrl} size="sm" /><span className="font-semibold text-slate-900">{employee.firstName} {employee.lastName}<span className="block mt-0.5 text-[11px] font-normal text-slate-500">{employee.email} · {employee.employeeCode}</span></span></div></td><td className="p-4 text-slate-700">{employee.department}</td><td className="p-4 text-slate-700">{employee.title}</td><td className="p-4">{editable ? <select value={employee.status} onChange={(event) => updateEmploymentStatus(employee._id, event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700"><option value="Active">Active</option><option value="Onboarding">Onboarding</option><option value="On Leave">On Leave</option><option value="Terminated">Terminated</option></select> : <><Badge variant={employee.status === 'Active' ? 'success' : 'warning'} size="sm">{employee.status}</Badge>{user.role === 'hr_manager' && isOwnProfile && <span className="block mt-1 text-[10px] text-slate-400">You cannot change your own status</span>}</>}</td>{user.role === 'admin' && <td className="p-4">{isFullProfile ? <Button variant="outline" size="sm" onClick={() => setEditingEmployee({ ...employee })}><Pencil className="w-3.5 h-3.5" />Edit</Button> : <span className="text-[11px] text-slate-400">Profile pending</span>}</td>}</tr> }) : <tr><td className="p-8 text-center text-slate-500" colSpan={user.role === 'admin' ? 5 : 4}>No employee records yet. Add one with Quick Action.</td></tr>}</tbody></table></div></CardContent></Card>
    {user.role === 'admin' && <Card><CardHeader><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-600" /><CardTitle>Account access roles</CardTitle></div><CardDescription>Only administrators can change access roles. This is enforced by the server.</CardDescription></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Account</th><th className="p-4">Employee record</th><th className="p-4">Access role</th></tr></thead><tbody className="divide-y divide-slate-100">{accounts.map((account) => <tr key={account._id}><td className="p-4"><div className="flex items-center gap-2"><Avatar name={account.name} src={account.avatarUrl} size="sm" /><span className="font-semibold text-slate-900">{account.name}<span className="block mt-0.5 text-[11px] font-normal text-slate-500">{account.email}</span></span></div></td><td className="p-4 text-slate-700">{account.employee ? `${account.employee.firstName} ${account.employee.lastName}` : 'Not linked'}</td><td className="p-4"><select value={account.role} disabled={account._id === user.id} onChange={(event) => setPendingRoleChange({ id: account._id, name: account.name, role: event.target.value as SessionUser['role'] })} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 disabled:bg-slate-100"><option value="employee">Employee</option><option value="hr_payroll_user">Payroll Specialist</option><option value="hr_manager">HR Manager</option><option value="hr_payroll_manager">Payroll Manager</option><option value="admin">Administrator</option></select>{account._id === user.id && <span className="ml-2 text-[10px] text-slate-400">Your account</span>}</td></tr>)}</tbody></table></div></CardContent></Card>}
    <Modal isOpen={Boolean(editingEmployee)} onClose={() => setEditingEmployee(null)} title="Edit employee" description="Employee ID is generated by the system and cannot be changed.">
      {editingEmployee && <form className="space-y-3" onSubmit={saveEmployee}>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">Employee ID: <strong className="text-slate-700">{editingEmployee.employeeCode}</strong></p>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-slate-700">First Name<input value={editingEmployee.firstName} onChange={(e) => setEditingEmployee({ ...editingEmployee, firstName: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label><label className="text-xs font-semibold text-slate-700">Last Name<input value={editingEmployee.lastName} onChange={(e) => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label></div>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-slate-700">Email<input type="email" value={editingEmployee.email} onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label><label className="text-xs font-semibold text-slate-700">Department<input value={editingEmployee.department} onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label></div>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-slate-700">Job Title<input value={editingEmployee.title} onChange={(e) => setEditingEmployee({ ...editingEmployee, title: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label><label className="text-xs font-semibold text-slate-700">Location<input value={editingEmployee.location || ''} onChange={(e) => setEditingEmployee({ ...editingEmployee, location: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label></div>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-slate-700">Employment Type<select value={editingEmployee.employmentType} onChange={(e) => setEditingEmployee({ ...editingEmployee, employmentType: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option>Full-time</option><option>Part-time</option><option>Contractor</option></select></label><label className="text-xs font-semibold text-slate-700">Employment Status<select value={editingEmployee.status} onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option>Active</option><option>Onboarding</option><option>On Leave</option><option>Terminated</option></select></label></div>
        <div className="grid grid-cols-3 gap-3"><label className="text-xs font-semibold text-slate-700">Join Date<input type="date" value={String(editingEmployee.joinDate).slice(0, 10)} onChange={(e) => setEditingEmployee({ ...editingEmployee, joinDate: e.target.value })} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label><label className="text-xs font-semibold text-slate-700">Base Salary (₹)<input type="number" min="0" value={editingEmployee.baseSalary} onChange={(e) => setEditingEmployee({ ...editingEmployee, baseSalary: Number(e.target.value) })} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label><label className="text-xs font-semibold text-slate-700">Allowances (₹)<input type="number" min="0" value={editingEmployee.fixedAllowances || 0} onChange={(e) => setEditingEmployee({ ...editingEmployee, fixedAllowances: Number(e.target.value) })} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label></div>
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" size="sm" onClick={() => { setConfirmEmployeeSave(false); setEditingEmployee(null); }}>Cancel and discard</Button><Button type="submit" variant="primary" size="sm">Save changes</Button></div>
      </form>}
    </Modal>
    <Modal isOpen={confirmEmployeeSave} onClose={() => setConfirmEmployeeSave(false)} title="Confirm employee changes" description="Review and confirm before updating the employee record.">
      <div className="space-y-5 text-sm text-slate-700"><p>Save the edited details for <strong>{editingEmployee?.firstName} {editingEmployee?.lastName}</strong>? The Employee ID will remain unchanged.</p><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setConfirmEmployeeSave(false)}>Back to edit</Button><Button variant="primary" size="sm" onClick={applyEmployeeChanges}>Confirm changes</Button></div></div>
    </Modal>
    <Modal isOpen={Boolean(pendingRoleChange)} onClose={() => setPendingRoleChange(null)} title="Confirm role change" description="This will immediately change the account's access permissions.">
      <div className="space-y-5 text-sm text-slate-700"><p>Change <strong>{pendingRoleChange?.name}</strong> to <strong>{pendingRoleChange ? ROLE_LABELS[pendingRoleChange.role] : ''}</strong>?</p><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setPendingRoleChange(null)}>Cancel</Button><Button variant="primary" size="sm" onClick={changeRole}>Confirm change</Button></div></div>
    </Modal>
  </div>;
}
