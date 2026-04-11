import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, CheckCircle2, Globe, Shield } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();

  const steps = [
    {
      title: t('onboarding.welcome'),
      body: t('onboarding.introBody'),
      icon: <Globe size={64} className="fade-in" color="var(--aura-gold)" />
    },
    {
      title: t('onboarding.shieldTitle'),
      body: t('onboarding.shieldBody'),
      icon: <ShieldCheck size={72} color="var(--aura-gold)" style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.4))' }} />
    }
  ];

  return (
    <div style={{ 
      fixed: 'inset-0', background: 'var(--aura-black)', minHeight: '100vh',
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'
    }}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="aura-card" 
          style={{ width: '100%', maxWidth: '600px', textAlign: 'center', border: 'none' }}
        >
          <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'center' }}>
            {steps[step].icon}
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{steps[step].title}</h1>
          <p style={{ 
            fontSize: '1.1rem', color: 'var(--aura-text-muted)', lineHeight: '1.8', 
            marginBottom: '3.5rem', fontWeight: 300 
          }}>
            {steps[step].body}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <button 
              className="btn-aura" 
              onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}
            >
              {step < steps.length - 1 ? t('common.next') : t('onboarding.btnStart')}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginTop: '4rem' }}>
            {steps.map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: i === step ? '40px' : '8px', 
                  height: '2px', 
                  background: i === step ? 'var(--aura-gold)' : 'rgba(212,175,55,0.2)',
                  transition: 'all 0.4s'
                }} 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
