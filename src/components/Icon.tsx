import React from 'react';

const ICONS: Record<string, string> = {
  plus:      "M12 5v14M5 12h14",
  minus:     "M5 12h14",
  check:     "M20 6 9 17l-5-5",
  x:         "M18 6 6 18M6 6l12 12",
  arrowR:    "M5 12h14M13 6l6 6-6 6",
  arrowL:    "M19 12H5M11 18l-6-6 6-6",
  chevD:     "M6 9l6 6 6-6",
  chevR:     "M9 6l6 6-6 6",
  download:  "M12 3v12M8 11l4 4 4-4M5 21h14",
  eye:       "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z|M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
  pencil:    "M12 20h9|M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  mail:      "M3 6h18v12H3zM3 7l9 6 9-6",
  search:    "M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0|M21 21l-4.3-4.3",
  trash:     "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  copy:      "M9 9h11v11H9zM5 15V4h11",
  dots:      "M12 5h.01M12 12h.01M12 19h.01",
  grip:      "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  briefcase: "M3 8h18v12H3zM8 8V5h8v3",
  cap:       "M3 9l9-4 9 4-9 4-9-4ZM7 11v5c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-5",
  folder:    "M3 7h6l2 2h10v11H3z",
  doc:       "M6 2h8l4 4v16H6zM14 2v4h4",
  globe:     "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  award:     "M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM9 12l-1.5 8L12 17l4.5 3L15 12",
  wrench:    "M14 7a4 4 0 0 1-5 5l-5 5 2 2 5-5a4 4 0 0 1 5-5l-2-2 2-2Z",
  user:      "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21c0-3.5 3-6 7-6s7 2.5 7 6",
  layers:    "M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5",
  sparkle:   "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z",
  palette:   "M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.5 1-2 2-2h1a4 4 0 0 0 4-4c0-5-4-8-9-8ZM7.5 12.5h.01M10 8h.01M15 8h.01",
  home:      "M3 11l9-8 9 8M5 10v10h14V10",
  list:      "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  flag:      "M5 21V4h13l-2 4 2 4H5",
  bot:       "M12 3v3M8 9h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2ZM9 14h.01M15 14h.01",
  link:      "M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1",
  star:      "M12 3l2.6 6.3 6.4.5-4.9 4.2 1.5 6.5L12 17.8 6.9 20.5l1.5-6.5L3.5 9.8l6.4-.5L12 3Z",
  clock:     "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2",
  lock:      "M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3",
  filter:    "M3 5h18l-7 8v6l-4-2v-4z",
  move:      "M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3",
  image:     "M4 5h16v14H4z|M4 15l5-5 4 4 2-2 5 5|M9.5 9.5m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0",
  share:     "M4 12v8h16v-8|M12 16V3M7 8l5-5 5 5",
  external:  "M14 4h6v6M20 4l-9 9M18 13v6H5V6h6",
  users:     "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 21c0-3.3 3-5.5 7-5.5s7 2.2 7 5.5M17 5.2a3.5 3.5 0 0 1 0 6.6M18 15.6c2.4.7 4 2.3 4 5.4",
  sort:      "M4 6h16M4 11h11M4 16h6|M20 14l-3 3-3-3M17 17V9",
  menu:      "M4 6h16M4 12h16M4 18h16",
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.9, fill = 'none', style, onClick }: IconProps) {
  if (name === 'google') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    );
  }

  if (name === 'github') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
        <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
      </svg>
    );
  }

  const paths = (ICONS[name] || '').split('|');
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ ...style, cursor: onClick ? 'pointer' : style?.cursor }}
      onClick={onClick}
    >
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
