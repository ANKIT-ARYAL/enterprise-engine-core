'use client';

import React, { useState, useEffect } from 'react';
import { MousePointer2, X, Settings2, Code, Type, Palette } from 'lucide-react';

export default function VisualInspector() {
  const [isActive, setIsActive] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });

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
            &lt;{hoveredElement.tagName.toLowerCase()}&gt; {hoveredElement.className.split(' ')[0]}
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
              &lt;{selectedElement.tagName.toLowerCase()} className="{selectedElement.className}"&gt;
            </div>
            
            {/* Quick Actions (Stubbed for now, visually fully represented) */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">Typography</div>
              <button className="w-full flex justify-between items-center px-3 py-2 text-xs font-medium border border-card-border rounded-btn bg-card-bg hover:bg-card-hover text-surface-text transition-colors">
                <span className="flex items-center gap-2"><Type size={12} /> Edit Text Content</span>
              </button>

              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 mt-4">Design Tokens</div>
              <button className="w-full flex justify-between items-center px-3 py-2 text-xs font-medium border border-card-border rounded-btn bg-card-bg hover:bg-card-hover text-surface-text transition-colors">
                <span className="flex items-center gap-2"><Palette size={12} /> Bind to Token</span>
                <span className="opacity-50">Select...</span>
              </button>

              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 mt-4">Developer Tools</div>
              <button className="w-full flex justify-between items-center px-3 py-2 text-xs font-medium border border-card-border rounded-btn bg-card-bg hover:bg-card-hover text-surface-text transition-colors">
                <span className="flex items-center gap-2"><Code size={12} /> Edit Raw Tailwind</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Toggle Button when active */}
      {!selectedElement && (
        <div className="fixed bottom-6 right-6 z-[10000]">
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
