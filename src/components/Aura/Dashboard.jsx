import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, ChevronRight, Zap, Heart } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ pets, onSelectPet }) => {
  // We use the first pet for the main Bio-Ring display
  const pet = pets[0] || { name: 'AURA Member', species: 'N/A' };
  const healthScore = 92; // Simulated executive health score

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <span style={{ 
          fontSize: '0.8rem', letterSpacing: '4px', color: 'var(--aura-gold)', 
          textTransform: 'uppercase', display: 'block', marginBottom: '1rem' 
        }}>
          Biological Intelligence
        </span>
        <h1 style={{ fontSize: '3.5rem', margin: 0 }}>Executive Summary</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
        {/* Dynamic Bio-Ring */}
        <div className="aura-card bio-ring" style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px', height: '300px' }}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                      data={[{ value: healthScore }, { value: 100 - healthScore }]}
                      innerRadius={110}
                      outerRadius={135}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                      stroke="none"
                   >
                      <Cell fill="url(#goldGradient)" />
                      <Cell fill="rgba(255,255,255,0.05)" />
                   </Pie>
                   <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#FFD700" />
                      </linearGradient>
                   </defs>
                </PieChart>
             </ResponsiveContainer>
             <div style={{ 
               position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
               textAlign: 'center'
             }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: 'var(--aura-gold)' }}>
                  {healthScore}
                </span>
                <p style={{ margin: 0, fontSize: '0.7rem', letterSpacing: '3px', opacity: 0.6, textTransform: 'uppercase' }}>
                  Aura Score
                </p>
             </div>
          </div>
          
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem' }}>{pet.name}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--aura-text-muted)', margin: 0 }}>
              <span className="status-indicator status-active"></span> Sistema Bio-Certificado por Vault™
            </p>
          </div>
        </div>

        {/* Executive Stats */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div className="aura-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
             <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.05)', borderRadius: '12px' }}>
                <Shield color="var(--aura-gold)" size={24} />
             </div>
             <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.3rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Inmunidad Global</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--aura-text-muted)' }}>Protección activa en cumplimiento de normativas UE/US.</p>
             </div>
             <Zap size={20} color="var(--aura-neon-cyan)" />
          </div>

          <div className="aura-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
             <div style={{ padding: '1rem', background: 'rgba(0,180,216,0.05)', borderRadius: '12px' }}>
                <Activity color="var(--aura-neon-cyan)" size={24} />
             </div>
             <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.3rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Actividad Cardiovascular</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--aura-text-muted)' }}>Ritmo optimizado según raza y condiciones climáticas localizadas.</p>
             </div>
             <Heart size={20} color="var(--aura-neon-pink)" />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button className="btn-aura" style={{ width: '100%', gap: '1rem' }}>
              Ver Reporte Veterinario Completo <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Mascotas (Minimalista) */}
      <h2 style={{ fontSize: '1.8rem', marginTop: '5rem', marginBottom: '2.5rem' }}>Bóveda de Miembros</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {pets.map(p => (
          <motion.div 
            key={p.id}
            whileHover={{ y: -5 }}
            className="aura-card"
            style={{ padding: '2rem', cursor: 'pointer' }}
            onClick={() => onSelectPet(p.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
               <div style={{ 
                 width: '60px', height: '60px', borderRadius: '18px', background: 'var(--aura-black)',
                 border: '1px solid var(--aura-border)', overflow: 'hidden'
               }}>
                 {p.customImage ? <img src={p.customImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: '2rem', textAlign: 'center' }}>{p.avatar}</div>}
               </div>
               <span style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>ACTIVE</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.3rem' }}>{p.name}</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--aura-text-muted)' }}>{p.breed} • Certificado Gold</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
