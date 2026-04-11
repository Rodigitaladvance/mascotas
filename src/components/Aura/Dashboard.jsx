import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Activity, ChevronRight, Zap, Heart, 
  Wind, Thermometer, Droplets, Calendar, Award 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from '../../context/LocalizationContext';
import ChronographGauge from './ChronographGauge';

const Dashboard = ({ pets, onSelectPet, onAddPet }) => {
  const { t, getCurrencySymbol } = useTranslation();
  const pet = pets[0] || null;
  const healthScore = 95;

  const renderSpeciesSpecific = () => {
    if (!pet) return null;

    switch (pet.species) {
      case 'Horse':
      case 'Caballo':
        return (
          <div className="aura-card" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
               <Calendar color="var(--aura-gold)" style={{ marginBottom: '1rem' }} />
               <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>{t('species.horse.lastFarrier')}</h4>
               <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>15 Ene 2026</p>
            </div>
            <div style={{ textAlign: 'center' }}>
               <Award color="var(--aura-gold)" style={{ marginBottom: '1rem' }} />
               <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>{t('species.horse.competition')}</h4>
               <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>CSI5* GP</p>
            </div>
            <div style={{ textAlign: 'center' }}>
               <Shield color="var(--aura-gold)" style={{ marginBottom: '1rem' }} />
               <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>MICROCHIP / REGA</h4>
               <p style={{ fontSize: '1rem', fontWeight: 600 }}>ES-827-X</p>
            </div>
          </div>
        );
      
      case 'Exotic':
      case 'Exótico':
        return (
          <div className="aura-card" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '3rem' }}>
            <ChronographGauge value={28.5} min={15} max={45} label={t('species.exotic.temp')} unit="°C" color="var(--aura-neon-cyan)" />
            <ChronographGauge value={72} min={0} max={100} label={t('species.exotic.humidity')} unit="%" color="var(--aura-gold)" />
            <div style={{ textAlign: 'center' }}>
               <Wind color="var(--aura-neon-pink)" size={32} style={{ marginBottom: '1rem' }} />
               <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>{t('species.exotic.shedding')}</h4>
               <span className="locale-chip" style={{ color: 'var(--aura-neon-pink)', borderColor: 'var(--aura-neon-pink)' }}>75% COMPLETE</span>
            </div>
          </div>
        );

      case 'Bird':
      case 'Ave':
        return (
          <div className="aura-card" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', textAlign: 'center' }}>
             <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>{t('species.bird.ringing')}</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>AUR-99X-Z</p>
             </div>
             <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>{t('species.bird.feather')}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '0.5rem' }}>
                   {[1,2,3,4,5].map(i => <div key={i} style={{ width: '20px', height: '4px', background: i <= 4 ? 'var(--aura-gold)' : 'rgba(255,255,255,0.1)' }} />)}
                </div>
             </div>
             <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>{t('species.bird.song')}</p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                   <Activity size={16} color="var(--aura-neon-cyan)" /> <span style={{ fontWeight: 600 }}>OPTIMAL</span>
                </div>
             </div>
          </div>
        );

      default:
        return (
          <div className="aura-card" style={{ gridColumn: 'span 2', display: 'flex', gap: '4rem', justifyContent: 'center' }}>
             <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>IDENTIDAD VAULT™</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                   <Shield color="var(--aura-gold)" size={18} /> <span style={{ fontWeight: 600 }}>BIOMETRÍA OK</span>
                </div>
             </div>
             <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>EXCELENCIA SANITARIA</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                   <Award color="var(--aura-gold)" size={18} /> <span style={{ fontWeight: 600 }}>TIER 1 MEMBER</span>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="fade-in">
       <header style={{ marginBottom: '5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div style={{ opacity: 0.8 }}>
             <span className="luxury-title" style={{ fontSize: '0.8rem', letterSpacing: '6px', textTransform: 'uppercase' }}>
               AURA - {t('dashboard.bioIntel')}
             </span>
             <h1 style={{ fontSize: '4.5rem', margin: '0.5rem 0 0', lineHeight: 1 }}>{t('dashboard.executiveTitle')}</h1>
          </div>
          <div>
            <button className="btn-aura btn-neon" onClick={onAddPet}>+ ADMITIR MIEMBRO</button>
          </div>
       </header>

       <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', gap: '3rem' }}>
          {/* Main Bio-Ring Card */}
          <div className="aura-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
             <div style={{ position: 'relative', width: '280px', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ value: healthScore }, { value: 100 - healthScore }]}
                      innerRadius={115} outerRadius={135}
                      startAngle={90} endAngle={450} paddingAngle={0}
                      dataKey="value" stroke="none"
                    >
                      <Cell fill="var(--aura-gold)" />
                      <Cell fill="rgba(255,255,255,0.03)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ 
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <h2 style={{ fontSize: '4rem', margin: 0, fontWeight: 300, color: 'var(--aura-gold)' }}>{healthScore}</h2>
                  <p style={{ margin: 0, fontSize: '0.6rem', letterSpacing: '4px', opacity: 0.5 }}>{t('dashboard.scoreTitle')}</p>
                </div>
             </div>
             <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: 'white' }}>{pet?.name || 'Aura Member'}</h3>
                <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                   <div className="status-indicator status-active" /> {t('dashboard.systemCertified')}
                </p>
             </div>
          </div>

          {/* Species Specific and Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
             {renderSpeciesSpecific()}

             <div className="aura-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(0,245,255,0.05)', padding: '1rem' }}><Wind color="var(--aura-neon-cyan)" /></div>
                <div>
                   <h4 style={{ margin: 0, fontSize: '0.85rem' }}>{t('dashboard.globalImmunity')}</h4>
                   <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--aura-text-muted)' }}>ISO-Cert: 2026-XQ</p>
                </div>
             </div>

             <div className="aura-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(255,0,122,0.05)', padding: '1rem' }}><Zap color="var(--aura-neon-pink)" /></div>
                <div>
                   <h4 style={{ margin: 0, fontSize: '0.85rem' }}>{t('dashboard.cardio')}</h4>
                   <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--aura-text-muted)' }}>Optimum Performance</p>
                </div>
             </div>

             <button className="btn-aura" style={{ gridColumn: 'span 2', padding: '1.5rem', marginTop: '1rem', background: 'rgba(212,175,55,0.02)' }}>
                {t('dashboard.reportBtn')} <ChevronRight size={16} />
             </button>
          </div>
       </div>

       {/* Vault List */}
       <section style={{ marginTop: '8rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>{t('dashboard.vaultTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
             {pets.map(p => (
               <motion.div 
                 key={p.id} whileHover={{ y: -8 }} 
                 className="aura-card" 
                 style={{ cursor: 'pointer', padding: '2rem' }}
                 onClick={() => onSelectPet(p.id)}
               >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                     <div style={{ width: '40px', height: '40px', border: '1px solid var(--aura-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        {p.avatar}
                     </div>
                     <span style={{ fontSize: '0.6rem', letterSpacing: '2px', opacity: 0.5 }}>VAULT ID</span>
                  </div>
                  <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.4rem' }}>{p.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6 }}>{p.species} • TIER 1</p>
               </motion.div>
             ))}
          </div>
       </section>
    </div>
  );
};

export default Dashboard;
