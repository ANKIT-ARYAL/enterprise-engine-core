/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createFaqsAction, updateFaqAction } from '@/app/actions/faq-actions';

interface SingleFaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export function FaqForm({ initialData, isEditing = false }: { initialData?: any, isEditing?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [faqItems, setFaqItems] = useState<SingleFaqItem[]>([
    {
      id: initialData?.id || `faq-1`,
      question: initialData?.question || '',
      answer: initialData?.answer || '',
      order: initialData?.order || 0,
    },
  ]);

  const addFaqItem = () => {
    setFaqItems(prev => [
      ...prev,
      {
        id: `faq-${Date.now()}`,
        question: '',
        answer: '',
        order: prev.length,
      },
    ]);
  };

  const removeFaqItem = (id: string) => {
    if (faqItems.length <= 1) return;
    setFaqItems(prev => prev.filter(item => item.id !== id));
  };

  const updateFaqItem = (id: string, field: keyof SingleFaqItem, value: any) => {
    setFaqItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await updateFaqAction(initialData.id, {
          question: faqItems[0].question,
          answer: faqItems[0].answer,
          order: Number(faqItems[0].order) || 0,
        });
      } else {
        const validItems = faqItems.filter(item => item.question.trim());
        if (validItems.length > 0) {
          await createFaqsAction(validItems.map(item => ({
            question: item.question.trim(),
            answer: item.answer || '',
            order: Number(item.order) || 0,
          })));
        }
      }
      router.push('/admin/faq');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
      {/* Top Header Actions */}
      <div className="bg-[color:var(--bg-main)] p-4 sm:p-6 rounded-[var(--card-radius)] shadow-sm border border-[color:var(--card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Link href="/admin/faq" className="self-start sm:self-auto p-2 rounded-btn bg-black/5 text-[color:var(--text-muted)] hover:bg-black/10 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[color:var(--text-main)] uppercase tracking-wider">
              {isEditing ? `Edit FAQ` : 'Add FAQs'}
            </h1>
            {!isEditing && (
              <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
                Add one or multiple FAQs at the same time.
              </p>
            )}
          </div>
        </div>

        <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={addFaqItem}
              className="bg-black/5 hover:bg-black/10 text-[color:var(--text-main)] font-bold px-4 py-2.5 rounded-btn flex items-center gap-2 text-sm transition-colors cursor-pointer"
            >
              <Plus size={16} /> Add Another FAQ
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[color:var(--accent)] text-white font-bold px-6 py-2.5 rounded-btn shadow-sm flex items-center gap-2 transition-colors uppercase tracking-wider text-sm disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            {loading ? 'Saving...' : isEditing ? 'Update FAQ' : 'Publish FAQs'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {faqItems.map((item, index) => (
          <div key={item.id} className="bg-[color:var(--bg-main)] p-6 rounded-[var(--card-radius)] border border-[color:var(--card-border)] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--card-border)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)] flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </div>
                <h2 className="font-bold text-[color:var(--text-main)] uppercase tracking-wider text-sm">
                  {isEditing ? 'FAQ Details' : `Item #${index + 1}`}
                </h2>
              </div>

              {!isEditing && faqItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFaqItem(item.id)}
                  className="p-1.5 rounded-md text-[color:var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div>
              <label className="block font-bold text-[color:var(--text-main)] mb-1 text-sm">Question *</label>
              <input
                required
                value={item.question}
                onChange={(e) => updateFaqItem(item.id, 'question', e.target.value)}
                className="w-full p-3 bg-transparent border border-[color:var(--card-border)] rounded-md focus:outline-none focus:border-[color:var(--accent)] text-sm font-medium"
                placeholder="e.g. How many days does the trek usually take?"
              />
            </div>

            <div>
              <label className="block font-bold text-[color:var(--text-main)] mb-1 text-sm">Answer *</label>
              <textarea
                required
                rows={4}
                value={item.answer}
                onChange={(e) => updateFaqItem(item.id, 'answer', e.target.value)}
                className="w-full p-3 bg-transparent border border-[color:var(--card-border)] rounded-md focus:outline-none focus:border-[color:var(--accent)] text-sm"
                placeholder="Write the full answer here..."
              />
            </div>

            <div className="w-32 pt-2">
              <label className="block font-bold text-[color:var(--text-muted)] mb-1 text-xs uppercase">Order</label>
              <input
                type="number"
                value={item.order}
                onChange={(e) => updateFaqItem(item.id, 'order', Number(e.target.value) || 0)}
                className="w-full p-2 bg-transparent border border-[color:var(--card-border)] rounded-md outline-none text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
