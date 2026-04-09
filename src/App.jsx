import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import PetCard from './components/PetCard'
import Auth from './components/Auth'
import { storage } from './utils/storage'

const INITIAL_PETS = [
  { 
    id: '1', name: 'Dado', species: 'Perro', breed: 'No conocida', gender: 'Macho', birthDate: '2023-01-01', avatar: '🐕', userId: 'demo-id',
    history: [
      { id: 101, type: 'Vacuna', name: 'Rabia', date: '2025-03-10', status: 'ok' },
      { id: 102, type: 'Desparasitación', name: 'Interna/Externa', date: '2025-03-15', status: 'ok' }
    ]
  },
  { 
    id: '2', name: 'Leo', species: 'Perro', breed: 'Chihuahua', gender: 'Macho', birthDate: '2024-02-01', avatar: '🐕', userId: 'demo-id',
    history: [
      { id: 201, type: 'Vacuna', name: 'Rabia', date: '2025-02-20', status: 'ok' },
      { id: 202, type: 'Desparasitación', name: 'Interna/Externa', date: '2025-02-25', status: 'ok' }
    ]
  }
];

import HistoryPrint from './components/HistoryPrint'

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const printId = queryParams.get('print');

  const [user, setUser] = useState(storage.getSession());
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);

  // If in print mode, handle it early
  if (printId) {
    const allPets = JSON.parse(localStorage.getItem('mascota_health_pets') || '[]');
    const petToPrint = allPets.find(p => p.id === printId);
    return <HistoryPrint pet={petToPrint} />;
  }

  // Initialize Demo User if not exists
  useEffect(() => {
    const users = storage.getUsers();
    if (users.length === 0) {
      const demoUser = { id: 'demo-id', email: 'demo@demo.com', password: btoa('demo123') };
      storage.saveUser(demoUser);
      INITIAL_PETS.forEach(pet => storage.savePet(pet));
    }
  }, []);

  useEffect(() => {
    if (user) {
      setPets(storage.getPets(user.id));
    } else {
      setPets([]);
    }
  }, [user]);

  const handleLogin = (loggedUser) => {
    storage.setSession(loggedUser);
    setUser(loggedUser);
  };

  const handleLogout = () => {
    storage.clearSession();
    setUser(null);
    setSelectedPetId(null);
  };

  const handleAddPet = (newPet) => {
    const petWithId = { ...newPet, id: Date.now().toString(), userId: user.id, history: [] };
    storage.savePet(petWithId);
    setPets([...pets, petWithId]);
  };

  const handleAddTreatment = (petId, treatment) => {
    storage.updatePet(petId, (pet) => ({
      ...pet,
      history: [...pet.history, { ...treatment, id: Date.now() }]
    }));
    setPets(storage.getPets(user.id));
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const selectedPet = pets.find(p => p.id === selectedPetId);

  return (
    <div className="app-wrapper">
      <header className="glass-card container" style={{ marginTop: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🐾 MascotaHealth
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.email}</span>
          <button className="btn" onClick={() => setSelectedPetId(null)}>Inicio</button>
          <button className="btn" style={{ color: 'var(--status-urgent)' }} onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <main className="container fade-in">
        {selectedPetId ? (
          <PetCard 
            pet={selectedPet} 
            onBack={() => setSelectedPetId(null)} 
            onAddTreatment={(t) => handleAddTreatment(selectedPetId, t)}
          />
        ) : (
          <Dashboard 
            pets={pets} 
            onSelectPet={(id) => setSelectedPetId(id)} 
            onAddPet={handleAddPet}
          />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        &copy; 2024 MascotaHealth - Gestión Profesional para Clientes
      </footer>
    </div>
  );
}

export default App;
