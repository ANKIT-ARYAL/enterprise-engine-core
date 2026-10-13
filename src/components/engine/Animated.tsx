"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { animationClass, type AnimationTarget } from "@/lib/theme/animation-presets";

type Props = HTMLAttributes<HTMLElement> & { target: AnimationTarget; animation?: string; children: ReactNode };

export function Animated({ target, animation, children, className = "", ...props }: Props) {
  const Tag = target === "text" ? "span" : target === "button" ? "div" : "div";
  const selectedClass = animation ? animationClass(target, animation) : `motion-auto-${target}`;
  return <Tag className={`${selectedClass} motion-target-${target} ${className}`.trim()} {...props}>{children}</Tag>;
}

export { animationClass };
