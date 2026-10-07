'use client';

import React, { useState, useTransition } from 'react';
import { X, Plus, Trash2, Save, Menu } from 'lucide-react';
import { updateNavigationAction } from '@/app/actions/update-navigation-action';

export default function QuickAddPanel({ 
  isOpen, 
  onClose, 
  initialNav 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  initialNav: any 
}) {
  const [navState, setNavState] = useState(initialNav);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  async function handleSave() {
    startTransition(async () => {
      await updateNavigationAction(navState);
      onClose();
    });
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#fdfdfd] border-l border-[#ececec] shadow-2xl z-[100] flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
      <div className="h-16 px-6 border-b border-[#ececec] flex items-center justify-between shrink-0 bg-white">
        <h2 className="font-bold text-[15px] flex items-center gap-2">
          <Menu size={16} className="text-primary" /> Edit Sidebar Navigation
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Dashboards Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider opacity-60">Dashboards</h3>
            <button 
              type="button" 
              onClick={() => {
                setNavState({
                  ...navState,
                  dashboards: [...(navState.dashboards || []), { label: 'New Link', href: '/admin/new', icon: 'LayoutDashboard' }]
                });
              }}
              className="text-[10px] flex items-center gap-1 font-medium bg-black/5 hover:bg-black/10 px-2 py-1 rounded"
            >
              <Plus size={12} /> Add Link
            </button>
          </div>
          
          <div className="space-y-2">
            {((navState.dashboards) || []).map((link: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#ececec] shadow-sm">
                <input 
                  type="text" 
                  value={link.label} 
                  onChange={(e) => {
                    const newNav = { ...navState };
                    newNav.dashboards[idx].label = e.target.value;
                    setNavState(newNav);
                  }}
                  className="w-1/3 px-2 py-1.5 text-xs border border-transparent rounded bg-black/5 focus:bg-white focus:border-card-border outline-none transition-colors" 
                  placeholder="Label"
                />
                <input 
                  type="text" 
                  value={link.href} 
                  onChange={(e) => {
                    const newNav = { ...navState };
                    newNav.dashboards[idx].href = e.target.value;
                    setNavState(newNav);
                  }}
                  className="w-1/3 px-2 py-1.5 text-xs border border-transparent rounded bg-black/5 focus:bg-white focus:border-card-border outline-none transition-colors" 
                  placeholder="URL path"
                />
                <input 
                  type="text" 
                  value={link.icon} 
                  onChange={(e) => {
                    const newNav = { ...navState };
                    newNav.dashboards[idx].icon = e.target.value;
                    setNavState(newNav);
                  }}
                  className="w-1/4 px-2 py-1.5 text-xs border border-transparent rounded bg-black/5 focus:bg-white focus:border-card-border outline-none transition-colors" 
                  placeholder="Icon"
                />
                <button 
                  type="button" 
                  onClick={() => {
                    const newNav = { ...navState };
                    newNav.dashboards.splice(idx, 1);
                    setNavState(newNav);
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pages Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider opacity-60">Pages</h3>
            <button 
              type="button" 
              onClick={() => {
                setNavState({
                  ...navState,
                  pages: [...(navState.pages || []), { label: 'New Page', href: '/admin/new-page', icon: 'FileText' }]
                });
              }}
              className="text-[10px] flex items-center gap-1 font-medium bg-black/5 hover:bg-black/10 px-2 py-1 rounded"
            >
              <Plus size={12} /> Add Link
            </button>
          </div>
          
          <div className="space-y-2">
            {((navState.pages) || []).map((link: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#ececec] shadow-sm">
                <input 
                  type="text" 
                  value={link.label} 
                  onChange={(e) => {
                    const newNav = { ...navState };
                    newNav.pages[idx].label = e.target.value;
                    setNavState(newNav);
                  }}
                  className="w-1/3 px-2 py-1.5 text-xs border border-transparent rounded bg-black/5 focus:bg-white focus:border-card-border outline-none transition-colors" 
                  placeholder="Label"
                />
                <input 
                  type="text" 
                  value={link.href} 
                  onChange={(e) => {
                    const newNav = { ...navState };
                    newNav.pages[idx].href = e.target.value;
                    setNavState(newNav);
                  }}
                  className="w-1/3 px-2 py-1.5 text-xs border border-transparent rounded bg-black/5 focus:bg-white focus:border-card-border outline-none transition-colors" 
                  placeholder="URL path"
                />
                <input 
                  type="text" 
                  value={link.icon} 
                  onChange={(e) => {
                    const newNav = { ...navState };
                    newNav.pages[idx].icon = e.target.value;
                    setNavState(newNav);
                  }}
                  className="w-1/4 px-2 py-1.5 text-xs border border-transparent rounded bg-black/5 focus:bg-white focus:border-card-border outline-none transition-colors" 
                  placeholder="Icon"
                />
                <button 
                  type="button" 
                  onClick={() => {
                    const newNav = { ...navState };
                    newNav.pages.splice(idx, 1);
                    setNavState(newNav);
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-[#ececec] bg-white">
        <button 
          onClick={handleSave}
          disabled={isPending}
          className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-btn-bg text-btn-text text-sm font-semibold rounded-btn hover:bg-btn-hover transition-colors shadow-lg disabled:opacity-70"
        >
          <Save size={16} /> {isPending ? 'Saving...' : 'Save Navigation'}
        </button>
      </div>
    </div>
  );
}
