/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useTransition } from 'react';
import { User, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateOwnProfileAction } from '@/app/actions/user-actions';

interface ProfileManagerProps {
  initialUser: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    customRoleName?: string | null;
  };
}

export default function ProfileManager({ initialUser }: ProfileManagerProps) {
  const [name, setName] = useState(initialUser.name || '');
  const [email, setEmail] = useState(initialUser.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (newPassword && !currentPassword) {
      setStatusMessage({ text: 'You must provide your current password to set a new one.', type: 'error' });
      return;
    }

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append('name', name.trim());
        fd.append('email', email.trim());
        if (currentPassword) fd.append('currentPassword', currentPassword);
        if (newPassword) fd.append('newPassword', newPassword);

        const res = await updateOwnProfileAction(fd);

        if (res.success) {
          setStatusMessage({ text: 'Profile updated successfully!', type: 'success' });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setStatusMessage({ text: (res as any)?.error || 'Failed to update profile', type: 'error' });
        }
      } catch (err: any) {
        setStatusMessage({ text: err.message || 'Failed to update profile', type: 'error' });
      }
    });
  };

  return (
    <div className="space-y-6 w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-btn bg-primary text-primary-foreground shadow-xs">
              <User size={18} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Profile Settings</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage your personal identity credentials, change your email ID, and rotate your account password.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-muted text-foreground rounded-btn border border-border uppercase">
            {initialUser.role === 'CUSTOM' ? (initialUser.customRoleName || 'Custom') : initialUser.role}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className={`p-3 text-xs rounded-card flex items-center gap-2 animate-in fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-primary/10 border border-primary/20 text-foreground' 
            : 'bg-destructive/10 border border-destructive/20 text-destructive'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={15} className="text-primary" /> : <AlertCircle size={15} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-card border border-border rounded-card p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Personal Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 text-xs bg-muted/40 border border-border rounded-btn outline-none focus:bg-card focus:border-primary text-foreground transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address (Login ID)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-muted/40 border border-border rounded-btn outline-none focus:bg-card focus:border-primary text-foreground font-mono transition-colors"
                />
                <p className="text-[10px] text-muted-foreground">Changing this will update your primary sign-in identifier.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Security & Password Rotation</h2>
                <p className="text-xs text-muted-foreground">Leave password fields blank if you do not wish to change your password.</p>
              </div>
              <Lock size={16} className="text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-muted/40 border border-border rounded-btn outline-none focus:bg-card focus:border-primary text-foreground font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 text-xs bg-muted/40 border border-border rounded-btn outline-none focus:bg-card focus:border-primary text-foreground font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 text-xs bg-muted/40 border border-border rounded-btn outline-none focus:bg-card focus:border-primary text-foreground font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-btn-bg text-btn-text hover:bg-btn-hover text-xs font-semibold rounded-btn transition-colors shadow-xs disabled:opacity-50"
            >
              <span>{isPending ? 'Saving...' : 'Save Profile Changes'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
