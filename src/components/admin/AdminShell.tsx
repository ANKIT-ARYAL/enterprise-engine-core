'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { 
  Menu, X, LayoutDashboard, Settings, Image as ImageIcon, Trash2, Box, 
  Search, Bell, Moon, User, Plus, Mail, CreditCard, 
  PieChart, Activity, ShoppingCart, GraduationCap, Truck, Server, FileText, ActivitySquare,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

export default function AdminShell({ children, initialNav }: { children: React.ReactNode, initialNav?: any }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Do not render the shell for the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const defaultDashboardLinks = [
    { href: '/admin/default', label: 'Default', icon: 'LayoutDashboard' },
    { href: '/admin/crm', label: 'CRM', icon: 'User' },
    { href: '/admin/finance', label: 'Finance', icon: 'CreditCard' },
    { href: '/admin/academy', label: 'Academy', icon: 'GraduationCap' },
  ];

  const defaultPageLinks = [
    { href: '/admin/email', label: 'Email', icon: 'Mail' },
    { href: '/admin/settings', label: 'System Design', icon: 'Settings' },
  ];

  const dashboards = initialNav?.dashboards || defaultDashboardLinks;
  const pages = initialNav?.pages || defaultPageLinks;

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-surface-text font-sans">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#fdfdfd] border-r border-[#ececec] 
        transform transition-all duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0 ml-0' : '-translate-x-full lg:translate-x-0 lg:-ml-[260px]'}
      `}>
        <div className="h-16 px-6 flex items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <h1 className="font-bold text-[15px] tracking-tight">Studio Admin</h1>
          </div>
        </div>
        
        <div className="px-4 py-2 shrink-0">
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1a1a1a] text-white rounded-md text-sm font-medium hover:bg-black transition-colors shadow-sm">
              <Plus size={16} /> Quick Create
            </button>
            <button className="px-3 py-2 border border-[#ececec] rounded-md text-slate-600 hover:bg-slate-50 transition-colors">
              <Mail size={16} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 tracking-wider">Dashboards</div>
            <div className="space-y-0.5">
              {dashboards.map((link: any) => {
                const isActive = pathname.startsWith(link.href) || (link.href === '/admin/academy' && pathname === '/admin');
                const IconComponent = (Icons as any)[link.icon] || Icons.Circle;
                return (
                  <a 
                    key={link.href} 
                    href={link.href} 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] font-medium ${
                      isActive 
                        ? 'bg-slate-100/80 text-slate-900' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent size={16} className={isActive ? 'text-slate-900' : 'text-slate-500'} />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 tracking-wider">Pages</div>
            <div className="space-y-0.5">
              {pages.map((link: any) => {
                const isActive = pathname.startsWith(link.href);
                const IconComponent = (Icons as any)[link.icon] || Icons.Circle;
                return (
                  <a 
                    key={link.href} 
                    href={link.href} 
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] font-medium ${
                      isActive 
                        ? 'bg-slate-100/80 text-slate-900' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent size={16} className={isActive ? 'text-slate-900' : 'text-slate-500'} />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 shrink-0">
          <div className="p-4 bg-white border border-[#ececec] rounded-xl shadow-sm mb-4">
            <h4 className="text-[13px] font-bold mb-1">Have something in mind?</h4>
            <p className="text-[12px] text-slate-500 mb-1 leading-relaxed">
              Suggest a feature or discuss custom work with me on <span className="font-semibold text-slate-700">𝕏</span> or by email.
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
              {/* Profile placeholder */}
              <div className="w-full h-full bg-slate-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">Arham Khan</div>
              <div className="text-[11px] text-slate-500 truncate">hello@arhamkhnz.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#ececec] flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-[#ececec] rounded-md max-w-sm w-full transition-colors focus-within:bg-white focus-within:border-slate-300">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-[13px] w-full placeholder:text-slate-400"
              />
              <div className="flex items-center gap-1 shrink-0">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white border border-[#ececec] text-slate-500 shadow-sm">⌘</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white border border-[#ececec] text-slate-500 shadow-sm">J</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors">
              <Settings size={18} />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors">
              <Moon size={18} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ml-2 cursor-pointer border border-[#ececec]">
              <div className="w-full h-full bg-slate-300"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface relative">
          <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
