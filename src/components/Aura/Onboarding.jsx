import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';
import logo from '../../assets/logo-aura.png';
import PawPrint from './PawPrint';
import { PlaneTrail, Sparkle, HeartOutline, Blob } from './Decorations';

/* Mismos adornos que la pantalla de acceso, para que las dos primeras
   pantallas que ve un usuario nuevo hablen el mismo idioma visual. */
const ONB_BLOBS = [
  { size: 200, color: '#A5E3DC', top: '-8%',    left: '-14%', opacity: 0.50 },
  { size: 160, color: '#C9BDF2', top: '-6%',    right: '-12%', opacity: 0.48 },
  { size: 150, color: '#F9C9D8', bottom: '-6%', right: '-14%', opacity: 0.40 },
  { size: 130, color: '#FCE1A8', bottom: '4%',  left: '-11%', opacity: 0.42 },
];
const ONB_PAWS = [
  { size: 44, top: '14%',   left: '5%',   color: '#A5E3DC', opacity: 0.50, rot: -22 },
  { size: 28, top: '30%',   right: '7%',  color: '#BFE0F5', opacity: 0.55, rot: 30 },
  { size: 34, bottom: '14%', left: '10%', color: '#C9BDF2', opacity: 0.42, rot: 10 },
  { size: 22, bottom: '26%', right: '12%', color: '#A5E3DC', opacity: 0.45, rot: -36 },
];

const steps = (t) => [
  {
    icon: (
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <img
          src={logo}
          alt="AURA"
          className="aura-pulse-logo"
          style={{ width: 128, height: 128, objectFit: 'contain', filter: 'drop-shadow(0 10px 22px rgba(42, 45, 124, 0.14))' }}
        />
      </div>
    ),
    title: t('onboarding.welcome'),
    body: t('onboarding.introBody'),
    accent: 'var(--aura-gold)',
  },
  {
    icon: (
      <div className="shield-icon" style={{ width: 80, height: 80, margin: '0 auto' }}>
        <Shield size={40} />
      </div>
    ),
    title: t('onboarding.shieldTitle'),
    body: t('onboarding.shieldBody'),
    accent: 'var(--aura-neon-cyan)',
    badge: 'AES-256 · GDPR · CCPA · LOPD',
  },
];

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();
  const s = steps(t);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--aura-black)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="aura-card"
          style={{ width: '100%', maxWidth: 560, textAlign: 'center', padding: '3.4rem 3rem', position: 'relative' }}
        >
          {ONB_BLOBS.map((b, i) => (
            <Blob key={`b${i}`} size={b.size} color={b.color}
              style={{ top: b.top, left: b.left, right: b.right, bottom: b.bottom, opacity: b.opacity, zIndex: 0 }} />
          ))}
          {ONB_PAWS.map((h, i) => (
            <PawPrint key={`p${i}`} size={h.size}
              style={{
                position: 'absolute', top: h.top, left: h.left, right: h.right, bottom: h.bottom,
                color: h.color, opacity: h.opacity, transform: `rotate(${h.rot}deg)`,
                pointerEvents: 'none', zIndex: 0,
              }} />
          ))}
          <PlaneTrail size={104} style={{ position: 'absolute', top: '4%', right: '-2%', color: 'var(--violet)', opacity: 0.55, zIndex: 0, pointerEvents: 'none' }} />
          <HeartOutline size={26} style={{ position: 'absolute', bottom: '8%', left: '4%', color: '#F19FB8', opacity: 0.6, zIndex: 0, pointerEvents: 'none' }} />
          <Sparkle size={14} style={{ position: 'absolute', top: '12%', left: '26%', color: '#FCE1A8', opacity: 0.85, zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
            {s[step].icon}
          </div>

          <h1 style={{ fontSize: '2.2rem', marginBottom: '1.2rem', color: 'var(--ink)' }}>
            {s[step].title}
          </h1>

          <p style={{ color: 'var(--ink-body)', lineHeight: 1.85, fontSize: '1rem', marginBottom: '2.5rem', fontWeight: 300 }}>
            {s[step].body}
          </p>

          {s[step].badge && (
            <div style={{ marginBottom: '2.5rem' }}>
              <span className="locale-chip" style={{ borderColor: 'var(--violet)', color: 'var(--violet)', letterSpacing: '3px', background: 'rgba(139, 92, 246, 0.08)' }}>
                {s[step].badge}
              </span>
            </div>
          )}

          <button
            className="btn-aura btn-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
            onClick={() => step < s.length - 1 ? setStep(step + 1) : onComplete()}
          >
            {step < s.length - 1 ? t('common.next') : t('onboarding.btnStart')}
            <ChevronRight size={14} />
          </button>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '2.5rem' }}>
            {s.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 32 : 8,
                height: 2,
                background: i === step ? 'var(--violet)' : 'var(--border)',
                transition: 'all 0.4s',
                borderRadius: 1,
              }} />
            ))}
          </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
