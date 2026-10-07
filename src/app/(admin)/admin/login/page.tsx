'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth-actions';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);
    if (res.success) {
      router.push('/admin/pages');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 absolute inset-0 z-50">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[var(--radius)] shadow-xl relative z-50">
        <h1 className="h3-title text-center mb-6">Engine Authentication</h1>
        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email / Username</label>
            <input type="text" name="email" required className="w-full p-3 border rounded-[var(--radius)] dark:bg-slate-800 dark:border-slate-700" placeholder="admin@engine.local" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" required className="w-full p-3 border rounded-[var(--radius)] dark:bg-slate-800 dark:border-slate-700" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full p-3 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius)] hover:brightness-110 transition-all">
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}
