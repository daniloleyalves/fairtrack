'use client';

import { useEffect } from 'react';

export const IDLE_RELOAD_MS = 30 * 60_000;
const CHECK_INTERVAL_MS = 60_000;
const ACTIVITY_EVENTS = [
  'pointerdown',
  'keydown',
  'scroll',
  'touchstart',
] as const;

const blockers = new Set<symbol>();

export function useBlockIdleReload(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const token = Symbol();
    blockers.add(token);
    return () => {
      blockers.delete(token);
    };
  }, [active]);
}

export function useIdleReload(idleMs: number = IDLE_RELOAD_MS) {
  useEffect(() => {
    let lastActivity = Date.now();
    const markActive = () => {
      lastActivity = Date.now();
    };
    const reloadIfIdle = () => {
      if (Date.now() - lastActivity < idleMs) return;
      if (blockers.size > 0 || !navigator.onLine) return;
      window.location.reload();
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActive, {
        capture: true,
        passive: true,
      });
    }
    document.addEventListener('visibilitychange', reloadIfIdle);
    const interval = window.setInterval(reloadIfIdle, CHECK_INTERVAL_MS);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, markActive, { capture: true });
      }
      document.removeEventListener('visibilitychange', reloadIfIdle);
      window.clearInterval(interval);
    };
  }, [idleMs]);
}
