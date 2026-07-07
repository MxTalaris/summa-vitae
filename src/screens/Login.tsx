import { useState } from 'react';
import { SigmaMark } from '../components/Logo';
import { Icon } from '../components/Icon';
import slide01 from '../assets/slide-01.png';
import slide02 from '../assets/slide-02.png';
import slide03 from '../assets/slide-03.png';
import slide04 from '../assets/slide-04.png';

const SLIDE_IMAGES: (string | null)[] = [slide01, slide02, slide03, slide04, null];

const SLIDES = [
  "HR processes, recruiters, and application portals all require you to butcher parts of your professional history to fit a word count, a template, or someone's preconceived notion of a role. Here is different.",
  "Create your own “Base CV” with everything you’ve ever done. Literally everything. Add as much information as possible. Be extensive, brag, write stories, whatever comes to your mind.",
  "From that amalgamy of content, create versions that emphasize different aspects of your experience in a way that will help you tell a story.",
  "Finally, create CVs by picking the most relevant versions of your experiences for the job applications you’re seeking. Then easily export in one of the CV designs available, ATS optimized (so AI can also read your information easily).",
  "Summa Vitae is an open-source tool. That means it’s free. Forever! Use Google Drive’s login to save your data online and access your CVs on multiple devices.",
];

const SLIDE_LABELS = ['The problem', 'Your base', 'Your versions', 'Your CVs', 'Free & open'];

function CarouselModal({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(SLIDES.length - 1, i + 1));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(24,20,16,.6)', zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card sv-pop"
        style={{
          width: '100%', maxWidth: 480, padding: '36px 36px 28px',
          border: '2px solid var(--ink)', boxShadow: 'var(--shadow-lg)', position: 'relative',
        }}
      >
        {/* close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, border: '1.5px solid var(--line-strong)',
            background: 'transparent', borderRadius: 'var(--r)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)',
          }}
          aria-label="Close"
        >
          <Icon name="x" size={14} />
        </button>

        {/* slide image */}
        {SLIDE_IMAGES[index] && (
          <div style={{
            margin: '-36px -36px 24px',
            borderBottom: '1.5px solid var(--line)',
            overflow: 'hidden',
            borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
            background: '#fff',
            height: 180,
          }}>
            <img
              src={SLIDE_IMAGES[index]!}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
        )}

        {/* kicker */}
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 6 }}>
          {index + 1} / {SLIDES.length} — {SLIDE_LABELS[index]}
        </div>

        {/* slide text */}
        <p className="serif" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.55, color: 'var(--ink)', minHeight: 130, marginBottom: 32 }}>
          {SLIDES[index]}
        </p>

        {/* dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 24 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === index ? 18 : 7,
                height: 7,
                borderRadius: 999,
                background: i === index ? 'var(--ink)' : 'var(--line-strong)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width .2s ease, background .2s ease',
              }}
            />
          ))}
        </div>

        {/* nav */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn--ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={prev}
            disabled={index === 0}
          >
            <Icon name="arrowL" size={15} /> Back
          </button>
          {index < SLIDES.length - 1 ? (
            <button
              className="btn btn--primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={next}
            >
              Next <Icon name="arrowR" size={15} />
            </button>
          ) : (
            <button
              className="btn btn--accent"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={onClose}
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface LoginProps {
  onContinueWithout: () => void;
  onLoginGoogle: () => void;
}

export function Login({ onContinueWithout, onLoginGoogle }: LoginProps) {
  const [showCarousel, setShowCarousel] = useState(false);

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

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div
          className="card sv-pop"
          style={{
            width: '100%',
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
            The sum of your professional life
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn--lg btn--accent" style={{ justifyContent: 'center', width: '100%' }} onClick={onLoginGoogle}>
              <Icon name="google" size={18} /> Continue with Google
            </button>
          </div>

          <p className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 10, lineHeight: 1.6, textAlign: 'center' }}>
            For cross-device data persistency only
          </p>

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
            <a href="#terms" style={{ textDecoration: 'underline', color: 'inherit' }}>Terms</a> ·{' '}
            <a href="#privacy" style={{ textDecoration: 'underline', color: 'inherit' }}>Privacy</a>
          </p>
        </div>

        <button
          className="btn btn--ghost"
          style={{ fontSize: 13, color: 'var(--ink-soft)', borderColor: 'transparent', boxShadow: 'none' }}
          onClick={() => setShowCarousel(true)}
        >
          What is Summa Vitae?
        </button>
      </div>

      {showCarousel && <CarouselModal onClose={() => setShowCarousel(false)} />}
    </div>
  );
}
