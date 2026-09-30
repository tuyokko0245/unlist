'use client';

import { createContext, useCallback, useMemo, useRef, type ReactNode } from 'react';

import { confettiColors } from '@/constants/palette';
import { useSettings } from '@/hooks/useSettings';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { buildTheme } from '@/lib/theme/applyBaseColor';

export interface ConfettiOrigin {
  x: number;
  y: number;
}

export interface ConfettiContextValue {
  fire: (origin: ConfettiOrigin) => void;
}

export const ConfettiContext = createContext<ConfettiContextValue | null>(null);

type ConfettiFn = (options: Record<string, unknown>) => void;

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const prefersReducedMotion = usePrefersReducedMotion();
  const confettiRef = useRef<ConfettiFn | null>(null);

  const fire = useCallback(
    (origin: ConfettiOrigin) => {
      if (prefersReducedMotion) return;

      const colors = confettiColors(settings.baseColor, buildTheme(settings.baseColor).light);
      const options = {
        particleCount: 18,
        spread: 70,
        startVelocity: 28,
        gravity: 1.1,
        ticks: 90,
        zIndex: 100,
        colors,
        disableForReducedMotion: true,
        origin: {
          x: origin.x / window.innerWidth,
          y: origin.y / window.innerHeight,
        },
      };

      if (confettiRef.current) {
        confettiRef.current(options);
        return;
      }

      void import('canvas-confetti').then((module) => {
        confettiRef.current = module.default as unknown as ConfettiFn;
        confettiRef.current(options);
      });
    },
    [prefersReducedMotion, settings.baseColor],
  );

  const value = useMemo(() => ({ fire }), [fire]);

  return <ConfettiContext.Provider value={value}>{children}</ConfettiContext.Provider>;
}
