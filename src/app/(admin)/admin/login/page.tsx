'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, completeFirstTimePasswordChangeAction } from '@/app/actions/auth-actions';
import { SubmitButton } from '@/components/ui/action-buttons';
import { Lock, ShieldCheck, Key, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    try {
      const res = await loginAction(formData);
      if (res.success) {
        if (res.mustChangePassword) {
          setMustChangePassword(true);
        } else {
          router.push('/admin/dashboard');
          router.refresh();
        }
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForcePasswordChange = async () => {
    setError('');
    if (!newPassword || newPassword.length < 8) {
      const err = 'New password must be at least 8 characters.';
      setError(err);
      throw new Error(err);
    }
    if (newPassword !== confirmPassword) {
      const err = 'Passwords do not match.';
      setError(err);
      throw new Error(err);
    }

    const formData = new FormData();
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    try {
      await completeFirstTimePasswordChangeAction(formData);
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans p-4 relative z-50">
      <div className="max-w-md w-full p-8 bg-card border border-border rounded-card shadow-sm relative z-50">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-btn flex items-center justify-center shadow-md">
            {mustChangePassword ? (
              <Key size={18} className="text-white" />
            ) : (
              <span className="text-primary-foreground text-lg font-bold">S</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold tracking-tight text-center text-foreground mb-2">
          {mustChangePassword ? 'Password Rotation Required' : 'Studio Admin Login'}
        </h1>

        <p className="text-xs text-center text-muted-foreground mb-6">
          {mustChangePassword 
            ? 'For security compliance, you must set a personalized password before entering the platform.' 
            : 'Enter your authenticated credentials to access the administrative panel.'}
        </p>
        
        {error && (
          <div className="px-4 py-3 mb-6 text-[13px] font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-btn flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </div>
        )}
        
        {/* Normal Login Form */}
        {!mustChangePassword ? (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void handleLogin(); }}>
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-[13px] font-semibold text-foreground">Email Address</label>
              <input
                type="text"
                id="admin-email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-[14px] bg-muted/40 border border-border rounded-btn outline-none transition-colors focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/20 font-mono text-foreground"
                placeholder="Configured administrator email"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-[13px] font-semibold text-foreground">Password</label>
              <input
                type="password"
                id="admin-password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-[14px] bg-muted/40 border border-border rounded-btn outline-none transition-colors focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/20 font-mono text-foreground"
                placeholder="••••••••"
              />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="group relative inline-flex w-full items-center justify-center gap-2 rounded-btn border border-transparent bg-btn-bg px-6 py-3 text-[14px] font-bold text-btn-text transition-all hover:bg-btn-hover focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          </form>
        ) : (
          /* Mandatory First-Time Password Reset Form */
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-foreground">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 text-[14px] bg-muted/40 border border-border rounded-btn outline-none transition-colors focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/20 font-mono text-foreground"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-foreground">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 text-[14px] bg-muted/40 border border-border rounded-btn outline-none transition-colors focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/20 font-mono text-foreground"
                placeholder="Repeat new password"
              />
            </div>

            <div className="pt-3">
              <SubmitButton 
                className="w-full !py-3 !text-[14px] !rounded-btn !bg-btn-bg !text-btn-text hover:!bg-btn-hover"
                action={handleForcePasswordChange}
                successMessage="Password set successfully!"
                errorMessage="Failed to set password"
              >
                Set Password & Enter Studio
              </SubmitButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
