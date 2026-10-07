'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Settings, Image as ImageIcon, Trash2, Box } from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Do not render the shell for the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navLinks = [
    { href: '/admin/pages', label: 'Pages & Sections', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products (40k)', icon: Box },
    { href: '/admin/media', label: 'Media Vault', icon: ImageIcon },
    { href: '/admin/settings', label: 'System Design', icon: Settings },
    { href: '/admin/recycle-bin', label: 'Recycle Bin', icon: Trash2 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-surface-text font-sans">
      
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="xl:hidden fixed top-4 left-4 z-50 p-2 bg-card-bg border border-card-border rounded-lg shadow-sm"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 xl:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed xl:static inset-y-0 left-0 z-50 w-72 bg-card-bg border-r border-card-border 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">Admin Shell</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enterprise Engine</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="xl:hidden p-2 text-slate-500">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <a 
                key={link.href} 
                href={link.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-btn transition-all font-medium ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'opacity-70 hover:opacity-100 hover:bg-black/5'
                }`}
              >
                <Icon size={20} />
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="p-6 border-t border-card-border">
          <form action="/api/auth/logout" method="POST">
            <button className="w-full py-2.5 px-4 bg-btn-bg text-btn-text rounded-btn font-medium hover:bg-btn-hover-bg transition-colors shadow-sm">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto xl:ml-0 relative w-full pb-20 xl:pb-0">
        <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-8 md:p-12 mt-14 xl:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
