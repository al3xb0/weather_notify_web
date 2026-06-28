'use client';

import { useEffect, useReducer, useSyncExternalStore } from 'react';

const KEY = 'trigger-test-cooldown-until';
const listeners = new Set<() => void>();

function readUntil(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(KEY) ?? 0);
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function secondsLeft(until: number): number {
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

function writeUntil(secs: number): void {
  localStorage.setItem(KEY, String(Date.now() + secs * 1000));
  listeners.forEach((l) => l());
}

/**
 * Global, reload-proof cooldown for the trigger Test action. The deadline lives
 * in localStorage so every Test button — and a fresh page load, or a newly
 * created trigger — shares one timer, mirroring the server-side per-user
 * cooldown.
 */
export function useTestCooldown() {
  const until = useSyncExternalStore(subscribe, readUntil, () => 0);
  const [, tick] = useReducer((c: number) => c + 1, 0);
  const remaining = secondsLeft(until);
  const cooling = remaining > 0;

  useEffect(() => {
    if (!cooling) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooling]);

  return { remaining, cooling, start: writeUntil };
}
