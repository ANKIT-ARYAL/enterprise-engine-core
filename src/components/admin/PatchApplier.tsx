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
              el.textContent = patch.value;
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
