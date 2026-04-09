import React, { useState } from 'react';
import TreatmentForm from './TreatmentForm';

const PetCard = ({ pet, onBack, onAddTreatment }) => {
  const [showForm, setShowForm] = useState(false);

  const sortedHistory = [...pet.history].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="pet-card fade-in">
      <button className="btn" onClick={onBack} style={{ marginBottom: '1.5rem', padding: '0.5rem 0' }}>
        ← Volver al listado
      </button>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '24px', backgroundColor: 'var(--secondary)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' 
            }}>
              {pet.species === 'Perro' ? '🐕' : '🐈'}
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>{pet.name}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{pet.species} • {pet.breed} • {pet.gender}</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cerrar Registro' : '+ Registrar Tratamiento'}
          </button>
        </div>

        {showForm && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
            <TreatmentForm 
              onAdd={(t) => {
                onAddTreatment(t);
                setShowForm(false);
              }} 
            />
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3>Historial de Salud</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--secondary)' }}>
                <th style={{ padding: '1rem' }}>Fecha</th>
                <th style={{ padding: '1rem' }}>Tipo</th>
                <th style={{ padding: '1rem' }}>Detalle</th>
                <th style={{ padding: '1rem' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '1rem' }}><strong>{new Date(item.date).toLocaleDateString()}</strong></td>
                  <td style={{ padding: '1rem' }}>{item.type}</td>
                  <td style={{ padding: '1rem' }}>{item.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge status-ok`}>✅ Realizado</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
