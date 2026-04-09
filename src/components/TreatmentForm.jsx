import React, { useState, useEffect } from 'react';

const TreatmentForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    type: 'Vacuna',
    name: '',
    date: new Date().toISOString().split('T')[0],
    isSchedule: false,
    interval: '8',
    details: '',
    nextDateSuggestion: ''
  });

  const getSmartAlert = (type, date) => {
    const d = new Date(date);
    if (type === 'Vacuna') d.setFullYear(d.getFullYear() + 1);
    else if (type === 'Desparasitación') d.setMonth(d.getMonth() + 3);
    else if (type === 'Revisión') d.setFullYear(d.getFullYear() + 1);
    else return null;
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    const suggestion = getSmartAlert(formData.type, formData.date);
    setFormData(prev => ({ ...prev, nextDateSuggestion: suggestion }));
  }, [formData.type, formData.date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    const finalDetails = formData.isSchedule 
      ? `Frecuencia: cada ${formData.interval} horas. ${formData.details}`
      : formData.details;

    const finalData = {
      ...formData,
      status: 'ok',
      details: finalDetails,
      nextAlert: formData.nextDateSuggestion
    };
    onAdd(finalData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo de Tratamiento</label>
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Fecha Realización</label>
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
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nombre del Medicamento / Servicio</label>
        <input 
          type="text" 
          placeholder="ej: Nobivac Rabia / Drontal Plus" 
          className="btn" 
          style={{ width: '100%', background: 'white', border: '1px solid var(--glass-border)' }} 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Observaciones adicionales</label>
        <textarea 
          placeholder="Dosis, reacciones, etc..."
          className="btn" 
          style={{ width: '100%', background: 'white', border: '1px solid var(--glass-border)', resize: 'vertical' }}
          value={formData.details}
          onChange={(e) => setFormData({...formData, details: e.target.value})}
        />
      </div>

      {formData.nextDateSuggestion && (
        <div className="fade-in" style={{ padding: '1rem', background: 'rgba(212, 163, 115, 0.1)', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            💡 <strong>Alerta Inteligente:</strong> Se sugiere la próxima dosis para el <strong>{new Date(formData.nextDateSuggestion).toLocaleDateString()}</strong>.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          id="isSchedule" 
          checked={formData.isSchedule}
          onChange={(e) => setFormData({...formData, isSchedule: e.target.checked})}
        />
        <label htmlFor="isSchedule" style={{ cursor: 'pointer' }}>¿Activar pauta de medicación horaria?</label>
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
        </div>
      )}

      <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '1rem' }}>
        Confirmar y Notificar
      </button>
    </form>
  );
};

export default TreatmentForm;
