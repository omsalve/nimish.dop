'use client';

import { useSyncExternalStore } from 'react';

// The frame a visitor reaches for grows into the film's page (a shared view
// transition name, `still-<slug>`). A film can appear more than once on the
// home page (the reel, the index, the contact sheet), and a name may only be
// worn by one element at a time, so whichever frame was last pointed at,
// focused or scrolled into play holds it.
type Armed = { slug: string; source: string } | null;

let armed: Armed = null;
const listeners = new Set<() => void>();

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function arm(slug: string, source: string) {
  if (armed?.slug === slug && armed.source === source) return;
  armed = { slug, source };
  listeners.forEach((l) => l());
}

export function useArmed(slug: string, source: string) {
  return useSyncExternalStore(
    subscribe,
    () => armed?.slug === slug && armed.source === source,
    () => false,
  );
}

