import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import PetCard from './components/PetCard'
import TreatmentForm from './components/TreatmentForm'

const INITIAL_PETS = [
  { 
    id: 1, 
    name: 'Dado', 
    species: 'Perro', 
    breed: 'No conocida', 
    gender: 'Macho',
    history: [
      { id: 101, type: 'Vacuna', name: 'Rabia', date: '2025-03-10', status: 'ok' },
      { id: 102, type: 'Desparasitación', name: 'Interna/Externa', date: '2025-03-15', status: 'ok' }
    ]
  },
  { 
    id: 2, 
    name: 'Leo', 
    species: 'Perro', 
    breed: 'Chihuahua', 
    gender: 'Macho',
    history: [
      { id: 201, type: 'Vacuna', name: 'Rabia', date: '2025-02-20', status: 'ok' },
      { id: 202, type: 'Desparasitación', name: 'Interna/Externa', date: '2025-02-25', status: 'ok' }
    ]
  },
  { 
    id: 3, 
    name: 'Pelusa', 
    species: 'Gato', 
    breed: 'Europeo', 
    gender: 'Macho',
    history: [
      { id: 301, type: 'Vacuna', name: 'Rabia', date: '2025-01-10', status: 'ok' },
      { id: 302, type: 'Desparasitación', name: 'Interna/Externa', date: '2025-01-15', status: 'ok' }
    ]
  },
  { 
    id: 4, 
    name: 'Curry', 
    species: 'Gato', 
    breed: 'Tiger', 
    gender: 'Macho',
    history: [
      { id: 401, type: 'Vacuna', name: 'Rabia', date: '2025-04-01', status: 'ok' },
      { id: 402, type: 'Desparasitación', name: 'Interna/Externa', date: '2025-04-05', status: 'ok' }
    ]
  },
  { 
    id: 5, 
    name: 'Mia', 
    species: 'Gato', 
    breed: 'Europea', 
    gender: 'Hembra',
    history: [
      { id: 501, type: 'Vacuna', name: 'Rabia', date: '2025-05-10', status: 'ok' },
      { id: 502, type: 'Desparasitación', name: 'Interna/Externa', date: '2025-05-15', status: 'ok' }
    ]
  }
];

function App() {
  const [pets, setPets] = useState(() => {
    const saved = localStorage.getItem('mascota_health_data');
    return saved ? JSON.parse(saved) : INITIAL_PETS;
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPetId, setSelectedPetId] = useState(null);

  useEffect(() => {
    localStorage.setItem('mascota_health_data', JSON.stringify(pets));
  }, [pets]);

  const addTreatment = (petId, treatment) => {
    setPets(prev => prev.map(pet => {
      if (pet.id === petId) {
        return { ...pet, history: [...pet.history, { ...treatment, id: Date.now() }] };
      }
      return pet;
    }));
  };

  const selectedPet = pets.find(p => p.id === selectedPetId);

  return (
    <div className="app-wrapper">
      <header className="glass-card container" style={{ marginTop: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🐾 MascotaHealth
        </h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`} onClick={() => { setActiveTab('dashboard'); setSelectedPetId(null); }}>Dashboard</button>
        </nav>
      </header>

      <main className="container fade-in">
        {selectedPetId ? (
          <PetCard 
            pet={selectedPet} 
            onBack={() => setSelectedPetId(null)} 
            onAddTreatment={(t) => addTreatment(selectedPetId, t)}
          />
        ) : (
          <Dashboard 
            pets={pets} 
            onSelectPet={(id) => setSelectedPetId(id)} 
          />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        &copy; 2026 MascotaHealth - Gestión Veterinaria para Clientes
      </footer>
    </div>
  );
}

export default App;
