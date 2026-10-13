/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CMS_BLOCKS } from '@/lib/cms-registry';
import { 
  ChevronDown, ChevronUp, Eye, EyeOff, Trash2, Save, 
  Sparkles, LayoutGrid, HelpCircle, BookOpen, FileText, 
  Upload, Image as ImageIcon, Video, CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
  mutateSectionAction, 
  softDeleteSectionAction, 
  toggleSectionVisibilityAction 
} from '@/app/actions/admin-mutations';
import toast from 'react-hot-toast';

interface SectionEditorFormProps {
  section: Record<string, unknown> & { 
    id: string; 
    type: string; 
    isEnabled?: boolean; 
    content?: unknown;
    order?: number;
  };
  pageSlug: string;
  index?: number;
}

export function SectionEditorForm({ section, pageSlug, index = 0 }: SectionEditorFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState<Record<string, string>>(
    (section.content as Record<string, string>) || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEnabled, setIsEnabled] = useState(section.isEnabled ?? true);
  const [isToggling, setIsToggling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('images', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.urls.length > 0) {
        handleChange('imageUrl', data.urls[0]);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await mutateSectionAction(section.id, pageSlug, content);
      toast.success('Section saved successfully');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete the "${section.type}" section from this page? It can be restored from the Recycle Bin.`)) {
      setIsDeleting(true);
      try {
        await softDeleteSectionAction(section.id, pageSlug);
        toast.success('Section moved to Recycle Bin');
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete section');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleChange = (key: string, value: string | boolean | number) => {
    setContent(prev => ({ ...prev, [key]: value as unknown as string }));
  };

  const handleToggleVisibility = async () => {
    setIsToggling(true);
    const newState = !isEnabled;
    setIsEnabled(newState);
    try {
      await toggleSectionVisibilityAction(section.id, pageSlug, newState);
      toast.success(newState ? 'Section enabled' : 'Section hidden');
      router.refresh();
    } catch (err: any) {
      setIsEnabled(!newState);
      toast.error(err.message || 'Failed to toggle visibility');
    } finally {
      setIsToggling(false);
    }
  };

  // Icon mapping by block type
  const getBlockIcon = () => {
    switch (section.type) {
      case 'HERO': return <Sparkles size={16} className="text-amber-500" />;
      case 'FEATURED_GRID': return <LayoutGrid size={16} className="text-blue-500" />;
      case 'FAQ_ACCORDION': return <HelpCircle size={16} className="text-emerald-500" />;
      case 'BLOG_ROLL': return <BookOpen size={16} className="text-purple-500" />;
      default: return <FileText size={16} className="text-primary" />;
    }
  };

  const blockRegistryItem = CMS_BLOCKS.find(b => b.type === section.type);
  const displayTitle = content.title || content.heading || `${section.type} Block`;

  const renderFields = () => {
    if (section.type === 'HERO') {
      return (
        <div className="p-5 md:p-6 space-y-5 border-t border-border bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Top Eyebrow Badge
              </label>
              <input 
                type="text" 
                value={content.badge || ''} 
                onChange={(e) => handleChange('badge', e.target.value)} 
                placeholder="e.g. Next-Gen Architecture"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Main Hero Title
              </label>
              <input 
                type="text" 
                value={content.title || ''} 
                onChange={(e) => handleChange('title', e.target.value)} 
                placeholder="e.g. Enterprise Modular Engine"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Subtitle & Value Proposition
            </label>
            <textarea 
              rows={3}
              value={content.subtitle || ''} 
              onChange={(e) => handleChange('subtitle', e.target.value)} 
              placeholder="High-performance, headless digital architecture engineered for scale."
              className="w-full p-3.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Primary Call to Action Label
              </label>
              <input 
                type="text" 
                value={content.primaryCtaText || ''} 
                onChange={(e) => handleChange('primaryCtaText', e.target.value)} 
                placeholder="e.g. Get Started Now"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Primary CTA Target URL
              </label>
              <input 
                type="text" 
                value={content.primaryCtaLink || ''} 
                onChange={(e) => handleChange('primaryCtaLink', e.target.value)} 
                placeholder="e.g. /contact-us or /#features"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Hero Visual Media
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => handleChange('mediaType', 'image')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  (content.mediaType || 'image') === 'image' 
                    ? 'border-primary bg-primary/10 text-primary font-semibold' 
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <ImageIcon size={15} /> Upload Image
              </button>
              <button
                type="button"
                onClick={() => handleChange('mediaType', 'youtube')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  content.mediaType === 'youtube' 
                    ? 'border-primary bg-primary/10 text-primary font-semibold' 
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Video size={15} /> YouTube Stream
              </button>
            </div>

            {content.mediaType === 'youtube' ? (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">YouTube Video ID (e.g. dQw4w9WgXcQ)</label>
                <input 
                  type="text" 
                  value={content.youtubeId || ''} 
                  onChange={(e) => handleChange('youtubeId', e.target.value)} 
                  placeholder="Paste YouTube ID..."
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
              </div>
            ) : (
              <div>
                {content.imageUrl ? (
                  <div className="relative w-full h-44 border border-border rounded-lg overflow-hidden bg-muted/40 group">
                    <img src={content.imageUrl} alt="Hero" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange('imageUrl', '')}
                        className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-btn text-xs font-semibold shadow hover:opacity-90 transition-opacity"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-primary rounded-lg bg-card cursor-pointer hover:bg-muted/30 transition-all p-4">
                    <Upload size={22} className="text-muted-foreground mb-1.5" />
                    <span className="text-xs font-medium text-foreground">
                      {isUploading ? 'Uploading image...' : 'Click or drop image to upload'}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG, WEBP, or SVG</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      disabled={isUploading} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Generic form for FEATURES, FAQ, BLOG, RICH_TEXT
    return (
      <div className="p-5 md:p-6 space-y-5 border-t border-border bg-muted/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Section Heading / Title
            </label>
            <input 
              type="text" 
              value={content.title || content.heading || ''} 
              onChange={(e) => {
                handleChange('title', e.target.value);
                handleChange('heading', e.target.value);
              }} 
              placeholder="e.g. Core Capabilities"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Supporting Subheading
            </label>
            <input 
              type="text" 
              value={content.subtitle || ''} 
              onChange={(e) => handleChange('subtitle', e.target.value)} 
              placeholder="e.g. Engineered with zero compromises"
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Detailed Content & Description
          </label>
          <textarea 
            rows={4}
            value={content.description || content.content || ''} 
            onChange={(e) => {
              handleChange('description', e.target.value);
              handleChange('content', e.target.value);
            }} 
            placeholder="Write section body copy, bullet points, or markdown text..."
            className="w-full p-3.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-y font-sans"
          />
        </div>

        {/* Optional Section Image */}
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Featured Image (Optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="url" 
              value={content.imageUrl || ''} 
              onChange={(e) => handleChange('imageUrl', e.target.value)} 
              placeholder="https://images.unsplash.com/..."
              className="flex-1 px-3.5 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <label className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-medium rounded-lg cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-colors">
              <Upload size={14} />
              <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
            </label>
          </div>
          {content.imageUrl && (
            <div className="mt-3 relative w-full h-36 border border-border rounded-lg overflow-hidden bg-muted/30">
              <img src={content.imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-card border border-border rounded-card shadow-xs overflow-hidden transition-all duration-200 hover:border-border/90">
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Order Badge */}
          <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-muted-foreground font-mono text-xs font-bold border border-border">
            #{index + 1}
          </span>

          {/* Component Icon & Type Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              {getBlockIcon()}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {section.type}
            </span>
          </div>

          {/* Section Title Preview */}
          <span className="text-xs text-muted-foreground truncate hidden md:inline">
            — {displayTitle}
          </span>
          {blockRegistryItem?.frontendComponent && (
            <span className="hidden xl:inline text-[11px] font-mono text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded border border-border/40">
              {blockRegistryItem.frontendComponent}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Visibility Toggle Button */}
          <button 
            type="button"
            onClick={handleToggleVisibility} 
            disabled={isToggling}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-btn transition-colors cursor-pointer border ${
              isEnabled 
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
                : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
            title={isEnabled ? "Visible on live page" : "Hidden from public view"}
          >
            {isEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>{isToggling ? '...' : isEnabled ? 'Visible' : 'Hidden'}</span>
          </button>

          {/* Delete Button */}
          <button 
            type="button"
            onClick={handleDelete} 
            disabled={isDeleting} 
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
            title="Delete Section"
          >
            <Trash2 size={16} />
          </button>

          {/* Save Button */}
          <button 
            type="button"
            onClick={handleSave} 
            disabled={isSaving} 
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-btn-bg text-btn-text rounded-btn hover:bg-btn-hover transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save size={13} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Expand/Collapse Chevron */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-150">
          {renderFields()}
        </div>
      )}
    </div>
  );
}
