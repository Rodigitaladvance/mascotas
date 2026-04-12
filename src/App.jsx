import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTranslation } from './context/LocalizationContext';
import Auth from './components/Auth';
import logo from './assets/logo.png';
import Dashboard from './components/Aura/Dashboard';
import GlobalPassport from './components/Aura/GlobalPassport';
import SOSMode from './components/Aura/SOSMode';
import Onboarding from './components/Aura/Onboarding';
import PrivacyVault from './components/Aura/PrivacyVault';
import PetRegistration from './components/Aura/PetRegistration';
import { storage } from './utils/storage';
import {
  LogOut, LayoutDashboard, ShieldAlert, ShieldCheck,
  Settings, PlusCircle, Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Tab definitions ── */
const NAV_TABS = [
  { id: 'dashboard', path: '/dashboard', iconD: LayoutDashboard, label: 'Dashboard' },
  { id: 'passport',  path: '/passport',  iconD: Globe,           label: 'Passport'  },
  { id: 'add',       path: '/registro',  iconD: PlusCircle,      label: 'Registro', isCTA: true },
  { id: 'privacy',   path: '/privacy',   iconD: ShieldCheck,     label: 'Privacidad' },
  { id: 'settings',  path: '/settings',  iconD: Settings,        label: 'Ajustes'   },
];

const TAB_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16,1,0.3,1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.25 } },
};

