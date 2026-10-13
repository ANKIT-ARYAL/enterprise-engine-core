/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useTransition } from 'react';
import { 
  Users, Plus, Shield, ShieldCheck, Key, 
  Trash2, Edit3, X, CheckCircle2, Lock, Sparkles, RefreshCw
} from 'lucide-react';
import { createRoleAction, updateRoleAction, deleteRoleAction } from '@/app/actions/rbac-actions';
import { SYSTEM_PERMISSIONS } from '@/lib/auth/permissions';

interface RolesManagerProps {
  customRoles: Array<{
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
    users: Array<{ id: string; email: string; name: string | null }>;
  }>;
}

export default function RolesManager({ customRoles = [] }: RolesManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const openCreateModal = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setSelectedPermissions(['content:create', 'content:edit', 'media:upload']);
    setModalOpen(true);
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || '');
    setSelectedPermissions(role.permissions || []);
    setModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        if (editingRole) {
          await updateRoleAction(editingRole.id, {
            name: name.trim(),
            description: description.trim(),
            permissions: selectedPermissions,
          });
          setStatusMessage({ text: `Role "${name}" updated successfully.`, type: 'success' });
        } else {
          await createRoleAction({
            name: name.trim(),
            description: description.trim(),
            permissions: selectedPermissions,
          });
          setStatusMessage({ text: `Role "${name}" created successfully.`, type: 'success' });
        }
        setModalOpen(false);
        setTimeout(() => setStatusMessage(null), 4000);
      } catch (err: any) {
        setStatusMessage({ text: err.message || 'Operation failed', type: 'error' });
      }
    });
  };

  const handleDeleteRole = async (role: any) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;

    startTransition(async () => {
      try {
        await deleteRoleAction(role.id);
        setStatusMessage({ text: `Role "${role.name}" deleted.`, type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      } catch (err: any) {
        setStatusMessage({ text: err.message || 'Failed to delete role', type: 'error' });
      }
    });
  };

  // Group system permissions by category
  const categories = Array.from(new Set(SYSTEM_PERMISSIONS.map(p => p.category)));

  return (
    <div className="space-y-8 w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#ececec]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-black text-white">
              <Users size={18} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Roles Management</h1>
          </div>
          <p className="text-xs text-slate-500">
            Define role boundaries, manage access tiers, and grant granular platform capabilities.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus size={15} />
          <span>Create New Role</span>
        </button>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm animate-in fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Built-in System Roles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-blue-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Engine Roles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-[#ececec] rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" /> SUPER_ADMIN
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Root Tier</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full unconstrained access to all schemas, edge deployment pipelines, API credentials, and administrative controls.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400">
              Permissions: <span className="font-semibold text-slate-700">Wildcard (*)</span>
            </div>
          </div>

          <div className="p-5 bg-white border border-[#ececec] rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Shield size={16} className="text-blue-500" /> ADMIN
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Management</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standard administrative team access for managing content, media files, blogs, FAQs, and design studio styling.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400">
              Permissions: <span className="font-semibold text-slate-700">Standard Management Suite</span>
            </div>
          </div>

          <div className="p-5 bg-white border border-[#ececec] rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Lock size={16} className="text-slate-400" /> USER
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Base</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Default role for frontend platform users. Restricted to public pages and client dashboard views.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400">
              Permissions: <span className="font-semibold text-slate-700">Read-Only Public</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Roles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Custom Project Roles</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{customRoles.length} Defined</span>
        </div>

        {customRoles.length === 0 ? (
          <div className="p-12 bg-white border border-dashed border-[#ececec] rounded-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Key size={18} />
            </div>
            <h3 className="font-semibold text-sm text-slate-800">No Custom Roles Created</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create custom roles to grant specific team members targeted permissions like Content Editor, SEO Specialist, or Billing Auditor.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus size={14} /> Create First Role
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customRoles.map((role) => (
              <div 
                key={role.id} 
                className="p-5 bg-white border border-[#ececec] rounded-xl shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{role.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{role.description || 'No description provided.'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold shrink-0">
                      {role.users.length} {role.users.length === 1 ? 'User' : 'Users'}
                    </span>
                  </div>

                  {/* Permissions tags */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Assigned Capabilities ({role.permissions.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.slice(0, 6).map((perm) => (
                        <span key={perm} className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-100">
                          {perm}
                        </span>
                      ))}
                      {role.permissions.length > 6 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-semibold">
                          +{role.permissions.length - 6} more
                        </span>
                      )}
                      {role.permissions.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ececec]">
                  <button
                    onClick={() => openEditModal(role)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#ececec] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#ececec] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Custom Role'}
                </h3>
                <p className="text-xs text-slate-500">Configure role identity and assign specific security permissions.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRole} className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Content Editor"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-[#ececec] rounded-lg focus:bg-white focus:border-slate-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of duties and access level"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-[#ececec] rounded-lg focus:bg-white focus:border-slate-400 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Permissions Selector */}
              <div className="space-y-4 pt-2 border-t border-[#ececec]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Assign System Capabilities</h4>
                    <p className="text-[11px] text-slate-400">Select privileges granted to users with this role.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions(SYSTEM_PERMISSIONS.map(p => p.id))}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      className="text-xs text-slate-500 hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {categories.map((category) => (
                    <div key={category} className="space-y-2">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{category}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SYSTEM_PERMISSIONS.filter(p => p.category === category).map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-blue-50/70 border-blue-300 text-slate-900'
                                  : 'bg-slate-50/50 border-[#ececec] text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold">{perm.label}</span>
                                <span className="text-[10px] text-slate-400 leading-tight">{perm.description}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#ececec] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !name.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isPending && <RefreshCw size={13} className="animate-spin" />}
                  <span>{editingRole ? 'Update Role' : 'Create Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
