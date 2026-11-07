'use client';

import { useReducedMotion, useSpring, m } from 'motion/react';
import { useRef, type ReactNode } from 'react';

export function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 180, damping: 22 });
  const ry = useSpring(0, { stiffness: 180, damping: 22 });
  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    rx.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -5);
    ry.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 5);
  }
  function reset() { rx.set(0); ry.set(0); }
  return <m.div ref={ref} className={`tilt-card ${className}`} style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }} onPointerMove={move} onPointerLeave={reset}>{children}</m.div>;
}
