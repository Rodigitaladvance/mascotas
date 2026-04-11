import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTranslation } from './context/LocalizationContext';
import Auth from './components/Auth';
import Dashboard from './components/Aura/Dashboard';
import GlobalPassport from './components/Aura/GlobalPassport';
import SOSMode from './components/Aura/SOSMode';
import Onboarding from './components/Aura/Onboarding';
import { storage } from './utils/storage';
import { LogOut, Globe, LayoutDashboard, ShieldAlert, Settings, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent = () => {
  const { user, logout } = useAuth();
  const { t, locale, setManualConfig, currency } = useTranslation();
  const [pets, setPets] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSOS, setIsSOS] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if first time
  useEffect(() => {
    if (user) {
      const isFirstTime = localStorage.getItem(`aura_onboarding_${user.id}`) === null;
      if (isFirstTime) setShowOnboarding(true);
      setPets(storage.getPets(user.id));
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(`aura_onboarding_${user.id}`, 'completed');
    setShowOnboarding(false);
  };

  const handleAddPet = (newPet) => {
    const petWithMeta = { 
      ...newPet, 
      id: Date.now(), 
      userId: user.id,
      emergencyConfig: { active: true, medicalAlerts: '', contacts: [{ name: 'Dueño', phone: '' }] }
    };
    storage.savePet(user.id, petWithMeta);
    setPets([...pets, petWithMeta]);
  };

  if (!user) return <Auth />;
  if (showOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;
  if (isSOS) return <SOSMode pet={pets[0]} onExit={() => setIsSOS(false)} />;

  return (
    <div className="app-container">
      {/* Navbar Elite */}
      <nav className="aura-nav" style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem 0',
        borderBottom: '1px solid var(--aura-border)'
       }}>
        <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <img 
            src="./brand/logo.jpg" 
            alt="AURA Pets" 
            className="aura-logo-img" 
            style={{ height: '48px', filter: 'drop-shadow(0 0 10px var(--aura-gold-muted))' }} 
          />
          <div style={{ width: '1px', height: '24px', background: 'var(--aura-border)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontSize: '0.65rem', letterSpacing: '4px', color: 'var(--aura-gold)', fontWeight: 700 }}>EXCELENCIA</span>
             <span style={{ fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.5 }}>GLOBAL VAULT™</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <button 
             className="btn-aura" 
             onClick={() => setActiveTab('dashboard')}
             style={{ border: 'none', padding: '0.5rem', opacity: activeTab === 'dashboard' ? 1 : 0.4 }}
          >
            <LayoutDashboard size={20} />
          </button>
          <button 
             className="btn-aura" 
             onClick={() => setActiveTab('passport')}
             style={{ border: 'none', padding: '0.5rem', opacity: activeTab === 'passport' ? 1 : 0.4 }}
          >
            <Globe size={20} />
          </button>
          <button 
             className="btn-aura" 
             onClick={() => setActiveTab('privacy')}
             style={{ border: 'none', padding: '0.5rem', opacity: activeTab === 'privacy' ? 1 : 0.4 }}
          >
            <ShieldCheck size={20} />
          </button>
          <button 
             className="btn-aura" 
             onClick={() => setIsSOS(true)}
             style={{ border: 'none', padding: '0.5rem', color: 'var(--aura-neon-pink)' }}
          >
            <ShieldAlert size={20} />
          </button>
          <button 
             className="btn-aura" 
             onClick={() => setActiveTab('settings')}
             style={{ border: 'none', padding: '0.5rem', opacity: activeTab === 'settings' ? 1 : 0.4 }}
          >
            <Settings size={20} />
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--aura-border)' }}></div>
          <button onClick={logout} className="btn-aura" style={{ border: 'none', opacity: 0.5 }}>
             <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main style={{ padding: '0' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard pets={pets} onAddPet={() => setActiveTab('add')} onSelectPet={() => setActiveTab('passport')} />
            </motion.div>
          )}
          {activeTab === 'passport' && (
            <motion.div key="pass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GlobalPassport pet={pets[0]} />
            </motion.div>
          )}
          {activeTab === 'privacy' && (
            <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <PrivacyVault />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="aura-card">
              <h2 className="luxury-title" style={{ fontSize: '2rem', marginBottom: '3rem' }}>{t('common.settings')}</h2>
              
              <div style={{ display: 'grid', gap: '3rem', maxWidth: '500px' }}>
                <div className="setting-group">
                   <p style={{ fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.5, marginBottom: '1.5rem' }}>IDIOMA Y REGIÓN</p>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className={`btn-aura ${locale === 'es' ? 'btn-neon' : ''}`} onClick={() => setManualConfig('es')}>ESPAÑOL</button>
                      <button className={`btn-aura ${locale === 'en' ? 'btn-neon' : ''}`} onClick={() => setManualConfig('en')}>ENGLISH</button>
                   </div>
                </div>

                <div className="setting-group">
                   <p style={{ fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.5, marginBottom: '1.5rem' }}>DIVISA DE REFERENCIA (PREMIUM)</p>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {['EUR', 'USD', 'GBP', 'AUD'].map(curr => (
                        <button 
                           key={curr}
                           className={`btn-aura ${currency === curr ? 'btn-neon' : ''}`} 
                           onClick={() => setManualConfig(null, curr)}
                        >
                          {curr}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="setting-group" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--aura-border)' }}>
                   <p style={{ fontSize: '0.8rem', color: 'var(--aura-neon-cyan)', fontWeight: 700 }}>ESTÁNDAR GDPR / HIPAA ACTIVO</p>
                   <p style={{ fontSize: '0.85rem', color: 'var(--aura-text-muted)' }}>Sus datos biométricos están cifrados localmente y no son accesibles por personal de AURA Pets.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ marginTop: '8rem', padding: '4rem 0', textAlign: 'center', opacity: 0.4 }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '5px' }}>AURA PETS • GLOBAL SANITARY EXCELLENCE PROTOCOL v4.2</p>
      </footer>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
