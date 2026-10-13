import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Enterprise Engine',
  description: 'Privacy Policy and data governance practices.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="universal-container py-16 md:py-24 w-full">
      {/* Header */}
      <div className="mb-12 border-b border-[color:var(--card-border)] pb-8">
        <span className="text-[color:var(--accent)] font-bold tracking-wider uppercase text-xs block mb-3">
          Legal & Transparency
        </span>
        <h1 className="h1-title mb-4">Privacy Policy</h1>
        <p className="desc-text text-sm">
          Last updated: October 12, 2026
        </p>
      </div>

      {/* Policy Content */}
      <div className="space-y-10 text-[color:var(--text-main)] leading-relaxed">
        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">1. Introduction</h2>
          <p className="desc-text text-base">
            We value your trust and are committed to protecting your personal information. This Privacy Policy outlines our standards for collecting, using, disclosing, and safeguarding your information when you access or interact with our web services and software engine.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">2. Information We Collect</h2>
          <p className="desc-text text-base">
            When you interact with our platform, we may collect the following categories of data:
          </p>
          <ul className="list-disc list-inside space-y-2 desc-text text-base ml-2">
            <li><strong>Account & Profile Information:</strong> Full name, email address, password hashes, and assigned administrative roles.</li>
            <li><strong>Content Submissions:</strong> Form inputs, uploaded media assets, questions, and article content created through our management portal.</li>
            <li><strong>Telemetry & Usage Data:</strong> Anonymized interaction metrics, browser environment, timestamp logs, and system error events.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">3. How We Use Your Data</h2>
          <p className="desc-text text-base">
            Collected data is utilized strictly to provide, maintain, and optimize platform functionality, specifically to:
          </p>
          <ul className="list-disc list-inside space-y-2 desc-text text-base ml-2">
            <li>Authenticate user sessions and enforce role-based access control (RBAC).</li>
            <li>Persist layout modifications, theme tokens, and dynamic content schema.</li>
            <li>Monitor platform reliability, sub-second edge response times, and prevent unauthorized intrusion.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">4. Data Storage & Security Measures</h2>
          <p className="desc-text text-base">
            We implement industry-grade security protocols, including AES encryption at rest, secure TLS transport, rate-limiting algorithms, and strict parameterized database queries via Prisma ORM to mitigate OWASP Top 10 vulnerabilities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">5. Your Data Rights</h2>
          <p className="desc-text text-base">
            You retain the right to request access, correction, or deletion of your personal information stored in our databases. To initiate a data retrieval or deletion request, please contact our support team.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="h2-title text-xl font-bold">6. Contact Information</h2>
          <p className="desc-text text-base">
            If you have questions regarding this Privacy Policy or our security architecture, you may contact our legal operations team directly at{' '}
            <a href="mailto:privacy@enterprise.engine" className="text-[color:var(--accent)] font-semibold underline">
              privacy@enterprise.engine
            </a>.
          </p>
        </section>
      </div>

      {/* Return Action */}
      <div className="mt-16 pt-8 border-t border-[color:var(--card-border)] flex items-center justify-between">
        <Link href="/" className="text-sm font-bold text-[color:var(--accent)] hover:underline">
          ← Back to Homepage
        </Link>
        <Link href="/terms" className="text-sm font-semibold opacity-75 hover:opacity-100">
          Terms of Service →
        </Link>
      </div>
    </main>
  );
}
