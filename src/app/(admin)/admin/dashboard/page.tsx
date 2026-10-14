import Link from 'next/link';
import { ArrowUpRight, FileText, Image, MessageSquare, ShieldCheck, Users } from 'lucide-react';
import { prisma } from '@/lib/db/client';
import { getCurrentAdminSession } from '@/lib/auth/session';

export const instant = false;

function MetricCard({ label, value, href, icon: Icon, detail }: { label: string; value: number; href: string; icon: typeof Users; detail: string }) {
  return <Link href={href} className="group rounded-card border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40"><div className="flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-btn bg-primary/10 text-primary"><Icon size={18} /></span><ArrowUpRight size={16} className="text-muted-foreground group-hover:text-primary" /></div><p className="mt-5 text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{value.toLocaleString()}</p><p className="mt-2 text-xs text-muted-foreground">{detail}</p></Link>;
}

export default async function AdminDashboard() {
  const [session, users, pages, posts, faqs, media, recentUsers] = await Promise.all([
    getCurrentAdminSession(),
    prisma.user.count(),
    prisma.page.count({ where: { isPublished: true } }),
    prisma.post.count({ where: { published: true } }),
    prisma.faq.count({ where: { isPublished: true } }),
    prisma.mediaVault.count({ where: { isDeleted: false } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
  ]);

  return <div className="space-y-8 pb-20">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Workspace overview</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Good to see you, {session?.name || 'Admin'}</h1><p className="mt-2 text-sm text-muted-foreground">Your system is connected to live database records.</p></div><div className="flex gap-2"><Link href="/admin/users" className="rounded-btn border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Manage users</Link><Link href="/admin/pages" className="rounded-btn bg-btn-bg px-4 py-2 text-sm font-medium text-btn-text hover:bg-btn-hover">Manage content</Link></div></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Team members" value={users} href="/admin/users" icon={Users} detail="Accounts in the workspace" /><MetricCard label="Published pages" value={pages} href="/admin/pages" icon={FileText} detail="Live public pages" /><MetricCard label="Published posts" value={posts} href="/admin/dashboard/pages" icon={MessageSquare} detail={`${faqs} published FAQs`} /><MetricCard label="Media assets" value={media} href="/admin/dashboard/assets" icon={Image} detail="Available in Media Vault" /></section>
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"><div className="rounded-card border border-border bg-card p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-foreground">Recent team activity</h2><p className="mt-1 text-xs text-muted-foreground">Latest accounts created in this workspace.</p></div><Link href="/admin/users" className="text-xs font-semibold text-primary hover:underline">View all</Link></div><div className="mt-6 divide-y divide-border">{recentUsers.length === 0 ? <p className="py-8 text-sm text-muted-foreground">No team members yet.</p> : recentUsers.map((user) => <div key={user.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{user.name || user.email}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div><div className="text-right"><span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{user.role}</span><p className="mt-1 text-[11px] text-muted-foreground">{user.createdAt.toLocaleDateString()}</p></div></div>)}</div></div><div className="rounded-card border border-border bg-card p-6 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck className="text-primary" size={20} /><h2 className="font-semibold text-foreground">System status</h2></div><div className="mt-6 space-y-4 text-sm">{[['Database', 'Connected'], ['Authentication', 'Active'], ['Content delivery', 'Operational'], ['Media storage', media > 0 ? 'In use' : 'Ready']].map(([label, status]) => <div key={label} className="flex items-center justify-between border-b border-border pb-3"><span className="text-muted-foreground">{label}</span><span className="font-medium text-primary">{status}</span></div>)}</div></div></section>
  </div>;
}
