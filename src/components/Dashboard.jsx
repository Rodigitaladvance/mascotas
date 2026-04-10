import React, { useState } from 'react';
import { 
  LayoutDashboard, Heart, Calendar, ShieldCheck, Plus, 
  ChevronRight, Activity, Bell, FileText, QrCode 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import AddPetModal from './AddPetModal';
import { intelligence } from '../utils/intelligence';
import { motion } from 'framer-motion';

const Dashboard = ({ pets, onSelectPet, onAddPet }) => {
  const [showModal, setShowModal] = useState(false);

  // Statistics for Executive Summary
  const petStats = pets.map(p => ({
    name: p.name,
    protection: intelligence.calculateProtection(p)
  }));

  const globalProtection = Math.round(petStats.reduce((acc, curr) => acc + curr.protection, 0) / (pets.length || 1));
  
  const COLORS = ['#4A7C59', '#8FBC8F', '#C2D5A8', '#E9EDC9'];

  const nextEvents = pets
    .flatMap(p => (p.history || []).map(h => ({ ...h, petName: p.petName || p.name })))
    .filter(h => new Date(h.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-pro"
      style={{ padding: '1rem 0' }}
    >
      {/* Executive Summary Header */}
      <section style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Executive <span style={{ color: 'var(--primary)' }}>Panel</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Resumen global de la bóveda sanitaria y nivel de protección activa.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
          style={{ padding: '1.2rem 1.8rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, gap: '0.8rem' }}
        >
          <Plus size={20} /> Añadir Nueva Mascota
        </button>
      </section>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Protection Score Widget */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Nivel de Protección Global
          </h3>
          <div style={{ position: 'relative', width: '200px', height: '140px' }}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: globalProtection }, { value: 100 - globalProtection }]}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill="var(--primary)" />
                    <Cell fill="rgba(0,0,0,0.05)" />
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{globalProtection}%</span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>{intelligence.getStatusEmoji(globalProtection)} PROTEGIDO</p>
             </div>
          </div>
        </div>

        {/* Protection by Pet Chart */}
        <div className="glass-card" style={{ padding: '2rem' }}>
           <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Distribución por Mascota
          </h3>
          <div style={{ height: '150px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={petStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(74, 124, 89, 0.05)' }}
                />
                <Bar dataKey="protection" radius={[6, 6, 0, 0]}>
                  {petStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.protection > 80 ? 'var(--primary)' : 'var(--status-urgent)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Next Notifications */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Bóveda: Próximos Eventos
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {nextEvents.length > 0 ? nextEvents.map((event, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{event.type} - {event.petName}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{event.date}</p>
                </div>
                <Bell size={16} color="var(--text-muted)" />
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>No hay eventos programados.</p>
            )}
          </div>
        </div>
      </div>

      {/* Pet Selection Grid */}
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Mi Bóveda Sanitaria</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {pets.map((pet, index) => {
          const protection = intelligence.calculateProtection(pet);
          return (
            <motion.div 
              key={pet.id}
              whileHover={{ y: -8 }}
              onClick={() => onSelectPet(pet.id)}
              className="glass-card" 
              style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
            >
              <div style={{ height: '8px', background: protection > 80 ? 'var(--primary)' : 'var(--status-urgent)' }} />
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ 
                    width: '80px', height: '80px', borderRadius: '24px', 
                    background: 'var(--secondary)', overflow: 'hidden',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }}>
                    {pet.customImage ? (
                      <img src={pet.customImage} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                        {pet.avatar || (pet.species === 'Perro' ? '🐕' : '🐈')}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{pet.name}</h3>
                      <span style={{ fontSize: '1.5rem' }}>{intelligence.getStatusEmoji(protection)}</span>
                    </div>
                    <p style={{ margin: '0.3rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{pet.breed} • {pet.age} años</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                       <span style={{ background: 'rgba(74, 124, 89, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {protection}% PROTECCIÓN
                       </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <div title="Documentos Pasaporte" style={{ color: 'var(--text-muted)' }}><FileText size={18} /></div>
                      <div title="QR Emergencia" style={{ color: pet.emergencyConfig?.active ? 'var(--status-urgent)' : 'var(--text-muted)' }}><QrCode size={18} /></div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                    ADMINISTRAR <ChevronRight size={16} />
                   </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showModal && <AddPetModal onAdd={onAddPet} onClose={() => setShowModal(false)} />}
    </motion.div>
  );
};

export default Dashboard;
