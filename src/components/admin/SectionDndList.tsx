'use client';

import React, { useState } from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { softDeleteSectionAction } from '@/app/actions/admin-mutations';

interface SectionData {
  id: string;
  type: string;
  isEnabled: boolean;
  order: number;
}

interface SectionDndListProps {
  initialSections: SectionData[];
  pageSlug: string;
}

function SortableItem({ section, onToggle, onDelete }: { section: SectionData, onToggle: (id: string, isEnabled: boolean) => void, onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 mb-3 bg-white border border-[#ececec] rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors active:cursor-grabbing">
          <GripVertical size={20} />
        </button>
        <div>
          <h3 className="text-[14px] font-semibold text-slate-900 capitalize">{section.type || 'Generic Section'}</h3>
          <p className="text-[12px] text-slate-500 font-mono mt-0.5">ID: {section.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onToggle(section.id, section.isEnabled)} className={`p-2 rounded-lg transition-colors hover:bg-slate-50 border border-transparent hover:border-slate-200 ${section.isEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
          {section.isEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button onClick={() => onDelete(section.id)} className="p-2 rounded-lg transition-colors hover:bg-red-50 text-red-500 border border-transparent hover:border-red-100">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export function SectionDndList({ initialSections, pageSlug }: SectionDndListProps) {
  const [sections, setSections] = useState(initialSections);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // In a real app, you would send an API request here to update the order in DB
        // e.g., updateSectionOrderAction(newArray.map((s, idx) => ({ id: s.id, order: idx })));
        
        return newArray;
      });
    }
  };

  const handleToggle = async (id: string, isEnabled: boolean) => {
    // In a real app, you would trigger a server action here to toggle
    setSections(sections.map(s => s.id === id ? { ...s, isEnabled: !isEnabled } : s));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Move section to recycle bin?')) {
      await softDeleteSectionAction(id, pageSlug);
      setSections(sections.filter(s => s.id !== id));
    }
  };

  const dndId = React.useId();

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="w-full space-y-4">
          {sections.map((section) => (
            <SortableItem key={section.id} section={section} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
