'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { MousePointer2, X, Settings2, Code, Type, Palette, Save, Trash2 } from 'lucide-react';
import { saveVisualPatch } from '@/app/actions/patch-action';
import { clearAllPatches } from '@/app/actions/clear-patches';

// Helper to generate a robust CSS selector
function getCssPath(el: HTMLElement): string {
  if (!(el instanceof Element)) return '';
  const path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += '#' + el.id;
      path.unshift(selector);
      break;
    } else {
      let sib = el, nth = 1;
      while ((sib = sib.previousElementSibling as HTMLElement)) {
        if (sib.nodeName.toLowerCase() == selector) nth++;
      }
      if (nth != 1) selector += ":nth-of-type(" + nth + ")";
    }
    path.unshift(selector);
    el = el.parentNode as HTMLElement;
  }
  return path.join(" > ");
}

export default function VisualInspector() {
  const [isActive, setIsActive] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });

  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Cmd/Ctrl + Shift + I
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsActive(prev => {
          if (prev) {
            setHoveredElement(null);
            setSelectedElement(null);
          }
          return !prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (selectedElement) return; // Don't change hover while inspecting
      
      const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      // Don't inspect the inspector itself
      if (element && !element.closest('#visual-inspector-panel')) {
        setHoveredElement(element);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isActive) return;
      const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      
      if (element && !element.closest('#visual-inspector-panel')) {
        e.preventDefault();
        e.stopPropagation();
        setSelectedElement(element);
        setHoveredElement(null);
        
        // Position panel near the click
        const x = Math.min(e.clientX + 20, window.innerWidth - 300);
        const y = Math.min(e.clientY + 20, window.innerHeight - 400);
        setPanelPos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick, { capture: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, { capture: true });
    };
  }, [isActive, selectedElement]);

  if (!isActive) return null;

  return (
    <>
      {/* Global overlay styling for the inspector mode */}
      <style dangerouslySetInnerHTML={{__html: `
        body { cursor: crosshair !important; }
        * { transition: outline 0.1s ease !important; }
      `}} />

      {/* Hover Highlighter */}
      {hoveredElement && !selectedElement && (
        <div 
          className="fixed pointer-events-none z-[9999] border-2 border-primary bg-primary/10 transition-all duration-75"
          style={{
            top: hoveredElement.getBoundingClientRect().top,
            left: hoveredElement.getBoundingClientRect().left,
            width: hoveredElement.getBoundingClientRect().width,
            height: hoveredElement.getBoundingClientRect().height,
          }}
        >
          <div className="absolute -top-6 -left-0.5 bg-primary text-white text-[10px] font-mono px-2 py-1 rounded shadow-sm whitespace-nowrap">
            &lt;{hoveredElement.tagName.toLowerCase()}&gt; {typeof hoveredElement.className === 'string' ? hoveredElement.className.split(' ')[0] : (hoveredElement.getAttribute('class') || '').split(' ')[0]}
          </div>
        </div>
      )}

      {/* Selected Element Highlighter */}
      {selectedElement && (
        <div 
          className="fixed pointer-events-none z-[9998] border-2 border-accent bg-accent/5"
          style={{
            top: selectedElement.getBoundingClientRect().top,
            left: selectedElement.getBoundingClientRect().left,
            width: selectedElement.getBoundingClientRect().width,
            height: selectedElement.getBoundingClientRect().height,
          }}
        />
      )}

      {/* Control Panel */}
      {selectedElement && (
        <div 
          id="visual-inspector-panel"
          className="fixed z-[10000] w-72 bg-card-bg border border-card-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          style={{ top: panelPos.y, left: panelPos.x }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-black/5 cursor-move">
            <div className="flex items-center gap-2 text-xs font-bold text-surface-text">
              <Settings2 size={14} /> Element Inspector
            </div>
            <button 
              onClick={() => setSelectedElement(null)}
              className="p-1 hover:bg-black/10 rounded-md transition-colors text-surface-text opacity-70"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-mono bg-black/5 p-2 rounded text-surface-text break-all">
              &lt;{selectedElement.tagName.toLowerCase()} className="{typeof selectedElement.className === 'string' ? selectedElement.className : selectedElement.getAttribute('class') || ''}"&gt;
            </div>
            
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Typography</div>
              <button 
                onClick={() => {
                  selectedElement.contentEditable = 'true';
                  selectedElement.focus();
                  selectedElement.style.outline = '2px dashed var(--accent)';
                  selectedElement.style.outlineOffset = '2px';
                  
                  const handleBlur = () => {
                    selectedElement.contentEditable = 'false';
                    selectedElement.style.outline = '';
                    selectedElement.style.outlineOffset = '';
                    selectedElement.removeEventListener('blur', handleBlur);
                    selectedElement.removeEventListener('keydown', handleKey);
                    
                    // Save patch
                    startTransition(async () => {
                      await saveVisualPatch({
                        selector: getCssPath(selectedElement),
                        type: 'text',
                        value: selectedElement.textContent || ''
                      });
                    });
                  };
                  
                  const handleKey = (e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      e.preventDefault();
                      selectedElement.blur();
                    }
                  };
                  
                  selectedElement.addEventListener('blur', handleBlur);
                  selectedElement.addEventListener('keydown', handleKey);
                }}
                className="w-full flex justify-between items-center px-3 py-2 text-xs font-medium border border-card-border rounded-btn bg-card-bg hover:bg-card-hover text-surface-text transition-colors"
              >
                <span className="flex items-center gap-2"><Type size={12} /> Edit Text Content</span>
              </button>

              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 mt-4">Design Tokens</div>
              <div className="flex flex-col gap-2">
                <select 
                  className="w-full px-3 py-2 text-xs font-medium border border-card-border rounded-btn bg-card-bg text-surface-text focus:outline-none focus:ring-1 focus:ring-accent"
                  onChange={(e) => {
                    if (!e.target.value) return;
                    
                    const newClass = e.target.value;
                    const currentClass = typeof selectedElement.className === 'string' 
                      ? selectedElement.className 
                      : (selectedElement.getAttribute('class') || '');
                      
                    // Basic duplicate check
                    if (!currentClass.includes(newClass)) {
                      const updatedClass = `${currentClass} ${newClass}`.trim();
                      if (typeof selectedElement.className === 'string') {
                        selectedElement.className = updatedClass;
                      } else {
                        selectedElement.setAttribute('class', updatedClass);
                      }
                      
                      // Save patch
                      startTransition(async () => {
                        await saveVisualPatch({
                          selector: getCssPath(selectedElement),
                          type: 'class',
                          value: updatedClass
                        });
                      });
                    }
                    e.target.value = ''; // Reset select
                  }}
                >
                  <option value="">Select a token to bind...</option>
                  <optgroup label="Backgrounds">
                    <option value="bg-primary">Primary Brand</option>
                    <option value="bg-accent">Accent Color</option>
                    <option value="bg-surface">App Background</option>
                    <option value="bg-card-bg">Card Background</option>
                    <option value="bg-btn-bg">Button Background</option>
                  </optgroup>
                  <optgroup label="Text Colors">
                    <option value="text-primary">Primary Brand Text</option>
                    <option value="text-surface-text">Default Text</option>
                    <option value="text-btn-text">Button Text</option>
                  </optgroup>
                  <optgroup label="Radii & Shapes">
                    <option value="rounded-btn">Button Roundness</option>
                    <option value="rounded-card">Card Roundness</option>
                  </optgroup>
                </select>
                <p className="text-[9px] opacity-60 leading-tight">
                  Binding appends the token's Tailwind class to the element, linking it to the global design system.
                </p>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 mt-4">Developer Tools</div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium opacity-80"><Code size={12} /> Edit Raw Tailwind</label>
                <textarea 
                  defaultValue={typeof selectedElement.className === 'string' ? selectedElement.className : selectedElement.getAttribute('class') || ''}
                  onChange={(e) => {
                    const newClass = e.target.value;
                    if (typeof selectedElement.className === 'string') {
                      selectedElement.className = newClass;
                    } else {
                      selectedElement.setAttribute('class', newClass);
                    }
                    
                    // Save patch
                    startTransition(async () => {
                      await saveVisualPatch({
                        selector: getCssPath(selectedElement),
                        type: 'class',
                        value: newClass
                      });
                    });
                  }}
                  className="w-full h-24 p-2 text-xs font-mono border rounded bg-transparent border-card-border focus:ring-1 focus:ring-accent outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Toggle Button when active */}
      {!selectedElement && (
        <div className="fixed bottom-6 right-6 z-[10000] flex gap-2">
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to clear all visual patches? This will reset the UI to its original code state.')) {
                startTransition(async () => {
                  await clearAllPatches();
                });
              }
            }}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-card-bg text-surface-text border border-card-border rounded-btn shadow-lg hover:bg-card-hover transition-colors text-xs font-bold disabled:opacity-50"
          >
            <Trash2 size={14} /> Clear Patches
          </button>
          
          <button 
            onClick={() => setIsActive(false)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-btn shadow-lg hover:bg-rose-600 transition-colors text-xs font-bold"
          >
            <X size={14} /> Exit Inspector Mode
          </button>
        </div>
      )}
    </>
  );
}
