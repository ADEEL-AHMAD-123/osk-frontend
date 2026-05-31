/**
 * Hero filter icons. Inline SVGs, `currentColor` so they pick up the parent
 * token-driven color. No external icon dependency.
 */

export function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M9 3a6 6 0 014.47 9.99l3.27 3.27-1.06 1.06-3.27-3.27A6 6 0 119 3zm0 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CityIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M3 17V8l4-2v2h3V5l4-2v4h3v10H3zm6-1.5v-3H6v3h3zm0-4.5v-3H6v3h3zm5 4.5v-3h-3v3h3zm0-4.5v-3h-3v3h3zm0-4.5V4l-3 1.5V7h3z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M10 2.5L2.5 9h2v8h4v-5h3v5h4V9h2L10 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PriceIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M10 1.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17zm.75 4v1.25c1.42.15 2.25 1 2.25 2.13h-1.5c0-.41-.34-.75-.75-.75h-1c-.41 0-.75.34-.75.75s.34.75.75.75h1c1.24 0 2.25 1.01 2.25 2.25 0 1.05-.74 1.93-1.75 2.16V14.5h-1.5v-1.27c-1.42-.15-2.25-1.05-2.25-2.23h1.5c0 .41.34.75.75.75h1c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-1A2.25 2.25 0 017.5 8a2.25 2.25 0 011.75-2.19V5.5h1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RulerIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M2 13.5L13.5 2 18 6.5 6.5 18 2 13.5zm3.2-1.3l1.4 1.4 1.4-1.4-1.4-1.4 1.1-1.1 1.4 1.4 1.4-1.4-1.4-1.4 1.1-1.1 1.4 1.4L13 6.6l-2.6-2.6L4 10.4l1.2 1.8z"
        fill="currentColor"
      />
    </svg>
  );
}
