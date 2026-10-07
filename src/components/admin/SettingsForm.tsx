'use client';

import { useState, useTransition, useMemo } from 'react';
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTokens: any = {};
    formData.forEach((value, key) => {
      if (key !== 'siteName' && key !== 'customCss') {
        newTokens[key] = value === 'on' ? true : value;
      }
    });

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
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
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
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 font-medium text-sm">
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
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-1/2">{color.label}</label>
                        <div className="flex items-center justify-end gap-2 w-1/2">
                          <input type="text" name={color.id} value={color.val} onChange={handleLiveChange} className="w-20 px-2 py-1 text-xs font-mono border rounded dark:bg-slate-950 dark:border-slate-700" />
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
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 font-medium text-sm">
                    <Type size={16} className="text-slate-400" /> FLUID TYPOGRAPHY CALCULATOR
                  </div>
                  <div className="p-4 space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-1">Heading Font Family</label>
                      <input type="text" name="fontHeading" value={liveTokens.fontHeading || 'Inter'} onChange={handleLiveChange} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Body Font Family</label>
                      <input type="text" name="fontBody" value={liveTokens.fontBody || 'Inter'} onChange={handleLiveChange} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-700" />
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
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 font-medium text-sm">
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
                        <select name={field.id} value={liveTokens[field.id] || field.options[0].split(' ')[0]} onChange={handleLiveChange as any} className="w-1/2 px-2 py-1.5 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-700">
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
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 font-medium text-sm">
                    <Layers size={16} className="text-slate-400" /> ELEVATION & MOTION
                  </div>
                  <div className="p-4 space-y-5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Card Base Shadow</label>
                      <select name="cardShadow" value={liveTokens.cardShadow || 'md'} onChange={handleLiveChange as any} className="w-1/2 px-2 py-1.5 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-700">
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
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
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

        {/* Right Column: Persistent Live Viewport */}
        <div className="w-[500px] shrink-0 flex flex-col relative transition-colors duration-300">
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Persistent Stage</div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button type="button" onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-md ${previewDevice === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}><Monitor size={14} /></button>
              <button type="button" onClick={() => setPreviewDevice('tablet')} className={`p-1.5 rounded-md ${previewDevice === 'tablet' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}><Tablet size={14} /></button>
              <button type="button" onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-md ${previewDevice === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}><Smartphone size={14} /></button>
            </div>
          </div>

          {/* Sandbox Wrapper */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col items-center p-4">
            
            <div 
              className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 relative border border-slate-200/50 dark:border-slate-700"
              style={{ 
                width: previewWidth,
                height: '100%',
                backgroundColor: liveTokens.backgroundColor || '#ffffff',
                color: liveTokens.textColor || '#0f172a',
                fontFamily: liveTokens.fontBody || 'Inter'
              }}
            >
              
              {/* Fake Browser Chrome */}
              <div className="h-10 border-b border-black/5 bg-black/5 flex items-center px-4 shrink-0 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              </div>

              {/* Viewport Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                
                {/* Hero Section */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-4"
                       style={{ color: liveTokens.primaryColor || '#2563eb', backgroundColor: `${liveTokens.primaryColor || '#2563eb'}1A` }}>
                    <Zap size={12} /> Architecture v4.2
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: liveTokens.fontHeading || 'Inter' }}>
                    Fluid Scalable Layout Engine
                  </h1>
                  <p className="opacity-70 leading-relaxed text-sm max-w-sm">
                    Zero layout shifts, sub-second edge cache revalidation, and responsive clamp-based typography everywhere.
                  </p>
                  
                  <div className="flex gap-3 mt-6">
                    <button type="button" className="px-5 py-2.5 text-sm font-medium transition-all duration-300 shadow-sm"
                            style={{
                              backgroundColor: liveTokens.buttonBgColor || liveTokens.primaryColor || '#2563eb',
                              color: liveTokens.buttonTextColor || '#ffffff',
                              borderRadius: liveTokens.buttonRadius === 'var(--radius)' ? (liveTokens.radius || '0.5rem') : (liveTokens.buttonRadius || '0.5rem'),
                            }}>
                      Deploy Section
                    </button>
                    <button type="button" className="px-5 py-2.5 text-sm font-medium border opacity-80 hover:opacity-100"
                            style={{
                              borderColor: liveTokens.primaryColor || '#2563eb',
                              color: liveTokens.primaryColor || '#2563eb',
                              borderRadius: liveTokens.buttonRadius === 'var(--radius)' ? (liveTokens.radius || '0.5rem') : (liveTokens.buttonRadius || '0.5rem'),
                            }}>
                      Review Skeletons
                    </button>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border transition-all duration-300 relative group"
                       style={{
                         backgroundColor: liveTokens.cardBgColor || 'transparent',
                         borderColor: liveTokens.cardBorderColor || '#e2e8f0',
                         borderRadius: liveTokens.cardRadius === 'var(--radius)' ? (liveTokens.radius || '0.5rem') : (liveTokens.cardRadius || '0.75rem'),
                         boxShadow: cardShadowVal,
                       }}>
                    <h3 className="font-semibold text-sm mb-1">Hero Dynamic Card</h3>
                    <p className="text-xs opacity-60">Latency: 0.12ms</p>
                  </div>
                  <div className="p-4 border transition-all duration-300 relative group"
                       style={{
                         backgroundColor: liveTokens.cardBgColor || 'transparent',
                         borderColor: liveTokens.cardBorderColor || '#e2e8f0',
                         borderRadius: liveTokens.cardRadius === 'var(--radius)' ? (liveTokens.radius || '0.5rem') : (liveTokens.cardRadius || '0.75rem'),
                         boxShadow: cardShadowVal,
                       }}>
                    <h3 className="font-semibold text-sm mb-1">Database Record</h3>
                    <p className="text-xs opacity-60">Status: 40k Synced</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Compiled Active CSS Payload */}
          <div className="mt-4 bg-[#0B0E14] border border-[#222938] rounded-xl p-4 shrink-0 shadow-lg">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Compiled Active CSS Payload</div>
            <pre className="text-xs font-mono text-[#A8B2C1] whitespace-pre-wrap leading-relaxed">
              {activeCssPreview}
            </pre>
          </div>

        </div>

      </div>
    </form>
  );
}
