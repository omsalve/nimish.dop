// Hand-drawn icon set: one 1.5px stroke, square ends, drawn on a 16px grid.

const PATHS = {
  arrow: 'M2.5 8h11M9 3.5 13.5 8 9 12.5',
  'arrow-up-right': 'M4.5 11.5l7-7M5.5 4.5h6v6',
  down: 'M8 2.5v11M3.5 9 8 13.5 12.5 9',
  play: 'M5 3.2v9.6L12.6 8z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className, size = 16 }: { name: IconName; className?: string; size?: number }) {
  const filled = name === 'play';
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.5}
      strokeLinecap="square"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
