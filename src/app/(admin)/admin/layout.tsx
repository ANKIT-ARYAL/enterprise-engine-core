export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4">
        <h1 className="font-bold text-xl mb-8">Admin Shell</h1>
        <nav className="space-y-2">
          <a href="/admin/pages" className="block p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Pages & Sections</a>
          <a href="/admin/products" className="block p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Products (40k)</a>
          <a href="/admin/media" className="block p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Media Vault</a>
          <a href="/admin/settings" className="block p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">System Design</a>
          <a href="/admin/recycle-bin" className="block p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">Recycle Bin</a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
