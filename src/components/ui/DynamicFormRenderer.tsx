/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FormSchema } from '@/components/admin/FormBuilder';
import { SubmitButton } from '@/components/ui/action-buttons';

export function DynamicFormRenderer({ schema, onSubmit }: { schema: FormSchema, onSubmit?: (data: any) => Promise<void> | void }) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    for (const field of schema.fields) {
      if (field.type !== 'button' && field.required) {
        const val = formData[field.name];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          toast.error(`"${field.label}" is required.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      toast.success('Form submitted successfully!');
      setFormData({}); // Reset
    } catch (err: any) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schema || !schema.fields) {
    return <div className="text-sm text-slate-500">Invalid form schema.</div>;
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 bg-card-bg p-8 rounded-card shadow-sm border border-card-border">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-surface-text">{schema.name}</h2>
        {schema.description && <p className="text-[14px] opacity-70 mt-2">{schema.description}</p>}
      </div>

      <div className="flex flex-wrap gap-y-6 gap-x-[2%]">
        {schema.fields.map(field => {
          // Check conditional logic
          if (field.enableChildrenOnValue) {
            // (In a full implementation, this checks parent fields. Simplified here)
          }


          const widthClass = {
            '1/4': 'w-[23%]', '1/3': 'w-[31%]', '1/2': 'w-[48%]', '2/3': 'w-[64%]', 'full': 'w-full'
          }[field.width || 'full'];

          const rClass = { none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full' }[schema.inputRoundness || 'md'] || 'rounded-md';
          const sClass = { none: 'shadow-none', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg' }[schema.inputShadow || 'none'] || 'shadow-none';
          const inputGlobalClass = `w-full bg-black/5 border border-card-border px-4 py-3 text-[14px] text-surface-text focus:bg-card-bg focus:border-[color:var(--primary)] focus:ring-1 focus:ring-[color:var(--primary)] outline-none transition-all ${rClass} ${sClass}`;

          const val = formData[field.name] || '';

          return (
            <div key={field.id} className={`${widthClass} flex flex-col`}>
              {field.type !== 'button' && (
                <label className="text-[13px] font-bold text-surface-text mb-2">
                  {field.label} {field.required && <span className="text-[color:var(--error)]">*</span>}
                </label>
              )}

              {['text', 'email', 'password', 'number', 'tel', 'url', 'date'].includes(field.type) && (
                <input 
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={val || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={inputGlobalClass}
                />
              )}

              {field.type === 'checkbox' && (
                <label className="flex items-center gap-3 mt-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    required={field.required}
                    checked={!!val}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className={`w-5 h-5 border-card-border focus:ring-[color:var(--primary)] transition-all cursor-pointer ${rClass === 'rounded-full' ? 'rounded-full' : 'rounded'}`}
                  />
                  <span className="text-[14px] text-surface-text opacity-80 group-hover:opacity-100 transition-opacity">{field.placeholder || field.label}</span>
                </label>
              )}

              {field.type === 'textarea' && (
                <textarea 
                  placeholder={field.placeholder}
                  required={field.required}
                  value={val}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`${inputGlobalClass} h-32 resize-none`}
                />
              )}

              {field.type === 'button' && (
                <SubmitButton 
                  type={field.buttonAction === 'submit' ? 'submit' : 'button'}
                  externalLoading={isSubmitting}
                  style={field.buttonVariant === 'custom' ? { backgroundColor: field.buttonCustomBg || '#000', color: field.buttonCustomText || '#fff' } : undefined}
                  className={`w-full py-3.5 text-[14px] font-bold transition-all ${rClass} ${sClass} ${
                    field.buttonVariant === 'primary' ? 'bg-btn-bg text-btn-text hover:bg-btn-hover hover:text-[color:var(--btn-hover-text)]' : 
                    field.buttonVariant === 'outline' ? 'bg-transparent border-2 border-[color:var(--primary)] text-[color:var(--primary)] hover:bg-[color:var(--primary)]/10' : 
                    field.buttonVariant === 'custom' ? 'hover:opacity-90' :
                    'bg-black/10 text-surface-text hover:bg-black/20'
                  } disabled:opacity-50 mt-4`}
                >
                  {field.label}
                </SubmitButton>
              )}

              {/* Simplified fallback for dropdown and image for the generic renderer */}
              {['dropdown', 'relation'].includes(field.type) && (
                <select 
                  required={field.required}
                  value={val}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={inputGlobalClass}
                >
                  <option value="">Select an option</option>
                  {(field.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
            </div>
          );
        })}
      </div>
    </form>
  );
}
