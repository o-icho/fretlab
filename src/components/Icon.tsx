import type { CSSProperties } from "react";
export function Icon({
  name,
  size = 24,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  const paths: Record<string, React.ReactNode> = {
    chords: (
      <>
        <path d="M5 4v16M10 4v16M15 4v16M20 4v16M5 7h15M5 12h15M5 17h15" />
        <circle cx="10" cy="9.5" r="1.7" fill="currentColor" />
        <circle cx="15" cy="14.5" r="1.7" fill="currentColor" />
      </>
    ),
    metronome: (
      <>
        <path d="m9 3-5 18h16L15 3ZM7 16h10M12 16l6-12" />
        <circle cx="16" cy="8" r="1.5" fill="currentColor" />
      </>
    ),
    tuner: (
      <>
        <path d="M3 10v4M7 6v12M12 3v18M17 6v12M21 10v4" />
      </>
    ),
    transpose: (
      <>
        <path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    check: <path d="m5 12 4 4L19 6" />,
    logo: (
      <>
        <path d="M6 4v16M12 4v16M18 4v16M4 8h16M4 16h16" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {paths[name] ?? paths.arrow}
    </svg>
  );
}
