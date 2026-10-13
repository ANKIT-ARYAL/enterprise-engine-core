/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { getCachedSystemSettings, getCachedPages } from '@/lib/db/queries';

export default async function Navbar() {
  const settings = await getCachedSystemSettings();
  const allPages = await getCachedPages();

  const tokens = (settings?.tokens as any) || {};
  const siteName = settings?.siteName || 'Enterprise Engine';
  const logoUrl = tokens.logoUrl || tokens.branding?.logoUrl;
  
  // Custom navbar config from tokens
  const navbarConfig = tokens.navbar || {};
  const selectedSlugs = navbarConfig.selectedPageSlugs as string[] | undefined;
  const customLinks = (navbarConfig.customLinks as { label: string; href: string }[]) || [];
  const ctaText = navbarConfig.ctaText || 'Get Started';
  const ctaLink = navbarConfig.ctaLink || '/admin/login';
  const showCta = navbarConfig.showCta !== false;

  // If specific slugs are selected in admin, filter them; otherwise default to main pages
  const navPages = selectedSlugs 
    ? allPages.filter(p => selectedSlugs.includes(p.slug))
    : allPages.filter(p => ['home', 'faq', 'blogs'].includes(p.slug));

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[color:var(--bg-body)]/85 border-b border-[color:var(--card-border)] transition-all">
      <div className="universal-container flex h-16 items-center justify-between">
        {/* Brand Logo / Site Name */}
        <div className="flex items-center gap-6">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navPages.map((page) => {
              const href = page.slug === 'home' || page.slug === 'homepage' ? '/' : `/${page.slug}`;
              return (
                <Link
                  key={page.id}
                  href={href}
                  className="px-3.5 py-1.5 text-sm font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-black/5 rounded-md transition-colors"
                >
                  {page.title}
                </Link>
              );
            })}

            {/* Any extra custom links configured in admin */}
            {customLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="px-3.5 py-1.5 text-sm font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-black/5 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* CTA & Actions */}
        <div className="flex items-center gap-3">
          {showCta && (
            <Link
              href={ctaLink}
              className="motion-target-button px-5 py-2 text-sm font-bold bg-btn-bg text-btn-text rounded-btn shadow-sm hover:bg-btn-hover transition-colors"
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
