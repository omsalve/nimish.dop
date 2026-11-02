export function Arrow({
  direction = "up",
}: {
  direction?: "up" | "down" | "left" | "right";
}) {
  return (
    <svg
      className={`arrow arrow-${direction}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Asterisk() {
  return (
    <svg
      className="asterisk"
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M30 3v54M3 30h54M11 11l38 38M11 49l38-38"
        stroke="currentColor"
        strokeWidth="7"
      />
    </svg>
  );
}
