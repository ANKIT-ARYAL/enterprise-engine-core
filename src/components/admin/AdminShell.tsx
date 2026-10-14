/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import QuickAddPanel from '@/components/admin/QuickAddPanel';
import GlobalSearchModal from '@/components/admin/GlobalSearchModal';
import { LogoutButton } from '@/components/ui/action-buttons';
import { 
  Settings, Search, Moon, Sun, User, Plus, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useNavigationPreferences } from '@/hooks/use-navigation-preferences';
import { useThemePreferences } from '@/components/theme/theme-provider';

function NavItem({ link, pathname, isCompact }: { link: any, pathname: string, isCompact?: boolean }) {
  const searchParams = useSearchParams();
  const fullPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
  
  const isActive = pathname.startsWith(link.href) || (link.href === '/admin/academy' && pathname === '/admin');
  const IconComponent = (Icons as any)[link.icon] || Icons.Circle;
  const hasChildren = link.children && link.children.length > 0;
  
  // Auto-expand if active
  const [expanded, setExpanded] = useState(isActive);

  return (
    <div className="space-y-0.5">
      <div className="relative group">
        <Link 
          href={link.href} 
          title={isCompact ? link.label : undefined}
          className={`flex items-center ${isCompact ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'} transition-all text-[13px] font-medium rounded-lg ${
            isActive 
              ? 'bg-primary/15 text-primary font-bold border-l-2 border-primary shadow-xs' 
              : 'text-[var(--sidebar-foreground)] opacity-75 hover:bg-muted/50 hover:opacity-100 hover:text-[var(--sidebar-foreground)]'
          }`}
        >
          <IconComponent size={18} className={isActive ? 'text-primary' : 'opacity-70'} />
          {!isCompact && <span className="flex-1 truncate">{link.label}</span>}
          {!isCompact && hasChildren && (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating when just toggling accordion
                setExpanded(!expanded);
              }}
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${link.label} submenu`}
              className="min-h-6 min-w-6 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <Icons.ChevronDown size={14} className={`opacity-50 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </Link>
      </div>
      
      {!isCompact && hasChildren && expanded && (
        <div className="pl-9 pr-2 space-y-0.5 pb-1 mt-0.5">
          {link.children.map((child: any) => {
            const isChildActive = fullPath === child.href || fullPath.startsWith(child.href + '&');
            return (
              <Link
                key={child.href + child.label}
                href={child.href}
                className={`flex items-center gap-2 px-3 py-1.5 transition-all text-[12px] rounded-md ${
                  isChildActive
                    ? 'text-primary font-bold bg-primary/15 border-l-2 border-primary shadow-xs'
                    : 'text-[var(--sidebar-foreground)] opacity-70 hover:opacity-100 hover:bg-muted/30 font-medium'
                }`}
              >
                {child.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminShell({ children, initialNav, sessionUser }: { children: React.ReactNode, initialNav?: any, sessionUser?: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { navigationMode, setNavigationMode } = useNavigationPreferences();
  const isCompact = navigationMode === 'compact';
  const { mode, setThemeMode } = useThemePreferences();
  // Hydration-safe mounted flag using useSyncExternalStore
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Global search palette shortcut (Cmd+J / Ctrl+J, and Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'j' || e.key === 'J' || e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile sidebar on route change when opened
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setSidebarOpen(prev => (prev ? false : prev));
    }
  }, [pathname, searchParams]);

  // Sidebar toggle handler:
  // - On desktop: Toggles between compact (rail, 68px) and expanded (260px)
  // - On mobile: Toggles mobile drawer
  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(prev => !prev);
    } else {
      setNavigationMode(isCompact ? 'expanded' : 'compact');
    }
  };

  // Do not render the shell for the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Normalize legacy nav to new sections array
  const defaultDashboardLinks = [
    { href: '/admin/default', label: 'Default', icon: 'LayoutDashboard' },
    { href: '/admin/crm', label: 'CRM', icon: 'User' },
    { href: '/admin/finance', label: 'Finance', icon: 'CreditCard' },
    { href: '/admin/academy', label: 'Academy', icon: 'GraduationCap' },
  ];

  const defaultPageLinks = [
    { href: '/admin/email', label: 'Email', icon: 'Mail' },
    { 
      href: '/admin/settings', 
      label: 'System Design Studio', 
      icon: 'Shield',
      children: [
        { href: '/admin/settings?tab=theme-presets', label: 'Theme & Presets' },
        { href: '/admin/settings?tab=design-buttons', label: 'Buttons & Roundness' },
        { href: '/admin/settings?tab=design-cards', label: 'Cards & Surfaces' },
        { href: '/admin/settings?tab=design-animations', label: 'Animations' },
        { href: '/admin/settings?tab=design-container', label: 'Layout & Navigation' },
        { href: '/admin/settings?tab=text-sizes', label: 'Sizes & Fluid Scale' },
        { href: '/admin/settings?tab=comp-form-builder', label: 'Dynamic Form Builder' },
        { href: '/admin/settings?tab=advanced-css', label: 'Custom Scripts & CSS' },
      ]
    },
    { href: '/admin/system-settings', label: 'Settings', icon: 'Settings' },
  ];

  const profileLinks = [
    { href: '/admin/profile', label: 'Profile Settings', icon: 'User' },
    { href: '/admin/settings?tab=theme-presets', label: 'Theme & Appearance', icon: 'Palette' },
  ];

  const normalizedNav = (initialNav?.sections) ? {
    ...initialNav,
    userProfile: {
      type: 'dropdown',
      name: sessionUser?.name || sessionUser?.email?.split('@')[0] || initialNav?.userProfile?.name || 'Admin',
      email: sessionUser?.email || initialNav?.userProfile?.email || '',
      links: profileLinks
    }
  } : {
    sections: [
      { id: 's1', title: 'Dashboards', links: initialNav?.dashboards || defaultDashboardLinks },
      { id: 's2', title: 'Pages', links: initialNav?.pages || defaultPageLinks }
    ],
    promoBox: { enabled: true, title: 'Have something in mind?', description: 'Suggest a feature or discuss custom work with me on 𝕏 or by email.' },
    userProfile: { 
      type: 'dropdown', 
      name: sessionUser?.name || 'Admin', 
      email: sessionUser?.email || '',
      links: profileLinks
    }
  };

  // Ensure the Design Studio submenu remains available even when navigation
  // was customized and persisted before newer studio tabs were added.
  const studioSection = normalizedNav.sections
    .flatMap((section: any) => section.links || [])
    .find((link: any) => link.href === '/admin/settings');
  if (studioSection) {
    studioSection.children = [
      ...(studioSection.children || []).filter((child: any) => child.href !== '/admin/settings?tab=design-animations'),
      { href: '/admin/settings?tab=design-animations', label: 'Animations' },
    ];
  }

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
        fixed lg:static inset-y-0 left-0 z-50 ${isCompact ? 'w-[68px]' : 'w-[260px]'} 
        bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)]
        transform transition-all duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className={`h-16 ${isCompact ? 'px-3 justify-center' : 'px-6'} flex items-center shrink-0`}>
          <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Studio Admin">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-xs font-bold">S</span>
            </div>
            {!isCompact && <h1 className="font-bold text-[15px] tracking-tight text-[var(--sidebar-foreground)] truncate">Studio Admin</h1>}
          </Link>
        </div>
        
        <div className={`${isCompact ? 'px-2' : 'px-4'} py-2 shrink-0`}>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsQuickAddOpen(true)}
              title={isCompact ? "Quick Create" : undefined}
              className={`flex-1 flex items-center justify-center gap-2 ${isCompact ? 'p-2' : 'px-3 py-2'} bg-btn-bg text-btn-text rounded-btn text-sm font-medium hover:bg-btn-hover hover:text-btn-hover-text transition-colors shadow-sm`}
            >
              <Plus size={16} /> {!isCompact && "Quick Create"}
            </button>
          </div>
        </div>

        <nav className={`flex-1 ${isCompact ? 'px-2 space-y-4' : 'px-3 space-y-6'} py-4 overflow-y-auto custom-scrollbar`}>          
          {normalizedNav.sections.map((section: any) => (
            <div key={section.id}>
              {!isCompact && (
                <div className="px-3 mb-2 text-[11px] font-semibold text-[var(--sidebar-foreground)] opacity-60 tracking-wider uppercase truncate">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.links.map((link: any) => (
                  <NavItem key={link.href + link.label} link={link} pathname={pathname} isCompact={isCompact} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className={`${isCompact ? 'p-2' : 'p-4'} shrink-0 relative`}>
          {!isCompact && normalizedNav.promoBox?.enabled && (
            <div className="p-4 bg-card text-card-foreground border border-[var(--sidebar-border)] rounded-xl shadow-xs mb-4">
              <h4 className="text-[13px] font-bold mb-1">{normalizedNav.promoBox.title}</h4>
              <p className="text-[12px] text-muted-foreground mb-1 leading-relaxed">
                {normalizedNav.promoBox.description}
              </p>
            </div>
          )}
          
          {normalizedNav.userProfile?.type !== 'hidden' && (
            <>
              <button 
                onClick={() => normalizedNav.userProfile?.type === 'dropdown' && setProfileDropdownOpen(!profileDropdownOpen)}
                title={isCompact ? normalizedNav.userProfile?.name : undefined}
                className={`w-full flex items-center ${isCompact ? 'justify-center p-2' : 'gap-3 px-2 py-2'} hover:bg-[var(--sidebar-accent)]/50 text-[var(--sidebar-foreground)] rounded-xl transition-colors text-left`}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] overflow-hidden shrink-0 flex items-center justify-center">
                  <User size={16} />
                </div>
                {!isCompact && (
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate text-[var(--sidebar-foreground)]">{normalizedNav.userProfile?.name}</div>
                    <div className="text-[11px] text-[var(--sidebar-foreground)] opacity-60 truncate">{normalizedNav.userProfile?.email}</div>
                  </div>
                )}
                {!isCompact && normalizedNav.userProfile?.type === 'dropdown' && (
                  <Icons.ChevronUp size={14} className={`text-[var(--sidebar-foreground)] opacity-60 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {normalizedNav.userProfile?.type === 'dropdown' && profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute bottom-[72px] left-4 right-4 bg-white border border-[#ececec] rounded-xl shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    {(normalizedNav.userProfile.links || []).map((link: any, idx: number) => {
                      const IconComponent = (Icons as any)[link.icon] || Icons.Circle;
                      return (
                        <Link 
                          key={idx}
                          href={link.href}
                          className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          <IconComponent size={14} className="opacity-70" />
                          {link.label}
                        </Link>
                      );
                    })}
                    
                    <div className="px-2 py-2 mt-1 border-t border-[#ececec]">
                      <LogoutButton 
                        className="w-full"
                        action={async () => {
                          const res = await fetch('/api/auth/logout', { method: 'POST' });
                          if (!res.ok) throw new Error('Logout failed');
                          // Redirect after logout success
                          router.push('/admin/login');
                          router.refresh();
                        }} 
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-card text-card-foreground border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 transition-colors">
          <div className="flex items-center gap-4 flex-1">
            <button 
              type="button"
              onClick={handleToggleSidebar}
              className="min-h-6 min-w-6 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title={
                mounted && typeof window !== 'undefined' && window.innerWidth < 1024
                  ? (sidebarOpen ? "Close menu" : "Open menu")
                  : (isCompact ? "Expand sidebar (Full labels)" : "Compact sidebar (Rail mode)")
              }
              aria-label="Toggle sidebar layout"
            >
              {(mounted && typeof window !== 'undefined' && window.innerWidth < 1024 ? !sidebarOpen : isCompact) 
                ? <PanelLeftOpen size={20} /> 
                : <PanelLeftClose size={20} />
              }
            </button>
            
            {/* Desktop / Tablet Search Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/40 hover:bg-muted/70 border border-border rounded-md max-w-sm w-full transition-all text-left cursor-pointer group"
              title="Global Search (⌘J / ⌘K)"
            >
              <Search size={16} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              <span className="text-[13px] text-muted-foreground group-hover:text-foreground flex-1 truncate transition-colors select-none">
                Search...
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-card border border-border text-muted-foreground shadow-xs">⌘</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-card border border-border text-muted-foreground shadow-xs">J</span>
              </div>
            </button>

            {/* Mobile Search Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title="Search (⌘J)"
            >
              <Search size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/admin/settings" 
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors block"
              title="Design Studio"
            >
              <Settings size={18} />
            </Link>
            <button 
              type="button"
              onClick={() => setThemeMode(mode === 'dark' ? 'light' : 'dark')}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title={mounted ? `Switch to ${mode === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
              aria-label={mounted ? `Switch to ${mode === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
            >
              {mounted && mode === 'dark' ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} />
              )}
            </button>
            <Link 
              href="/admin/profile"
              className="w-8 h-8 rounded-full bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] overflow-hidden ml-2 cursor-pointer border border-border flex items-center justify-center hover:opacity-80 transition-opacity"
              title="Profile"
            >
              <User size={16} />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-surface relative">
          <div className="p-4 sm:p-6 lg:p-8 w-full min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search & Command Palette Modal (⌘J) */}
      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onToggleThemeMode={() => setThemeMode(mode === 'dark' ? 'light' : 'dark')}
        onToggleCompactMode={() => setNavigationMode(isCompact ? 'expanded' : 'compact')}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        isCompact={isCompact}
        themeMode={mode}
      />

      {/* Slide-over Panel for Sidebar Navigation Configuration */}
      <QuickAddPanel 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
        initialNav={initialNav || { dashboards: [], pages: [] }} 
      />
    </div>
  );
}
