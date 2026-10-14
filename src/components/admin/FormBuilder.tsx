/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Settings, Image as ImageIcon, AlignLeft, List, Link, MousePointer2, GripVertical, AlertCircle, Search, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types & Interfaces ---

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'checkbox' | 'textarea' | 'dropdown' | 'relation' | 'image' | 'button';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  id: string;
  type: FieldType;
  label: string;
  name: string; // Used for data mapping, must be unique
  placeholder?: string;
  required?: boolean;
  width?: '1/4' | '1/3' | '1/2' | '2/3' | 'full'; // For resizable fields
  
  // Specific to Dropdown
  options?: FieldOption[];
  isMulti?: boolean;
  isAsyncCreatable?: boolean;

  // Specific to Relation
  parentFieldId?: string; // e.g. "country_field_id"
  relationMapping?: Record<string, FieldOption[]>; // e.g. { "Nepal": [{label: "Kathmandu", value: "KTM"}] }

  // Specific to Image
  maxImages?: number; // 1 to 5
  maxSizeMB?: number; // 1

  // Specific to Button
  buttonAction?: 'submit' | 'reset' | 'custom';
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'custom';
  buttonCustomBg?: string;
  buttonCustomText?: string;

  // Dependency Logic
  enableChildrenOnValue?: string;
  childrenElements?: string[]; // IDs of fields that are enabled when this condition is met
}

export interface FormSchema {
  id: string;
  name: string;
  componentName?: string;
  description: string;
  inputRoundness?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  inputShadow?: 'none' | 'sm' | 'md' | 'lg';
  fields: FieldConfig[];
}

// --- Subcomponents ---

const OptionManager = ({ options, onChange }: { options: FieldOption[], onChange: (opts: FieldOption[]) => void }) => {
  return (
    <div className="space-y-2 mt-2">
      {options.map((opt, i) => (
        <div key={i} className="flex gap-2 items-center">
           <input 
             className="w-full bg-black/5 border border-card-border px-2 py-1.5 text-[12px] text-surface-text rounded-sm focus:border-[color:var(--primary)] outline-none" 
             placeholder="Label (e.g. United States)" 
             value={opt.label} 
             onChange={e => { 
               const n = [...options]; 
               n[i].label = e.target.value; 
               n[i].value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
               onChange(n); 
             }} 
           />
           <input 
             readOnly
             className="w-full bg-black/5 border border-card-border px-2 py-1.5 text-[12px] text-surface-text rounded-sm outline-none opacity-50 cursor-not-allowed" 
             placeholder="Auto-generated value" 
             value={opt.value} 
           />
           <button onClick={() => { const n = [...options]; n.splice(i, 1); onChange(n); }} className="opacity-50 hover:opacity-100"><Trash2 size={14} className="text-[color:var(--error)]" /></button>
        </div>
      ))}
      <button onClick={() => onChange([...options, {label: '', value: ''}])} className="text-[11px] font-bold text-[color:var(--primary)] flex items-center gap-1 mt-2 hover:opacity-80">
        <Plus size={12}/> Add Option
      </button>
    </div>
  )
}

