'use client';

import { useState, useTransition, useEffect } from 'react';
import { updateSystemSettingsAction } from '@/app/actions/admin-mutations';
import { 
  Palette, Type, Layout, Code, Save, CheckCircle2, Box, MousePointer2, 
  Download, ChevronDown, Menu, Trash2, Plus, 
  PanelTop, PanelBottom, FormInput, Text, Globe, Activity, MessageSquare, Maximize
} from 'lucide-react';

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('text-colors');
  
  const tokens = (initialSettings.tokens as any) || {};
  const [liveTokens, setLiveTokens] = useState(tokens);

  const handleLiveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const categoryGroups = [
    {
      title: 'Design',
      items: [
        { id: 'design-buttons', icon: Box, label: 'Buttons' },
        { id: 'design-cards', icon: Layout, label: 'Cards & Surfaces' },
        { id: 'design-container', icon: Maximize, label: 'Container' },
        { id: 'design-navbars', icon: PanelTop, label: 'Navbars' },
        { id: 'design-footers', icon: PanelBottom, label: 'Footers' },
        { id: 'design-forms', icon: FormInput, label: 'Form UI Elements' },
      ]
    },
    {
      title: 'Text',
      items: [
        { id: 'text-colors', icon: Palette, label: 'Colors' },
        { id: 'text-sizes', icon: Type, label: 'Sizes & Fluid Scale' },
        { id: 'text-fonts', icon: Text, label: 'Fonts' },
      ]
    },
    {
      title: 'Components & Logic',
      items: [
        { id: 'comp-confirmation', icon: MessageSquare, label: 'Confirmation Messages' },
        { id: 'comp-form-builder', icon: FormInput, label: 'Dynamic Form Builder' },
        { id: 'navigation', icon: Menu, label: 'Sidebar Navigation' },
      ]
    },
    {
      title: 'Advanced System',
      items: [
        { id: 'advanced-motion', icon: Activity, label: 'Motion & Micro-interactions' },
        { id: 'advanced-css', icon: Code, label: 'Custom Scripts & CSS' },
        { id: 'advanced-seo', icon: Globe, label: 'Global SEO & Metadata' },
      ]
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-card-border shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Design Studio</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg border-card-border hover:bg-black/5 transition-colors">
            Preset: Obsidian Pro <ChevronDown size={16} />
          </button>
          <button type="button" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg border-card-border hover:bg-black/5 transition-colors">
            <Download size={16} /> Export JSON
          </button>
          <button 
            disabled={isPending}
            type="submit" 
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-70 shadow-lg shadow-primary/20"
          >
            {success ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {isPending ? 'Deploying...' : success ? 'Deployed!' : 'Deploy Tokens'}
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Column: Categorized Tree */}
        <div className="w-56 shrink-0 flex flex-col gap-4 border-r border-card-border pr-4 overflow-y-auto custom-scrollbar hidden md:flex pb-12">
          {categoryGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2 ml-2">{group.title}</div>
              <div className="flex flex-col gap-0.5">
                {group.items.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
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
            </div>
          ))}
        </div>

        {/* Center Column: Precision Control Deck */}
        <div className="flex-1 overflow-y-auto pr-4 pb-20 custom-scrollbar border-r border-card-border mr-2">
          
          <div className="max-w-2xl">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-4 ml-1">Token Controller & Inspector</div>
            
            {/* TEXT -> COLORS */}
            {activeTab === 'text-colors' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Palette size={16} className="opacity-70" /> SEMANTIC COLOR PALETTE
                  </div>
                  <div className="p-4 space-y-4">
                    {[
                      { id: 'primaryColor', label: 'Primary Brand', val: liveTokens.primaryColor || '#2563eb' },
                      { id: 'accentColor', label: 'Accent / CTA', val: liveTokens.accentColor || '#f97316' },
                      { id: 'backgroundColor', label: 'Surface Base (App Background)', val: liveTokens.backgroundColor || '#ffffff' },
                      { id: 'textColor', label: 'Base Text Foreground', val: liveTokens.textColor || '#0f172a' },
                      { id: 'successColor', label: 'Success / Validation', val: liveTokens.successColor || '#10b981' },
                      { id: 'errorColor', label: 'Error / Destructive', val: liveTokens.errorColor || '#ef4444' },
                    ].map(color => (
                      <div key={color.id} className="flex items-center justify-between">
                        <label className="text-sm font-medium opacity-90 w-1/2">{color.label}</label>
                        <div className="flex items-center justify-end gap-2 w-1/2">
                          <input type="text" name={color.id} value={color.val} onChange={handleLiveChange} className="w-24 px-2 py-1 text-xs font-mono border rounded bg-transparent border-card-border text-center uppercase" />
                          <input type="color" name={color.id} value={color.val} onChange={handleLiveChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DESIGN -> BUTTONS */}
            {activeTab === 'design-buttons' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Box size={16} className="opacity-70" /> BUTTON ENGINEERING
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {[
                      { id: 'buttonBgColor', label: 'Background Color', val: liveTokens.buttonBgColor || '#2563eb' },
                      { id: 'buttonHoverBgColor', label: 'Hover Background Color', val: liveTokens.buttonHoverBgColor || '#1d4ed8' },
                      { id: 'buttonTextColor', label: 'Text Color', val: liveTokens.buttonTextColor || '#ffffff' },
                    ].map(color => (
                      <div key={color.id} className="flex items-center justify-between">
                        <label className="text-sm font-medium w-1/2 opacity-90">{color.label}</label>
                        <div className="flex items-center justify-end gap-2 w-1/2">
                          <input type="text" name={color.id} value={color.val} onChange={handleLiveChange} className="w-24 px-2 py-1 text-xs font-mono border rounded bg-transparent border-card-border text-center uppercase" />
                          <input type="color" name={color.id} value={color.val} onChange={handleLiveChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-card-border mt-4">
                      <label className="text-sm font-medium w-1/2 opacity-90">Button Roundness (Radius)</label>
                      <select name="buttonRadius" value={liveTokens.buttonRadius || 'var(--radius)'} onChange={handleLiveChange as any} className="w-1/2 px-2 py-1.5 text-sm border rounded-lg bg-transparent border-card-border">
                        <option value="var(--radius)">Inherit Global Base</option>
                        <option value="0px">0px (Sharp)</option>
                        <option value="0.25rem">0.25rem (Subtle)</option>
                        <option value="0.5rem">0.5rem (Standard)</option>
                        <option value="9999px">9999px (Pill)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DESIGN -> CARDS */}
            {activeTab === 'design-cards' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Layout size={16} className="opacity-70" /> CARD & SURFACE STYLING
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {[
                      { id: 'cardBgColor', label: 'Card Base Background', val: liveTokens.cardBgColor || '#ffffff' },
                      { id: 'cardHoverBgColor', label: 'Card Hover State', val: liveTokens.cardHoverBgColor || '#f8fafc' },
                      { id: 'cardBorderColor', label: 'Card Outline Border', val: liveTokens.cardBorderColor || '#e2e8f0' },
                    ].map(color => (
                      <div key={color.id} className="flex items-center justify-between">
                        <label className="text-sm font-medium w-1/2 opacity-90">{color.label}</label>
                        <div className="flex items-center justify-end gap-2 w-1/2">
                          <input type="text" name={color.id} value={color.val} onChange={handleLiveChange} className="w-24 px-2 py-1 text-xs font-mono border rounded bg-transparent border-card-border text-center uppercase" />
                          <input type="color" name={color.id} value={color.val} onChange={handleLiveChange} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-card-border mt-4">
                      <label className="text-sm font-medium w-1/2 opacity-90">Card Roundness (Radius)</label>
                      <select name="cardRadius" value={liveTokens.cardRadius || 'var(--radius)'} onChange={handleLiveChange as any} className="w-1/2 px-2 py-1.5 text-sm border rounded-lg bg-transparent border-card-border">
                        <option value="var(--radius)">Inherit Global Base</option>
                        <option value="0.5rem">0.5rem (Standard)</option>
                        <option value="1rem">1rem (Soft)</option>
                        <option value="1.5rem">1.5rem (Bubbly)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DESIGN -> CONTAINER */}
            {activeTab === 'design-container' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Maximize size={16} className="opacity-70" /> CONTAINER & LAYOUT GRID
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium w-1/2 opacity-90">Max Container Width</label>
                      <select name="containerWidth" value={liveTokens.containerWidth || '1440px'} onChange={handleLiveChange as any} className="w-1/2 px-2 py-1.5 text-sm border rounded-lg bg-transparent border-card-border">
                        <option value="1024px">1024px (Tight)</option>
                        <option value="1200px">1200px (Classic Desktop)</option>
                        <option value="1440px">1440px (Modern Widescreen)</option>
                        <option value="1600px">1600px (Ultra Wide)</option>
                        <option value="100%">100% (Fluid Full Width)</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium w-1/2 opacity-90">Global Base Padding</label>
                      <select name="containerPadding" value={liveTokens.containerPadding || 'clamp(1rem, 4vw, 3rem)'} onChange={handleLiveChange as any} className="w-1/2 px-2 py-1.5 text-sm border rounded-lg bg-transparent border-card-border">
                        <option value="clamp(1rem, 4vw, 3rem)">Fluid (Responsive)</option>
                        <option value="1rem">1rem (Fixed Mobile)</option>
                        <option value="2rem">2rem (Fixed Standard)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEXT -> SIZES */}
            {activeTab === 'text-sizes' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Type size={16} className="opacity-70" /> FLUID TYPOGRAPHY CALCULATOR
                  </div>
                  <div className="p-4 space-y-5">
                    <p className="text-xs opacity-70 mb-4">
                      The engine uses CSS mathematical clamped scales for perfect scaling from mobile (320px) to ultrawide (2560px) viewports without media queries.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold opacity-90">H1 Display Scale</span>
                        <span className="font-mono opacity-60">clamp(2.25rem, 5vw + 1rem, 4.5rem)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-bold opacity-90">H2 Section Scale</span>
                        <span className="font-mono opacity-60">clamp(1.75rem, 3.5vw + 0.75rem, 3.25rem)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-bold opacity-90">Body Text Scale</span>
                        <span className="font-mono opacity-60">clamp(0.95rem, 0.4vw + 0.8rem, 1.15rem)</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-card-border flex justify-between items-center mt-4">
                      <label className="text-sm font-medium opacity-90">Scale Ratio Presets</label>
                      <select name="typeScale" value={liveTokens.typeScale || 'majorThird'} onChange={handleLiveChange as any} className="w-1/2 px-2 py-1.5 text-sm border rounded-lg bg-transparent border-card-border">
                        <option value="minorThird">1.200 (Subtle & Dense)</option>
                        <option value="majorThird">1.250 (Standard Clean)</option>
                        <option value="perfectFourth">1.333 (Editorial & Bold)</option>
                        <option value="augmentedFourth">1.414 (Brutalist Giant)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEXT -> FONTS */}
            {activeTab === 'text-fonts' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Text size={16} className="opacity-70" /> FONT FAMILY MANAGEMENT
                  </div>
                  <div className="p-4 space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-1">Heading Font Family (Google Fonts Integration)</label>
                      <input type="text" name="fontHeading" value={liveTokens.fontHeading || 'Inter'} onChange={handleLiveChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent border-card-border" placeholder="e.g. Outfit, Clash Display, Inter" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Body Font Family</label>
                      <input type="text" name="fontBody" value={liveTokens.fontBody || 'Inter'} onChange={handleLiveChange} className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent border-card-border" placeholder="e.g. Roboto, Inter, system-ui" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COMPONENTS -> FORM BUILDER */}
            {activeTab === 'comp-form-builder' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center justify-between font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <FormInput size={16} className="opacity-70" /> DYNAMIC FORM SCHEMA BUILDER
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        const currentForms = liveTokens.formFields || [];
                        setLiveTokens({
                          ...liveTokens, 
                          formFields: [...currentForms, { id: Date.now().toString(), name: 'new_field', label: 'New Field', type: 'text', required: false }]
                        });
                      }}
                      className="text-[10px] flex items-center gap-1 font-medium bg-primary text-white hover:brightness-110 px-2 py-1 rounded shadow-sm"
                    >
                      <Plus size={12} /> Add Field
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-xs opacity-70 mb-4">
                      Construct totally customizable form fields. These fields map directly to your PostgreSQL database and auto-generate API endpoints for submission handling.
                    </p>
                    
                    <div className="space-y-3">
                      {((liveTokens.formFields) || []).map((field: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 p-3 border border-card-border rounded-lg bg-black/5">
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={field.label} 
                                onChange={(e) => {
                                  const newFields = [...liveTokens.formFields];
                                  newFields[idx].label = e.target.value;
                                  setLiveTokens({ ...liveTokens, formFields: newFields });
                                }}
                                className="w-1/2 px-2 py-1.5 text-xs border rounded bg-card-bg border-card-border" 
                                placeholder="Display Label (e.g. Full Name)"
                              />
                              <input 
                                type="text" 
                                value={field.name} 
                                onChange={(e) => {
                                  const newFields = [...liveTokens.formFields];
                                  newFields[idx].name = e.target.value.toLowerCase().replace(/\\s+/g, '_');
                                  setLiveTokens({ ...liveTokens, formFields: newFields });
                                }}
                                className="w-1/2 px-2 py-1.5 text-xs border rounded bg-card-bg border-card-border font-mono text-primary" 
                                placeholder="db_column_name"
                              />
                            </div>
                            <div className="flex gap-2 items-center">
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const newFields = [...liveTokens.formFields];
                                  newFields[idx].type = e.target.value;
                                  setLiveTokens({ ...liveTokens, formFields: newFields });
                                }}
                                className="px-2 py-1.5 text-xs border rounded bg-card-bg border-card-border"
                              >
                                <option value="text">Short Text</option>
                                <option value="email">Email</option>
                                <option value="textarea">Textarea (Long form)</option>
                                <option value="richtext">Rich Text Editor (WYSIWYG)</option>
                                <option value="dropdown">Dropdown Select</option>
                                <option value="image">Image Upload</option>
                                <option value="checkbox">Checkbox (Boolean)</option>
                                <option value="date">Date Picker</option>
                              </select>
                              
                              <label className="flex items-center gap-1.5 text-xs opacity-80 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={field.required}
                                  onChange={(e) => {
                                    const newFields = [...liveTokens.formFields];
                                    newFields[idx].required = e.target.checked;
                                    setLiveTokens({ ...liveTokens, formFields: newFields });
                                  }}
                                  className="w-3.5 h-3.5 rounded-sm"
                                /> Required Field
                              </label>
                            </div>
                            
                            {/* If dropdown, show options input */}
                            {field.type === 'dropdown' && (
                              <input 
                                type="text" 
                                value={field.options || ''} 
                                onChange={(e) => {
                                  const newFields = [...liveTokens.formFields];
                                  newFields[idx].options = e.target.value;
                                  setLiveTokens({ ...liveTokens, formFields: newFields });
                                }}
                                className="w-full px-2 py-1.5 text-xs border rounded bg-card-bg border-card-border" 
                                placeholder="Comma separated options (e.g. Red, Green, Blue)"
                              />
                            )}
                          </div>
                          
                          <button 
                            type="button" 
                            onClick={() => {
                              const newFields = [...liveTokens.formFields];
                              newFields.splice(idx, 1);
                              setLiveTokens({ ...liveTokens, formFields: newFields });
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded bg-card-bg border border-card-border mt-0.5"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      
                      {!(liveTokens.formFields?.length) && (
                        <div className="text-center p-8 border border-dashed border-card-border rounded-lg opacity-60 text-sm">
                          No custom fields yet. Click "Add Field" to start building your schema.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION MODULE */}
            {activeTab === 'navigation' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Menu size={16} className="opacity-70" /> SIDEBAR NAVIGATION ENGINE
                  </div>
                  <div className="p-4 space-y-6">
                    
                    {/* Dashboards Section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-xs uppercase tracking-wider opacity-60">Dashboards</h3>
                        <button 
                          type="button" 
                          onClick={() => {
                            const currentNav = liveTokens.navigation || { dashboards: [], pages: [] };
                            setLiveTokens({
                              ...liveTokens, 
                              navigation: {
                                ...currentNav,
                                dashboards: [...(currentNav.dashboards || []), { label: 'New Link', href: '/admin/new', icon: 'LayoutDashboard' }]
                              }
                            });
                          }}
                          className="text-[10px] flex items-center gap-1 font-medium bg-black/5 hover:bg-black/10 px-2 py-1 rounded"
                        >
                          <Plus size={12} /> Add Link
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {((liveTokens.navigation?.dashboards) || []).map((link: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={link.label} 
                              onChange={(e) => {
                                const newNav = { ...liveTokens.navigation };
                                newNav.dashboards[idx].label = e.target.value;
                                setLiveTokens({ ...liveTokens, navigation: newNav });
                              }}
                              className="w-1/3 px-2 py-1.5 text-xs border rounded-lg bg-transparent border-card-border" 
                              placeholder="Label"
                            />
                            <input 
                              type="text" 
                              value={link.href} 
                              onChange={(e) => {
                                const newNav = { ...liveTokens.navigation };
                                newNav.dashboards[idx].href = e.target.value;
                                setLiveTokens({ ...liveTokens, navigation: newNav });
                              }}
                              className="w-1/3 px-2 py-1.5 text-xs border rounded-lg bg-transparent border-card-border" 
                              placeholder="URL path"
                            />
                            <input 
                              type="text" 
                              value={link.icon} 
                              onChange={(e) => {
                                const newNav = { ...liveTokens.navigation };
                                newNav.dashboards[idx].icon = e.target.value;
                                setLiveTokens({ ...liveTokens, navigation: newNav });
                              }}
                              className="w-1/4 px-2 py-1.5 text-xs border rounded-lg bg-transparent border-card-border" 
                              placeholder="Icon name"
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                const newNav = { ...liveTokens.navigation };
                                newNav.dashboards.splice(idx, 1);
                                setLiveTokens({ ...liveTokens, navigation: newNav });
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pages Section */}
                    <div className="pt-4 border-t border-card-border">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-xs uppercase tracking-wider opacity-60">Pages</h3>
                        <button 
                          type="button" 
                          onClick={() => {
                            const currentNav = liveTokens.navigation || { dashboards: [], pages: [] };
                            setLiveTokens({
                              ...liveTokens, 
                              navigation: {
                                ...currentNav,
                                pages: [...(currentNav.pages || []), { label: 'New Page', href: '/admin/new-page', icon: 'FileText' }]
                              }
                            });
                          }}
                          className="text-[10px] flex items-center gap-1 font-medium bg-black/5 hover:bg-black/10 px-2 py-1 rounded"
                        >
                          <Plus size={12} /> Add Link
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {((liveTokens.navigation?.pages) || []).map((link: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={link.label} 
                              onChange={(e) => {
                                const newNav = { ...liveTokens.navigation };
                                newNav.pages[idx].label = e.target.value;
                                setLiveTokens({ ...liveTokens, navigation: newNav });
                              }}
                              className="w-1/3 px-2 py-1.5 text-xs border rounded-lg bg-transparent border-card-border" 
                            />
                            <input 
                              type="text" 
                              value={link.href} 
                              onChange={(e) => {
                                const newNav = { ...liveTokens.navigation };
                                newNav.pages[idx].href = e.target.value;
                                setLiveTokens({ ...liveTokens, navigation: newNav });
                              }}
                              className="w-1/3 px-2 py-1.5 text-xs border rounded-lg bg-transparent border-card-border" 
                            />
                            <input 
                              type="text" 
                              value={link.icon} 
                              onChange={(e) => {
                                const newNav = { ...liveTokens.navigation };
                                newNav.pages[idx].icon = e.target.value;
                                setLiveTokens({ ...liveTokens, navigation: newNav });
                              }}
                              className="w-1/4 px-2 py-1.5 text-xs border rounded-lg bg-transparent border-card-border" 
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                const newNav = { ...liveTokens.navigation };
                                newNav.pages.splice(idx, 1);
                                setLiveTokens({ ...liveTokens, navigation: newNav });
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* RAW CSS MODULE */}
            {activeTab === 'advanced-css' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border border-card-border rounded-card overflow-hidden bg-card-bg shadow-sm">
                  <div className="px-4 py-3 border-b border-card-border bg-black/5 flex items-center gap-2 font-medium text-sm">
                    <Code size={16} className="opacity-70" /> RAW CSS OVERRIDES
                  </div>
                  <textarea 
                    name="customCss" 
                    defaultValue={initialSettings.customCss || ''} 
                    className="w-full h-48 p-4 font-mono text-xs border-0 bg-transparent focus:ring-0 resize-none outline-none" 
                    placeholder="/* Inject global CSS overrides here */" 
                  />
                </div>
              </div>
            )}
            
            {/* STUB TABS FOR FUTURE EXPANSION */}
            {['design-navbars', 'design-footers', 'design-forms', 'comp-confirmation', 'advanced-motion', 'advanced-seo'].includes(activeTab) && (
              <div className="p-8 border border-dashed border-card-border rounded-xl text-center space-y-2 opacity-70">
                <div className="w-12 h-12 rounded-full bg-black/5 mx-auto flex items-center justify-center">
                  <Code size={20} />
                </div>
                <h3 className="font-bold">Module Not Activated</h3>
                <p className="text-xs">This high-level configuration module is syncing with the core engine and will be available shortly.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </form>
  );
}
