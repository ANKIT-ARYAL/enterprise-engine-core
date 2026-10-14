import { notFound } from 'next/navigation';
import { getCachedPagePayload, getCachedSystemSettings } from '@/lib/db/queries';
import Hero from '../components/Hero';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

export default async function ContactUsPage() {
  const page = await getCachedPagePayload('contact-us');
  const settings = await getCachedSystemSettings();

  if (!page || !page.isPublished) {
    notFound();
  }

  const heroData = page.sections.find((s) => s.type === 'HERO')?.content as Record<string, string> | undefined;
  const tokens = (settings.tokens as { contactEmail?: string; contactDetails?: { email?: string } }) || {};
  const supportEmail = tokens.contactEmail || tokens.contactDetails?.email || 'support@enterprise.io';

  return (
    <main className="min-h-screen pb-20">
      {heroData && (
        <Hero 
          badge={heroData.badge || 'Contact & Support'}
          title={heroData.title || 'Get in Touch with Our Team'}
          subtitle={heroData.subtitle || 'We are here to answer questions, explore custom architectures, and scale your systems.'}
          primaryCtaText={heroData.primaryCtaText || 'Send Email'}
          primaryCtaLink={heroData.primaryCtaLink || `mailto:${supportEmail}`}
        />
      )}

      {/* Contact Channels Grid */}
      <section className="universal-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="p-6 rounded-card border border-[color:var(--card-border)] bg-[color:var(--card-bg)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[color:var(--primary)]/10 text-[color:var(--primary)] flex items-center justify-center font-bold">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-lg text-[color:var(--text-main)]">Email Support</h3>
            <p className="text-sm text-[color:var(--text-muted)]">Direct communication with our platform engineering lead.</p>
            <a href={`mailto:${supportEmail}`} className="text-sm font-semibold text-[color:var(--primary)] hover:underline block pt-2">
              {supportEmail}
            </a>
          </div>

          <div className="p-6 rounded-card border border-[color:var(--card-border)] bg-[color:var(--card-bg)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[color:var(--primary)]/10 text-[color:var(--primary)] flex items-center justify-center font-bold">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-lg text-[color:var(--text-main)]">Direct Hotline</h3>
            <p className="text-sm text-[color:var(--text-muted)]">Enterprise client operations and high-priority escalation.</p>
            <span className="text-sm font-semibold text-[color:var(--text-main)] block pt-2">
              +1 (800) 555-0199
            </span>
          </div>

          <div className="p-6 rounded-card border border-[color:var(--card-border)] bg-[color:var(--card-bg)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[color:var(--primary)]/10 text-[color:var(--primary)] flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-lg text-[color:var(--text-main)]">Hours of Operation</h3>
            <p className="text-sm text-[color:var(--text-muted)]">Global engineering response window across timezones.</p>
            <span className="text-sm font-semibold text-[color:var(--text-main)] block pt-2">
              Monday – Friday: 9am – 6pm EST
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
