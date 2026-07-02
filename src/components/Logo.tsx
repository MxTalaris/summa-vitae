import React from 'react';

interface SigmaGlyphProps {
  s: number;
  color: string;
  style?: React.CSSProperties;
}

function SigmaGlyph({ s, color, style }: SigmaGlyphProps) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none" style={style}>
      <rect x="2" y="2" width="36" height="36" rx="8" stroke={color} strokeWidth="2.4" />
      <path d="M27.5 11.5 H14 L21.5 20 L14 28.5 H27.5"
        stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SigmaMarkProps {
  size?: number;
  misreg?: boolean;
}

export function SigmaMark({ size = 38, misreg = true }: SigmaMarkProps) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      {misreg && (
        <>
          <SigmaGlyph s={size} color="var(--pink)" style={{ position: 'absolute', left: 1.2, top: -0.6, opacity: .85 }} />
          <SigmaGlyph s={size} color="var(--blue)" style={{ position: 'absolute', left: -1.2, top: 0.6, opacity: .8 }} />
        </>
      )}
      <SigmaGlyph s={size} color="var(--ink)" style={{ position: 'relative' }} />
    </span>
  );
}

interface LogoProps {
  size?: number;
  stacked?: boolean;
  light?: boolean;
  misreg?: boolean;
}

export function Logo({ size = 38, stacked = false, light = false, misreg = true }: LogoProps) {
  const txtColor = light ? 'var(--paper)' : 'var(--ink)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: stacked ? 0 : 12,
      flexDirection: stacked ? 'column' : 'row',
    }}>
      <SigmaMark size={size} misreg={misreg} />
      <span style={{
        display: 'flex', flexDirection: 'column', lineHeight: 1, marginTop: stacked ? 10 : 0,
        alignItems: stacked ? 'center' : 'flex-start',
      }}>
        <span className="serif" style={{ fontWeight: 800, fontSize: size * 0.62, color: txtColor, letterSpacing: '-.01em' }}>
          Summa Vitae
        </span>
        <span className="mono" style={{
          fontSize: size * 0.2, letterSpacing: '.32em', textTransform: 'uppercase',
          color: light ? 'rgba(244,236,219,.55)' : 'var(--ink-faint)', marginTop: 4, marginLeft: 2,
        }}>
          Source of Record
        </span>
      </span>
    </span>
  );
}
