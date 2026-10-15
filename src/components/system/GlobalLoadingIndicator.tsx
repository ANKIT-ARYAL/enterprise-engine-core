'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function GlobalLoadingIndicator() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  useEffect(() => { setLoading(false); }, [pathname]);
  useEffect(() => {
    let timer: number | undefined;
    const begin = () => { window.clearTimeout(timer); timer = window.setTimeout(() => setLoading(true), 250); };
    const end = () => { window.clearTimeout(timer); setLoading(false); };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
      if (link && link.origin === window.location.origin && !link.target && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) begin();
    };
    const onSubmit = () => begin();
    document.addEventListener('click', onClick, true); document.addEventListener('submit', onSubmit, true);
    const originalFetch = window.fetch;
    window.fetch = async (...args) => { begin(); try { return await originalFetch(...args); } finally { end(); } };
    return () => { document.removeEventListener('click', onClick, true); document.removeEventListener('submit', onSubmit, true); window.clearTimeout(timer); window.fetch = originalFetch; };
  }, []);
  if (!loading) return null;
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden bg-primary/15" role="status" aria-label="Loading"><div className="h-full w-1/3 animate-[loading-slide_1.1s_ease-in-out_infinite] rounded-full bg-primary" /><div className="sr-only"><Loader2 className="animate-spin" /> Loading</div></div>;
}
