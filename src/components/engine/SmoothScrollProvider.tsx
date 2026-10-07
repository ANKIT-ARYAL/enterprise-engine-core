'use client';

import { ReactNode } from 'react';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  // A real implementation would initialize Lenis here
  // For the scope of this engine, we provide the wrapper
  return <>{children}</>;
}
