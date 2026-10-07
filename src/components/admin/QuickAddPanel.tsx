/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Save, Menu, User, Bell, ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { updateNavigationAction } from '@/app/actions/update-navigation-action';

const popularIcons = [
  'None',
  'LayoutDashboard', 'Package', 'ShoppingCart', 'Users', 'Settings', 'Mail', 
  'CreditCard', 'GraduationCap', 'User', 'Bell', 'Search', 'FileText', 
  'PieChart', 'Activity', 'Truck', 'Server', 'Plus', 'Trash2', 'Home', 
  'Folder', 'Calendar', 'Map', 'Camera', 'Image', 'Box', 'Briefcase', 'Book',
  'Link', 'Globe', 'Compass', 'Lock', 'Shield', 'Star', 'Heart', 'Zap'
];

function IconPicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ActiveIcon = value && value !== 'None' ? (Icons as any)[value] : null;

  return (
    <div className="relative" ref={ref}>
      <button 
        type="button" 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 w-28 px-2 py-1.5 text-xs border border-transparent rounded bg-white hover:bg-black/5 outline-none transition-colors"
      >
        <span className="flex items-center gap-1.5 truncate">
          {ActiveIcon ? <ActiveIcon size={14} className="opacity-70 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-dashed border-black/30 shrink-0" />}
          <span className="truncate">{value || 'None'}</span>
        </span>
        <ChevronDown size={12} className="opacity-50 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-[#ececec] shadow-xl rounded-lg z-[200] p-2 max-h-64 overflow-y-auto custom-scrollbar grid grid-cols-4 gap-1 animate-in fade-in zoom-in-95 duration-100">
          {popularIcons.map(iconName => {
            const IconComp = iconName !== 'None' ? (Icons as any)[iconName] : null;
            return (
              <button
                key={iconName}
                type="button"
                title={iconName}
                onClick={() => {
                  onChange(iconName === 'None' ? '' : iconName);
                  setOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-md hover:bg-black/5 transition-colors gap-1 ${value === iconName ? 'bg-primary/10 text-primary' : 'text-slate-600'}`}
              >
                {IconComp ? <IconComp size={18} /> : <div className="w-[18px] h-[18px] rounded-full border border-dashed border-black/30" />}
                <span className="text-[9px] w-full text-center truncate">{iconName}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}

export default function QuickAddPanel({ 
  isOpen, 
  onClose, 
  initialNav 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  initialNav: any 
}) {
  // Normalize legacy format
  const normalized = (initialNav?.sections) ? initialNav : {
    sections: [
      { id: 's1', title: 'Dashboards', links: initialNav?.dashboards || [] },
      { id: 's2', title: 'Pages', links: initialNav?.pages || [] }
    ],
    promoBox: { enabled: true, title: 'Have something in mind?', description: 'Suggest a feature or discuss custom work with me on 𝕏 or by email.' },
    userProfile: { type: 'button', name: 'Admin', email: 'hello@admin.com' }
  };

  const [navState, setNavState] = useState(normalized);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  async function handleSave() {
    startTransition(async () => {
      await updateNavigationAction(navState);
      onClose();
    });
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#fdfdfd] border-l border-[#ececec] shadow-2xl z-[100] flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
      <div className="h-16 px-6 border-b border-[#ececec] flex items-center justify-between shrink-0 bg-white">
        <h2 className="font-bold text-[15px] flex items-center gap-2">
          <Menu size={16} className="text-primary" /> Edit Sidebar Engine
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
        
        {/* Dynamic Sections */}
        <div>
          <div className="flex justify-between items-center mb-4 border-b border-[#ececec] pb-2">
            <h3 className="font-bold text-sm">Navigation Sections</h3>
            <button 
              type="button" 
              onClick={() => {
                setNavState({
                  ...navState,
                  sections: [...navState.sections, { id: Date.now().toString(), title: 'New Section', links: [] }]
                });
              }}
              className="text-[11px] flex items-center gap-1 font-medium bg-black/5 hover:bg-black/10 px-2 py-1 rounded"
            >
              <Plus size={12} /> Add Section
            </button>
          </div>
          
          <div className="space-y-8">
            {navState.sections.map((section: any, sIdx: number) => (
              <div key={section.id} className="bg-white p-4 rounded-xl border border-[#ececec] shadow-sm relative">
                <button 
                  onClick={() => {
                    const newSections = [...navState.sections];
                    newSections.splice(sIdx, 1);
                    setNavState({ ...navState, sections: newSections });
                  }}
                  className="absolute top-4 right-4 text-rose-500 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
                
                <input 
                  type="text" 
                  value={section.title} 
                  onChange={(e) => {
                    const newSections = [...navState.sections];
                    newSections[sIdx].title = e.target.value;
                    setNavState({ ...navState, sections: newSections });
                  }}
                  className="font-bold text-xs uppercase tracking-wider opacity-60 bg-transparent outline-none border-b border-dashed border-transparent hover:border-black/20 focus:border-black/40 pb-1 mb-4" 
                  placeholder="Section Title"
                />

                <div className="space-y-2">
                  {section.links.map((link: any, lIdx: number) => (
                    <div key={lIdx} className="bg-black/5 p-2 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={link.label} 
                          onChange={(e) => {
                            const newSections = [...navState.sections];
                            newSections[sIdx].links[lIdx].label = e.target.value;
                            setNavState({ ...navState, sections: newSections });
                          }}
                          className="flex-1 px-2 py-1.5 text-xs border border-transparent rounded bg-white outline-none" 
                          placeholder="Label"
                        />
                        <input 
                          type="text" 
                          value={link.href} 
                          onChange={(e) => {
                            const newSections = [...navState.sections];
                            newSections[sIdx].links[lIdx].href = e.target.value;
                            setNavState({ ...navState, sections: newSections });
                          }}
                          className="flex-1 px-2 py-1.5 text-xs border border-transparent rounded bg-white outline-none" 
                          placeholder="URL path"
                        />
                        <IconPicker 
                          value={link.icon} 
                          onChange={(val) => {
                            const newSections = [...navState.sections];
                            newSections[sIdx].links[lIdx].icon = val;
                            setNavState({ ...navState, sections: newSections });
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            const newSections = [...navState.sections];
                            newSections[sIdx].links.splice(lIdx, 1);
                            setNavState({ ...navState, sections: newSections });
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded bg-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Sub-links */}
                      {(link.children || []).length > 0 && (
                        <div className="pl-4 border-l-2 border-black/10 space-y-2 mt-2">
                          {(link.children || []).map((child: any, cIdx: number) => (
                            <div key={cIdx} className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={child.label} 
                                onChange={(e) => {
                                  const newSections = [...navState.sections];
                                  newSections[sIdx].links[lIdx].children[cIdx].label = e.target.value;
                                  setNavState({ ...navState, sections: newSections });
                                }}
                                className="flex-1 px-2 py-1 text-[11px] border border-transparent rounded bg-white outline-none" 
                                placeholder="Sub-link Label"
                              />
                              <input 
                                type="text" 
                                value={child.href} 
                                onChange={(e) => {
                                  const newSections = [...navState.sections];
                                  newSections[sIdx].links[lIdx].children[cIdx].href = e.target.value;
                                  setNavState({ ...navState, sections: newSections });
                                }}
                                className="flex-1 px-2 py-1 text-[11px] border border-transparent rounded bg-white outline-none" 
                                placeholder="Sub-link URL"
                              />
                              <button 
                                type="button" 
                                onClick={() => {
                                  const newSections = [...navState.sections];
                                  newSections[sIdx].links[lIdx].children.splice(cIdx, 1);
                                  setNavState({ ...navState, sections: newSections });
                                }}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded bg-white"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button 
                        type="button" 
                        onClick={() => {
                          const newSections = [...navState.sections];
                          if (!newSections[sIdx].links[lIdx].children) {
                            newSections[sIdx].links[lIdx].children = [];
                          }
                          newSections[sIdx].links[lIdx].children.push({ label: 'New Sub-link', href: '/' });
                          setNavState({ ...navState, sections: newSections });
                        }}
                        className="text-[10px] font-medium text-slate-500 hover:text-primary mt-1 inline-block"
                      >
                        + Add sub-link
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => {
                      const newSections = [...navState.sections];
                      newSections[sIdx].links.push({ label: 'New Link', href: '/', icon: 'Circle' });
                      setNavState({ ...navState, sections: newSections });
                    }}
                    className="text-[11px] font-medium text-primary hover:underline mt-2 inline-block"
                  >
                    + Add link to {section.title}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Box Config */}
        <div>
          <h3 className="font-bold text-sm mb-4 border-b border-[#ececec] pb-2">Promo Box (Have something in mind?)</h3>
          <div className="bg-white p-4 rounded-xl border border-[#ececec] shadow-sm space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input 
                type="checkbox" 
                checked={navState.promoBox.enabled}
                onChange={(e) => setNavState({...navState, promoBox: {...navState.promoBox, enabled: e.target.checked}})}
              /> Show Promo Box in Sidebar
            </label>
            
            {navState.promoBox.enabled && (
              <>
                <input 
                  type="text" 
                  value={navState.promoBox.title} 
                  onChange={(e) => setNavState({...navState, promoBox: {...navState.promoBox, title: e.target.value}})}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-black/5" 
                  placeholder="Title"
                />
                <textarea 
                  value={navState.promoBox.description} 
                  onChange={(e) => setNavState({...navState, promoBox: {...navState.promoBox, description: e.target.value}})}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-black/5 h-20 resize-none" 
                  placeholder="Description"
                />
              </>
            )}
          </div>
        </div>

        {/* Bottom Profile Config */}
        <div>
          <h3 className="font-bold text-sm mb-4 border-b border-[#ececec] pb-2">Admin Profile Button</h3>
          <div className="bg-white p-4 rounded-xl border border-[#ececec] shadow-sm space-y-3">
            <select 
              value={navState.userProfile.type}
              onChange={(e) => setNavState({...navState, userProfile: {...navState.userProfile, type: e.target.value}})}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-black/5"
            >
              <option value="button">Single Profile Button</option>
              <option value="dropdown">Interactive Dropdown Menu</option>
              <option value="hidden">Hide Profile Area entirely</option>
            </select>
            
            {navState.userProfile.type !== 'hidden' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={navState.userProfile.name} 
                    onChange={(e) => setNavState({...navState, userProfile: {...navState.userProfile, name: e.target.value}})}
                    className="w-1/2 px-3 py-2 text-sm border rounded-lg bg-black/5" 
                    placeholder="Display Name"
                  />
                  <input 
                    type="text" 
                    value={navState.userProfile.email} 
                    onChange={(e) => setNavState({...navState, userProfile: {...navState.userProfile, email: e.target.value}})}
                    className="w-1/2 px-3 py-2 text-sm border rounded-lg bg-black/5" 
                    placeholder="Email Subtitle"
                  />
                </div>

                {navState.userProfile.type === 'dropdown' && (
                  <div className="pt-2 border-t border-[#ececec]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold opacity-70 uppercase">Dropdown Links</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const links = navState.userProfile.links || [];
                          setNavState({...navState, userProfile: {...navState.userProfile, links: [...links, { label: 'New Link', href: '/', icon: 'Circle' }]}});
                        }}
                        className="text-[10px] flex items-center gap-1 font-medium bg-black/5 hover:bg-black/10 px-2 py-1 rounded"
                      >
                        <Plus size={12} /> Add Link
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {(navState.userProfile.links || []).map((link: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={link.label} 
                            onChange={(e) => {
                              const newLinks = [...(navState.userProfile.links || [])];
                              newLinks[idx].label = e.target.value;
                              setNavState({...navState, userProfile: {...navState.userProfile, links: newLinks}});
                            }}
                            className="flex-1 px-2 py-1.5 text-xs border border-transparent rounded bg-black/5 focus:bg-white focus:border-card-border outline-none" 
                            placeholder="Label"
                          />
                          <input 
                            type="text" 
                            value={link.href} 
                            onChange={(e) => {
                              const newLinks = [...(navState.userProfile.links || [])];
                              newLinks[idx].href = e.target.value;
                              setNavState({...navState, userProfile: {...navState.userProfile, links: newLinks}});
                            }}
                            className="flex-1 px-2 py-1.5 text-xs border border-transparent rounded bg-black/5 focus:bg-white focus:border-card-border outline-none" 
                            placeholder="URL"
                          />
                          <IconPicker 
                            value={link.icon} 
                            onChange={(val) => {
                              const newLinks = [...(navState.userProfile.links || [])];
                              newLinks[idx].icon = val;
                              setNavState({...navState, userProfile: {...navState.userProfile, links: newLinks}});
                            }}
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              const newLinks = [...(navState.userProfile.links || [])];
                              newLinks.splice(idx, 1);
                              setNavState({...navState, userProfile: {...navState.userProfile, links: newLinks}});
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {(!navState.userProfile.links || navState.userProfile.links.length === 0) && (
                        <div className="text-[11px] opacity-50 italic">No links configured. Dropdown will be empty.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="p-6 border-t border-[#ececec] bg-white">
        <button 
          onClick={handleSave}
          disabled={isPending}
          className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-btn-bg text-btn-text text-sm font-semibold rounded-btn hover:bg-btn-hover transition-colors shadow-lg disabled:opacity-70"
        >
          <Save size={16} /> {isPending ? 'Saving...' : 'Deploy Global Navigation Changes'}
        </button>
      </div>
    </div>
  );
}
