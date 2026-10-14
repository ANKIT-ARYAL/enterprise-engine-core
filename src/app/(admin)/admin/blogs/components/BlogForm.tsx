/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createPostAction, updatePostAction } from '@/app/actions/post-actions';
import toast from 'react-hot-toast';

export function BlogForm({ initialData, isEditing = false }: { initialData?: any; isEditing?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    published: initialData?.published ?? true,
  });

  const handleTitleChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      title: val,
      // Auto-generate slug if not editing or slug is untouched
      slug: !isEditing ? val.toLowerCase().replace(/[^a-z0-9-_]/g, '-') : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await updatePostAction(initialData.id, formData);
      } else {
        await createPostAction(formData);
      }
      router.push('/admin/blogs');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to save post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/blogs"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to Blogs
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-btn-bg text-btn-text rounded-btn text-xs font-semibold hover:bg-btn-hover transition-colors shadow-sm disabled:opacity-50"
        >
          <Save size={15} /> {loading ? 'Saving...' : isEditing ? 'Update Article' : 'Publish Article'}
        </button>
      </div>

      <div className="bg-card border border-border rounded-card p-6 space-y-6 shadow-sm w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Article Title</label>
            <input 
              type="text" 
              required
              value={formData.title} 
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Architectural Blueprint for Enterprise Scale"
              className="w-full px-3.5 py-2.5 bg-transparent border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">URL Slug</label>
            <input 
              type="text" 
              required
              value={formData.slug} 
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g. architectural-blueprint"
              className="w-full px-3.5 py-2.5 bg-transparent border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Short Excerpt / Summary</label>
          <input 
            type="text" 
            value={formData.excerpt} 
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="A short punchy summary displayed in cards and previews..."
            className="w-full px-3.5 py-2.5 bg-transparent border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Article Content (Markdown / Text)</label>
          <textarea 
            required
            rows={12}
            value={formData.content} 
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write full article content here..."
            className="w-full p-4 bg-transparent border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono resize-y transition"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input 
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
            className="w-4 h-4 rounded accent-primary cursor-pointer"
          />
          <label htmlFor="published" className="text-xs font-medium text-foreground cursor-pointer select-none">
            Publish immediately (visible to public frontend)
          </label>
        </div>
      </div>
    </form>
  );
}
