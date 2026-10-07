'use client';

import { useState, useTransition } from 'react';
import { updateSystemSettingsAction } from '@/app/actions/admin-mutations';
import { Palette, Type, Layout, Code, Save, CheckCircle2, Box, MousePointer2, Layers, Settings2 } from 'lucide-react';

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('palette');
  
  // Load default tokens if they exist, fallback safely
  const tokens = (initialSettings.tokens as any) || {};

  // For the Live Preview, we'll keep local state of the form to react instantly
  const [liveTokens, setLiveTokens] = useState(tokens);

  const handleLiveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;
    
    setLiveTokens((prev: any) => ({
      ...prev,
      [name]: isCheckbox ? checked : value
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTokens: any = {};
    formData.forEach((value, key) => {
      if (key !== 'siteName' && key !== 'customCss') {
        newTokens[key] = value === 'on' ? true : value;
      }
    });

    // Handle checkboxes that might be unchecked (and thus absent from FormData)
    newTokens.hoverEffects = formData.get('hoverEffects') === 'on';
    newTokens.animations = formData.get('animations') === 'on';

    const data = {
      siteName: formData.get('siteName') as string,
      customCss: formData.get('customCss') as string,
      tokens: newTokens,
    };

    startTransition(async () => {
      await updateSystemSettingsAction(data as any);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  const tabs = [
    { id: 'palette', icon: Palette, label: 'Palette & Semantics' },
    { id: 'typography', icon: Type, label: 'Typography' },
    { id: 'geometry', icon: Layout, label: 'Geometry & Radius' },
    { id: 'components', icon: Box, label: 'UI Components' },
    { id: 'motion', icon: MousePointer2, label: 'Motion & Depth' },
    { id: 'css', icon: Code, label: 'Raw CSS' },
  ];

  return (
    <form onSubmit={handleSubmit} className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Design Studio</h1>
          <p className="text-sm text-slate-500 mt-1">Configure global tokens. All changes sync in real-time across the app.</p>
        </div>
        <button 
          disabled={isPending}
          type="submit" 
          className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-70 shadow-lg shadow-[var(--primary)]/20"
        >
          {success ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isPending ? 'Deploying...' : success ? 'Deployed!' : 'Save & Deploy'}
        </button>
      </div>

      {/* 3-Column Workspace Workspace */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Column: Category Drawer */}
        <div className="w-64 shrink-0 flex flex-col gap-2 border-r border-slate-200 dark:border-slate-800 pr-6 overflow-y-auto hidden md:flex">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 mt-2">Design Categories</div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Center Column: Precision Control Deck */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar">
          
          <div className="max-w-2xl">
            {activeTab === 'palette' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Core Colors</h2>
                  <div className="space-y-4">
                    {[
                      { id: 'primaryColor', label: 'Primary Brand Color', val: liveTokens.primaryColor || '#2563eb' },
                      { id: 'accentColor', label: 'Accent Color', val: liveTokens.accentColor || '#f97316' },
                      { id: 'backgroundColor', label: 'App Background', val: liveTokens.backgroundColor || '#ffffff' },
                      { id: 'textColor', label: 'Base Text Color', val: liveTokens.textColor || '#0f172a' },
                    ].map(color => (
                      <div key={color.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm">
                        <label className="text-sm font-medium">{color.label}</label>
                        <div className="flex items-center gap-2 shrink-0">
                          <input type="text" name={color.id} value={color.val} onChange={handleLiveChange} className="w-20 px-2 py-1.5 text-xs font-mono border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
                          <input type="color" name={color.id} value={color.val} onChange={handleLiveChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Site Typography</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm">
                      <label className="block text-sm font-medium mb-1">Heading Font Family</label>
                      <input type="text" name="fontHeading" value={liveTokens.fontHeading || 'Inter'} onChange={handleLiveChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm">
                      <label className="block text-sm font-medium mb-1">Body Font Family</label>
                      <input type="text" name="fontBody" value={liveTokens.fontBody || 'Inter'} onChange={handleLiveChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm">
                      <label className="block text-sm font-medium mb-1">Global Site Name</label>
                      <input type="text" name="siteName" defaultValue={initialSettings.siteName} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'geometry' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-lg font-semibold mb-4">Geometry & Borders</h2>
                <div className="space-y-4">
                  {[
                    { id: 'radius', label: 'Global Base Radius', options: ['0px', '0.25rem', '0.5rem', '0.75rem', '1rem'] },
                    { id: 'buttonRadius', label: 'Button Radius', options: ['var(--radius)', '0px', '0.5rem', '9999px'] },
                    { id: 'cardRadius', label: 'Card Radius', options: ['var(--radius)', '0.5rem', '1rem', '1.5rem'] },
                    { id: 'containerWidth', label: 'Container Max Width', options: ['1200px', '1440px', '1600px', '100%'] },
                  ].map(field => (
                    <div key={field.id} className="p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm flex justify-between items-center">
                      <label className="text-sm font-medium">{field.label}</label>
                      <select name={field.id} value={liveTokens[field.id] || field.options[0]} onChange={handleLiveChange as any} className="w-40 px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'components' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-lg font-semibold mb-4">Detailed Component Overrides</h2>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Button Styling</h3>
                  {[
                    { id: 'buttonBgColor', label: 'Background', val: liveTokens.buttonBgColor || '#2563eb' },
                    { id: 'buttonHoverBgColor', label: 'Hover Background', val: liveTokens.buttonHoverBgColor || '#1d4ed8' },
                    { id: 'buttonTextColor', label: 'Text Color', val: liveTokens.buttonTextColor || '#ffffff' },
                    { id: 'buttonHoverTextColor', label: 'Hover Text Color', val: liveTokens.buttonHoverTextColor || '#ffffff' },
                  ].map(color => (
                    <div key={color.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm">
                      <label className="text-sm font-medium">{color.label}</label>
                      <div className="flex items-center gap-2">
                        <input type="color" name={color.id} value={color.val} onChange={handleLiveChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                  <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Card Styling</h3>
                  {[
                    { id: 'cardBgColor', label: 'Background', val: liveTokens.cardBgColor || '#ffffff' },
                    { id: 'cardHoverBgColor', label: 'Hover Background', val: liveTokens.cardHoverBgColor || '#f8fafc' },
                    { id: 'cardBorderColor', label: 'Border Color', val: liveTokens.cardBorderColor || '#e2e8f0' },
                    { id: 'cardHoverBorderColor', label: 'Hover Border Color', val: liveTokens.cardHoverBorderColor || '#cbd5e1' },
                  ].map(color => (
                    <div key={color.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm">
                      <label className="text-sm font-medium">{color.label}</label>
                      <div className="flex items-center gap-2">
                        <input type="color" name={color.id} value={color.val} onChange={handleLiveChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'motion' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-lg font-semibold mb-4">Motion & Elevation</h2>
                <div className="space-y-4">
                  {[
                    { id: 'shadowStyle', label: 'Global Shadow Base' },
                    { id: 'cardShadow', label: 'Card Base Shadow' },
                    { id: 'cardHoverShadow', label: 'Card Hover Shadow' },
                    { id: 'buttonShadow', label: 'Button Base Shadow' },
                    { id: 'buttonHoverShadow', label: 'Button Hover Shadow' },
                  ].map(field => (
                    <div key={field.id} className="p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm flex justify-between items-center">
                      <label className="text-sm font-medium">{field.label}</label>
                      <select name={field.id} value={liveTokens[field.id] || 'md'} onChange={handleLiveChange as any} className="w-32 px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700">
                        <option value="none">None</option><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option><option value="xl">X-Large</option>
                      </select>
                    </div>
                  ))}
                  
                  <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm flex justify-between items-center mt-6">
                    <div>
                      <label className="text-sm font-medium">Enable Hover Interactions</label>
                      <p className="text-xs text-slate-500">Enable card lifting and button brightness.</p>
                    </div>
                    <input type="checkbox" name="hoverEffects" checked={liveTokens.hoverEffects !== false} onChange={handleLiveChange} className="w-5 h-5 rounded cursor-pointer" />
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-800 shadow-sm flex justify-between items-center">
                    <div>
                      <label className="text-sm font-medium">Enable Smooth Animations</label>
                      <p className="text-xs text-slate-500">Enable CSS transitions globally.</p>
                    </div>
                    <input type="checkbox" name="animations" checked={liveTokens.animations !== false} onChange={handleLiveChange} className="w-5 h-5 rounded cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'css' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-lg font-semibold mb-4">Raw CSS Injection</h2>
                <textarea 
                  name="customCss" 
                  defaultValue={initialSettings.customCss || ''} 
                  className="w-full h-64 px-4 py-4 font-mono text-sm border rounded-xl dark:bg-slate-900 dark:border-slate-700 focus:ring-2 ring-[var(--primary)] shadow-inner" 
                  placeholder="/* Write global overrides here */&#10;body { scroll-behavior: smooth; }" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Persistent Live Viewport */}
        <div className="w-[450px] shrink-0 border border-slate-200 dark:border-slate-800 rounded-2xl bg-[var(--bg-body)] overflow-hidden shadow-xl hidden lg:flex flex-col relative transition-colors duration-300"
             style={{ 
               backgroundColor: liveTokens.backgroundColor || '#ffffff',
               color: liveTokens.textColor || '#0f172a',
             }}>
          
          {/* Header of Viewport */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-black/5 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs font-medium opacity-50 uppercase tracking-widest">Live Preview</div>
          </div>

          {/* Viewport Content Area */}
          <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar flex-1"
               style={{ fontFamily: liveTokens.fontBody || 'Inter' }}>
            
            {/* Header Mock */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: liveTokens.fontHeading || 'Inter' }}>
                {initialSettings.siteName || 'Design System'}
              </h1>
              <p className="opacity-70 leading-relaxed">
                This sandbox reflects your tokens in real-time. Change a color on the left and see it applied instantly.
              </p>
            </div>

            {/* Interactive Card Mock */}
            <div className="p-6 transition-all duration-300"
                 style={{
                   backgroundColor: liveTokens.cardBgColor || '#ffffff',
                   borderColor: liveTokens.cardBorderColor || '#e2e8f0',
                   borderWidth: '1px',
                   borderStyle: 'solid',
                   borderRadius: liveTokens.cardRadius === 'var(--radius)' ? (liveTokens.radius || '0.5rem') : (liveTokens.cardRadius || '0.75rem'),
                   boxShadow: liveTokens.cardShadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 
                              liveTokens.cardShadow === 'lg' ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : 'none',
                   transform: liveTokens.hoverEffects !== false ? 'translateY(0)' : 'none',
                 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" 
                     style={{ backgroundColor: liveTokens.primaryColor || '#2563eb' }}>
                  <Layers size={18} color="#fff" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ fontFamily: liveTokens.fontHeading || 'Inter' }}>Enterprise Engine</h3>
                  <p className="text-xs opacity-60">Created 2 mins ago</p>
                </div>
              </div>
              <p className="text-sm opacity-80 mb-6">
                Modular blocks ready to scale. Use the design studio to inject life into standard components.
              </p>
              
              <div className="flex gap-3">
                <button type="button" className="px-4 py-2 text-sm font-medium transition-all duration-300"
                        style={{
                          backgroundColor: liveTokens.buttonBgColor || '#2563eb',
                          color: liveTokens.buttonTextColor || '#ffffff',
                          borderRadius: liveTokens.buttonRadius === 'var(--radius)' ? (liveTokens.radius || '0.5rem') : (liveTokens.buttonRadius || '0.5rem'),
                          boxShadow: liveTokens.buttonShadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
                        }}>
                  Primary CTA
                </button>
                <button type="button" className="px-4 py-2 text-sm font-medium transition-all duration-300 border border-transparent hover:border-current opacity-70 hover:opacity-100"
                        style={{
                          borderRadius: liveTokens.buttonRadius === 'var(--radius)' ? (liveTokens.radius || '0.5rem') : (liveTokens.buttonRadius || '0.5rem'),
                        }}>
                  Ghost Button
                </button>
              </div>
            </div>

            {/* Form Mock */}
            <div className="space-y-4 opacity-90">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider opacity-60 mb-1.5">Email Address</label>
                <input type="email" placeholder="ceo@company.com" disabled className="w-full px-4 py-2 border bg-transparent opacity-50"
                       style={{ 
                         borderColor: liveTokens.cardBorderColor || '#e2e8f0',
                         borderRadius: liveTokens.radius || '0.5rem' 
                       }} 
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </form>
  );
}
