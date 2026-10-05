import { ViewTransition, type ReactNode } from 'react';

/**
 * Wraps a page so route changes cross-dissolve (see globals.css). Links that
 * pass transitionTypes={['cut']} also get the single overexposed splice frame.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
