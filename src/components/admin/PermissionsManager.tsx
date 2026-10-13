/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useTransition } from 'react';
import { 
  Lock, Shield, Check, Search, CheckCircle2, 
  HelpCircle, ShieldAlert, Sliders, ExternalLink
} from 'lucide-react';
import { updatePermissionAssignmentAction } from '@/app/actions/rbac-actions';
import { SYSTEM_PERMISSIONS } from '@/lib/auth/permissions';
import Link from 'next/link';

interface PermissionsManagerProps {
  customRoles: Array<{
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
  }>;
}

export default function PermissionsManager({ customRoles = [] }: PermissionsManagerProps) {
  const [, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [localRoles, setLocalRoles] = useState(customRoles);
  const [toast, setToast] = useState<string | null>(null);

  const categories = ['ALL', ...Array.from(new Set(SYSTEM_PERMISSIONS.map(p => p.category)))];

  const filteredPermissions = SYSTEM_PERMISSIONS.filter(p => {
    const matchesSearch = p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggle = (roleId: string, permId: string, currentChecked: boolean) => {
    const nextState = !currentChecked;

    // Optimistically update local state
    setLocalRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const nextPerms = nextState 
          ? [...role.permissions, permId]
          : role.permissions.filter(p => p !== permId);
        return { ...role, permissions: nextPerms };
      }
      return role;
    }));

    startTransition(async () => {
      try {
        await updatePermissionAssignmentAction(roleId, permId, nextState);
        setToast(`Updated ${permId} permission.`);
        setTimeout(() => setToast(null), 3000);
      } catch (err: any) {
        setToast(`Error: ${err.message}`);
      }
    });
  };

  return (
    <div className="space-y-8 w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#ececec]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-black text-white">
              <Lock size={18} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Permissions Matrix</h1>
          </div>
          <p className="text-xs text-slate-500">
            Granular system capability matrix enforcing Principle of Least Privilege across roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/roles"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#ececec] rounded-md bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
          >
            <span>Manage Roles</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#ececec] rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Access Control Model</span>
            <Shield size={16} className="text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">RBAC Enforced</div>
          <p className="text-[11px] text-slate-500">Role-based schema boundaries validated on all server mutations.</p>
        </div>

        <div className="p-4 bg-white border border-[#ececec] rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security Posture</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-600">OWASP Compliant</div>
          <p className="text-[11px] text-slate-500">Explicit denial by default with session cookie encryption.</p>
        </div>

        <div className="p-4 bg-white border border-[#ececec] rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Capabilities</span>
            <Sliders size={16} className="text-indigo-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{SYSTEM_PERMISSIONS.length} Permissions</div>
          <p className="text-[11px] text-slate-500">Granular tokens across {categories.length - 1} operational functional domains.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 border border-[#ececec] rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search permissions or descriptions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-[#ececec] rounded-lg focus:bg-white focus:border-slate-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-black text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-[#ececec]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white border border-[#ececec] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#ececec]">
                <th className="py-3.5 px-4 font-bold text-slate-700 w-1/3">Permission & Capability</th>
                <th className="py-3.5 px-4 font-bold text-slate-700 text-center w-28">
                  <div className="flex flex-col items-center">
                    <span>SUPER_ADMIN</span>
                    <span className="text-[10px] text-emerald-600 font-normal">All-Access</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 font-bold text-slate-700 text-center w-28">
                  <div className="flex flex-col items-center">
                    <span>ADMIN</span>
                    <span className="text-[10px] text-blue-600 font-normal">Management</span>
                  </div>
                </th>
                {localRoles.map((role) => (
                  <th key={role.id} className="py-3.5 px-4 font-bold text-slate-700 text-center min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[110px]">{role.name}</span>
                      <span className="text-[10px] text-indigo-600 font-normal">Custom</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececec]">
              {filteredPermissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{perm.label}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{perm.id}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{perm.description}</div>
                  </td>

                  {/* Super Admin Column: Always Enabled */}
                  <td className="py-3 px-4 text-center bg-slate-50/30">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700" title="Always Granted">
                      <Check size={14} />
                    </span>
                  </td>

                  {/* Standard Admin Column: Enabled for non-destructive root maintenance */}
                  <td className="py-3 px-4 text-center">
                    {!perm.id.startsWith('recycle:purge') ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700" title="Granted for Admin">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="text-slate-300 font-mono text-base">—</span>
                    )}
                  </td>

                  {/* Custom Roles Columns: Interactive Checkboxes */}
                  {localRoles.map((role) => {
                    const isChecked = role.permissions.includes(perm.id);
                    return (
                      <td key={role.id} className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(role.id, perm.id, isChecked)}
                          className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredPermissions.length === 0 && (
                <tr>
                  <td colSpan={3 + localRoles.length} className="py-8 text-center text-slate-400">
                    No permissions match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
