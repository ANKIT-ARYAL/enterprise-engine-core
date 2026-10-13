import React from 'react';
import { prisma } from '@/lib/db/client';
import Link from 'next/link';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { deletePostAction } from '@/app/actions/post-actions';

export default async function BlogsDashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, email: true } }
    }
  });

  return (
    <div className="w-full space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Blogs & Articles Database</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage, create, and publish blog articles across your platform.</p>
        </div>
        <Link 
          href="/admin/blogs/new" 
          className="flex items-center gap-2 px-4 py-2 bg-btn-bg text-btn-text rounded-btn text-xs font-semibold hover:bg-btn-hover transition-colors shadow-sm"
        >
          <Plus size={16} /> Add New Blog Post
        </Link>
      </div>

      <div className="bg-card border border-border rounded-card shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-primary" />
            <p className="text-base font-semibold text-foreground">No blog posts found</p>
            <p className="text-xs mt-1">Get started by creating your first article to populate the blog database.</p>
            <Link 
              href="/admin/blogs/new" 
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-btn text-xs font-semibold shadow hover:opacity-90"
            >
              <Plus size={15} /> Create Article
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post, index) => (
              <div key={post.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground truncate">{post.title}</h3>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${post.published ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs line-clamp-2 mt-1">
                      {post.excerpt || post.content.substring(0, 120)}...
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                      <span>Slug: <code className="bg-muted px-1.5 py-0.5 rounded border border-border text-[11px] font-mono">/{post.slug}</code></span>
                      <span>By: {post.author?.name || 'Admin'}</span>
                      <span>Date: {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link 
                    href={`/admin/blogs/${post.id}/edit`}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="Edit Post"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <form action={async () => {
                    'use server';
                    await deletePostAction(post.id);
                  }}>
                    <button type="submit" className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer" title="Delete Post">
                      <Trash2 size={16} />
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