/* ── Session expiry modal ── */
const SessionModal = ({ locale, onRenew, onLogout }) => {
  const es = locale === 'es';
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit   ={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}
        className="aura-card"
        style={{ maxWidth: 420, width: '100%', padding: '3rem', textAlign: 'center' }}
      >
        {/* Animated lock icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '2px solid var(--aura-gold)', margin: '0 auto 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(212,175,55,0.25)',
        }}>
          <ShieldAlert size={28} color="var(--aura-gold)" />
        </div>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>
          {es ? 'Sesión por Expirar' : 'Session Expiring'}
        </h2>
        <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          {es
            ? 'Tu sesión ha alcanzado el límite de seguridad. ¿Deseas continuar o cerrar la sesión?'
            : 'Your session has reached the security limit. Do you want to continue or sign out?'}
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-aura" style={{ flex: 1, borderColor: 'var(--aura-border)' }}
            onClick={onLogout}>
            {es ? 'CERRAR SESIÓN' : 'SIGN OUT'}
          </button>
          <button
            className="btn-aura"
            style={{ flex: 2, borderColor: 'var(--aura-gold)', background: 'rgba(212,175,55,0.08)', color: 'var(--aura-gold)' }}
            onClick={onRenew}>
            {es ? '✓ CONTINUAR SESIÓN' : '✓ CONTINUE SESSION'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ════════════════════════════════
   Inner App — requires providers
════════════════════════════════ */
const AppContent = () => {
  const { user, logout, renewSession, sessionWarning } = useAuth();
  const { t, locale, setManualConfig, currency } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [pets, setPets]           = useState([]);
  const [isSOS, setIsSOS]         = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const isFirstTime = localStorage.getItem(`aura_onboarding_${user.id}`) === null;
      if (isFirstTime) setShowOnboarding(true);
      setPets(storage.getPets(user.id));
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(`aura_onboarding_${user.id}`, 'done');
    setShowOnboarding(false);
  };

  const handleAddPet = (newPet) => {
    const petWithMeta = {
      ...newPet,
      id: Date.now(),
      userId: user.id,
      emergencyConfig: { active: true, medicalAlerts: '', contacts: [{ name: 'Dueño', phone: '' }] },
    };
    storage.savePet(user.id, petWithMeta);
    setPets(prev => [...prev, petWithMeta]);
    navigate('/dashboard');
  };

  const handleUpdatePet = (updatedPet) => {
    storage.updatePet(user.id, updatedPet.id, () => updatedPet);
    setPets(prev => prev.map(p => p.id === updatedPet.id ? updatedPet : p));
  };

  /* ── Auth / Onboarding gates ── */
  if (!user) return <Auth />;
  if (showOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;
  if (isSOS) return <SOSMode pet={pets[0]} onExit={() => setIsSOS(false)} />;

  const activeId = NAV_TABS.find(tab => location.pathname === tab.path)?.id || 'dashboard';

  /* ── Language toggle button (reusable) ── */
  const LangToggle = () => (
    <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '2px' }}>
      {['es', 'en'].map(l => (
        <button key={l} onClick={() => setManualConfig(l)}
          style={{
            background: locale === l ? 'var(--aura-gold)' : 'transparent',
            color:      locale === l ? 'var(--aura-black)' : 'var(--aura-text-muted)',
            border: 'none', cursor: 'pointer', padding: '0.3rem 0.6rem',
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1px',
            borderRadius: 3, transition: 'all 0.25s', textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
          }}>
          {l === 'es' ? 'ES' : 'EN'}
        </button>
      ))}
    </div>
  );

  /* ── Main layout ── */
  return (
    <>
      {/* ── Session expiry modal ── */}
      <AnimatePresence>
        {sessionWarning && (
          <SessionModal
            locale={locale}
            onRenew={renewSession}
            onLogout={logout}
          />
        )}
      </AnimatePresence>

      {/* ── Desktop top nav ── */}
      <nav className="aura-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <img src={logo} alt="AURA Pets" className="aura-pulse-logo"
               style={{ height: 42, borderRadius: '50%', objectFit: 'contain',
                        border: '1px solid var(--aura-gold-muted)',
                        filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))' }} />
          <div style={{ width: 1, height: 24, background: 'var(--aura-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', letterSpacing: '4px', color: 'var(--aura-gold)', fontWeight: 700 }}>EXCELENCIA</span>
            <span style={{ fontSize: '0.72rem', letterSpacing: '2px', opacity: 0.45 }}>EXPEDIENTE MÉDICO</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {NAV_TABS.map(({ id, path, iconD: Icon, isCTA }) => (
            <button key={id} onClick={() => navigate(path)}
              className="btn-aura"
              style={{
                padding: '0.5rem 1rem',
                border: isCTA
                  ? '1px solid var(--aura-neon-cyan)'
                  : activeId === id ? '1px solid var(--aura-gold)' : '1px solid transparent',
                color: isCTA ? 'var(--aura-neon-cyan)' : activeId === id ? 'var(--aura-gold)' : 'var(--aura-text-muted)',
                opacity: 1,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
              <Icon size={16} />
            </button>
          ))}

          <button onClick={() => setIsSOS(true)} className="btn-aura"
            style={{ padding: '0.5rem 1rem', borderColor: 'var(--aura-neon-pink)', color: 'var(--aura-neon-pink)' }}>
            <ShieldAlert size={16} />
          </button>

          <div style={{ width: 1, height: 20, background: 'var(--aura-border)' }} />

          {/* Language toggle */}
          <LangToggle />

          <div style={{ width: 1, height: 20, background: 'var(--aura-border)' }} />
          <button onClick={logout} className="btn-aura"
            style={{ padding: '0.5rem', borderColor: 'transparent', opacity: 0.5 }}>
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="app-container">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/dashboard" element={
              <motion.div {...TAB_VARIANTS}>
                <Dashboard pets={pets} onAddPet={() => navigate('/registro')} onSelectPet={() => navigate('/passport')} onUpdatePet={handleUpdatePet} />
              </motion.div>
            } />
            <Route path="/passport" element={
              <motion.div {...TAB_VARIANTS} style={{ paddingTop: '2rem' }}>
                <GlobalPassport pet={pets[0]} />
              </motion.div>
            } />
            <Route path="/registro" element={
              <motion.div {...TAB_VARIANTS}>
                <PetRegistration onSave={handleAddPet} onCancel={() => navigate('/dashboard')} />
              </motion.div>
            } />
            <Route path="/privacy" element={
              <motion.div {...TAB_VARIANTS} style={{ paddingTop: '2rem' }}>
                <PrivacyVault />
              </motion.div>
            } />
            <Route path="/settings" element={
              <motion.div {...TAB_VARIANTS}>
                <div className="aura-card" style={{ maxWidth: 540, margin: '3rem auto' }}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '3rem' }}>{t('common.settings')}</h2>
                  <div style={{ display: 'grid', gap: '3rem' }}>
                    <div>
                      <p style={{ fontSize: '0.68rem', letterSpacing: '2.5px', opacity: 0.5, marginBottom: '1.2rem', textTransform: 'uppercase' }}>
                        {locale === 'es' ? 'Idioma y Región' : 'Language & Region'}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className={`btn-aura${locale === 'es' ? ' btn-neon' : ''}`}
                          onClick={() => setManualConfig('es')}>ESPAÑOL</button>
                        <button className={`btn-aura${locale === 'en' ? ' btn-neon' : ''}`}
                          onClick={() => setManualConfig('en')}>ENGLISH</button>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.68rem', letterSpacing: '2.5px', opacity: 0.5, marginBottom: '1.2rem', textTransform: 'uppercase' }}>
                        {locale === 'es' ? 'Divisa de Referencia' : 'Reference Currency'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {['EUR','USD','GBP','AUD'].map(c => (
                          <button key={c} className={`btn-aura${currency === c ? ' btn-neon' : ''}`}
                            onClick={() => setManualConfig(null, c)}>{c}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-tab-bar">
        {NAV_TABS.map(({ id, path, iconD: Icon, label, isCTA }) => (
          <button key={id}
            className={`tab-btn${activeId === id ? ' active' : ''}${isCTA ? ' confirm-tab' : ''}`}
            onClick={() => navigate(path)}>
            <Icon size={isCTA ? 22 : 20} />
            {!isCTA && <span>{label}</span>}
          </button>
        ))}
        <button className="tab-btn sos-tab" onClick={() => setIsSOS(true)}>
          <ShieldAlert size={20} />
          <span>SOS</span>
        </button>
        {/* Mobile lang toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0.4rem 0.6rem' }}>
          {['es','en'].map(l => (
            <button key={l} onClick={() => setManualConfig(l)}
              style={{
                background: locale === l ? 'var(--aura-gold)' : 'transparent',
                color:      locale === l ? 'var(--aura-black)' : 'var(--aura-text-muted)',
                border: 'none', cursor: 'pointer', padding: '1px 5px',
                fontSize: '0.55rem', fontWeight: 700, letterSpacing: '1px',
                borderRadius: 2, fontFamily: 'var(--font-sans)',
              }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

/* ── Localization & Auth wrap only, BrowserRouter in main.jsx ── */
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
