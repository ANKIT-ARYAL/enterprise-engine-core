/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useTransition } from 'react';
import { updateSystemSettingsAction } from '@/app/actions/admin-mutations';
import { 
  Settings, Image as ImageIcon, PanelTop, PanelBottom, 
  Save, CheckCircle2, Plus, Trash2, Sparkles, ExternalLink, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface SystemSettingsManagerProps {
  initialSettings: any;
  availablePages: Array<{ id: string; title: string; slug: string }>;
}

export default function SystemSettingsManager({
  initialSettings,
  availablePages = []
}: SystemSettingsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'navbar' | 'footer'>('branding');

  const initialTokens = (initialSettings.tokens as any) || {};

  // Form State
  const [siteName, setSiteName] = useState(initialSettings.siteName || 'Enterprise Engine');
  const [logoUrl, setLogoUrl] = useState(initialTokens.logoUrl || initialTokens.branding?.logoUrl || '');
  const [contactEmail, setContactEmail] = useState(initialTokens.contactEmail || 'admin@enterprise.io');

  // Navbar State
  const [navbar, setNavbar] = useState({
    selectedPageSlugs: initialTokens.navbar?.selectedPageSlugs || ['home', 'faq', 'blogs', 'about-us'],
    ctaText: initialTokens.navbar?.ctaText || 'Get Started',
    ctaLink: initialTokens.navbar?.ctaLink || '/admin/login',
    showCta: initialTokens.navbar?.showCta !== false,
  });

  // Footer State
  const [footer, setFooter] = useState({
    bgColor: initialTokens.footer?.bgColor || '#ffffff',
    textColor: initialTokens.footer?.textColor || '#0f172a',
    description: initialTokens.footer?.description || 'Modular, high-performance web architecture engineered for scale and speed.',
    copyright: initialTokens.footer?.copyright || '© 2026 Enterprise Engine. All rights reserved.',
    socials: initialTokens.footer?.socials || [
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'github', url: 'https://github.com' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'youtube', url: 'https://youtube.com' }
    ]
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTokens = {
      ...initialTokens,
      logoUrl: logoUrl.trim(),
      contactEmail: contactEmail.trim(),
      branding: {
        ...(initialTokens.branding || {}),
        logoUrl: logoUrl.trim(),
      },
      navbar,
      footer
    };

    startTransition(async () => {
      await updateSystemSettingsAction({
        siteName: siteName.trim(),
        customCss: initialSettings.customCss || '',
        tokens: updatedTokens
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    });
  };

  const sampleLogos = [
    { label: 'Next.js', url: 'https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon.png' },
    { label: 'Minimal Arc', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80' },
    { label: 'Geometric Core', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60' }
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6 w-full pb-24">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-btn bg-primary text-primary-foreground shadow-xs">
              <Settings size={18} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">System Settings</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure global site branding, logo, navigation bar, and universal footer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-border rounded-btn bg-card hover:bg-muted text-foreground transition-colors shadow-xs"
          >
            <span>Live Site</span>
            <ExternalLink size={13} />
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-btn-bg text-btn-text hover:bg-btn-hover rounded-btn transition-all shadow-xs disabled:opacity-50"
          >
            {isPending ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={14} className="text-primary-foreground" />
                <span>Saved & Deployed!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {success && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-card flex items-center gap-3 text-foreground text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-primary shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">System settings synchronized!</span> All changes to branding, logo, navbar, and footer are live and cached across public routes.
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'branding'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon size={15} />
          <span>Branding & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('navbar')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'navbar'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <PanelTop size={15} />
          <span>Navigation Bar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'footer'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <PanelBottom size={15} />
          <span>Footer & Socials</span>
        </button>
      </div>

      {/* TAB 1: BRANDING & LOGO */}
      {activeTab === 'branding' && (
        <div className="space-y-6 w-full animate-in fade-in">
          {/* Site Identification Card */}
          <div className="bg-card border border-border rounded-card p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              General Brand Identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Site Name / Platform Title
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-btn focus:bg-card focus:border-primary text-foreground outline-none transition-colors font-medium"
                  placeholder="e.g. xyz"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Used for browser titles and auto-generates team login emails as <code className="text-foreground font-semibold">&lt;role&gt;@{siteName.trim().toLowerCase().replace(/[^a-z0-9.-]/g, '') || 'xyz'}.com</code> (e.g. <code className="text-foreground font-semibold">admin@{siteName.trim().toLowerCase().replace(/[^a-z0-9.-]/g, '') || 'xyz'}.com</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Admin Support Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-btn focus:bg-card focus:border-primary text-foreground outline-none transition-colors"
                  placeholder="e.g. contact@domain.com"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Primary contact address for inquiries and system notifications.
                </p>
              </div>
            </div>
          </div>

          {/* Logo Customization Card */}
          <div className="bg-card border border-border rounded-card p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon size={16} className="text-primary" />
                  Site Logo Management
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set a custom logo image for your public navigation bar and footer.
                </p>
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  Reset to Text Badge
                </button>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-foreground">
                Logo Image URL (PNG, SVG, JPG, WebP)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-btn focus:bg-card focus:border-primary text-foreground outline-none font-mono text-xs transition-colors"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Provide an absolute URL to a hosted logo image or SVG icon. Transparent backgrounds are recommended.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Quick Preset Examples:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleLogos.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLogoUrl(sample.url)}
                    className="px-2.5 py-1 text-xs border border-border rounded-btn bg-muted/30 hover:bg-muted text-foreground transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Logo Preview Box */}
            <div className="border border-border rounded-card p-5 bg-muted/20 space-y-4">
              <span className="text-xs font-bold text-foreground tracking-wider uppercase block">
                Live Rendering Preview
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Light Background Preview */}
                <div className="p-4 rounded-btn bg-card border border-border flex flex-col items-center justify-center min-h-[100px] text-center space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Light Mode Background</span>
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt="Logo preview light"
                      className="h-9 max-w-[180px] object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><rect width="100" height="30" fill="%23fee2e2"/><text x="50" y="20" fill="%23dc2626" font-size="10" text-anchor="middle">Broken Image URL</text></svg>';
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm">
                        {siteName.charAt(0) || 'E'}
                      </span>
                      <span className="font-bold text-sm text-foreground">{siteName}</span>
                    </div>
                  )}
                </div>

                {/* Dark Background Preview */}
                <div className="p-4 rounded-btn bg-slate-900 border border-slate-800 flex flex-col items-center justify-center min-h-[100px] text-center space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Dark Mode Background</span>
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt="Logo preview dark"
                      className="h-9 max-w-[180px] object-contain rounded"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm">
                        {siteName.charAt(0) || 'E'}
                      </span>
                      <span className="font-bold text-sm text-white">{siteName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NAVBAR NAVIGATION */}
      {activeTab === 'navbar' && (
        <div className="space-y-6 w-full animate-in fade-in">
          <div className="bg-card border border-border rounded-card p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <PanelTop size={16} className="text-primary" />
                Public Navbar Pages & Links
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose which pages appear as primary links in the universal public header.
              </p>
            </div>

            {/* Page selection checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Select Published Pages:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const allSlugs = availablePages.map(p => p.slug);
                    const allSelected = allSlugs.every(s => navbar.selectedPageSlugs.includes(s));
                    setNavbar(prev => ({
                      ...prev,
                      selectedPageSlugs: allSelected ? [] : allSlugs
                    }));
                  }}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Toggle All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {availablePages.map((page) => {
                  const isChecked = navbar.selectedPageSlugs.includes(page.slug);

                  return (
                    <label
                      key={page.id}
                      className={`flex items-center gap-3 p-3.5 rounded-btn border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-primary/10 border-primary/40 text-foreground shadow-xs'
                          : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...navbar.selectedPageSlugs, page.slug]
                            : navbar.selectedPageSlugs.filter((s: string) => s !== page.slug);
                          setNavbar(prev => ({ ...prev, selectedPageSlugs: updated }));
                        }}
                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-[var(--primary)]"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs text-foreground truncate">{page.title}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">/{page.slug}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* CTA Button Configuration */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Navbar Call To Action (CTA) Button
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Button Text</label>
                  <input
                    type="text"
                    value={navbar.ctaText}
                    onChange={(e) => setNavbar(prev => ({ ...prev, ctaText: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-btn focus:bg-card focus:border-primary text-foreground outline-none"
                    placeholder="e.g. Get Started"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Button Link Target</label>
                  <input
                    type="text"
                    value={navbar.ctaLink}
                    onChange={(e) => setNavbar(prev => ({ ...prev, ctaLink: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-btn focus:bg-card focus:border-primary text-foreground outline-none"
                    placeholder="e.g. /admin/login or /contact"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="showCtaToggle"
                  checked={navbar.showCta}
                  onChange={(e) => setNavbar(prev => ({ ...prev, showCta: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-[var(--primary)]"
                />
                <label htmlFor="showCtaToggle" className="text-xs font-medium text-foreground cursor-pointer">
                  Display CTA button on desktop and tablet views
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOOTER & SOCIALS */}
      {activeTab === 'footer' && (
        <div className="space-y-6 w-full animate-in fade-in">
          <div className="bg-card border border-border rounded-card p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <PanelBottom size={16} className="text-primary" />
                Universal Footer Settings
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize styling, brand description, copyright statement, and social profiles.
              </p>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Footer Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-btn bg-muted/30">
                  <label className="text-xs font-semibold text-foreground">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={footer.bgColor}
                      onChange={(e) => setFooter(prev => ({ ...prev, bgColor: e.target.value }))}
                      className="w-20 px-2 py-1 text-xs font-mono border border-border rounded bg-card text-foreground text-center uppercase"
                    />
                    <input
                      type="color"
                      value={footer.bgColor.startsWith('#') ? footer.bgColor : '#ffffff'}
                      onChange={(e) => setFooter(prev => ({ ...prev, bgColor: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-btn bg-muted/30">
                  <label className="text-xs font-semibold text-foreground">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={footer.textColor}
                      onChange={(e) => setFooter(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-20 px-2 py-1 text-xs font-mono border border-border rounded bg-card text-foreground text-center uppercase"
                    />
                    <input
                      type="color"
                      value={footer.textColor.startsWith('#') ? footer.textColor : '#0f172a'}
                      onChange={(e) => setFooter(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Bio & Copyright */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Brand Details & Copy</h3>
              
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Footer Brand Summary / Bio</label>
                <textarea
                  rows={3}
                  value={footer.description}
                  onChange={(e) => setFooter(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-btn focus:bg-card focus:border-primary text-foreground outline-none resize-none"
                  placeholder="Short branding summary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Copyright Statement</label>
                <input
                  type="text"
                  value={footer.copyright}
                  onChange={(e) => setFooter(prev => ({ ...prev, copyright: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-btn focus:bg-card focus:border-primary text-foreground outline-none"
                  placeholder="e.g. © 2026 Company. All rights reserved."
                />
              </div>
            </div>

            {/* Social Media Profiles */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Social Media Profiles
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setFooter(prev => ({
                      ...prev,
                      socials: [...prev.socials, { platform: 'twitter', url: 'https://' }]
                    }));
                  }}
                  className="text-xs flex items-center gap-1 font-bold text-primary hover:underline"
                >
                  <Plus size={14} /> Add Profile
                </button>
              </div>

              <div className="space-y-3">
                {footer.socials.map((s: { platform: string; url: string }, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-btn border border-border">
                    <select
                      value={s.platform}
                      onChange={(e) => {
                        const newSocials = [...footer.socials];
                        newSocials[idx].platform = e.target.value;
                        setFooter(prev => ({ ...prev, socials: newSocials }));
                      }}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-btn border border-border bg-card text-foreground outline-none"
                    >
                      <option value="twitter">Twitter / X</option>
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="globe">Custom Website</option>
                    </select>

                    <input
                      type="url"
                      value={s.url}
                      onChange={(e) => {
                        const newSocials = [...footer.socials];
                        newSocials[idx].url = e.target.value;
                        setFooter(prev => ({ ...prev, socials: newSocials }));
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-btn border border-border bg-card text-foreground outline-none font-mono"
                      placeholder="https://..."
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const newSocials = [...footer.socials];
                        newSocials.splice(idx, 1);
                        setFooter(prev => ({ ...prev, socials: newSocials }));
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
