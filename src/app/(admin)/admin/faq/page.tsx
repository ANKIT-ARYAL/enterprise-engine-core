import React from 'react';
import { prisma } from '@/lib/db/client';
import Link from 'next/link';
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { deleteFaqAction } from '@/app/actions/faq-actions';

export default async function FaqDashboard() {
  const faqs = await prisma.faq.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div className="space-y-6 w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-btn bg-primary text-primary-foreground shadow-xs">
              <HelpCircle size={18} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">FAQ Database</h1>
          </div>
          <p className="text-xs text-muted-foreground">Manage and sequence all frequently asked questions globally.</p>
        </div>
        <Link 
          href="/admin/faq/new" 
          className="flex items-center gap-2 px-5 py-2.5 bg-btn-bg text-btn-text rounded-btn font-semibold hover:bg-btn-hover transition-colors shadow-xs text-xs"
        >
          <Plus size={16} /> Add New FAQ
        </Link>
      </div>

      <div className="bg-card border border-border rounded-card shadow-xs overflow-hidden w-full">
        {faqs.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <HelpCircle size={36} className="mx-auto mb-3 opacity-30 text-primary" />
            <p className="text-sm font-semibold text-foreground">No FAQs found in database</p>
            <p className="text-xs mt-1">Get started by creating your first frequently asked question.</p>
            <Link 
              href="/admin/faq/new"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover text-xs font-semibold rounded-btn shadow-xs transition-colors"
            >
              <Plus size={14} /> Create FAQ
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="shrink-0 w-7 h-7 flex items-center justify-center rounded-btn bg-primary/10 text-primary font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-foreground truncate">{faq.question}</h3>
                    <p className="text-muted-foreground text-xs line-clamp-2 mt-1 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground px-2.5 py-1 bg-muted rounded-full">
                    Order: {faq.order}
                  </span>
                  <Link 
                    href={`/admin/faq/${faq.id}/edit`}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-btn transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit2 size={15} />
                  </Link>
                  <form action={async () => {
                    'use server';
                    await deleteFaqAction(faq.id);
                  }}>
                    <button type="submit" className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-btn transition-colors" title="Delete FAQ">
                      <Trash2 size={15} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
