import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Aura/Dashboard';
import GlobalPassport from './components/Aura/GlobalPassport';
import SOSMode from './components/Aura/SOSMode';
import { storage } from './utils/storage';
import { LogOut, Globe, LayoutDashboard, ShieldAlert, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [pets, setPets] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSOS, setIsSOS] = useState(false);

  // Load private data
  useEffect(() => {
    if (user) {
      setPets(storage.getPets(user.id));
    }
  }, [user]);

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
  if (isSOS) return <SOSMode pet={pets[0]} onExit={() => setIsSOS(false)} />;

  return (
    <div className="app-container">
      {/* Luxury Navbar */}
      <nav className="aura-nav">
        <div className="logo-container">
          <img src="/brand/aura-logo.png" alt="AURA Pets" className="aura-logo-img" />
          <div style={{ width: '1px', height: '30px', background: 'var(--aura-border)' }}></div>
          <p style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 300, opacity: 0.6 }}>BIOMETRIC VAULT</p>
        </div>
        
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <button 
            className={`btn-aura ${activeTab === 'dashboard' ? 'btn-neon' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
            style={{ border: 'none', padding: '0.5rem', opacity: activeTab === 'dashboard' ? 1 : 0.4 }}
          >
            <LayoutDashboard size={20} />
          </button>
          <button 
            className={`btn-aura ${activeTab === 'passport' ? 'btn-neon' : ''}`} 
            onClick={() => setActiveTab('passport')}
            style={{ border: 'none', padding: '0.5rem', opacity: activeTab === 'passport' ? 1 : 0.4 }}
          >
            <Globe size={20} />
          </button>
          <button 
            className="btn-aura" 
            onClick={() => setIsSOS(true)}
            style={{ border: 'none', padding: '0.5rem', color: 'var(--aura-neon-pink)', opacity: 0.8 }}
          >
            <ShieldAlert size={20} />
          </button>
          <button className="btn-aura" onClick={logout} style={{ border: 'none', padding: '0.5rem', opacity: 0.4 }}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main style={{ minHeight: '70vh' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
               key="dash"
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
            >
              <Dashboard pets={pets} onAddPet={handleAddPet} onSelectPet={() => setActiveTab('passport')} />
            </motion.div>
          )}
          {activeTab === 'passport' && (
            <motion.div 
               key="pass"
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
            >
              <GlobalPassport pet={pets[0]} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ marginTop: '8rem', padding: '3rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase' }}>
          AURA Pets • International Sanitary Compliance Protocol v3.0
        </p>
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
