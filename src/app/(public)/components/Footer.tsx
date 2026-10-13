/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { getCachedSystemSettings, getCachedPages } from '@/lib/db/queries';
import { Globe } from 'lucide-react';

export default async function Footer() {
  const settings = await getCachedSystemSettings();
  const allPages = await getCachedPages();

  const tokens = (settings?.tokens as any) || {};
  const siteName = settings?.siteName || 'Enterprise Engine';
  const logoUrl = tokens.logoUrl || tokens.branding?.logoUrl;
  
  // Footer configuration
  const footerConfig = tokens.footer || {};
  const bgColor = footerConfig.bgColor || 'var(--card-bg, #ffffff)';
  const textColor = footerConfig.textColor || 'inherit';
  const description = footerConfig.description || 'Modular, high-performance web architecture engineered for scale and speed.';
  const copyright = footerConfig.copyright || `© 2026 ${siteName}. All rights reserved.`;

  // Social Links
  const socials = (footerConfig.socials as { platform: string; url: string }[]) || [
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'github', url: 'https://github.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'youtube', url: 'https://youtube.com' }
  ];

  const renderSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    switch (p) {
      case 'twitter':
      case 'x':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      default:
        return <Globe size={18} />;
    }
  };

  return (
    <footer 
      style={{ backgroundColor: bgColor, color: textColor }}
      className="border-t border-[color:var(--card-border)] transition-colors mt-auto"
    >
      <div className="universal-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight text-[color:var(--text-main)]">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={siteName} className="h-8 max-w-[160px] object-contain rounded-md" />
              ) : (
                <span className="w-8 h-8 rounded-lg bg-[color:var(--accent)] text-white flex items-center justify-center font-black text-base shadow-sm">
                  {siteName.charAt(0)}
                </span>
              )}
              <span>{siteName}</span>
            </Link>
            <p className="text-sm opacity-75 max-w-sm leading-relaxed">
              {description}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socials.filter(s => s.url).map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-[color:var(--card-border)] bg-black/5 hover:bg-[color:var(--accent)] hover:text-white hover:border-[color:var(--accent)] transition-all flex items-center justify-center text-[color:var(--text-muted)]"
                  title={s.platform}
                >
                  {renderSocialIcon(s.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Pages Navigation */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase mb-4 text-[color:var(--text-main)]">Navigation</h4>
            <ul className="space-y-2.5 text-sm opacity-80">
              {allPages.map((page) => {
                const href = page.slug === 'home' || page.slug === 'homepage' ? '/' : `/${page.slug}`;
                return (
                  <li key={page.id}>
                    <Link href={href} className="hover:text-[color:var(--accent)] transition-colors">
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* System & Support Links */}
          <div>
            <h4 className="font-bold text-sm tracking-wider uppercase mb-4 text-[color:var(--text-main)]">Portal & Resources</h4>
            <ul className="space-y-2.5 text-sm opacity-80">
              <li>
                <Link href="/admin/login" className="hover:text-[color:var(--accent)] transition-colors">
                  Studio Admin
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[color:var(--accent)] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-[color:var(--accent)] transition-colors">
                  Articles & Insights
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[color:var(--card-border)]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-60">
          <p>{copyright}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:opacity-100 hover:text-[color:var(--accent)] transition-all">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:opacity-100 hover:text-[color:var(--accent)] transition-all">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
