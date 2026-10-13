export const instant = false;

import React from 'react';
import { FormBuilder } from '@/components/admin/FormBuilder';

export default function FormBuilderDashboard() {
  return (
    <div className="p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[color:var(--text-main)]">Form Builder</h1>
        <p className="text-[color:var(--text-muted)]">Design custom forms and generate dynamic components for your projects.</p>
      </div>
      
      <div className="bg-[color:var(--bg-main)] border border-[color:var(--card-border)] rounded-[var(--card-radius)] p-6 shadow-xl">
        <FormBuilder />
      </div>
    </div>
  );
}
