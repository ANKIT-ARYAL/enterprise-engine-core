'use client';
import { useEffect } from 'react';

export default function PatchApplier({ patches }: { patches: any[] }) {
  useEffect(() => {
    if (!patches || !patches.length) return;
    
    // Apply patches on client mount safely after hydration
    const timer = setTimeout(() => {
      patches.forEach(patch => {
        try {
          const el = document.querySelector(patch.selector);
          if (el) {
            if (patch.type === 'text') {
              // Safely update text without destroying icons or child elements
              const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim() !== '');
              if (textNodes.length > 0) {
                textNodes[0].nodeValue = patch.value;
                // clear other text nodes if any to prevent duplicates
                for (let i = 1; i < textNodes.length; i++) {
                  textNodes[i].nodeValue = '';
                }
              } else {
                // If there was no text node, append one
                el.appendChild(document.createTextNode(patch.value));
              }
            } else if (patch.type === 'class') {
              el.className = patch.value;
            }
          }
        } catch (e) {
          console.error('Failed to apply visual patch', e);
        }
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [patches]);

  return null;
}
