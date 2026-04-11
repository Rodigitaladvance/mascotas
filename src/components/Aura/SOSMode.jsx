import React from 'react';
import { ShieldAlert, Phone, MapPin, Heart, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const SOSMode = ({ pet, onExit }) => {
  return (
    <div className="fade-in" style={{ 
      minHeight: '100vh', background: 'var(--aura-black)', position: 'fixed', inset: 0, zIndex: 1000,
      padding: '4rem 2rem', color: 'white'
    }}>
      <motion.div 
        animate={{ opacity: [1, 0.6, 1] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ 
          background: 'var(--aura-neon-pink)', color: 'white', padding: '1rem', 
          textAlign: 'center', position: 'fixed', top: 0, left: 0, width: '100%',
          letterSpacing: '5px', fontWeight: 900, fontSize: '1rem'
        }}
      >
        MODO SOS ACTIVO
      </motion.div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
           <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'white', fontFamily: 'var(--font-serif)' }}>Emergencia Sanitaria</h1>
           <button 
             onClick={onExit}
             className="btn-aura" 
             style={{ borderColor: 'white', color: 'white' }}
           >
             SALIR DEL MODO SOS
           </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Pet Vital Info */}
          <div className="aura-card" style={{ background: 'rgba(255,0,0,0.1)', borderColor: 'var(--aura-neon-pink)', padding: '3rem', textAlign: 'center' }}>
             <div style={{ 
               width: '150px', height: '150px', borderRadius: '40px', margin: '0 auto 2rem',
               background: 'var(--aura-obsidian)', border: '1px solid var(--aura-neon-pink)', overflow: 'hidden'
             }}>
                {pet?.customImage ? <img src={pet.customImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: '4rem', marginTop: '1rem' }}>{pet?.avatar || '🐾'}</div>}
             </div>
             <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'white' }}>{pet?.name || 'AURA Member'}</h2>
             <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>{pet?.breed || 'Desconocido'}</p>
          </div>

          {/* Action Grid */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
             <div className="aura-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Phone size={32} color="var(--aura-neon-pink)" />
                <div style={{ flex: 1 }}>
                   <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Contacto de Emergencia</h3>
                   <p style={{ margin: 0, opacity: 0.7 }}>+34 600 000 000 (Dueño)</p>
                </div>
                <button className="btn-aura btn-neon" style={{ borderColor: 'var(--aura-neon-pink)', color: 'var(--aura-neon-pink)' }}>LLAMAR</button>
             </div>

             <div className="aura-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <MapPin size={32} color="var(--aura-neon-pink)" />
                <div style={{ flex: 1 }}>
                   <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Hospital 24h Más Cercano</h3>
                   <p style={{ margin: 0, opacity: 0.7 }}>Hospital Veterinario AURA (a 1.2km)</p>
                </div>
                <button className="btn-aura btn-neon" style={{ borderColor: 'var(--aura-neon-pink)', color: 'var(--aura-neon-pink)' }}>MAPA</button>
             </div>
          </div>
        </div>

        {/* Vital Warnings */}
        <div className="aura-card" style={{ marginTop: '2rem', background: 'white', color: 'black', padding: '3rem' }}>
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--aura-neon-pink)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              <AlertCircle size={32} /> ESPECIFICACIONES CRÍTICAS
           </h3>
           <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>
             <p>• Alergia severa a la Penicilina.</p>
             <p>• Requiere hidratación inmediata en caso de golpe de calor.</p>
             <p>• No suministrar sedantes sin verificación de ID Vault.</p>
           </div>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', letterSpacing: '2px' }}>
          PROTOCOLO DE SEGURIDAD AURA Pets v3.0 PROTECTED
        </div>
      </div>
    </div>
  );
};

export default SOSMode;
