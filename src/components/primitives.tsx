import React from 'react';
import { Icon } from './Icon';

/* Chip */
interface ChipProps {
  children: React.ReactNode;
  tone?: 'pink' | 'blue' | 'teal' | 'yellow';
  style?: React.CSSProperties;
}
export function Chip({ children, tone, style }: ChipProps) {
  return (
    <span className={'chip' + (tone ? ' chip--' + tone : '')} style={style}>
      {children}
    </span>
  );
}

/* Kicker */
interface KickerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function Kicker({ children, style }: KickerProps) {
  return <div className="kicker" style={style}>{children}</div>;
}

/* Stars */
interface StarsProps {
  n: number;
  size?: number;
}
export function Stars({ n, size = 12 }: StarsProps) {
  return (
    <span style={{ display: 'inline-flex', gap: 1.5 }}>
      {[1, 2, 3].map((i) => (
        <Icon key={i} name="star" size={size}
          color={i <= n ? 'var(--orange)' : 'var(--line-strong)'}
          fill={i <= n ? 'var(--orange)' : 'none'}
          strokeWidth={1.6}
        />
      ))}
    </span>
  );
}

/* Toggle switch */
interface ToggleSwitchProps {
  on: boolean;
  onClick: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export function ToggleSwitch({ on, onClick, style }: ToggleSwitchProps) {
  return (
    <button
      onClick={onClick}
      className="twk-toggle"
      data-on={on ? '1' : '0'}
      style={{ cursor: 'pointer', flexShrink: 0, ...style }}
    >
      <i />
    </button>
  );
}

/* Section meta for Base CV */
export const SECTION_META: Record<string, { icon: string; tone: string; label: string }> = {
  general:   { icon: 'user',      tone: 'pink',   label: 'General Info' },
  contact:   { icon: 'mail',      tone: 'blue',   label: 'Contact' },
  work:      { icon: 'briefcase', tone: 'blue',   label: 'Work Experience' },
  education: { icon: 'cap',       tone: 'teal',   label: 'Education' },
  portfolio: { icon: 'layers',    tone: 'yellow', label: 'Portfolio' },
  other:     { icon: 'sparkle',   tone: 'pink',   label: 'Other Experiences' },
  certs:     { icon: 'award',     tone: 'blue',   label: 'Certifications' },
  skills:    { icon: 'wrench',    tone: 'teal',   label: 'Skills' },
  languages: { icon: 'globe',     tone: 'yellow', label: 'Languages' },
};
