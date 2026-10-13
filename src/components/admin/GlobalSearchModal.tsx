/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Settings,
  Shield,
  Users,
  Trash2,
  Palette,
  Type,
  Sliders,
  Layout,
  Home,
  Book,
  User,
  ExternalLink,
  Moon,
  Sun,
  ArrowRight,
  CornerDownLeft,
  X,
  Maximize,
  MousePointerClick,
  Layers,
  Sparkles,
} from "lucide-react";

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category:
    | "Pages & Views"
    | "Design Studio"
    | "System & Access"
    | "Quick Actions";
  href?: string;
  action?: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  keywords?: string[];
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleThemeMode?: () => void;
  onToggleCompactMode?: () => void;
  onOpenQuickAdd?: () => void;
  isCompact?: boolean;
  themeMode?: string;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onToggleThemeMode,
  onToggleCompactMode,
  onOpenQuickAdd,
  isCompact,
  themeMode,
}: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Search Items Registry
  const searchItems: SearchItem[] = useMemo(
    () => [
      // 1. Pages & Views
      {
        id: "page-home",
        title: "Homepage",
        description:
          "Manage homepage sections, hero banners, and content modules.",
        category: "Pages & Views",
        href: "/admin/pages/home",
        icon: Home,
        keywords: ["landing", "hero", "homepage", "index", "front"],
      },
      {
        id: "page-faq",
        title: "FAQ Management",
        description: "Create, edit, and organize frequently asked questions.",
        category: "Pages & Views",
        href: "/admin/faq",
        icon: Book,
        keywords: ["questions", "answers", "support", "help", "accordion"],
      },
      {
        id: "page-blogs",
        title: "Blog Articles",
        description:
          "Manage articles, publications, authors, and news releases.",
        category: "Pages & Views",
        href: "/admin/blogs",
        icon: FileText,
        keywords: ["posts", "news", "articles", "editorial", "content"],
      },
      {
        id: "page-about",
        title: "About Us Page",
        description:
          "Edit company mission, team roster, and corporate narrative.",
        category: "Pages & Views",
        href: "/admin/pages/about-us",
        icon: User,
        keywords: ["story", "team", "mission", "company"],
      },
      {
        id: "page-contact",
        title: "Contact Us Page",
        description: "Configure inquiry forms, contact details, and locations.",
        category: "Pages & Views",
        href: "/admin/pages/contact-us",
        icon: FileText,
        keywords: ["support", "email", "inquiry", "message", "form"],
      },
      {
        id: "public-site",
        title: "Live Public Website",
        description: "Open the active public storefront in a new tab.",
        category: "Pages & Views",
        action: () => window.open("/", "_blank"),
        icon: ExternalLink,
        keywords: ["live", "storefront", "public", "client", "view"],
      },
      {
        id: "public-terms",
        title: "Terms of Service",
        description: "View public terms of service policy view.",
        category: "Pages & Views",
        href: "/terms",
        icon: FileText,
        keywords: ["legal", "terms", "conditions", "tos"],
      },
      {
        id: "public-privacy",
        title: "Privacy Policy",
        description: "View user privacy policy and GDPR disclosure.",
        category: "Pages & Views",
        href: "/privacy",
        icon: FileText,
        keywords: ["gdpr", "privacy", "legal", "compliance"],
      },

      // 2. Design Studio
      {
        id: "studio-overview",
        title: "System Design Studio",
        description: "Master token architecture and styling control hub.",
        category: "Design Studio",
        href: "/admin/settings",
        icon: Palette,
        keywords: ["tokens", "theme", "studio", "styles", "css"],
      },
      {
        id: "tab-theme-presets",
        title: "Theme & Presets",
        description:
          "Select from 12 executive color themes (Forest, Emerald, Slate, Ocean...).",
        category: "Design Studio",
        href: "/admin/settings?tab=theme-presets",
        icon: Sparkles,
        keywords: [
          "palettes",
          "forest",
          "slate",
          "emerald",
          "colors",
          "preset",
        ],
      },

      {
        id: "tab-design-buttons",
        title: "Buttons & Roundness",
        description:
          "Configure button hover states, pill shapes, and button radii.",
        category: "Design Studio",
        href: "/admin/settings?tab=design-buttons",
        icon: MousePointerClick,
        keywords: ["pill", "radius", "hover", "roundness", "button"],
      },
      {
        id: "tab-design-animations",
        title: "Animations",
        description: "Configure text, card, and button motion",
        href: "/admin/settings?tab=design-animations",
        icon: Sparkles,
        category: "Design Studio",
      },
      {
        id: "tab-design-cards",
        title: "Cards & Surfaces",
        description:
          "Customize surface backgrounds, border contrast, and card elevations.",
        category: "Design Studio",
        href: "/admin/settings?tab=design-cards",
        icon: Layers,
        keywords: ["surface", "elevation", "card", "shadow", "border"],
      },
      {
        id: "tab-design-container",
        title: "Layout & Navigation",
        description:
          "Set rail navigation mode, container max width, and fluid margins.",
        category: "Design Studio",
        href: "/admin/settings?tab=design-container",
        icon: Layout,
        keywords: ["rail", "container", "width", "sidebar", "layout"],
      },
      {
        id: "tab-text-sizes",
        title: "Sizes & Fluid Scale",
        description:
          "Adjust fluid typography scales (H1, H2, H3, Body) and ratio presets.",
        category: "Design Studio",
        href: "/admin/settings?tab=text-sizes",
        icon: Sliders,
        keywords: ["fluid", "scale", "clamp", "h1", "h2", "body", "ratio"],
      },
      {
        id: "tab-form-builder",
        title: "Dynamic Form Builder",
        description:
          "Zero-code visual schema builder for contact and lead generation forms.",
        category: "Design Studio",
        href: "/admin/settings?tab=comp-form-builder",
        icon: FileText,
        keywords: ["schema", "inputs", "contact", "form", "builder"],
      },
      {
        id: "tab-advanced-css",
        title: "Custom Scripts & CSS",
        description:
          "Inject direct cascading CSS style sheets and JavaScript hooks.",
        category: "Design Studio",
        href: "/admin/settings?tab=advanced-css",
        icon: Sliders,
        keywords: ["css", "raw", "code", "script", "override"],
      },

      // 3. System & Access
      {
        id: "sys-settings",
        title: "System Settings & Branding",
        description:
          "Configure site title, logo URL, navigation bar, and footer links.",
        category: "System & Access",
        href: "/admin/system-settings",
        icon: Settings,
        keywords: ["logo", "brand", "footer", "navbar", "sitename"],
      },
      {
        id: "sys-roles",
        title: "Roles & Permissions",
        description:
          "Manage administrative roles, granularity, and access matrix.",
        category: "System & Access",
        href: "/admin/roles",
        icon: Shield,
        keywords: ["rbac", "access", "permissions", "superadmin", "editor"],
      },
      {
        id: "sys-users",
        title: "Users & Accounts",
        description: "Manage admin accounts, emails, and credentials.",
        category: "System & Access",
        href: "/admin/users",
        icon: Users,
        keywords: ["accounts", "passwords", "email", "login"],
      },
      {
        id: "sys-recycle",
        title: "Recycle Bin",
        description:
          "Review and restore soft-deleted pages, sections, or database items.",
        category: "System & Access",
        href: "/admin/recycle-bin",
        icon: Trash2,
        keywords: ["trash", "deleted", "restore", "recover"],
      },
      {
        id: "sys-profile",
        title: "Admin Profile",
        description: "Update your display name, email, and password security.",
        category: "System & Access",
        href: "/admin/profile",
        icon: User,
        keywords: ["password", "account", "security", "email"],
      },

      // 4. Quick Actions
      {
        id: "action-theme-mode",
        title: `Switch to ${themeMode === "dark" ? "Light" : "Dark"} Mode`,
        description: `Toggle display lighting to ${themeMode === "dark" ? "bright surfaces" : "dim surfaces"}.`,
        category: "Quick Actions",
        action: onToggleThemeMode,
        icon: themeMode === "dark" ? Sun : Moon,
        keywords: ["dark", "light", "mode", "theme", "toggle"],
      },
      {
        id: "action-sidebar-mode",
        title: isCompact
          ? "Expand Sidebar (Full labels)"
          : "Compact Sidebar (Rail mode)",
        description: isCompact
          ? "Switch navigation to full sidebar with labels."
          : "Switch navigation to compact icon rail mode.",
        category: "Quick Actions",
        action: onToggleCompactMode,
        icon: Layout,
        keywords: ["sidebar", "rail", "compact", "expand", "toggle"],
      },
      {
        id: "action-quick-add",
        title: "Quick Create Navigation / Page",
        description:
          "Open the slide-over drawer to add new pages or sidebar navigation links.",
        category: "Quick Actions",
        action: onOpenQuickAdd,
        icon: Maximize,
        keywords: ["add", "create", "new", "link"],
      },
    ],
    [
      themeMode,
      isCompact,
      onToggleThemeMode,
      onToggleCompactMode,
      onOpenQuickAdd,
    ],
  );

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchItems;
    return searchItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.some((k) => k.includes(q)))
      );
    });
  }, [query, searchItems]);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelect = (item: SearchItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-muted/20">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tools, design studio, settings... (↑↓ to navigate)"
            className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X size={16} />
            </button>
          ) : (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-border bg-card shadow-xs">
              ESC
            </span>
          )}
        </div>

        {/* Results Container */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Search size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs mt-1 opacity-70">
                Try searching for &quot;forest&quot;, &quot;faq&quot;,
                &quot;fonts&quot;, &quot;users&quot;, or &quot;theme&quot;.
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-primary-foreground/15 text-primary-foreground"
                        : "bg-muted border border-border text-muted-foreground"
                    }`}
                  >
                    <IconComp size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs truncate">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded uppercase ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground border border-border/60"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-primary-foreground/80 shrink-0">
                      <span>Select</span>
                      <CornerDownLeft size={12} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Keyboard Shortcuts */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-card border border-border font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1 py-0.5 rounded bg-card border border-border font-mono text-[10px]">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">
                ↵
              </kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">
                esc
              </kbd>
              <span>close</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Global shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">
              J
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
