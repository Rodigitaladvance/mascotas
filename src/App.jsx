import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTranslation } from './context/LocalizationContext';
import Auth from './components/Auth';
import logo from './assets/logo-aura.png';
import Dashboard from './components/Aura/Dashboard';
import GlobalPassport from './components/Aura/GlobalPassport';
import SOSMode from './components/Aura/SOSMode';
import Onboarding from './components/Aura/Onboarding';
import PrivacyVault from './components/Aura/PrivacyVault';
import PetRegistration from './components/Aura/PetRegistration';
import RecuperarAcceso from './components/Aura/RecuperarAcceso';
import { storage } from './utils/storage';
import { PawScatter } from './components/Aura/Decorations';
import {
  LogOut, LayoutDashboard, ShieldAlert, ShieldCheck,
  Settings, PlusCircle, Globe, AlertTriangle, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PawPrint from './components/Aura/PawPrint';

/* ── Desktop tab definitions ── */
const NAV_TABS = [
  { id: 'dashboard', path: '/dashboard', iconD: LayoutDashboard, k: 'nav.home'     },
  { id: 'passport',  path: '/passport',  iconD: Globe,           k: 'nav.passport' },
  { id: 'add',       path: '/registro',  iconD: PlusCircle,      k: 'nav.add', isCTA: true },
  { id: 'privacy',   path: '/privacy',   iconD: ShieldCheck,     k: 'nav.security' },
  { id: 'settings',  path: '/settings',  iconD: Settings,        k: 'nav.settings' },
];

/* ── Mobile-only tab definitions (5 max, SOS as center CTA) ── */
const MOBILE_TABS = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, labelEs: 'Inicio',    labelEn: 'Home'     },
  { id: 'passport',  path: '/passport',  icon: Globe,           labelEs: 'Pasaporte', labelEn: 'Passport' },
  { id: 'sos',       path: null,         icon: ShieldAlert,     labelEs: 'SOS',       labelEn: 'SOS',     isSOS: true },
  { id: 'privacy',   path: '/privacy',   icon: ShieldCheck,     labelEs: 'Seguridad', labelEn: 'Security' },
  { id: 'settings',  path: '/settings',  icon: Settings,        labelEs: 'Ajustes',   labelEn: 'Settings' },
];

const TAB_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16,1,0.3,1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.25 } },
};

