import React, { useState } from 'react';
import { useTranslation } from '../context/LocalizationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Shield, ChevronRight, CheckCircle2, 
  Dna, Info, Calendar, Award 
} from 'lucide-react';

const AddPetModal = ({ onAdd, onClose }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    species: 'Perro',
    breed: '',
    age: '',
    gender: 'Macho',
    avatar: '🐾',
    // Dynamic Fields
    regaPassport: '',
    sheddingCycle: 0,
    habitatTemp: 25,
    habitatHumidity: 60,
    ringingId: '',
    dietType: ''
  });

  const speciesOptions = [
    { label: 'Perro / Canina', value: 'Perro' },
    { label: 'Gato / Felina', value: 'Gato' },
    { label: 'Caballo / Equina', value: 'Horse' },
    { label: 'Exótico / Reptil', value: 'Exotic' },
    { label: 'Ave / Ornitológica', value: 'Bird' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--aura-border)',
    padding: '1.2rem',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: 'var(--font-sans)'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    letterSpacing: '2px',
    color: 'var(--aura-gold)',
    marginBottom: '0.8rem',
    textTransform: 'uppercase',
    fontWeight: 600
  };

  return (
    <div style={{ 
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="aura-card" 
        style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <div>
             <h2 className="luxury-title" style={{ fontSize: '2rem', margin: 0 }}>Admitir Miembro</h2>
             <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.8rem' }}>Registro en el Ecosistema AURA Pets</p>
          </div>
          <button onClick={onClose} className="btn-aura" style={{ border: 'none', padding: '1rem' }}>✕</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="input-group">
              <label style={labelStyle}>IDENTIDAD</label>
              <input 
                style={inputStyle} 
                placeholder="Nombre del Miembro" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label style={labelStyle}>CATEGORÍA BIOLÓGICA</label>
              <select 
                style={inputStyle}
                value={formData.species}
                onChange={e => setFormData({...formData, species: e.target.value})}
              >
                {speciesOptions.map(opt => <option key={opt.value} value={opt.value} style={{ background: '#111' }}>{opt.label}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label style={labelStyle}>RAZA / LINAJE</label>
              <input 
                style={inputStyle} 
                placeholder="Ej: Pura Sangre, Labrador..." 
                value={formData.breed}
                onChange={e => setFormData({...formData, breed: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label style={labelStyle}>EDAD / CICLO VITAL</label>
              <input 
                type="number" 
                style={inputStyle} 
                placeholder="Años" 
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>
          </div>

          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--aura-border)', paddingTop: '3rem' }}>
             <h3 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Campos de Especialidad</h3>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {(formData.species === 'Horse') && (
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Microchip / Pasaporte REGA (España)</label>
                    <input 
                      style={inputStyle} 
                      placeholder="ES-XXXX-XXXX" 
                      value={formData.regaPassport}
                      onChange={e => setFormData({...formData, regaPassport: e.target.value})}
                    />
                  </div>
                )}

                {(formData.species === 'Exotic') && (
                  <>
                    <div className="input-group">
                      <label style={labelStyle}>Temp. Objetivo del Hábitat (°C)</label>
                      <input 
                        type="number" style={inputStyle} 
                        value={formData.habitatTemp}
                        onChange={e => setFormData({...formData, habitatTemp: e.target.value})}
                      />
                    </div>
                    <div className="input-group">
                      <label style={labelStyle}>Humedad Relativa (%)</label>
                      <input 
                        type="number" style={inputStyle} 
                        value={formData.habitatHumidity}
                        onChange={e => setFormData({...formData, habitatHumidity: e.target.value})}
                      />
                    </div>
                  </>
                )}

                {(formData.species === 'Bird') && (
                   <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>ID de Anillado</label>
                    <input 
                      style={inputStyle} 
                      placeholder="REG-BIRD-2026" 
                      value={formData.ringingId}
                      onChange={e => setFormData({...formData, ringingId: e.target.value})}
                    />
                  </div>
                )}
             </div>
          </div>

          <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}>
            <button type="submit" className="btn-aura btn-neon" style={{ padding: '1.5rem 4rem' }}>
              REGISTRAR EN LA BÓVEDA <ChevronRight size={18} />
            </button>
          </div>
        </form>

        <footer style={{ marginTop: '3rem', textAlign: 'center' }}>
           <p style={{ fontSize: '0.7rem', color: 'var(--aura-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Shield size={12} /> DATOS PROTEGIDOS POR CIFRADO AES-256
           </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default AddPetModal;
