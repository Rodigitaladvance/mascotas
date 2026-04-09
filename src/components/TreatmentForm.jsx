import React, { useState } from 'react';

const TreatmentForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    type: 'Vacuna',
    name: '',
    date: new Date().toISOString().split('T')[0],
    isSchedule: false,
    interval: '8', // hours
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    const finalData = {
      ...formData,
      status: 'ok',
      details: formData.isSchedule ? `Frecuencia: cada ${formData.interval} horas` : ''
    };
    onAdd(finalData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo</label>
          <select 
            className="btn" 
            style={{ width: '100%', background: 'white', border: '1px solid var(--glass-border)' }}
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option>Vacuna</option>
            <option>Desparasitación</option>
            <option>Medicación</option>
            <option>Revisión</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Fecha</label>
          <input 
            type="date" 
            className="btn" 
            style={{ width: '100%', background: 'white', border: '1px solid var(--glass-border)' }} 
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nombre / Descripción</label>
        <input 
          type="text" 
          placeholder="ej: Rabia / Antibiótico X" 
          className="btn" 
          style={{ width: '100%', background: 'white', border: '1px solid var(--glass-border)' }} 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          id="isSchedule" 
          checked={formData.isSchedule}
          onChange={(e) => setFormData({...formData, isSchedule: e.target.checked})}
        />
        <label htmlFor="isSchedule">¿Requiere pauta horaria? (Medicación activa)</label>
      </div>

      {formData.isSchedule && (
        <div className="fade-in" style={{ padding: '1rem', background: 'rgba(74, 124, 89, 0.05)', borderRadius: '12px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Frecuencia (horas)</label>
          <input 
            type="number" 
            className="btn" 
            style={{ width: '100px', background: 'white', border: '1px solid var(--glass-border)' }} 
            value={formData.interval}
            onChange={(e) => setFormData({...formData, interval: e.target.value})}
          />
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Se establecerán avisos cada <strong>{formData.interval} horas</strong> comenzando desde hoy.
          </p>
        </div>
      )}

      <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
        Confirmar Registro
      </button>
    </form>
  );
};

export default TreatmentForm;