/* ── Language toggle ── */
const LangToggle = () => {
  const { locale, setManualConfig } = useTranslation();
  return (
    <div style={{ display: 'flex', gap: '2px', background: '#FFFFFF', borderRadius: 4, padding: '2px' }}>
      {['es', 'en'].map(l => (
        <button key={l} onClick={() => setManualConfig(l)}
          style={{
            background: locale === l ? 'var(--aura-gold)' : 'transparent',
            color:      locale === l ? 'var(--ink-strong)' : 'var(--aura-text-muted)',
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
};

/* ── Session expiry modal ── */
const SessionModal = ({ locale, onRenew, onLogout }) => {
  const es = locale === 'es';
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(42, 45, 124, 0.42)', backdropFilter: 'blur(16px)',
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
          boxShadow: '0 0 24px rgba(217, 164, 65, 0.3)',
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
          <button className="btn-aura btn-ghost" style={{ flex: 1 }}
            onClick={onLogout}>
            {es ? 'CERRAR SESIÓN' : 'SIGN OUT'}
          </button>
          <button
            className="btn-aura"
            style={{ flex: 2 }}
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
  const { user, logout, renewSession, sessionWarning, vaultReady } = useAuth();
  const { t, locale, setManualConfig, currency } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [pets, setPets]           = useState([]);
  const [activePetId, setActivePetId] = useState(null);
  const [isSOS, setIsSOS]         = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /* Derive active pet — falls back to first pet if activePetId is null or stale */
  const activePet = pets.find(p => p.id === activePetId) || pets[0] || null;

  useEffect(() => {
    // Espera a que la bóveda esté abierta: antes de eso el expediente aún no
    // está descifrado y se leería vacío.
    if (user && vaultReady) {
      const isFirstTime = localStorage.getItem(`aura_onboarding_${user.id}`) === null;
      if (isFirstTime) setShowOnboarding(true);
      setPets(storage.getPets(user.id));
    }
  }, [user, vaultReady]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(`aura_onboarding_${user.id}`, 'done');
    setShowOnboarding(false);
  };

  const handleAddPet = async (newPet) => {
    const petWithMeta = {
      ...newPet,
      id: Date.now(),
      userId: user.id,
      emergencyConfig: { active: true, medicalAlerts: '', contacts: [{ name: t('nav.defaultOwner'), phone: '' }] },
    };
    // Solo se refleja en pantalla si el cifrado y la escritura han ido bien:
    // antes, un fallo de cuota dejaba la mascota visible pero sin guardar.
    try {
      await storage.savePet(user.id, petWithMeta);
    } catch (err) {
      setSaveError(err.message);
      return;
    }
    setPets(prev => [...prev, petWithMeta]);
    setTimeout(() => navigate('/dashboard'), 1200); // delay only the nav for the success animation
  };

  const handleUpdatePet = async (updatedPet) => {
    try {
      await storage.updatePet(user.id, updatedPet.id, () => updatedPet);
    } catch (err) {
      setSaveError(err.message);
      return;
    }
    setPets(prev => prev.map(p => p.id === updatedPet.id ? updatedPet : p));
  };

  const handleDeletePet = async (petId) => {
    try {
      await storage.deletePet(user.id, petId);
    } catch (err) {
      setSaveError(err.message);
      return;
    }
    setPets(prev => {
      const remaining = prev.filter(p => p.id !== petId);
      if (activePetId === petId) setActivePetId(remaining[0]?.id ?? null);
      return remaining;
    });
  };

  /* ── Auth / Onboarding gates ── */
  if (location.pathname === '/recuperar-acceso') return <RecuperarAcceso />;
  // Mientras se descifra el expediente no se muestra nada: evita el parpadeo de
  // un panel vacío antes de que los datos estén disponibles.
  if (!vaultReady) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.4rem',
        background: 'var(--aura-black)', color: 'var(--gold-ink)',
        fontSize: '0.78rem', letterSpacing: '3px', textTransform: 'uppercase',
      }}>
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.9, 0.45] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <PawPrint size={40} />
        </motion.div>
        {locale === 'es' ? 'Descifrando expediente…' : 'Decrypting records…'}
      </div>
    );
  }
  if (!user) return <Auth />;
  if (showOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;
  if (isSOS) return <SOSMode pet={activePet} pets={pets} onActivePetChange={setActivePetId} onExit={() => setIsSOS(false)} />;

  const activeId = NAV_TABS.find(tab => location.pathname === tab.path)?.id || 'dashboard';

  /* ── Main layout ── */
  return (
    <>
      {/* ── Aviso de fallo al guardar — antes esto fallaba en silencio ── */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="alert"
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 5000,
              display: 'flex', alignItems: 'center', gap: '0.9rem',
              padding: '1rem 1.2rem',
              paddingTop: 'max(1rem, env(safe-area-inset-top))',
              background: '#FDECEF',
              borderBottom: '1px solid var(--aura-neon-pink, #EF5F7A)',
              boxShadow: '0 8px 32px rgba(42, 45, 124, 0.28)',
            }}
          >
            <AlertTriangle size={18} color="var(--aura-neon-pink, #EF5F7A)" style={{ flexShrink: 0 }} />
            <p style={{
              margin: 0, flex: 1, fontSize: '0.82rem', lineHeight: 1.5,
              color: '#7A1F33',
            }}>
              {saveError}
            </p>
            <button
              onClick={() => setSaveError(null)}
              aria-label={locale === 'es' ? 'Cerrar aviso' : 'Dismiss'}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#7A1F33', padding: '0.3rem', flexShrink: 0,
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
          <img src={logo} className="aura-pulse-logo"
               style={{ height: 42, borderRadius: '50%', objectFit: 'contain',
                        border: '1px solid var(--aura-gold-muted)',
                        filter: 'drop-shadow(0 0 10px rgba(217, 164, 65, 0.35))' }}
               alt="AURA Pets Global" />
          <div style={{ width: 1, height: 24, background: 'var(--aura-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', letterSpacing: '4px', color: 'var(--gold-ink)', fontWeight: 700 }}>{t('nav.brandLine1')}</span>
            <span style={{ fontSize: '0.72rem', letterSpacing: '2px', opacity: 0.68 }}>{t('nav.brandLine2')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {NAV_TABS.map(({ id, path, iconD: Icon, k, isCTA }) => {
            const isActive = activeId === id;
            return (
              <button key={id} onClick={() => navigate(path)}
                style={{
                  background: isActive ? 'var(--violet)' : 'transparent',
                  border: '1px solid transparent',
                  borderRadius: 14,
                  color: isActive ? '#FFFFFF' : 'var(--ink-muted)',
                  
                  boxShadow: isActive ? '0 6px 16px -6px rgba(139, 92, 246, 0.55)' : 'none',
                  padding: '0.45rem 0.75rem',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  transition: 'all 0.22s',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-soft)'; e.currentTarget.style.color = 'var(--violet)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-muted)'; } }}
              >
                <Icon size={20} />
                <span style={{ fontSize: '9px', letterSpacing: '0.8px', fontWeight: 600, lineHeight: 1 }}>
                  {t(k)}
                </span>
              </button>
            );
          })}

          {/* SOS */}
          <button onClick={() => setIsSOS(true)}
            style={{
              background: 'rgba(226,75,74,0.1)',
              border: '1px solid rgba(226,75,74,0.5)',
              borderRadius: 14,
              color: 'var(--pink-ink)',
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              transition: 'all 0.22s',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,75,74,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(226,75,74,0.1)'; }}
          >
            <ShieldAlert size={20} />
            <span style={{ fontSize: '9px', letterSpacing: '0.8px', fontWeight: 600, lineHeight: 1 }}>{t('nav.sos')}</span>
          </button>

          <div style={{ width: 1, height: 32, background: 'var(--aura-border)', margin: '0 0.15rem' }} />

          {/* Language toggle */}
          <LangToggle />

          <div style={{ width: 1, height: 32, background: 'var(--aura-border)', margin: '0 0.15rem' }} />

          {/* Logout */}
          <button onClick={logout}
            style={{
              background: 'transparent', border: '1px solid transparent', borderRadius: 14,
              color: '#8B5CF6', padding: '0.45rem 0.6rem', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              transition: 'all 0.22s', opacity: 0.7, fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#C8C8E8'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = '#8B5CF6'; }}
          >
            <LogOut size={20} />
            <span style={{ fontSize: '9px', letterSpacing: '0.8px', fontWeight: 600, lineHeight: 1 }}>{t('nav.logout')}</span>
          </button>
        </div>
      </nav>

      {/* ── Separador decorativo ── */}
      <div className="aura-separator" />

      {/* ── Content ── */}
      <div className="app-container">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/dashboard" element={
              <motion.div {...TAB_VARIANTS}>
                <Dashboard pets={pets} activePetId={activePetId} onActivePetChange={setActivePetId} onAddPet={() => navigate('/registro')} onSelectPet={() => navigate('/passport')} onUpdatePet={handleUpdatePet} onDeletePet={handleDeletePet} />
              </motion.div>
            } />
            <Route path="/passport" element={
              <motion.div {...TAB_VARIANTS} style={{ paddingTop: '2rem' }}>
                <GlobalPassport pet={activePet} onUpdatePet={handleUpdatePet} />
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
                <div className="aura-card aura-card--bloom" style={{ maxWidth: 540, margin: '3rem auto', position: 'relative' }}>
                  <PawScatter variante="b" />
                  <h2 style={{ fontSize: '2rem', marginBottom: '3rem' }}>{t('common.settings')}</h2>
                  <div style={{ display: 'grid', gap: '3rem' }}>
                    <div>
                      <p style={{ fontSize: '0.68rem', letterSpacing: '2.5px', opacity: 0.68, marginBottom: '1.2rem', textTransform: 'uppercase' }}>
                        {locale === 'es' ? 'Idioma y Región' : 'Language & Region'}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className={`btn-aura ${locale === 'es' ? 'btn-neon' : 'btn-ghost'}`}
                          aria-pressed={locale === 'es'}
                          onClick={() => setManualConfig('es')}>ESPAÑOL</button>
                        <button className={`btn-aura ${locale === 'en' ? 'btn-neon' : 'btn-ghost'}`}
                          aria-pressed={locale === 'en'}
                          onClick={() => setManualConfig('en')}>ENGLISH</button>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.68rem', letterSpacing: '2.5px', opacity: 0.68, marginBottom: '1.2rem', textTransform: 'uppercase' }}>
                        {locale === 'es' ? 'Divisa de Referencia' : 'Reference Currency'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {['EUR','USD','GBP','AUD'].map(c => (
                          <button key={c} className={`btn-aura ${currency === c ? 'btn-neon' : 'btn-ghost'}`}
                            aria-pressed={currency === c}
                            onClick={() => setManualConfig(null, c)}>{c}</button>
                        ))}
                      </div>
                    </div>
                    {/* Logout — accessible on mobile where top nav is hidden */}
                    <div>
                      <p style={{ fontSize: '0.68rem', letterSpacing: '2.5px', opacity: 0.68, marginBottom: '1.2rem', textTransform: 'uppercase' }}>
                        {locale === 'es' ? 'Sesión' : 'Session'}
                      </p>
                      <button className="btn-aura btn-ghost" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                        onClick={logout}>
                        <LogOut size={15} />
                        {locale === 'es' ? 'CERRAR SESIÓN' : 'SIGN OUT'}
                      </button>
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

      {/* ── Mobile bottom tab bar — 5 tabs only, SOS as center CTA ── */}
      <nav className="bottom-tab-bar">
        {MOBILE_TABS.map(({ id, path, icon: Icon, labelEs, labelEn, isSOS: isSosTab }) => (
          <button
            key={id}
            className={`tab-btn${activeId === id && !isSosTab ? ' active' : ''}${isSosTab ? ' tab-sos-cta' : ''}`}
            onClick={() => isSosTab ? setIsSOS(true) : navigate(path)}
          >
            <Icon size={isSosTab ? 22 : 18} />
            <span>{locale === 'es' ? labelEs : labelEn}</span>
          </button>
        ))}
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
