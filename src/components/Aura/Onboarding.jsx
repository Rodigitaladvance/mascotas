import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';
import logo from '../../assets/logo.png';

const steps = (t) => [
  {
    icon: (
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <img
          src={logo}
          alt="AURA"
          className="aura-pulse-logo"
          style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: '50%', border: '2px solid var(--aura-gold-muted)' }}
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
    badge: 'AES-256 · GDPR · HIPAA',
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
          style={{ width: '100%', maxWidth: 560, textAlign: 'center', padding: '4rem 3rem' }}
        >
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
            {s[step].icon}
          </div>

          <h1 style={{ fontSize: '2.2rem', marginBottom: '1.2rem', color: s[step].accent }}>
            {s[step].title}
          </h1>

          <p style={{ color: 'var(--aura-text-muted)', lineHeight: 1.85, fontSize: '1rem', marginBottom: '2.5rem', fontWeight: 300 }}>
            {s[step].body}
          </p>

          {s[step].badge && (
            <div style={{ marginBottom: '2.5rem' }}>
              <span className="locale-chip" style={{ borderColor: 'var(--aura-neon-cyan)', color: 'var(--aura-neon-cyan)', letterSpacing: '3px' }}>
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
                background: i === step ? 'var(--aura-gold)' : 'rgba(212,175,55,0.2)',
                transition: 'all 0.4s',
                borderRadius: 1,
              }} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
