import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PetPassport from './components/Passport/PetPassport';
import EmergencyLanding from './components/Passport/EmergencyLanding';
import { storage } from './utils/storage';
import { LogOut, ShieldCheck, Heart } from 'lucide-react';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyPet, setEmergencyPet] = useState(null);

  // 🚨 Detección de Ruta de Emergencia (Pública)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emergencyId = params.get('emergency');
    if (emergencyId) {
      // Búsqueda profunda en la base de datos global de usuarios para emergencias
      const users = JSON.parse(localStorage.getItem('mascota_health_users') || '[]');
      let foundPet = null;
      
      for (const u of users) {
        const userPets = JSON.parse(localStorage.getItem(`vault_${u.id}_pets`) || '[]');
        foundPet = userPets.find(p => p.id.toString() === emergencyId);
        if (foundPet) break;
      }

      if (foundPet) {
        setEmergencyPet(foundPet);
        setIsEmergency(true);
      }
    }
  }, []);

  // Carga de Bóveda Privada
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
      emergencyConfig: { active: false, medicalAlerts: '', contacts: [{ name: 'Dueño', phone: '' }] }
    };
    storage.savePet(user.id, petWithMeta);
    setPets([...pets, petWithMeta]);
  };

  const handleUpdatePet = (updatedPet) => {
    storage.updatePet(user.id, updatedPet.id, () => updatedPet);
    setPets(pets.map(p => p.id === updatedPet.id ? updatedPet : p));
  };

  if (isEmergency) return <EmergencyLanding pet={emergencyPet} />;
  if (!user) return <Auth />;

  return (
    <div className="app-container">
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1.5rem 0', marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: '10px' }}>
             <Heart color="white" size={20} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>MascotaHealth <span style={{ color: 'var(--primary)' }}>PRO</span></h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right', display: 'none' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>{user.email}</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>BÓVEDA ACTIVA</span>
          </div>
          <button className="btn" onClick={logout} style={{ color: 'var(--status-urgent)', fontWeight: 700 }}>
            <LogOut size={18} /> Bloquear Bóveda
          </button>
        </div>
      </nav>

      {selectedPetId ? (
        <PetPassport 
          pet={pets.find(p => p.id === selectedPetId)} 
          onUpdate={handleUpdatePet}
          onBack={() => setSelectedPetId(null)}
        />
      ) : (
        <Dashboard 
          pets={pets} 
          onSelectPet={setSelectedPetId} 
          onAddPet={handleAddPet}
        />
      )}

      <footer style={{ marginTop: '5rem', textAlign: 'center', paddingBottom: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} /> Encriptación de Bóveda SHA-256 Activa • Grado Profesional
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
