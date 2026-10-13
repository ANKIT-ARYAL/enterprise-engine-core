'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, LayoutTemplate } from 'lucide-react';
import { CMS_BLOCKS } from '@/lib/cms-registry';
import { addSectionAction } from '@/app/actions/admin-mutations';
import { useRouter } from 'next/navigation';

export function AddSectionDropdown({ 
  pageId = '', 
  pageSlug = '',
  onAddSection
}: { 
  pageId?: string; 
  pageSlug?: string; 
  onAddSection?: (model: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [customType, setCustomType] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = async (blockType: string, defaultContent: unknown) => {
    setIsAdding(true);
    setIsOpen(false);
    try {
      if (onAddSection) {
        onAddSection(blockType);
      } else if (pageId && pageSlug) {
        await addSectionAction(pageId, pageSlug, blockType, defaultContent);
        router.refresh();
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="relative z-[100] flex-1 md:flex-none" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isAdding}
        className="flex items-center gap-2 px-4 py-2.5 bg-btn-bg text-btn-text rounded-btn font-medium shadow-sm hover:bg-btn-hover hover:text-btn-hover-text transition-colors whitespace-nowrap w-full justify-center"
      >
        <Plus size={16} /> {isAdding ? 'Adding...' : 'Add Section'} <ChevronDown size={14} className={`opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl flex flex-col p-2 z-[1000] animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1.5">
            Pre-built Components
          </div>
          {CMS_BLOCKS.map((block) => (
            <button 
              key={block.type}
              onClick={() => handleAdd(block.type, block.defaultContent)}
              className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-muted rounded-lg transition-colors text-foreground flex items-center gap-2.5 cursor-pointer"
            >
              <LayoutTemplate size={14} className="text-primary shrink-0" /> 
              <span>{block.label}</span>
            </button>
          ))}
          
          <div className="border-t border-border mt-2 pt-2 px-1 pb-1">
            <p className="text-[10px] font-bold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Custom Section</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={customType}
                onChange={(e) => setCustomType(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                placeholder="e.g. PRICING_TABLE"
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
              />
              <button 
                onClick={() => {
                  if (customType.trim()) {
                    handleAdd(customType.trim(), { title: 'New Custom Section' });
                    setCustomType('');
                  }
                }}
                disabled={!customType.trim()}
                className="bg-primary text-primary-foreground hover:opacity-90 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
