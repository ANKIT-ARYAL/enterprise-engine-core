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
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
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
      throw new Error(res.error || 'Invalid credentials');
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
    <div className="min-h-screen flex items-center justify-center bg-surface font-sans p-4 relative z-50">
      <div className="max-w-md w-full p-8 bg-white border border-[#ececec] rounded-2xl shadow-sm relative z-50">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-md">
            {mustChangePassword ? (
              <Key size={18} className="text-white" />
            ) : (
              <span className="text-white text-lg font-bold">S</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold tracking-tight text-center text-slate-900 mb-2">
          {mustChangePassword ? 'Password Rotation Required' : 'Studio Admin Login'}
        </h1>

        <p className="text-xs text-center text-slate-500 mb-6">
          {mustChangePassword 
            ? 'For security compliance, you must set a personalized password before entering the platform.' 
            : 'Enter your authenticated credentials to access the administrative panel.'}
        </p>
        
        {error && (
          <div className="px-4 py-3 mb-6 text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {error}
          </div>
        )}
        
        {/* Normal Login Form */}
        {!mustChangePassword ? (
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">Email Address</label>
              <input 
                type="text" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-[#ececec] rounded-xl outline-none transition-colors focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 font-mono" 
                placeholder="hello@admin.com" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">Password</label>
              <input 
                type="password" 
                name="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-[#ececec] rounded-xl outline-none transition-colors focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 font-mono" 
                placeholder="••••••••" 
              />
            </div>
            <div className="pt-2">
              <SubmitButton 
                className="w-full !py-3 !text-[14px] !rounded-xl !bg-black hover:!bg-slate-800"
                action={handleLogin}
                successMessage="Authentication successful!"
                errorMessage="Authentication failed"
              >
                Sign In
              </SubmitButton>
            </div>
          </form>
        ) : (
          /* Mandatory First-Time Password Reset Form */
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
                minLength={8}
                className="w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-[#ececec] rounded-xl outline-none transition-colors focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 font-mono" 
                placeholder="At least 8 characters" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                minLength={8}
                className="w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-[#ececec] rounded-xl outline-none transition-colors focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 font-mono" 
                placeholder="Repeat new password" 
              />
            </div>

            <div className="pt-3">
              <SubmitButton 
                className="w-full !py-3 !text-[14px] !rounded-xl !bg-black hover:!bg-slate-800"
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
