'use client';

import { useSyncExternalStore } from 'react';

const subscribers = new Map<string, (notify: () => void) => () => void>();

function subscriber(query: string) {
  let subscribe = subscribers.get(query);
  if (!subscribe) {
    subscribe = (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', notify);
      return () => mq.removeEventListener('change', notify);
    };
    subscribers.set(query, subscribe);
  }
  return subscribe;
}

/** A media query as live state. Renders `serverValue` until hydrated. */
export function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscriber(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
