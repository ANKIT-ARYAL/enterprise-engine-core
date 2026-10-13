/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  Shield, Plus, Trash2, Edit3, Check, X, 
  Search, CheckCircle2, AlertCircle, Key, Layers
} from 'lucide-react';
import { 
  createRoleAction, 
  updateRoleAction, 
  deleteRoleAction 
} from '@/app/actions/rbac-actions';
import { SYSTEM_PERMISSIONS } from '@/lib/auth/permissions';

interface RolesAndPermissionsManagerProps {
  initialRoles?: any[];
  customRoles?: any[];
}

export default function RolesAndPermissionsManager({ initialRoles, customRoles }: RolesAndPermissionsManagerProps) {
  const [localRoles, setLocalRoles] = useState<any[]>(customRoles || initialRoles || []);
  const [activeSubTab, setActiveSubTab] = useState<'roles' | 'matrix'>('roles');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  
  // Form fields
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const categories: string[] = ['ALL', ...Array.from(new Set(SYSTEM_PERMISSIONS.map((p: any) => p.category as string)))];

  const filteredPermissions = SYSTEM_PERMISSIONS.filter((p: any) => {
    const matchesSearch = p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
    setModalOpen(true);
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setSelectedPermissions(role.permissions || []);
    setModalOpen(true);
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    try {
      if (editingRole) {
        const res = await updateRoleAction(editingRole.id, {
          name: roleName.trim(),
          description: roleDescription.trim(),
          permissions: selectedPermissions,
        });
        if (res.success && res.role) {
          setLocalRoles(prev => prev.map(r => r.id === editingRole.id ? res.role : r));
          setStatusMessage({ type: 'success', text: `Role "${roleName}" successfully updated!` });
        } else {
          setStatusMessage({ type: 'error', text: (res as any)?.error || 'Failed to update role' });
        }
      } else {
        const res = await createRoleAction({
          name: roleName.trim(),
          description: roleDescription.trim(),
          permissions: selectedPermissions,
        });
        if (res.success && res.role) {
          setLocalRoles(prev => [...prev, res.role]);
          setStatusMessage({ type: 'success', text: `Role "${roleName}" created!` });
        } else {
          setStatusMessage({ type: 'error', text: (res as any)?.error || 'Failed to create role' });
        }
      }
      setModalOpen(false);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch {
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
  };

  const handleDeleteRole = async (role: any) => {
    if (!confirm(`Are you sure you want to permanently delete role "${role.name}"?`)) return;

    try {
      const res = await deleteRoleAction(role.id);
      if (res.success) {
        setLocalRoles(prev => prev.filter(r => r.id !== role.id));
        setStatusMessage({ type: 'success', text: `Role "${role.name}" deleted` });
      } else {
        setStatusMessage({ type: 'error', text: (res as any)?.error || 'Delete operation blocked' });
      }
      setTimeout(() => setStatusMessage(null), 3500);
    } catch {
      setStatusMessage({ type: 'error', text: 'Error deleting role' });
    }
  };

  const handleToggleMatrixPermission = async (roleId: string, permId: string, currentlyGranted: boolean) => {
    const role = localRoles.find(r => r.id === roleId);
    if (!role) return;

    const newPerms = currentlyGranted
      ? (role.permissions || []).filter((p: string) => p !== permId)
      : [...(role.permissions || []), permId];

    // Optimistic update
    setLocalRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: newPerms } : r));

    try {
      const res = await updateRoleAction(role.id, {
        name: role.name,
        description: role.description || '',
        permissions: newPerms,
      });
      if (!res.success) {
        // Rollback
        setLocalRoles(prev => prev.map(r => r.id === roleId ? role : r));
        setStatusMessage({ type: 'error', text: (res as any)?.error || 'Failed to synchronize permission matrix' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      setLocalRoles(prev => prev.map(r => r.id === roleId ? role : r));
      setStatusMessage({ type: 'error', text: 'Matrix update error' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-btn bg-primary text-primary-foreground shadow-xs">
              <Shield size={18} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Roles & Permissions</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure enterprise role hierarchies and allocate granular platform capabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-btn text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>Create New Role</span>
          </button>
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

      {/* Unified Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-btn w-fit border border-border">
        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-btn text-xs font-semibold transition-all ${
            activeSubTab === 'roles'
              ? 'bg-card text-foreground shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers size={14} />
          <span>Configured Roles ({localRoles.length + 3})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-btn text-xs font-semibold transition-all ${
            activeSubTab === 'matrix'
              ? 'bg-card text-foreground shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Key size={14} />
          <span>Permissions Matrix</span>
        </button>
      </div>

      {/* TAB 1: ROLES OVERVIEW */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6 w-full">
          {/* Baseline Built-in System Roles */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              System Built-in Roles (Immutable)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card border border-border rounded-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-sm font-bold text-foreground">SUPER_ADMIN</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">Root</span>
                </div>
                <p className="text-xs text-muted-foreground">Unrestricted system access across all tenants, engine settings, and database tables.</p>
                <div className="text-[11px] font-medium text-muted-foreground pt-1">All {SYSTEM_PERMISSIONS.length} Permissions Active</div>
              </div>

              <div className="p-4 bg-card border border-border rounded-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/70" />
                    <span className="text-sm font-bold text-foreground">ADMIN</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full">Core</span>
                </div>
                <p className="text-xs text-muted-foreground">Operational authority over content, pages, blogs, and media vault management.</p>
                <div className="text-[11px] font-medium text-muted-foreground pt-1">Standard Operational Scope</div>
              </div>

              <div className="p-4 bg-card border border-border rounded-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                    <span className="text-sm font-bold text-foreground">USER</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-muted text-muted-foreground rounded-full">Standard</span>
                </div>
                <p className="text-xs text-muted-foreground">Read-only or restricted access to specific delegated platform workspaces.</p>
                <div className="text-[11px] font-medium text-muted-foreground pt-1">Restricted Access Scope</div>
              </div>
            </div>
          </div>

          {/* Custom Roles Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Custom Assigned Roles ({localRoles.length})
            </h2>

            {localRoles.length === 0 ? (
              <div className="p-8 text-center bg-card border border-dashed border-border rounded-card space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Shield size={20} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">No custom roles created yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Create roles to assign tailored permission sets to team members.
                </p>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover text-xs font-semibold rounded-btn transition-colors shadow-xs"
                >
                  <Plus size={14} /> Create Role
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {localRoles.map(role => (
                  <div key={role.id} className="p-5 bg-card border border-border rounded-card shadow-xs space-y-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{role.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-btn font-semibold">
                            {role.users?.length || 0} users assigned
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{role.description || 'No description configured'}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-btn transition-colors"
                          title="Edit role"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-btn transition-colors"
                          title="Delete role"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Assigned Permissions ({role.permissions.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                        {role.permissions.map((permId: string) => {
                          const p = SYSTEM_PERMISSIONS.find((item: any) => item.id === permId);
                          return (
                            <span 
                              key={permId} 
                              className="text-[10px] px-2 py-0.5 bg-muted text-foreground rounded font-medium flex items-center gap-1"
                            >
                              <Check size={10} className="text-primary" />
                              {p?.label || permId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PERMISSIONS MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4 w-full">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-3 border border-border rounded-card">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search permissions or descriptions..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-btn focus:bg-card focus:border-primary text-foreground outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-btn whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted border border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-card border border-border rounded-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[220px]">Capability & Scope</th>
                    <th className="py-3 px-4 min-w-[120px]">Category</th>
                    <th className="py-3 px-3 text-center min-w-[100px] bg-muted/60">SUPER_ADMIN</th>
                    {localRoles.map(role => (
                      <th key={role.id} className="py-3 px-3 text-center min-w-[110px]">
                        <span className="block truncate max-w-[110px]" title={role.name}>{role.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredPermissions.map((perm: any) => (
                    <tr key={perm.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{perm.label}</div>
                        <div className="text-[11px] text-muted-foreground">{perm.description}</div>
                        <div className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{perm.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          {perm.category}
                        </span>
                      </td>
                      {/* Root role - always active */}
                      <td className="py-3 px-3 text-center bg-muted/30">
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/20 text-primary">
                          <Check size={14} />
                        </div>
                      </td>
                      {/* Custom Roles dynamic toggles */}
                      {localRoles.map(role => {
                        const isGranted = (role.permissions || []).includes(perm.id);
                        return (
                          <td key={role.id + perm.id} className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleMatrixPermission(role.id, perm.id, isGranted)}
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-btn border transition-all ${
                                isGranted 
                                  ? 'bg-primary text-primary-foreground border-primary shadow-xs' 
                                  : 'bg-card border-border text-transparent hover:border-primary/50'
                              }`}
                              title={`Toggle ${perm.label} for ${role.name}`}
                            >
                              <Check size={13} className={isGranted ? 'opacity-100' : 'opacity-0'} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROLE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card rounded-card border border-border shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Custom Role'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Role Name</label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Content Manager, Support Specialist"
                  className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-btn outline-none focus:bg-card focus:border-primary text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  rows={2}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Brief summary of duties and responsibilities..."
                  className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-btn outline-none focus:bg-card focus:border-primary text-foreground resize-none"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Assign Capabilities</label>
                  <span className="text-[11px] text-muted-foreground">
                    {selectedPermissions.length} selected
                  </span>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {Array.from(new Set(SYSTEM_PERMISSIONS.map((p: any) => p.category as string))).map((category: string) => (
                    <div key={category} className="space-y-2">
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {category}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {SYSTEM_PERMISSIONS.filter((p: any) => p.category === category).map((perm: any) => {
                          const isChecked = selectedPermissions.includes(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start gap-2.5 p-2 rounded-btn border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-primary/10 border-primary/40 text-foreground'
                                  : 'bg-card border-border text-muted-foreground hover:bg-muted/40'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-0.5 rounded text-primary accent-[var(--primary)]"
                              />
                              <div>
                                <div className="font-semibold text-foreground">{perm.label}</div>
                                <div className="text-[11px] text-muted-foreground">{perm.description}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-btn transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-btn-bg text-btn-text hover:bg-btn-hover rounded-btn transition-colors shadow-xs"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
