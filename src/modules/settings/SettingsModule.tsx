import React, { useState } from 'react';
import { LogOut, Save, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { SessionUser } from '../../lib/api';
import { api } from '../../lib/api';

interface SettingsModuleProps {
  user: SessionUser;
  onLogout: () => void;
  token: string;
  onUserUpdated: (user: SessionUser) => void;
}

export function SettingsModule({ user, onLogout, token, onUserUpdated }: SettingsModuleProps) {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    if (!window.confirm('Save these changes to your display name and profile photo?')) return;
    try { const result = await api.updateProfile({ name, avatarUrl }, token); onUserUpdated(result.user); setMessage('Profile updated.'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to update profile.'); }
  };
  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    try { const result = await api.changePassword({ currentPassword, newPassword, confirmPassword }, token); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setMessage(result.message); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to update password.'); }
  };
  return <div className="max-w-3xl mx-auto space-y-6 pb-12">
    <div>
      <h1 className="text-xl font-bold text-slate-900">Settings</h1>
      <p className="text-xs text-slate-500 mt-1">Manage your workspace session and access.</p>
    </div>
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-600" /><CardTitle>Signed-in account</CardTitle></div>
        <CardDescription>{user.name} · {user.email} · {user.role.replace(/_/g, ' ')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><p className="text-sm font-semibold text-slate-900">Sign out of PeoplePay360</p><p className="text-xs text-slate-500 mt-1">Your saved browser session will be cleared from this device.</p></div>
          <Button variant="danger" size="sm" onClick={onLogout}><LogOut className="w-4 h-4" />Log out</Button>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Update the name and photo shown in the application.</CardDescription></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={saveProfile}>
          <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center overflow-hidden">{avatarUrl ? <img src={avatarUrl} alt="Profile preview" className="w-full h-full object-cover" /> : name.slice(0, 1).toUpperCase()}</div><p className="text-xs text-slate-500">Paste an image URL to use it as your profile photo.</p></div>
          <label className="block text-xs font-semibold text-slate-700">Display name<input value={name} onChange={(event) => setName(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="block text-xs font-semibold text-slate-700">Photo URL<input type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://example.com/photo.jpg" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <Button type="submit" variant="primary" size="sm"><Save className="w-4 h-4" />Save profile</Button>
        </form>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Change password</CardTitle><CardDescription>Use at least 8 characters and confirm the new password.</CardDescription></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={savePassword}>
          <label className="block text-xs font-semibold text-slate-700">Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="block text-xs font-semibold text-slate-700">New password<input type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="block text-xs font-semibold text-slate-700">Confirm new password<input type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <Button type="submit" variant="primary" size="sm"><Save className="w-4 h-4" />Update password</Button>
        </form>
        {(message || error) && <p className={`mt-4 rounded-lg p-3 text-xs ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{error || message}</p>}
      </CardContent>
    </Card>
  </div>;
}
