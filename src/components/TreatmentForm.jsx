import React, { useState } from 'react';
import { intelligence } from '../utils/intelligence';
import { Calendar, Syringe, ClipboardList, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TreatmentForm = ({ onSave, species }) => {
  const [formData, setFormData] = useState({
    type: 'Rabia',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const treatmentTypes = [
    'Rabia', 'Parvovirus', 'Moquillo', 'Hexavalente', 'Leishmania', 
    'Trivalente', 'Leucemia', 'Desparasitación Interna', 'Desparasitación Externa', 'Otro'
  ];

  const handleTypeChange = (type) => {
    const nextDate = intelligence.getNextDate(species, type, new Date());
    setFormData({ ...formData, type, date: nextDate });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.type || !formData.date) return;
    onSave(formData);
    // Success micro-animation simulation (can be handled by parent modal)
  };

  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit} 
      style={{ display: 'grid', gap: '1.5rem' }}
    >
      <div className="input-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem', fontWeight: 600 }}>
          <Syringe size={18} color="var(--primary)" /> Tipo de Tratamiento / Vacuna
        </label>
        <select 
          className="btn"
          style={{ width: '100%', background: 'white', border: '1px solid var(--glass-border)', padding: '1rem' }}
          value={formData.type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          {treatmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
          <CheckCircle2 size={12} style={{ verticalAlign: 'middle' }} /> MOTOR DE INTELIGENCIA SUGIRIENDO INTERVALO
        </p>
      </div>

      <div className="input-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem', fontWeight: 600 }}>
          <Calendar size={18} color="var(--accent)" /> Fecha Programada
        </label>
        <input 
          type="date"
          required
          className="btn"
          style={{ width: '100%', background: 'white', border: '1px solid var(--glass-border)', padding: '1rem' }}
          value={formData.date}
          min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas para agendar
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem', fontWeight: 600 }}>
          <ClipboardList size={18} color="var(--text-muted)" /> Notas de la Bóveda
        </label>
        <textarea 
          placeholder="Lugar, marca de la vacuna o reacción esperada..."
          style={{ 
            width: '100%', minHeight: '80px', borderRadius: '15px', padding: '1rem',
            border: '1px solid var(--glass-border)', background: 'white', fontSize: '0.9rem'
          }}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ padding: '1rem', justifyContent: 'center', fontWeight: 700 }}>
        Confirmar y Blindar Registro
      </button>
    </motion.form>
  );
};

export default TreatmentForm;
