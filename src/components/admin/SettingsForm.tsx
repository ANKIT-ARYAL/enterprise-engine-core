'use client';

import { useState, useTransition } from 'react';
import { updateSystemSettingsAction } from '@/app/actions/admin-mutations';
import { Palette, Type, Layout, Code, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      siteName: formData.get('siteName') as string,
      primaryColor: formData.get('primaryColor') as string,
      accentColor: formData.get('accentColor') as string,
      backgroundColor: formData.get('backgroundColor') as string,
      textColor: formData.get('textColor') as string,
      fontHeading: formData.get('fontHeading') as string,
      fontBody: formData.get('fontBody') as string,
      radius: formData.get('radius') as string,
      customCss: formData.get('customCss') as string,
    };

    startTransition(async () => {
      await updateSystemSettingsAction(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="h2-title">System Design Studio</h1>
          <p className="desc-text mt-2">These global tokens cascade across the entire Headless Engine, dynamically altering the UI without touching code.</p>
        </div>
        <button 
          disabled={isPending}
          type="submit" 
          className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-[var(--radius)] hover:brightness-110 transition-all disabled:opacity-70 shadow-lg shadow-blue-500/20"
        >
          {success ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isPending ? 'Deploying...' : success ? 'Deployed!' : 'Save & Deploy'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colors Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><Palette size={20} /></div>
            <h2 className="font-semibold text-lg">Brand Colors</h2>
          </div>
          
          <div className="space-y-5">
            {[
              { id: 'primaryColor', label: 'Primary Brand Color', val: initialSettings.primaryColor },
              { id: 'accentColor', label: 'Accent / CTA Color', val: initialSettings.accentColor },
              { id: 'backgroundColor', label: 'App Background', val: initialSettings.backgroundColor },
              { id: 'textColor', label: 'Base Text Color', val: initialSettings.textColor },
            ].map(color => (
              <div key={color.id} className="flex items-center justify-between">
                <label className="text-sm font-medium">{color.label}</label>
                <div className="flex items-center gap-3">
                  <input type="text" name={color.id} defaultValue={color.val} className="w-24 px-2 py-1.5 text-sm font-mono border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
                  <input type="color" defaultValue={color.val} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    onChange={(e) => {
                      const textInput = e.currentTarget.previousSibling as HTMLInputElement;
                      if (textInput) textInput.value = e.currentTarget.value;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><Type size={20} /></div>
            <h2 className="font-semibold text-lg">Typography & Text</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Heading Font Family (Google Fonts)</label>
              <input type="text" name="fontHeading" defaultValue={initialSettings.fontHeading} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="'Inter', sans-serif" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Body Font Family</label>
              <input type="text" name="fontBody" defaultValue={initialSettings.fontBody} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="'Inter', sans-serif" />
            </div>
          </div>
        </div>

        {/* Layout & Structure */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><Layout size={20} /></div>
            <h2 className="font-semibold text-lg">UI Geometry</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Global Border Radius</label>
              <select name="radius" defaultValue={initialSettings.radius} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="0px">0px (Sharp Corners)</option>
                <option value="0.25rem">0.25rem (Subtle)</option>
                <option value="0.5rem">0.5rem (Standard)</option>
                <option value="0.75rem">0.75rem (Modern)</option>
                <option value="1rem">1rem (Playful)</option>
                <option value="2rem">2rem (Pill)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Global Site Name</label>
              <input type="text" name="siteName" defaultValue={initialSettings.siteName} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="My Enterprise Engine" />
            </div>
          </div>
        </div>

        {/* Advanced CSS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg"><Code size={20} /></div>
            <h2 className="font-semibold text-lg">Advanced CSS Injection</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-500">Inject custom utility classes or CSS overrides globally (Applies at the root level).</label>
              <textarea 
                name="customCss" 
                defaultValue={initialSettings.customCss || ''} 
                className="w-full h-32 px-3 py-2 font-mono text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 ring-blue-500" 
                placeholder="body { scroll-behavior: smooth; }" 
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
