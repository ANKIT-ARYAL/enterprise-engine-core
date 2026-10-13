/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useTransition } from 'react';
import { 
  Trash2, RefreshCcw, Layers, Package, Image as ImageIcon, 
  AlertTriangle, CheckCircle2, X
} from 'lucide-react';
import { 
  restoreSectionAction, 
  purgeSectionAction, 
  restoreProductAction, 
  purgeProductAction, 
  restoreMediaAction, 
  purgeMediaAction, 
  emptyRecycleBinAction 
} from '@/app/actions/recycle-bin-actions';

interface RecycleBinManagerProps {
  initialDeletedSections?: any[];
  initialDeletedProducts?: any[];
  initialDeletedMedia?: any[];
  deletedSections?: any[];
  deletedProducts?: any[];
  deletedMedia?: any[];
}

export default function RecycleBinManager({
  initialDeletedSections,
  initialDeletedProducts,
  initialDeletedMedia,
  deletedSections: propDeletedSections,
  deletedProducts: propDeletedProducts,
  deletedMedia: propDeletedMedia,
}: RecycleBinManagerProps) {
  const [deletedSections, setDeletedSections] = useState(
    initialDeletedSections || propDeletedSections || []
  );
  const [deletedProducts, setDeletedProducts] = useState(
    initialDeletedProducts || propDeletedProducts || []
  );
  const [deletedMedia, setDeletedMedia] = useState(
    initialDeletedMedia || propDeletedMedia || []
  );

  const [activeTab, setActiveTab] = useState<'all' | 'sections' | 'products' | 'media'>('all');
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRestoreSection = async (id: string, pageSlug: string) => {
    startTransition(async () => {
      try {
        await restoreSectionAction(id, pageSlug);
        setDeletedSections(prev => prev.filter(s => s.id !== id));
        showToast('Section restored successfully');
      } catch (err: any) {
        showToast(err.message || 'Failed to restore section', 'error');
      }
    });
  };

  const handlePurgeSection = async (id: string) => {
    if (!confirm('Permanently purge this section? This cannot be undone.')) return;
    startTransition(async () => {
      try {
        await purgeSectionAction(id);
        setDeletedSections(prev => prev.filter(s => s.id !== id));
        showToast('Section permanently destroyed');
      } catch (err: any) {
        showToast(err.message || 'Failed to purge section', 'error');
      }
    });
  };

  const handleRestoreProduct = async (id: string) => {
    startTransition(async () => {
      try {
        await restoreProductAction(id);
        setDeletedProducts(prev => prev.filter(p => p.id !== id));
        showToast('Product restored to catalog');
      } catch (err: any) {
        showToast(err.message || 'Failed to restore product', 'error');
      }
    });
  };

  const handlePurgeProduct = async (id: string) => {
    if (!confirm('Permanently delete product?')) return;
    startTransition(async () => {
      try {
        await purgeProductAction(id);
        setDeletedProducts(prev => prev.filter(p => p.id !== id));
        showToast('Product permanently purged');
      } catch (err: any) {
        showToast(err.message || 'Failed to purge product', 'error');
      }
    });
  };

  const handleRestoreMedia = async (id: string) => {
    startTransition(async () => {
      try {
        await restoreMediaAction(id);
        setDeletedMedia(prev => prev.filter(m => m.id !== id));
        showToast('Media restored to library');
      } catch (err: any) {
        showToast(err.message || 'Failed to restore media', 'error');
      }
    });
  };

  const handlePurgeMedia = async (id: string) => {
    if (!confirm('Permanently purge media?')) return;
    startTransition(async () => {
      try {
        await purgeMediaAction(id);
        setDeletedMedia(prev => prev.filter(m => m.id !== id));
        showToast('Media asset deleted');
      } catch (err: any) {
        showToast(err.message || 'Failed to purge media', 'error');
      }
    });
  };

  const handleEmptyAll = async () => {
    if (!confirm('Permanently empty all items in the Recycle Bin? This action cannot be reversed.')) return;
    startTransition(async () => {
      try {
        await emptyRecycleBinAction();
        setDeletedSections([]);
        setDeletedProducts([]);
        setDeletedMedia([]);
        showToast('Recycle Bin emptied completely');
      } catch (err: any) {
        showToast(err.message || 'Failed to empty recycle bin', 'error');
      }
    });
  };

  const totalCount = deletedSections.length + deletedProducts.length + deletedMedia.length;

  return (
    <div className="space-y-6 w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-btn bg-primary text-primary-foreground shadow-xs">
              <Trash2 size={18} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Recycle Bin</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Recover accidentally removed layout components, catalog items, and media assets.
          </p>
        </div>

        {totalCount > 0 && (
          <button
            onClick={handleEmptyAll}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-destructive hover:opacity-90 text-destructive-foreground rounded-btn text-xs font-semibold transition-opacity shadow-xs disabled:opacity-50"
          >
            <AlertTriangle size={14} />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`p-4 rounded-card flex items-center gap-3 text-sm animate-in fade-in ${
          toast.type === 'success' 
            ? 'bg-primary/10 border border-primary/20 text-foreground' 
            : 'bg-destructive/10 border border-destructive/20 text-destructive'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} className="text-primary" /> : <X size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>All Items</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground font-mono">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'sections'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers size={14} />
          <span>Page Sections</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground font-mono">
            {deletedSections.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package size={14} />
          <span>Products</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground font-mono">
            {deletedProducts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'media'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon size={14} />
          <span>Media Vault</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground font-mono">
            {deletedMedia.length}
          </span>
        </button>
      </div>

      {/* Main List */}
      <div className="space-y-4 w-full">
        {totalCount === 0 ? (
          <div className="p-16 bg-card border border-dashed border-border rounded-card text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} className="text-primary" />
            </div>
            <h3 className="font-bold text-base text-foreground">Recycle Bin is Empty</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No soft-deleted sections, catalog products, or media assets found. All database entities are clean and active.
            </p>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            {/* Sections */}
            {(activeTab === 'all' || activeTab === 'sections') && deletedSections.map((sec) => (
              <div 
                key={sec.id}
                className="p-4 bg-card border border-border rounded-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-btn bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Layers size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground truncate">{sec.type} Component</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground">
                        Page: {sec.page.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Deleted: {sec.updatedAt} • Belongs to /{sec.page.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRestoreSection(sec.id, sec.page.slug)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/15 text-primary hover:bg-primary/25 rounded-btn transition-colors"
                  >
                    <RefreshCcw size={13} /> Restore
                  </button>
                  <button
                    onClick={() => handlePurgeSection(sec.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-btn transition-colors"
                  >
                    <Trash2 size={13} /> Purge
                  </button>
                </div>
              </div>
            ))}

            {/* Products */}
            {(activeTab === 'all' || activeTab === 'products') && deletedProducts.map((prod) => (
              <div 
                key={prod.id}
                className="p-4 bg-card border border-border rounded-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-btn bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Package size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground truncate">{prod.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground">
                        ${prod.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Deleted: {prod.updatedAt} • Slug: /{prod.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRestoreProduct(prod.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/15 text-primary hover:bg-primary/25 rounded-btn transition-colors"
                  >
                    <RefreshCcw size={13} /> Restore
                  </button>
                  <button
                    onClick={() => handlePurgeProduct(prod.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-btn transition-colors"
                  >
                    <Trash2 size={13} /> Purge
                  </button>
                </div>
              </div>
            ))}

            {/* Media */}
            {(activeTab === 'all' || activeTab === 'media') && deletedMedia.map((med) => (
              <div 
                key={med.id}
                className="p-4 bg-card border border-border rounded-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-btn bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ImageIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground truncate">{med.fileName}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground">
                        {Math.round(med.fileSize / 1024)} KB
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Deleted: {med.createdAt} • Type: {med.mimeType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRestoreMedia(med.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/15 text-primary hover:bg-primary/25 rounded-btn transition-colors"
                  >
                    <RefreshCcw size={13} /> Restore
                  </button>
                  <button
                    onClick={() => handlePurgeMedia(med.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-btn transition-colors"
                  >
                    <Trash2 size={13} /> Purge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
