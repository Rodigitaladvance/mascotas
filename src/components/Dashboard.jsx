import React, { useState } from 'react';
import AddPetModal from './AddPetModal';

const Dashboard = ({ pets, onSelectPet, onAddPet }) => {
  const [showModal, setShowModal] = useState(false);

  const getStatus = (history) => {
    if (!history || history.length === 0) return { label: 'Sin datos', emoji: '❓', class: 'status-pending', days: 999 };
    
    const lastDate = new Date(Math.max(...history.map(h => new Date(h.date))));
    const nextEventDate = new Date(lastDate);
    nextEventDate.setFullYear(lastDate.getFullYear() + 1);
    
    const now = new Date();
    const diffTime = nextEventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Vencido', emoji: '🚨', class: 'status-urgent', days: diffDays };
    if (diffDays < 30) return { label: 'Próximamente', emoji: '📅', class: 'status-pending', days: diffDays };
    return { label: 'Al día', emoji: '✅', class: 'status-ok', days: diffDays };
  };

  const allStatus = pets.map(p => ({ ...getStatus(p.history), name: p.name }));
  const nextImportant = allStatus
    .filter(s => s.days > 0 && s.days < 365)
    .sort((a, b) => a.days - b.days)[0];

  return (
    <div className="dashboard">
      <section style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Panel de Control Sanitario</h2>
          <p style={{ color: 'var(--text-muted)' }}>Bienvenido. Aquí tienes el estado global de tus mascotas.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {nextImportant && (
            <div className="glass-card" style={{ padding: '0.8rem 1.2rem', borderLeft: '4px solid var(--accent)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>PRÓXIMO EVENTO</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>
                {nextImportant.emoji} {nextImportant.name}: faltan {nextImportant.days} días
              </strong>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Añadir Mascota</button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {pets.map(pet => {
          const status = getStatus(pet.history);
          return (
            <div 
              key={pet.id} 
              className="glass-card fade-in" 
              style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
              onClick={() => onSelectPet(pet.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--card-shadow)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '18px', 
                  background: 'linear-gradient(135deg, var(--secondary) 0%, #fff 100%)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden'
                }}>
                  {pet.customImage ? (
                    <img src={pet.customImage} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    pet.avatar || (pet.species === 'Perro' ? '🐕' : '🐈')
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{pet.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{pet.breed} • {pet.gender}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <span className={`status-badge ${status.class}`}>
                  {status.emoji} {status.label}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Gestionar →</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <AddPetModal onAdd={onAddPet} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Dashboard;
