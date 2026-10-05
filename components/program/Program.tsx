'use client';

import { addTransitionType, startTransition, useEffect, useState } from 'react';
import { CATEGORIES, type Category, type Project } from '@/content/projects';
import { ProgramIndex } from './ProgramIndex';
import { ContactSheet } from './ContactSheet';
import styles from './Program.module.css';

type View = 'index' | 'sheet';
const VIEW_KEY = 'nk:program-view';

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];

/**
 * The program: every film, newest first. Two ways to read it: an index of
 * titles that projects each film behind the list as you reach for it, or a
 * contact sheet of every frame at once. Filtering re-cuts the list in place.
 */
export function Program({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [view, setView] = useState<View>('index');

  // a per-visitor convenience: remember the last view
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === 'sheet') startTransition(() => setView('sheet'));
    } catch {}
  }, []);

  const shown = filter === 'all' ? projects : projects.filter((p) => p.category === filter);
  const years = projects.map((p) => p.year);
  const span = `${Math.min(...years)}–${Math.max(...years)}`;
  const count = (key: Category) => projects.filter((p) => p.category === key).length;

  const choose = (next: Category | 'all') => {
    if (next === filter) return;
    startTransition(() => {
      addTransitionType('filter');
      setFilter(next);
    });
  };

  const show = (next: View) => {
    if (next === view) return;
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {}
    startTransition(() => {
      addTransitionType('filter');
      setView(next);
    });
  };

  return (
    <section id="program" className={styles.program} aria-labelledby="program-title">
      <header className={`grid12 ${styles.head}`}>
        <h2 id="program-title" className={`t-section ${styles.heading}`}>
          The program
        </h2>
        <p className={styles.intro}>
          {WORDS[projects.length] ?? projects.length} films, {span}: brand films and commercials, music videos, short
          fiction, documentary and experiments, each lit, shot or cut by Nimish.
        </p>

        <div className={styles.controls}>
          <div className={styles.filters} role="group" aria-label="Show films by kind">
            <FilterButton label="All" n={projects.length} on={filter === 'all'} onClick={() => choose('all')} />
            {CATEGORIES.map((c) => (
              <FilterButton key={c.key} label={c.label} n={count(c.key)} on={filter === c.key} onClick={() => choose(c.key)} />
            ))}
          </div>
          <div className={styles.views} role="group" aria-label="View">
            <button type="button" className={styles.viewBtn} aria-pressed={view === 'index'} onClick={() => show('index')}>
              <IndexGlyph />
              Index
            </button>
            <button type="button" className={styles.viewBtn} aria-pressed={view === 'sheet'} onClick={() => show('sheet')}>
              <SheetGlyph />
              Contact sheet
            </button>
          </div>
        </div>
      </header>

      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'film' : 'films'} shown
      </p>

      {view === 'index' ? <ProgramIndex films={shown} /> : <ContactSheet films={shown} />}
    </section>
  );
}

function FilterButton({ label, n, on, onClick }: { label: string; n: number; on: boolean; onClick: () => void }) {
  return (
    <button type="button" className={styles.filter} aria-pressed={on} onClick={onClick}>
      {label}
      <span className={styles.n}>{n}</span>
    </button>
  );
}

// drawn on the 16px icon grid, same stroke as the rest of the set
function IndexGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
    </svg>
  );
}

function SheetGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M2.5 3.5h4.5v4h-4.5zM9 3.5h4.5v4H9zM2.5 9.5h4.5v3.5h-4.5zM9 9.5h4.5v3.5H9z" />
    </svg>
  );
}
