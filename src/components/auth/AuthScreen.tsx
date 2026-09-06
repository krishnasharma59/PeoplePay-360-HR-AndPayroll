import React, { useState } from 'react';
import { ArrowLeft, MailCheck, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';

interface AuthScreenProps {
  onSubmit: (payload: { email: string; password: string }) => Promise<void>;
}
const isValidEmail = (value: string) => /^[^\s@\\]+@[^\s@\\]+\.[^\s@\\]{2,}$/.test(value.trim());

export function AuthScreen({ onSubmit }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) { setError('Enter a valid email address, for example name@example.com.'); return; }
    setLoading(true); setError('');
    try { await onSubmit({ email, password }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to connect to the API.'); }
    finally { setLoading(false); }
  };
  const requestCode = async (event: React.FormEvent) => { event.preventDefault(); if (!isValidEmail(email)) { setError('Enter a valid email address, for example name@example.com.'); return; } setLoading(true); setError(''); try { const result = await api.requestPasswordReset(email); setMessage(result.message); setMode('reset'); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to send the verification code.'); } finally { setLoading(false); } };
  const reset = async (event: React.FormEvent) => { event.preventDefault(); if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; } setLoading(true); setError(''); try { const result = await api.resetPassword({ email, code, newPassword: password, confirmPassword }); setMessage(result.message); setPassword(''); setConfirmPassword(''); setCode(''); setMode('login'); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to reset password.'); } finally { setLoading(false); } };
  const backToLogin = () => { setMode('login'); setError(''); setMessage(''); };

  return <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-7"><div className="rounded-xl bg-brand-600 p-2.5 text-white"><ShieldCheck className="w-6 h-6" /></div><div><h1 className="text-xl font-bold">PeoplePay360</h1><p className="text-xs text-slate-500">{mode === 'login' ? 'Sign in to your workspace' : 'Secure password recovery'}</p></div></div>
      {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{message}</p>}
      {mode === 'login' && <form className="space-y-4" onSubmit={submit}>
        <label className="block text-xs font-semibold text-slate-700">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        <label className="block text-xs font-semibold text-slate-700">Password<input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
        <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot password?</button>
        <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>{loading ? 'Connecting…' : 'Sign in'}</Button>
      </form>}
      {mode === 'forgot' && <form className="space-y-4" onSubmit={requestCode}><p className="text-sm text-slate-600">Enter your email and we’ll send a six-digit verification code.</p><label className="block text-xs font-semibold text-slate-700">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>{error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}<Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}><MailCheck className="w-4 h-4" />{loading ? 'Sending…' : 'Send verification code'}</Button><button type="button" onClick={backToLogin} className="flex items-center gap-1 text-xs font-semibold text-slate-500"><ArrowLeft className="w-3 h-3" />Back to sign in</button></form>}
      {mode === 'reset' && <form className="space-y-4" onSubmit={reset}><p className="text-sm text-slate-600">Verify your email code, then choose a new password.</p><label className="block text-xs font-semibold text-slate-700">Verification code<input inputMode="numeric" pattern="[0-9]{6}" value={code} onChange={(e) => setCode(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label><label className="block text-xs font-semibold text-slate-700">New password<input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label><label className="block text-xs font-semibold text-slate-700">Confirm password<input type="password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>{error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}<Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>{loading ? 'Resetting…' : 'Verify and reset password'}</Button><button type="button" onClick={backToLogin} className="flex items-center gap-1 text-xs font-semibold text-slate-500"><ArrowLeft className="w-3 h-3" />Back to sign in</button></form>}
    </section>
  </main>;
}
