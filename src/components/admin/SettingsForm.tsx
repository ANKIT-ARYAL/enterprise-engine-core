'use client';

import { useState, useTransition } from 'react';
import { updateSystemSettingsAction } from '@/app/actions/admin-mutations';
import { Palette, Type, Layout, Code, Save, CheckCircle2, Sliders, Box, MousePointer2 } from 'lucide-react';

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
      buttonRadius: formData.get('buttonRadius') as string,
      cardRadius: formData.get('cardRadius') as string,
      containerWidth: formData.get('containerWidth') as string,
      shadowStyle: formData.get('shadowStyle') as string,
      hoverEffects: formData.get('hoverEffects') === 'on',
      animations: formData.get('animations') === 'on',
      
      cardBgColor: formData.get('cardBgColor') as string,
      cardHoverBgColor: formData.get('cardHoverBgColor') as string,
      cardBorderColor: formData.get('cardBorderColor') as string,
      cardHoverBorderColor: formData.get('cardHoverBorderColor') as string,
      cardShadow: formData.get('cardShadow') as string,
      cardHoverShadow: formData.get('cardHoverShadow') as string,
      
      buttonBgColor: formData.get('buttonBgColor') as string,
      buttonHoverBgColor: formData.get('buttonHoverBgColor') as string,
      buttonTextColor: formData.get('buttonTextColor') as string,
      buttonHoverTextColor: formData.get('buttonHoverTextColor') as string,
      buttonShadow: formData.get('buttonShadow') as string,
      buttonHoverShadow: formData.get('buttonHoverShadow') as string,
      
      customCss: formData.get('customCss') as string,
    };

    startTransition(async () => {
      await updateSystemSettingsAction(data as any);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-[1200px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Design Studio</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">The central nervous system of your UI. Changes made here globally cascade to all components, buttons, and layouts instantly.</p>
        </div>
        <button 
          disabled={isPending}
          type="submit" 
          className="flex items-center gap-2 px-8 py-3 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius)] hover:brightness-110 transition-all disabled:opacity-70 shadow-lg shadow-[var(--primary)]/20 whitespace-nowrap"
        >
          {success ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {isPending ? 'Deploying...' : success ? 'Deployed!' : 'Save & Deploy Tokens'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Core Geometry (Radius) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><Layout size={20} /></div>
            <h2 className="font-semibold text-lg">Border Radii & Geometry</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Global Base Radius</label>
                <select name="radius" defaultValue={initialSettings.radius} className="w-full px-3 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                  <option value="0px">Sharp (0px)</option>
                  <option value="0.25rem">Subtle (4px)</option>
                  <option value="0.5rem">Standard (8px)</option>
                  <option value="0.75rem">Modern (12px)</option>
                  <option value="1rem">Playful (16px)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Button Radius Override</label>
                <select name="buttonRadius" defaultValue={initialSettings.buttonRadius} className="w-full px-3 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                  <option value="var(--radius)">Same as Base</option>
                  <option value="0px">Sharp Corners (0px)</option>
                  <option value="0.5rem">Rounded (8px)</option>
                  <option value="9999px">Pill / Fully Rounded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Card Radius Override</label>
                <select name="cardRadius" defaultValue={initialSettings.cardRadius} className="w-full px-3 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                  <option value="var(--radius)">Same as Base</option>
                  <option value="0.5rem">Standard (8px)</option>
                  <option value="1rem">Soft (16px)</option>
                  <option value="1.5rem">Bubbly (24px)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Container Width</label>
                <select name="containerWidth" defaultValue={initialSettings.containerWidth} className="w-full px-3 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                  <option value="1200px">Narrow (1200px)</option>
                  <option value="1440px">Standard Desktop (1440px)</option>
                  <option value="1600px">Ultrawide (1600px)</option>
                  <option value="100%">Full Width Fluid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Depth & Interaction */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><MousePointer2 size={20} /></div>
            <h2 className="font-semibold text-lg">Depth & Interaction</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Global Shadow Intensity</label>
              <select name="shadowStyle" defaultValue={initialSettings.shadowStyle} className="w-full px-3 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                <option value="none">Flat Design (No Shadows)</option>
                <option value="sm">Subtle / Hairline</option>
                <option value="md">Standard Material</option>
                <option value="lg">Soft & Elevated</option>
                <option value="xl">Floaty / Neumorphic</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-xl dark:border-slate-800">
              <div>
                <h3 className="font-medium">Micro-Interactions (Hover)</h3>
                <p className="text-sm text-slate-500">Enable card lifting and button brightness shifts on hover.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="hoverEffects" defaultChecked={initialSettings.hoverEffects} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-xl dark:border-slate-800">
              <div>
                <h3 className="font-medium">Animations & Transitions</h3>
                <p className="text-sm text-slate-500">Enable smooth fading, sliding, and layout transitions.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="animations" defaultChecked={initialSettings.animations} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><Palette size={20} /></div>
            <h2 className="font-semibold text-lg">Palette Studio</h2>
          </div>
          
          <div className="space-y-6">
            {[
              { id: 'primaryColor', label: 'Primary Brand Color', desc: 'Main buttons, active links, primary borders.', val: initialSettings.primaryColor },
              { id: 'accentColor', label: 'Accent / CTA Color', desc: 'Highlight elements, secondary buttons, alerts.', val: initialSettings.accentColor },
              { id: 'backgroundColor', label: 'App Background', desc: 'The root body background color.', val: initialSettings.backgroundColor },
              { id: 'textColor', label: 'Base Text Color', desc: 'The default color for all body typography.', val: initialSettings.textColor },
            ].map(color => (
              <div key={color.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label className="text-sm font-medium">{color.label}</label>
                  <p className="text-xs text-slate-500 max-w-[200px] mt-0.5">{color.desc}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <input type="text" name={color.id} defaultValue={color.val} className="w-24 px-3 py-2 text-sm font-mono border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
                  <input type="color" defaultValue={color.val} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
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

        {/* Specific UI Component Configuration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><Box size={20} /></div>
            <h2 className="font-semibold text-lg">Component-Specific Styling</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Card Tokens */}
            <div>
              <h3 className="font-medium text-lg mb-4 text-slate-700 dark:text-slate-300">Card Design</h3>
              <div className="space-y-4">
                {[
                  { id: 'cardBgColor', label: 'Background Color', val: initialSettings.cardBgColor },
                  { id: 'cardHoverBgColor', label: 'Hover Background Color', val: initialSettings.cardHoverBgColor },
                  { id: 'cardBorderColor', label: 'Border Color', val: initialSettings.cardBorderColor },
                  { id: 'cardHoverBorderColor', label: 'Hover Border Color', val: initialSettings.cardHoverBorderColor },
                ].map(color => (
                  <div key={color.id} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{color.label}</label>
                    <div className="flex items-center gap-2">
                      <input type="text" name={color.id} defaultValue={color.val} className="w-20 px-2 py-1 text-xs font-mono border rounded dark:bg-slate-800 dark:border-slate-700" />
                      <input type="color" defaultValue={color.val} className="w-8 h-8 rounded cursor-pointer border-0 p-0" onChange={(e) => { const textInput = e.currentTarget.previousSibling as HTMLInputElement; if (textInput) textInput.value = e.currentTarget.value; }} />
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Card Base Shadow</label>
                  <select name="cardShadow" defaultValue={initialSettings.cardShadow} className="w-32 px-2 py-1.5 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">X-Large</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Card Hover Shadow</label>
                  <select name="cardHoverShadow" defaultValue={initialSettings.cardHoverShadow} className="w-32 px-2 py-1.5 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">X-Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Button Tokens */}
            <div>
              <h3 className="font-medium text-lg mb-4 text-slate-700 dark:text-slate-300">Button Design</h3>
              <div className="space-y-4">
                {[
                  { id: 'buttonBgColor', label: 'Background Color', val: initialSettings.buttonBgColor },
                  { id: 'buttonHoverBgColor', label: 'Hover Background Color', val: initialSettings.buttonHoverBgColor },
                  { id: 'buttonTextColor', label: 'Text Color', val: initialSettings.buttonTextColor },
                  { id: 'buttonHoverTextColor', label: 'Hover Text Color', val: initialSettings.buttonHoverTextColor },
                ].map(color => (
                  <div key={color.id} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{color.label}</label>
                    <div className="flex items-center gap-2">
                      <input type="text" name={color.id} defaultValue={color.val} className="w-20 px-2 py-1 text-xs font-mono border rounded dark:bg-slate-800 dark:border-slate-700" />
                      <input type="color" defaultValue={color.val} className="w-8 h-8 rounded cursor-pointer border-0 p-0" onChange={(e) => { const textInput = e.currentTarget.previousSibling as HTMLInputElement; if (textInput) textInput.value = e.currentTarget.value; }} />
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Button Base Shadow</label>
                  <select name="buttonShadow" defaultValue={initialSettings.buttonShadow} className="w-32 px-2 py-1.5 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">X-Large</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Button Hover Shadow</label>
                  <select name="buttonHoverShadow" defaultValue={initialSettings.buttonHoverShadow} className="w-32 px-2 py-1.5 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">X-Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Typography & Identity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><Type size={20} /></div>
              <h2 className="font-semibold text-lg">Typography & Identity</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Global Site Name</label>
                <input type="text" name="siteName" defaultValue={initialSettings.siteName} className="w-full px-3 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="My Enterprise Engine" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heading Font Family (Google Fonts)</label>
                <input type="text" name="fontHeading" defaultValue={initialSettings.fontHeading} className="w-full px-3 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="'Inter', sans-serif" />
                <p className="text-xs text-slate-500 mt-1.5">Used for h1, h2, h3 and title elements.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Body Font Family</label>
                <input type="text" name="fontBody" defaultValue={initialSettings.fontBody} className="w-full px-3 py-2.5 border rounded-lg dark:bg-slate-800 dark:border-slate-700" placeholder="'Inter', sans-serif" />
                <p className="text-xs text-slate-500 mt-1.5">Used for paragraph text, descriptions, and labels.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 text-slate-500 rounded-lg"><Code size={16} /></div>
              <h2 className="font-semibold">CSS Overrides</h2>
            </div>
            <textarea 
              name="customCss" 
              defaultValue={initialSettings.customCss || ''} 
              className="w-full h-24 px-3 py-3 font-mono text-sm border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:ring-2 ring-[var(--primary)]" 
              placeholder="/* Inject global styles here */&#10;body { scroll-behavior: smooth; }" 
            />
          </div>
        </div>
      </div>
    </form>
  );
}
