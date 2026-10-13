import React from 'react';
import { BlogForm } from '../components/BlogForm';

export default function NewBlogPage() {
  return (
    <div className="w-full space-y-6 pb-24">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Article</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Write a new article to be published to your blog.</p>
      </div>

      <BlogForm />
    </div>
  );
}
