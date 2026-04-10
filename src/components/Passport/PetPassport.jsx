import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, QrCode, Upload, Download, 
  Trash2, Plus, ArrowLeft, Heart, Calendar, AlertCircle,
  ExternalLink, ChevronRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmergencyQR from './EmergencyQR';
import TreatmentForm from '../TreatmentForm';
import { intelligence } from '../../utils/intelligence';

const PetPassport = ({ pet, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  
  const protection = intelligence.calculateProtection(pet);

  const handleUpdateEmergency = (config) => {
    onUpdate({ ...pet, emergencyConfig: config });
  };

  const handleAddTreatment = (treatment) => {
    const newHistory = [...(pet.history || []), { ...treatment, id: Date.now() }];
    onUpdate({ ...pet, history: newHistory });
    setShowTreatmentForm(false);
  };

  const tabs = [
    { id: 'summary', label: 'Resumen', icon: Activity },
    { id: 'history', label: 'Historial', icon: Calendar },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'emergency', label: 'Emergencia/QR', icon: QrCode },
  ];

  return (
    <div className="pet-passport fade-in">
      {/* Header Contextual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
        <button className="btn" onClick={onBack} style={{ padding: '0.8rem' }}><ArrowLeft /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '18px', 
            background: 'var(--secondary)', overflow: 'hidden',
            boxShadow: 'var(--card-shadow)'
          }}>
             {pet.customImage ? (
                <img src={pet.customImage} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                   {pet.avatar || (pet.species === 'Perro' ? '🐕' : '🐈')}
                </div>
              )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>{pet.name}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>ID: {pet.id.toString().slice(-6)} • Bóveda Protegida</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ 
        display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', 
        padding: '0.4rem', borderRadius: '18px', marginBottom: '2.5rem',
        maxWidth: 'fit-content'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.4rem',
              borderRadius: '14px', border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -10 }}
           transition={{ duration: 0.2 }}
        >
          {activeTab === 'summary' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                   <Activity size={20} color="var(--primary)" /> Inteligencia Preventiva
                </h3>
                <div style={{ 
                  padding: '1.5rem', borderRadius: '20px', background: 'rgba(74, 124, 89, 0.05)',
                  textAlign: 'center', marginBottom: '2rem'
                }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px' }}>NIVEL DE PROTECCIÓN</p>
                  <h4 style={{ fontSize: '3.5rem', margin: '0.5rem 0', fontWeight: 800 }}>{protection}%</h4>
                  <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${protection}%`, height: '100%', background: 'var(--primary)', transition: 'width 1s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                   {intelligence.calculateProtection(pet) < 100 ? (
                      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(230, 75, 75, 0.05)', borderRadius: '15px' }}>
                        <AlertCircle color="var(--status-urgent)" />
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Refuerzos requeridos</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detectamos vacunas vencidas o próximas a vencer.</p>
                        </div>
                      </div>
                   ) : (
                      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(74, 124, 89, 0.05)', borderRadius: '15px' }}>
                        <ShieldCheck color="var(--primary)" />
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Bóveda al día</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Todas las protecciones críticas están activas.</p>
                        </div>
                      </div>
                   )}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                    <Calendar size={20} color="var(--accent)" /> Próximas Citas
                  </h3>
                  <button className="btn btn-primary" onClick={() => setShowTreatmentForm(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>+ Agendar</button>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                   {pet.history?.filter(h => new Date(h.date) > new Date()).map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700 }}>{h.type}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.date}</p>
                        </div>
                        <ChevronRight size={16} color="var(--text-muted)" />
                      </div>
                   ))}
                   {pet.history?.filter(h => new Date(h.date) > new Date()).length === 0 && (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay próximas citas programadas.</p>
                   )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
               <TreatmentForm 
                  onSave={handleAddTreatment} 
                  species={pet.species} 
                  initialData={null}
               />
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem', border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'pointer' }}>
                <Upload size={32} color="var(--text-muted)" />
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-muted)' }}>Subir Documento</p>
                <span style={{ fontSize: '0.7rem' }}>(PDF, JPG hasta 5MB)</span>
              </div>
              {/* Ejemplos estáticos de documentos */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <FileText color="var(--primary)" />
                    <Download size={18} color="var(--text-muted)" strokeWidth={2} />
                 </div>
                 <h4 style={{ margin: '0 0 0.3rem' }}>Certificado Microchip</h4>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subido: 2024-03-01</p>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <ShieldCheck color="var(--accent)" />
                    <Download size={18} color="var(--text-muted)" strokeWidth={2} />
                 </div>
                 <h4 style={{ margin: '0 0 0.3rem' }}>Póliza de Seguro</h4>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vence: 2025-01-10</p>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <EmergencyQR pet={pet} onUpdate={handleUpdateEmergency} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {showTreatmentForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', z_index: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <h3>Agendar Tratamiento / Vacuna</h3>
               <button className="btn" onClick={() => setShowTreatmentForm(false)}>✕</button>
             </div>
             <TreatmentForm onSave={handleAddTreatment} species={pet.species} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PetPassport;
