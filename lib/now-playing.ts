'use client';

import { useSyncExternalStore } from 'react';

// One film plays at a time on touch screens: whichever most recently took the
// screen. Cards claim the slot as they settle into view and release it as they leave.
let current: string | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function claim(id: string) {
  if (current !== id) {
    current = id;
    emit();
  }
}

export function release(id: string) {
  if (current === id) {
    current = null;
    emit();
  }
}

export function useNowPlaying(id: string) {
  return useSyncExternalStore(
    subscribe,
    () => current === id,
    () => false,
  );
}
