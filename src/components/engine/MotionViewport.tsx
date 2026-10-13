"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window { __ENGINE_MOTION_PAGES__?: Record<string, boolean>; }
}

export function MotionViewport({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const pageEnabled = typeof window === "undefined" || window.__ENGINE_MOTION_PAGES__?.[pathname] !== false;

  useEffect(() => {
    const element = ref.current;
    if (!pageEnabled) { setVisible(true); return; }
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      // Toggle the class on every viewport transition so the CSS animation
      // timeline restarts when the user scrolls away and returns.
      setVisible(entry.isIntersecting);
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.01 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [pageEnabled]);

  return <div ref={ref} className={`motion-viewport motion-global ${pageEnabled ? "" : "motion-disabled"} ${visible ? "is-visible" : ""} ${className}`.trim()}>{children}</div>;
}

export function FadeUp({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MotionViewport className={`motion-explicit motion-fade-up ${className}`}>{children}</MotionViewport>;
}

export function Fade({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MotionViewport className={`motion-explicit motion-fade ${className}`}>{children}</MotionViewport>;
}

export function SlideDown({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MotionViewport className={`motion-explicit motion-slide-down ${className}`}>{children}</MotionViewport>;
}

export function SlideLeft({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MotionViewport className={`motion-explicit motion-slide-left ${className}`}>{children}</MotionViewport>;
}

export function SlideRight({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MotionViewport className={`motion-explicit motion-slide-right ${className}`}>{children}</MotionViewport>;
}

export function ScaleIn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MotionViewport className={`motion-explicit motion-scale-in ${className}`}>{children}</MotionViewport>;
}

export function AutoSlide({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MotionViewport className={`motion-explicit motion-auto-slide ${className}`}>{children}</MotionViewport>;
}
