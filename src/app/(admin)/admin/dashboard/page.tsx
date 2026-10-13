/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useState, useEffect, useRef } from 'react';
import { X, GripHorizontal, Zap, Shield, FileJson } from 'lucide-react';
import { AddSectionDropdown } from '@/components/admin/AddSectionDropdown';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Layout {
  width: string;
  height: string;
}

const SortableDataTable = ({ model, onRemove, layout, onResize }: { model: string, onRemove: () => void, layout?: Layout, onResize: (m: string, w: string, h: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: model });
  const internalRef = useRef<HTMLDivElement | null>(null);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    width: layout?.width || '100%',
    height: layout?.height || 'auto',
  };

  const handleMouseUp = () => {
    if (internalRef.current) {
      const w = internalRef.current.style.width;
      const h = internalRef.current.style.height;
      if (w || h) {
        onResize(model, w, h);
      }
    }
  };

  return (
    <div 
      ref={(node) => {
        setNodeRef(node);
        internalRef.current = node;
      }}
      style={style}
      onMouseUp={handleMouseUp}
      className={`dynamic-card bg-white border border-[#ececec] rounded-2xl shadow-sm p-6 relative group animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-[300px] ${isDragging ? 'shadow-2xl scale-[1.02] border-slate-300' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded transition-colors hover:bg-slate-50">
            <GripHorizontal size={18} />
          </button>
          <h3 className="text-lg font-bold text-slate-900">{model} Management</h3>
        </div>
        <button onClick={onRemove} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
          <X size={16} />
        </button>
      </div>
      <div className="overflow-x-auto h-[calc(100%-40px)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ececec] text-[12px] font-semibold text-slate-500 uppercase">
              <th className="pb-3 pl-2">ID</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Created At</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-slate-700">
            {[1, 2, 3].map((row) => (
              <tr key={row} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                <td className="py-3 pl-2 font-mono text-xs text-slate-400">#{(Math.random() * 10000).toFixed(0)}</td>
                <td className="py-3 font-medium truncate max-w-[120px]">Sample {model} {row}</td>
                <td className="py-3">
                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[11px] font-bold">Active</span>
                </td>
                <td className="py-3 text-slate-500 whitespace-nowrap">Just now</td>
                <td className="py-3 text-right pr-2">
                  <button className="text-blue-600 font-medium hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [layouts, setLayouts] = useState<Record<string, Layout>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedSections = localStorage.getItem('dashboard-sections');
    if (savedSections) setActiveSections(JSON.parse(savedSections));
    
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    if (savedLayouts) setLayouts(JSON.parse(savedLayouts));
  }, []);

  const handleAddSection = (model: string) => {
    setActiveSections(prev => {
      if (prev.includes(model)) return prev;
      const next = [...prev, model];
      localStorage.setItem('dashboard-sections', JSON.stringify(next));
      return next;
    });
  };

  const handleRemoveSection = (model: string) => {
    setActiveSections(prev => {
      const next = prev.filter(m => m !== model);
      localStorage.setItem('dashboard-sections', JSON.stringify(next));
      return next;
    });
  };

  const handleResize = (model: string, width: string, height: string) => {
    setLayouts(prev => {
      const next = { ...prev, [model]: { width, height } };
      localStorage.setItem('dashboard-layouts', JSON.stringify(next));
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setActiveSections(prev => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const next = arrayMove(prev, oldIndex, newIndex);
        localStorage.setItem('dashboard-sections', JSON.stringify(next));
        return next;
      });
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6 pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1280px) {
          .dynamic-card { width: 100% !important; height: auto !important; }
        }
      `}} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 relative z-40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Here is a summary of your systems performance today.</p>
        </div>
        <div className="flex items-center gap-3 relative z-40">
          <button className="px-4 py-2 text-[13px] font-medium text-foreground bg-card border border-border rounded-lg shadow-sm hover:bg-muted transition-colors">
            Download Report
          </button>
          <AddSectionDropdown onAddSection={handleAddSection} />
        </div>
      </div>

      {activeSections.length === 0 ? (
        <div className="w-full py-12">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Zap size={32} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Enterprise Engine</h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              The core infrastructure is running perfectly. You are currently operating in a headless, zero-bloat state. Ready to inject your projects custom features?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="bg-card border border-border rounded-2xl p-6">
              <Shield size={24} className="text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Hyper-Secure Baseline</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Authentication, JWT sessions, and role-based access control are active. No unused tables or bloated dependencies exist in this environment.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <FileJson size={24} className="text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Zero-Code Admin UI</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you define new entities, this panel will automatically parse your DMMF and instantly render the required UI forms and data tables.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <DndContext id="dashboard-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeSections} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap items-start gap-6">
              {activeSections.map((section) => (
                <SortableDataTable 
                  key={section} 
                  model={section} 
                  onRemove={() => handleRemoveSection(section)}
                  layout={layouts[section]}
                  onResize={handleResize}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