// 3. Sortable Canvas Item
const SortableFieldItem = ({ field, schema, isSelected, onSelect, onDelete }: { field: FieldConfig, schema: FormSchema, isSelected: boolean, onSelect: () => void, onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  // Width mapping
  const widthClass = {
    '1/4': 'w-[23%]',
    '1/3': 'w-[31%]',
    '1/2': 'w-[48%]',
    '2/3': 'w-[64%]',
    'full': 'w-full'
  }[field.width || 'full'];

  const rClass = { none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full' }[schema.inputRoundness || 'md'] || 'rounded-md';
  const sClass = { none: 'shadow-none', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg' }[schema.inputShadow || 'none'] || 'shadow-none';
  const inputGlobalClass = `w-full bg-black/5 border border-card-border px-4 py-2.5 text-[13px] text-surface-text ${rClass} ${sClass}`;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={onSelect}
      className={`${widthClass} relative group p-4 border-2 rounded-card transition-all cursor-pointer bg-card-bg shadow-sm ${isSelected ? 'border-[color:var(--primary)] ring-4 ring-[color:var(--primary)]/10' : 'border-card-border hover:border-black/20'} ${isDragging ? 'opacity-50 shadow-2xl scale-[1.02]' : ''}`}
    >
      {/* Drag Handle & Delete */}
      <div className="absolute -top-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 gap-2">
        <button {...attributes} {...listeners} className="bg-card-bg border border-card-border shadow-sm rounded-btn p-1.5 opacity-50 hover:opacity-100 text-surface-text cursor-grab">
          <GripVertical size={14} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="bg-card-bg border border-card-border shadow-sm rounded-btn p-1.5 opacity-50 hover:opacity-100 hover:text-[color:var(--error)]">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="pointer-events-none">
        {field.type !== 'button' && (
          <label className="block text-[13px] font-bold text-surface-text mb-2">
            {field.label} {field.required && <span className="text-[color:var(--error)]">*</span>}
          </label>
        )}
        
        {['text', 'email', 'password', 'number', 'tel', 'url', 'date'].includes(field.type) && (
          <input disabled type={field.type} placeholder={field.placeholder || `Enter ${field.type}...`} className={inputGlobalClass} />
        )}

        {field.type === 'checkbox' && (
          <div className="flex items-center gap-2 mt-2">
            <input disabled type="checkbox" className={`w-4 h-4 border-card-border bg-black/5 ${rClass === 'rounded-full' ? 'rounded-full' : 'rounded'}`} />
            <span className="text-[13px] opacity-70">Checkbox Option</span>
          </div>
        )}
        
        {field.type === 'textarea' && (
          <textarea disabled placeholder={field.placeholder} className={`${inputGlobalClass} h-24 resize-none`} />
        )}

        {field.type === 'dropdown' && (
          <div className={`${inputGlobalClass} opacity-70 flex justify-between items-center`}>
            {field.placeholder || 'Select option...'}
            <Search size={14} />
          </div>
        )}

        {field.type === 'relation' && (
          <div className={`${inputGlobalClass} opacity-70 flex justify-between items-center border-dashed`}>
            <span className="flex items-center gap-2">
              <Link size={14} /> 
              {field.parentFieldId ? `Linked to: ${schema.fields.find(f => f.id === field.parentFieldId)?.label || 'Unknown'}` : 'Top-Level Relation'}
            </span>
          </div>
        )}

        {field.type === 'image' && (
          <div className={`${inputGlobalClass} border-dashed px-4 py-6 text-center opacity-70 flex flex-col items-center`}>
             <ImageIcon size={24} className="mb-2" />
             <span className="text-[12px] font-medium">Image Upload Area</span>
          </div>
        )}

        {field.type === 'button' && (
          <button 
            disabled 
            style={field.buttonVariant === 'custom' ? { backgroundColor: field.buttonCustomBg || '#000', color: field.buttonCustomText || '#fff' } : undefined}
            className={`w-full py-3 text-[13px] font-bold transition-all ${rClass} ${sClass} ${field.buttonVariant === 'primary' ? 'bg-btn-bg text-btn-text' : field.buttonVariant === 'outline' ? 'bg-transparent border-2 border-[color:var(--primary)] text-[color:var(--primary)]' : field.buttonVariant === 'custom' ? '' : 'bg-black/10 text-surface-text'}`}
          >
            {field.label}
          </button>
        )}
      </div>
    </div>
  );
};


// --- Main Form Builder Component ---

export function FormBuilder({ onSave, initialSchema }: { onSave?: (schema: FormSchema) => void, initialSchema?: FormSchema }) {
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsMounted(true), []);

  const [schema, setSchema] = useState<FormSchema>(() => initialSchema || {
    id: 'form_root',
    name: 'Untitled Form',
    description: 'A new dynamic form',
    fields: []
  });
  const [activeRelationMapTab, setActiveRelationMapTab] = useState<string>('');

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Tools
  const addField = (type: FieldType) => {
    const newField: FieldConfig = {
      id: `f_${Date.now()}`,
      type,
      label: `New ${type}`,
      name: `field_${Date.now()}`,
      width: 'full',
      placeholder: '',
      required: false,
      options: type === 'dropdown' ? [{label: 'Option 1', value: 'opt1'}] : [],
      isAsyncCreatable: type === 'dropdown' ? true : undefined,
      maxImages: type === 'image' ? 5 : undefined,
      maxSizeMB: type === 'image' ? 1 : undefined,
      buttonVariant: type === 'button' ? 'primary' : undefined,
    };
    
    setSchema(prev => ({ ...prev, fields: [...prev.fields, newField] }));
    setSelectedFieldId(newField.id);
  };

  const updateSelectedField = (updates: Partial<FieldConfig>) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f)
    }));
  };

  const removeField = (id: string) => {
    setSchema(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  // DND Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSchema(prev => {
        const oldIndex = prev.fields.findIndex(f => f.id === active.id);
        const newIndex = prev.fields.findIndex(f => f.id === over.id);
        return { ...prev, fields: arrayMove(prev.fields, oldIndex, newIndex) };
      });
    }
  };

  // Validation before save
  const handleFinalize = () => {
    // 1. Check empty form
    if (schema.fields.length === 0) {
      toast.error('Form must have at least one field.');
      return;
    }

    // 2. Check for duplicate "name" keys
    const names = schema.fields.map(f => f.name);
    const duplicates = names.filter((item, index) => names.indexOf(item) !== index);
    if (duplicates.length > 0) {
      toast.error(`Duplicate field names detected: ${duplicates.join(', ')}. Data keys must be unique.`);
      return;
    }

    // 3. Check for empty labels
    const emptyLabels = schema.fields.some(f => (!f.label || f.label.trim() === '') && f.type !== 'button');
    if (emptyLabels) {
      toast.error('All fields must have a valid label.');
      return;
    }

    // Optimistic Save
    const toastId = toast.loading('Finalizing and compiling form schema...');
    setTimeout(() => {
      toast.success('Form successfully compiled and saved as reusable component!', { id: toastId });
      if (onSave) onSave(schema);
    }, 1200);
  };

  const selectedField = schema.fields.find(f => f.id === selectedFieldId);

  return (
    <div className="flex flex-col xl:flex-row h-full min-h-[700px] bg-card-bg border border-card-border rounded-card overflow-hidden shadow-2xl">
      
      {/* LEFT: Toolbar & Properties */}
      <div className="w-full xl:w-80 border-b xl:border-b-0 xl:border-r border-card-border bg-black/5 flex flex-col xl:h-full overflow-hidden shrink-0">
        <div className="p-5 border-b border-card-border">
          <h2 className="text-[12px] uppercase tracking-wider font-bold opacity-50 flex items-center gap-2 mb-4">
            <Settings size={14} /> Form Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold opacity-50 uppercase block mb-1">Form Name</label>
              <input 
                className="w-full bg-transparent border-b-2 border-transparent hover:border-black/10 focus:border-[color:var(--primary)] px-0 py-1 text-[15px] font-bold text-surface-text outline-none transition-all placeholder:opacity-40"
                value={schema.name}
                onChange={(e) => setSchema({...schema, name: e.target.value})}
                placeholder="Form Title"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold opacity-50 uppercase block mb-1">React Component Name</label>
              <input 
                className="w-full bg-transparent border-b border-transparent hover:border-black/10 focus:border-[color:var(--primary)] px-0 py-1 text-[13px] font-mono text-[color:var(--primary)] outline-none transition-all placeholder:opacity-40"
                value={schema.componentName || ''}
                onChange={(e) => setSchema({...schema, componentName: e.target.value.replace(/[^a-zA-Z0-9]/g, '')})}
                placeholder="e.g. ContactForm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold opacity-50 uppercase block mb-1">Description</label>
              <textarea 
                className="w-full bg-black/5 border border-transparent hover:border-black/10 rounded-md px-3 py-2 text-[12px] opacity-80 h-16 resize-none focus:border-[color:var(--primary)] outline-none transition-all text-surface-text placeholder:opacity-40"
                value={schema.description || ''}
                onChange={(e) => setSchema({...schema, description: e.target.value})}
                placeholder="Form description..."
              />
            </div>
            <div className="pt-2 border-t border-card-border mt-4">
              <label className="text-[11px] font-bold opacity-50 uppercase block mb-1 mt-2">Input Roundness</label>
              <select 
                className="w-full bg-black/5 border border-card-border rounded-btn px-3 py-2 text-[12px] focus:bg-card-bg focus:ring-2 focus:ring-[color:var(--primary)] outline-none transition-all text-surface-text"
                value={schema.inputRoundness || 'md'}
                onChange={(e) => setSchema({...schema, inputRoundness: e.target.value as 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'})}
              >
                <option value="none">Sharp (0px)</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
                <option value="full">Pill (Full)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold opacity-50 uppercase block mb-1">Input Shadow</label>
              <select 
                className="w-full bg-black/5 border border-card-border rounded-btn px-3 py-2 text-[12px] focus:bg-card-bg focus:ring-2 focus:ring-[color:var(--primary)] outline-none transition-all text-surface-text"
                value={schema.inputShadow || 'none'}
                onChange={(e) => setSchema({...schema, inputShadow: e.target.value as 'none' | 'sm' | 'md' | 'lg'})}
              >
                <option value="none">No Shadow</option>
                <option value="sm">Small Shadow</option>
                <option value="md">Medium Shadow</option>
                <option value="lg">Large Shadow</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {!selectedField ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Add Fields</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => addField('text')} className="flex flex-col items-center justify-center p-4 bg-card-bg border border-card-border rounded-card hover:border-black/30 hover:shadow-sm transition-all text-surface-text opacity-80 hover:opacity-100">
                    <AlignLeft size={20} className="mb-2 opacity-50" />
                    <span className="text-[11px] font-bold">Text Input</span>
                  </button>
                  <button onClick={() => addField('dropdown')} className="flex flex-col items-center justify-center p-4 bg-card-bg border border-card-border rounded-card hover:border-black/30 hover:shadow-sm transition-all text-surface-text opacity-80 hover:opacity-100">
                    <List size={20} className="mb-2 opacity-50" />
                    <span className="text-[11px] font-bold">Dropdown</span>
                  </button>
                  <button onClick={() => addField('relation')} className="flex flex-col items-center justify-center p-4 bg-card-bg border border-card-border rounded-card hover:border-black/30 hover:shadow-sm transition-all text-surface-text opacity-80 hover:opacity-100">
                    <Link size={20} className="mb-2 opacity-50" />
                    <span className="text-[11px] font-bold">Relational</span>
                  </button>
                  <button onClick={() => addField('image')} className="flex flex-col items-center justify-center p-4 bg-card-bg border border-card-border rounded-card hover:border-black/30 hover:shadow-sm transition-all text-surface-text opacity-80 hover:opacity-100">
                    <ImageIcon size={20} className="mb-2 opacity-50" />
                    <span className="text-[11px] font-bold">Image</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider opacity-50 mb-3">Layout & Actions</h3>
                <button onClick={() => addField('button')} className="w-full flex items-center gap-3 p-3 bg-card-bg border border-card-border rounded-card hover:border-black/30 hover:shadow-sm transition-all text-surface-text opacity-80 hover:opacity-100">
                  <MousePointer2 size={16} className="opacity-50" />
                  <span className="text-[12px] font-bold">Action Button</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-surface-text flex items-center gap-2">
                  Field Properties
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => addField('text')} className="flex items-center gap-1 text-[10px] font-bold bg-black/5 hover:bg-black/10 text-surface-text px-2 py-1 rounded transition-colors">
                    <Plus size={12} /> Add Field
                  </button>
                  <button onClick={() => setSelectedFieldId(null)} className="p-1 hover:bg-black/5 rounded-md opacity-50 hover:opacity-100">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold opacity-50 uppercase">Field Type</label>
                  <select 
                    className="w-full mt-1 bg-card-bg border border-card-border rounded-btn px-3 py-2 text-[13px] outline-none focus:border-[color:var(--primary)] text-surface-text"
                    value={selectedField.type}
                    onChange={(e) => updateSelectedField({ type: e.target.value as FieldType })}
                  >
                    <option value="text">Short Text</option>
                    <option value="email">Email Address</option>
                    <option value="password">Password</option>
                    <option value="number">Number</option>
                    <option value="tel">Phone Number</option>
                    <option value="url">URL Link</option>
                    <option value="date">Date Picker</option>
                    <option value="checkbox">Checkbox (Toggle)</option>
                    <option value="textarea">Textarea (Long text)</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="relation">Relational Dropdown</option>
                    <option value="image">Image Upload</option>
                    <option value="button">Action Button</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold opacity-50 uppercase flex items-center justify-between">
                    Field Label
                    <div className="flex items-center gap-1.5 normal-case font-medium">
                      <input 
                        type="checkbox" 
                        checked={selectedField.required || false}
                        onChange={(e) => updateSelectedField({ required: e.target.checked })}
                        className="w-3 h-3"
                      />
                      <span className="text-[10px] opacity-70">Required</span>
                    </div>
                  </label>
                  <input 
                    className="w-full mt-1 bg-card-bg border border-card-border rounded-btn px-3 py-2 text-[13px] outline-none focus:border-[color:var(--primary)] text-surface-text"
                    value={selectedField.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      const name = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                      updateSelectedField({ 
                        label, 
                        name: name || `field_${selectedField.id.split('_')[1]}` 
                      });
                    }}
                  />
                </div>

                {!['checkbox', 'image', 'button'].includes(selectedField.type) && (
                  <div>
                    <label className="text-[11px] font-bold opacity-50 uppercase">Placeholder text</label>
                    <input 
                      className="w-full mt-1 bg-card-bg border border-card-border rounded-btn px-3 py-2 text-[13px] outline-none focus:border-[color:var(--primary)] text-surface-text"
                      value={selectedField.placeholder || ''}
                      onChange={(e) => updateSelectedField({ placeholder: e.target.value })}
                      placeholder={`e.g. Enter ${selectedField.label.toLowerCase()}...`}
                    />
                  </div>
                )}
                
                <div>
                  <label className="text-[11px] font-bold opacity-50 uppercase">Data Key (Name)</label>
                  <input 
                    disabled
                    className="w-full mt-1 bg-black/5 border border-card-border rounded-btn px-3 py-2 text-[13px] font-mono text-[color:var(--primary)] outline-none cursor-not-allowed opacity-70"
                    value={selectedField.name}
                  />
                  <p className="text-[10px] opacity-50 mt-1">Auto-generated unique key for database/API payload.</p>
                </div>

                {/* Sizing Control */}
                <div>
                  <label className="text-[11px] font-bold opacity-50 uppercase">Field Width</label>
                  <div className="flex bg-card-bg border border-card-border rounded-btn p-1 mt-1 gap-1">
                    {['1/4', '1/2', 'full'].map(size => (
                      <button 
                        key={size}
                        onClick={() => updateSelectedField({ width: size as '1/4' | '1/3' | '1/2' | '2/3' | 'full' })}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-sm transition-colors ${selectedField.width === size ? 'bg-[color:var(--primary)] text-white shadow-sm' : 'opacity-70 hover:bg-black/5 text-surface-text'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Logic (Enable children) */}
                <div className="pt-4 border-t border-card-border">
                  <label className="text-[11px] font-bold opacity-50 uppercase flex items-center gap-1"><AlertCircle size={12}/> Conditional Logic</label>
                  <p className="text-[10px] opacity-50 mt-1 mb-2">If this field equals a specific value, enable child fields.</p>
                  <input 
                    placeholder="Trigger value (e.g. Yes)"
                    className="w-full bg-card-bg border border-card-border rounded-btn px-3 py-2 text-[13px] outline-none focus:border-[color:var(--primary)] mb-2 text-surface-text"
                    value={selectedField.enableChildrenOnValue || ''}
                    onChange={(e) => updateSelectedField({ enableChildrenOnValue: e.target.value })}
                  />
                </div>

                {selectedField.type === 'image' && (
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-card-border">
                    <div>
                      <label className="text-[11px] font-bold opacity-50 uppercase">Max Images</label>
                      <input type="number" min="1" max="10" className="w-full mt-1 bg-card-bg border border-card-border rounded-btn px-3 py-2 text-[13px] text-surface-text" value={selectedField.maxImages} onChange={e => updateSelectedField({ maxImages: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold opacity-50 uppercase">Max Size (MB)</label>
                      <input type="number" min="1" max="20" className="w-full mt-1 bg-card-bg border border-card-border rounded-btn px-3 py-2 text-[13px] text-surface-text" value={selectedField.maxSizeMB} onChange={e => updateSelectedField({ maxSizeMB: parseInt(e.target.value) })} />
                    </div>
                  </div>
                )}

                {selectedField.type === 'dropdown' && (
                  <div className="pt-4 border-t border-card-border">
                    <div className="mb-4">
                      <label className="text-[11px] font-bold opacity-50 uppercase">Dropdown Options</label>
                      <OptionManager options={selectedField.options || []} onChange={opts => updateSelectedField({ options: opts })} />
                    </div>
                    <div className="flex items-center justify-between mb-3 border-t border-card-border pt-4">
                      <label className="text-[11px] font-bold opacity-50 uppercase">Async Creatable</label>
                      <input type="checkbox" checked={selectedField.isAsyncCreatable} onChange={e => updateSelectedField({ isAsyncCreatable: e.target.checked })} />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-bold opacity-50 uppercase">Multi-Select</label>
                      <input type="checkbox" checked={selectedField.isMulti} onChange={e => updateSelectedField({ isMulti: e.target.checked })} />
                    </div>
                  </div>
                )}

                {selectedField.type === 'relation' && (
                  <div className="pt-4 border-t border-card-border space-y-3">
                    <div>
                      <label className="text-[11px] font-bold opacity-50 uppercase">Parent Field</label>
                      <select 
                        className="w-full mt-1 bg-card-bg border border-card-border rounded-btn px-3 py-2 text-[13px] outline-none text-surface-text focus:border-[color:var(--primary)]"
                        value={selectedField.parentFieldId || ''}
                        onChange={(e) => updateSelectedField({ parentFieldId: e.target.value })}
                      >
                        <option value="">None (Top-Level Relation)</option>
                        {schema.fields.filter(f => f.id !== selectedField.id && ['dropdown', 'relation', 'text'].includes(f.type)).map(f => (
                          <option key={f.id} value={f.id}>{f.label} ({f.type})</option>
                        ))}
                      </select>
                      <p className="text-[11px] opacity-50 mt-1">
                        {selectedField.parentFieldId 
                          ? "This dropdown will load dynamically based on the parent's value." 
                          : "This field acts as the root of the hierarchy."}
                      </p>
                    </div>
                    
                    {!selectedField.parentFieldId && (
                      <div className="pt-3 border-t border-card-border mt-3">
                        <label className="text-[11px] font-bold opacity-50 uppercase">Base Options</label>
                        <p className="text-[11px] opacity-50 mt-1 mb-2">Configure the root options for this relation.</p>
                        <OptionManager options={selectedField.options || []} onChange={opts => updateSelectedField({ options: opts })} />
                      </div>
                    )}

                    {selectedField.parentFieldId && (
                      <div className="pt-3 border-t border-card-border mt-3">
                        <label className="text-[11px] font-bold opacity-50 uppercase">Dependent Options Mapping</label>
                        <p className="text-[11px] opacity-50 mt-1 mb-3">Define the child options for each possible parent value.</p>
                        
                        {(() => {
                          const parentField = schema.fields.find(f => f.id === selectedField.parentFieldId);
                          const parentOptions = parentField?.options || [];
                          if (parentOptions.length === 0) {
                            return <div className="text-[11px] opacity-50 text-[color:var(--error)] p-2 bg-[color:var(--error)]/10 rounded">Please add Base Options to the parent field "{parentField?.label || 'Parent'}" first!</div>;
                          }

                          const activeVal = activeRelationMapTab || parentOptions[0].value;
                          const currentMapping = selectedField.relationMapping || {};
                          const activeOptions = currentMapping[activeVal] || [];

                          return (
                            <div className="border border-card-border rounded-card overflow-hidden">
                              <div className="flex overflow-x-auto border-b border-card-border custom-scrollbar">
                                {parentOptions.map(pOpt => (
                                  <button
                                    key={pOpt.value}
                                    onClick={() => setActiveRelationMapTab(pOpt.value)}
                                    className={`px-3 py-2 text-[11px] font-bold whitespace-nowrap transition-colors ${activeVal === pOpt.value ? 'bg-[color:var(--primary)] text-white' : 'bg-black/5 hover:bg-black/10 text-surface-text opacity-70'}`}
                                  >
                                    If: {pOpt.label}
                                  </button>
                                ))}
                              </div>
                              <div className="p-3 bg-card-bg">
                                <OptionManager 
                                  options={activeOptions} 
                                  onChange={opts => {
                                    updateSelectedField({ 
                                      relationMapping: {
                                        ...currentMapping,
                                        [activeVal]: opts
                                      } 
                                    });
                                  }} 
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {selectedField.type === 'button' && (
                  <div className="pt-4 border-t border-card-border space-y-3">
                    <div>
                      <label className="text-[11px] font-bold opacity-50 uppercase">Button Styling</label>
                      <select 
                        className="w-full mt-1 bg-card-bg border border-card-border rounded-btn px-3 py-2 text-[13px] outline-none text-surface-text focus:border-[color:var(--primary)]"
                        value={selectedField.buttonVariant || 'primary'}
                        onChange={(e) => updateSelectedField({ buttonVariant: e.target.value as 'primary' | 'outline' | 'custom' })}
                      >
                        <option value="primary">Global Design System Button</option>
                        <option value="custom">Custom Color Button</option>
                      </select>
                    </div>
                    {selectedField.buttonVariant === 'custom' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-[11px] font-bold opacity-50 uppercase block mb-1">Background Color</label>
                           <input aria-label="Button background color" type="color" className="w-full h-8 rounded cursor-pointer border-0 p-0" value={selectedField.buttonCustomBg || '#000000'} onChange={e => updateSelectedField({ buttonCustomBg: e.target.value })} />
                        </div>
                        <div>
                           <label className="text-[11px] font-bold opacity-50 uppercase block mb-1">Text Color</label>
                           <input aria-label="Button text color" type="color" className="w-full h-8 rounded cursor-pointer border-0 p-0" value={selectedField.buttonCustomText || '#ffffff'} onChange={e => updateSelectedField({ buttonCustomText: e.target.value })} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Canvas */}
      <div className="flex-1 bg-black/5 flex flex-col relative overflow-hidden xl:h-full">
        
        {/* Canvas Header */}
        <div className="h-16 bg-card-bg border-b border-card-border flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-btn-bg rounded-btn flex items-center justify-center shadow-md">
              <Check className="text-btn-text" size={16} />
            </div>
            <div>
              <h1 className="text-[14px] font-bold text-surface-text leading-tight">{schema.name}</h1>
              <p className="text-[11px] opacity-50">Form Canvas Builder</p>
            </div>
          </div>
          <button onClick={handleFinalize} className="px-5 py-2 bg-btn-bg text-btn-text hover:bg-btn-hover hover:text-[color:var(--btn-hover-text)] text-[13px] font-bold rounded-btn shadow-md transition-colors">
            Finalize Form
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 xl:p-6 custom-scrollbar w-full">
          <div className="w-full bg-card rounded-card shadow-sm min-h-[500px] p-6 xl:p-8 border border-border">
            
            <div className="mb-8 pb-6 border-b border-border">
              <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">{schema.name}</h2>
              <p className="opacity-70 text-[14px] text-muted-foreground">{schema.description}</p>
            </div>

            {schema.fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-card-border rounded-card bg-black/5">
                <List size={32} className="opacity-30 mb-4" />
                <h3 className="text-[15px] font-bold text-surface-text mb-1">Canvas is empty</h3>
                <p className="text-[13px] opacity-70 max-w-sm">Use the left sidebar to drag and drop form fields, dropdowns, and layouts into your project.</p>
              </div>
            ) : isMounted ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={schema.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-wrap gap-y-6 gap-x-[2%]">
                    {schema.fields.map((field) => (
                      <SortableFieldItem 
                        key={field.id} 
                        field={field} 
                        schema={schema}
                        isSelected={selectedFieldId === field.id}
                        onSelect={() => setSelectedFieldId(field.id)}
                        onDelete={() => removeField(field.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : null}


            
          </div>
        </div>

      </div>
    </div>
  );
}
