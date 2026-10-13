import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Enterprise Engine',
  description: 'Terms of Service and platform governance agreements.',
};

export default function TermsOfServicePage() {
  return (
    <main className="universal-container py-16 md:py-24 w-full">
      {/* Header */}
      <div className="mb-12 border-b border-[color:var(--card-border)] pb-8">
        <span className="text-[color:var(--accent)] font-bold tracking-wider uppercase text-xs block mb-3">
          User Agreement
        </span>
        <h1 className="h1-title mb-4">Terms of Service</h1>
        <p className="desc-text text-sm">
          Last updated: October 12, 2026
        </p>
      </div>

      {/* Terms Content */}
      <div className="space-y-10 text-[color:var(--text-main)] leading-relaxed">
        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">1. Agreement to Terms</h2>
          <p className="desc-text text-base">
            By accessing or using this web application and modular engine, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any part of these terms, you are prohibited from utilizing this platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">2. Use License & Intellectual Property</h2>
          <p className="desc-text text-base">
            Permission is granted to access and use the software architecture for lawful business and deployment objectives. You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 desc-text text-base ml-2">
            <li>Attempt to reverse engineer, decompile, or bypass cryptographic protections within the system engine.</li>
            <li>Use the platform for distributing malicious scripts, automated spam, or denial-of-service attempts.</li>
            <li>Remove any copyright, proprietary notices, or license credits from source code distributions.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">3. Account Responsibility & Security</h2>
          <p className="desc-text text-base">
            Users assigned administrative privileges are responsible for safeguarding credentials and session tokens. You must notify platform administrators immediately upon discovering any unauthorized access to your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">4. Limitation of Liability</h2>
          <p className="desc-text text-base">
            In no event shall the platform owners, engineers, or suppliers be liable for damages arising out of the use or inability to use the platform services, including but not limited to loss of data or business interruption.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">5. Governing Law & Modifications</h2>
          <p className="desc-text text-base">
            These terms are governed by standard international commercial law. We reserve the right to revise these Terms of Service at any time without prior notice. Continued use of the platform constitutes acceptance of revised agreements.
          </p>
        </section>
      </div>

      {/* Return Action */}
      <div className="mt-16 pt-8 border-t border-[color:var(--card-border)] flex items-center justify-between">
        <Link href="/" className="text-sm font-bold text-[color:var(--accent)] hover:underline">
          ← Back to Homepage
        </Link>
        <Link href="/privacy" className="text-sm font-semibold opacity-75 hover:opacity-100">
          Privacy Policy →
        </Link>
      </div>
    </main>
  );
}
