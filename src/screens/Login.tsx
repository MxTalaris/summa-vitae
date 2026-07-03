import { SigmaMark } from '../components/Logo';
import { Icon } from '../components/Icon';

interface LoginProps {
  onContinueWithout: () => void;
  onLoginGoogle: () => void;
}

export function Login({ onContinueWithout, onLoginGoogle }: LoginProps) {
  return (
    <div
      className="grain"
      style={{
        position: 'relative', minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 32, overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 0%, #fbf6ea, var(--paper) 60%)',
      }}
    >
      <div className="halftone" style={{
        position: 'absolute', top: -20, left: -20, width: 220, height: 220,
        color: 'var(--pink)', opacity: .14, transform: 'rotate(8deg)',
      }} />
      <div className="halftone" style={{
        position: 'absolute', bottom: -30, right: -10, width: 260, height: 200,
        color: 'var(--blue)', opacity: .12,
      }} />
      <span aria-hidden style={{
        position: 'absolute', right: -60, bottom: -120,
        fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 520, lineHeight: .8,
        color: 'rgba(24,20,16,.03)', userSelect: 'none', pointerEvents: 'none',
      }}>Σ</span>

      <div
        className="card sv-pop"
        style={{
          position: 'relative', zIndex: 2, width: '100%', maxWidth: 430,
          padding: '44px 40px', boxShadow: 'var(--shadow-lg)', borderColor: 'var(--ink)', borderWidth: 2,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <SigmaMark size={62} />
        </div>
        <h1 className="serif" style={{ textAlign: 'center', fontWeight: 800, fontSize: 30, marginTop: 14, letterSpacing: '-.01em' }}>
          Summa Vitae
        </h1>
        <p className="mono" style={{
          textAlign: 'center', fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase',
          color: 'var(--ink-faint)', marginTop: 8, marginBottom: 30,
        }}>
          The sum of your work
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn--lg btn--accent" style={{ justifyContent: 'center', width: '100%' }} onClick={onLoginGoogle}>
            <Icon name="google" size={18} /> Continue with Google
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 16px' }}>
          <hr className="divider" style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '.1em' }}>OR</span>
          <hr className="divider" style={{ flex: 1 }} />
        </div>

        <button className="btn btn--ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onContinueWithout}>
          Continue without login
        </button>

        <p className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 22, lineHeight: 1.6, textAlign: 'center' }}>
          By continuing you agree to keep one honest record.<br />
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms</span> ·{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy</span>
        </p>
      </div>
    </div>
  );
}
