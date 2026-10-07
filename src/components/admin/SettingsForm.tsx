'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { updateSystemSettingsAction } from '@/app/actions/admin-mutations';
import { Palette, Type, Layout, Code, Save, CheckCircle2, Box, MousePointer2, Layers, Settings2, Download, Monitor, Tablet, Smartphone, ChevronDown, Zap } from 'lucide-react';

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('palette');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Load default tokens if they exist, fallback safely
  const tokens = (initialSettings.tokens as any) || {};
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

  // Dynamically inject CSS variables to the document root to update the Admin UI live
  useEffect(() => {
    const root = document.documentElement;
    // Core
    if (liveTokens.primaryColor) root.style.setProperty('--primary', liveTokens.primaryColor);
    if (liveTokens.accentColor) root.style.setProperty('--accent', liveTokens.accentColor);
    if (liveTokens.backgroundColor) root.style.setProperty('--bg-body', liveTokens.backgroundColor);
    if (liveTokens.textColor) root.style.setProperty('--text-main', liveTokens.textColor);
    
    // Geometry
    if (liveTokens.radius) root.style.setProperty('--radius', liveTokens.radius);
    if (liveTokens.buttonRadius) root.style.setProperty('--button-radius', liveTokens.buttonRadius === 'var(--radius)' ? liveTokens.radius : liveTokens.buttonRadius);
    if (liveTokens.cardRadius) root.style.setProperty('--card-radius', liveTokens.cardRadius === 'var(--radius)' ? liveTokens.radius : liveTokens.cardRadius);
    if (liveTokens.containerWidth) root.style.setProperty('--container-max', liveTokens.containerWidth);
    
    // Typography
    if (liveTokens.fontHeading) root.style.setProperty('--font-heading', `"${liveTokens.fontHeading}", -apple-system, sans-serif`);
    if (liveTokens.fontBody) root.style.setProperty('--font-body', `"${liveTokens.fontBody}", -apple-system, sans-serif`);
    
    // Components (Cards)
    if (liveTokens.cardBgColor) root.style.setProperty('--card-bg', liveTokens.cardBgColor);
    if (liveTokens.cardHoverBgColor) root.style.setProperty('--card-hover-bg', liveTokens.cardHoverBgColor);
    if (liveTokens.cardBorderColor) root.style.setProperty('--card-border', liveTokens.cardBorderColor);
    
    // Components (Buttons)
    if (liveTokens.buttonBgColor) root.style.setProperty('--btn-bg', liveTokens.buttonBgColor);
    if (liveTokens.buttonHoverBgColor) root.style.setProperty('--btn-hover-bg', liveTokens.buttonHoverBgColor);
    if (liveTokens.buttonTextColor) root.style.setProperty('--btn-text', liveTokens.buttonTextColor);
    if (liveTokens.buttonHoverTextColor) root.style.setProperty('--btn-hover-text', liveTokens.buttonHoverTextColor);
  }, [liveTokens]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // We use liveTokens state instead of FormData because unrendered tabs wouldn't be included in FormData
    const data = {
      siteName: liveTokens.siteName || initialSettings.siteName,
      customCss: liveTokens.customCss || initialSettings.customCss || '',
      tokens: liveTokens,
    };

    startTransition(async () => {
      await updateSystemSettingsAction(data as any);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  const tabs = [
    { id: 'palette', icon: Palette, label: 'Palette' },
    { id: 'typography', icon: Type, label: 'Typography' },
    { id: 'geometry', icon: Layout, label: 'Geometry' },
    { id: 'components', icon: Box, label: 'Components' },
    { id: 'depth', icon: MousePointer2, label: 'Depth & Motion' },
    { id: 'css', icon: Code, label: 'Raw CSS' },
  ];

  // Dynamic values for rendering preview
  const previewWidth = previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '390px';
  const cardShadowVal = liveTokens.cardShadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : liveTokens.cardShadow === 'lg' ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : 'none';

  // Compute live CSS preview string
  const activeCssPreview = useMemo(() => {
    return `:root {\n  --primary: ${liveTokens.primaryColor || '#2563eb'};\n  --bg-surface: ${liveTokens.backgroundColor || '#ffffff'};\n  --radius-card: ${liveTokens.cardRadius || '0.75rem'};\n  --font-h1: ${liveTokens.fontHeading || 'Inter'};\n}`;
  }, [liveTokens]);

  return (
    <form onSubmit={handleSubmit} className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Design Studio</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Preset: Obsidian Pro <ChevronDown size={16} />
          </button>
          <button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download size={16} /> Export JSON
          </button>
          <button 
            disabled={isPending}
            type="submit" 
            className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-70 shadow-lg shadow-[var(--primary)]/20"
          >
            {success ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {isPending ? 'Deploying...' : success ? 'Deployed!' : 'Deploy Tokens'}
          </button>
        </div>
      </div>

      {/* 3-Column Workspace Workspace */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Column: Category Drawer */}
        <div className="w-48 shrink-0 flex flex-col gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-4 overflow-y-auto hidden md:flex">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 mt-2 ml-2">Categories</div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'opacity-70 hover:opacity-100 hover:bg-black/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Center Column: Precision Control Deck */}
        <div className="flex-1 overflow-y-auto pr-4 pb-20 custom-scrollbar border-r border-slate-200 dark:border-slate-800 mr-2">
          
          <div className="max-w-xl">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Token Controller & Inspector</div>
            
            {activeTab === 'palette' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Palette size={16} className="text-slate-400" /> SEMANTIC PALETTE ENGINE
                  </div>
                  <div className="p-4 space-y-4">
                    {[
                      { id: 'primaryColor', label: 'Primary Brand', val: liveTokens.primaryColor || '#2563eb' },
                      { id: 'accentColor', label: 'Accent / CTA', val: liveTokens.accentColor || '#f97316' },
                      { id: 'backgroundColor', label: 'Surface Base', val: liveTokens.backgroundColor || '#ffffff' },
                      { id: 'textColor', label: 'Base Text', val: liveTokens.textColor || '#0f172a' },
                    ].map(color => (
                      <div key={color.id} className="flex items-center justify-between">
                        <label className="text-sm font-medium opacity-90 w-1/2">{color.label}</label>
                        <div className="flex items-center justify-end gap-2 w-1/2">
                          <input type="text" name={color.id} value={color.val} onChange={handleLiveChange} className="w-20 px-2 py-1 text-xs font-mono border rounded bg-transparent border-card-border" />
                          <input type="color" name={color.id} value={color.val} onChange={handleLiveChange} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Type size={16} className="text-slate-400" /> FLUID TYPOGRAPHY CALCULATOR
                  </div>
                  <div className="p-4 space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-1">Heading Font Family</label>
                      <input type="text" name="fontHeading" value={liveTokens.fontHeading || 'Inter'} onChange={handleLiveChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent border-card-border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Body Font Family</label>
                      <input type="text" name="fontBody" value={liveTokens.fontBody || 'Inter'} onChange={handleLiveChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent border-card-border" />
                    </div>
                    
                    <div className="pt-4 border-t dark:border-slate-800">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium text-slate-500">Heading Scale (H1)</span>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-3 text-xs font-mono text-center border dark:border-slate-800">
                        Generated: clamp(2.25rem, 5vw + 1rem, 4.5rem)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'geometry' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Layout size={16} className="text-slate-400" /> GEOMETRY & STRUCTURE
                  </div>
                  <div className="p-4 space-y-4">
                    {[
                      { id: 'radius', label: 'Global Base Radius', options: ['0px (Sharp)', '0.25rem (Subtle)', '0.5rem (Standard)', '0.75rem (Modern Soft)', '1rem (Playful)'] },
                      { id: 'cardRadius', label: 'Card Radius Override', options: ['var(--radius)', '0.5rem (Standard)', '1rem (Soft)', '1.5rem (Bubbly)'] },
                      { id: 'containerWidth', label: 'Max Container Width', options: ['1200px', '1440px', '1600px', '100%'] },
                    ].map(field => (
                      <div key={field.id} className="flex justify-between items-center">
                        <label className="text-sm font-medium w-1/2">{field.label}</label>
                        <select name={field.id} value={liveTokens[field.id] || field.options[0].split(' ')[0]} onChange={handleLiveChange as any} className="w-1/2 px-2 py-1.5 text-sm border rounded-lg bg-transparent border-card-border">
                          {field.options.map(opt => <option key={opt.split(' ')[0]} value={opt.split(' ')[0]}>{opt}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'depth' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Layers size={16} className="text-slate-400" /> ELEVATION & MOTION
                  </div>
                  <div className="p-4 space-y-5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Card Base Shadow</label>
                      <select name="cardShadow" value={liveTokens.cardShadow || 'md'} onChange={handleLiveChange as any} className="w-1/2 px-2 py-1.5 text-sm border rounded-lg bg-transparent border-card-border">
                        <option value="none">None</option><option value="sm">Small</option><option value="md">Ambient Tinted Glow</option><option value="lg">Heavy Lift</option>
                      </select>
                    </div>
                    
                    <div className="pt-4 border-t dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <label className="text-sm font-medium block">Micro-Motion (Hover Lift)</label>
                        <span className="text-xs text-slate-500">Enable card lifting on hover.</span>
                      </div>
                      <input type="checkbox" name="hoverEffects" checked={liveTokens.hoverEffects !== false} onChange={handleLiveChange} className="w-4 h-4 rounded cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'css' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 font-medium text-sm">
                    <Code size={16} className="text-slate-400" /> RAW CSS OVERRIDES
                  </div>
                  <textarea 
                    name="customCss" 
                    defaultValue={initialSettings.customCss || ''} 
                    className="w-full h-48 p-4 font-mono text-xs border-0 bg-transparent focus:ring-0 resize-none outline-none" 
                    placeholder="/* Inject global CSS here */" 
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'components' && (
              <div className="p-4 border rounded-xl dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500">
                Select other tabs to configure global layouts. Component-level specific tokens are syncing.
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
