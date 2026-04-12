import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, ChevronRight, Zap, Wind, Calendar, Award, PlusCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../../context/LocalizationContext';
import ChronographGauge from './ChronographGauge';

const Dashboard = ({ pets, onAddPet, onSelectPet }) => {
  const { t, locale } = useTranslation();
  const [showPerformanceDetail, setShowPerformanceDetail] = useState(false);
  const pet = pets?.[0] || null;
  const healthScore = 95;

  const renderSpeciesPanel = () => {
    if (!pet) return null;
    const sid = pet.species?.toLowerCase();

    if (sid === 'horse') return (
      <div className="aura-card" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2rem' }}>
        {[
          { icon: <Calendar color="var(--aura-gold)" />, label: t('species.horse.lastFarrier'), value: pet.specific?.lastFarrier || '—' },
          { icon: <Award color="var(--aura-gold)" />, label: t('species.horse.competition'),  value: pet.specific?.competition || '—' },
          { icon: <Shield color="var(--aura-gold)" />, label: 'REGA', value: pet.specific?.rega || '—' },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>{icon}</div>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', opacity: 0.6, color: 'var(--aura-text)' }}>{label}</h4>
            <p style={{ fontWeight: 600, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
    );

    if (sid === 'exotic') return (
      <div className="aura-card" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '3rem' }}>
        <ChronographGauge value={pet.specific?.temp ?? 28} min={0} max={50}  label={t('species.exotic.temp')}     unit="°C" color="var(--aura-neon-cyan)" />
        <ChronographGauge value={pet.specific?.humidity ?? 65} min={0} max={100} label={t('species.exotic.humidity')} unit="%" color="var(--aura-gold)" />
        <div style={{ textAlign: 'center' }}>
          <Wind color="var(--aura-neon-pink)" size={32} style={{ marginBottom: '1rem' }} />
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>{t('species.exotic.shedding')}</h4>
          <span className="locale-chip" style={{ color: 'var(--aura-neon-pink)', borderColor: 'var(--aura-neon-pink)' }}>75% COMPLETE</span>
        </div>
      </div>
    );

    if (sid === 'bird') return (
      <div className="aura-card" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2rem', textAlign: 'center' }}>
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>{t('species.bird.ringing')}</p>
          <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>{pet.specific?.ringing || 'AUR-99X-Z'}</p>
        </div>
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>{t('species.bird.feather')}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '0.5rem' }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ width:20, height:4, background: i<=4?'var(--aura-gold)':'rgba(255,255,255,0.1)' }} />)}
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>{t('species.bird.song')}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
            <Activity size={16} color="var(--aura-neon-cyan)" />
            <span style={{ fontWeight: 600 }}>OPTIMAL</span>
          </div>
        </div>
      </div>
    );

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
  };

  /* ── Empty state ── */
  if (!pet) return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🐾</div>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        {locale === 'es' ? 'Bóveda Vacía' : 'Empty Vault'}
      </h2>
      <p style={{ color: 'var(--aura-text-muted)', marginBottom: '3rem' }}>
        {locale === 'es' ? 'Registra tu primer miembro premium.' : 'Register your first premium member.'}
      </p>
      <button className="btn-aura" onClick={onAddPet} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem' }}>
        <PlusCircle size={16} />
        {locale === 'es' ? 'ADMITIR PRIMER MIEMBRO' : 'ADMIT FIRST MEMBER'}
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      {/* ── Hero header ── */}
      <header style={{ padding: '4rem 0 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', letterSpacing: '5px', color: 'var(--aura-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            AURA — {t('dashboard.bioIntel')}
          </span>
          <h1 style={{ fontSize: 'clamp(3rem,5vw,4.5rem)', lineHeight: 1, marginTop: '0.5rem' }}>
            {t('dashboard.executiveTitle')}
          </h1>
        </div>
        <button className="btn-aura" onClick={onAddPet} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <PlusCircle size={14} /> {locale === 'es' ? '+ ADMITIR MIEMBRO' : '+ ADD MEMBER'}
        </button>
      </header>

      {/* ── Main grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.6fr', gap: '2.5rem' }}>

        {/* Bio-Ring */}
        <div className="aura-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ position: 'relative', width: 260, height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ v: healthScore },{ v: 100-healthScore }]}
                     dataKey="v" innerRadius={108} outerRadius={128}
                     startAngle={90} endAngle={450} strokeWidth={0}>
                  <Cell fill="var(--aura-gold)" />
                  <Cell fill="rgba(255,255,255,0.03)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
              <h2 style={{ fontSize: '3.8rem', fontWeight: 300, color: 'var(--aura-gold)', margin: 0 }}>{healthScore}</h2>
              <p style={{ margin: 0, fontSize: '0.58rem', letterSpacing: '4px', opacity: 0.5 }}>{t('dashboard.scoreTitle')}</p>
            </div>
          </div>
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--aura-text)' }}>{pet.name}</h3>
            <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: 0 }}>
              <span className="status-indicator status-active" />
              {t('dashboard.systemCertified')}
            </p>
            <div style={{ marginTop: '1.2rem' }}>
              <span className="locale-chip">{pet.speciesLabel?.toUpperCase() || pet.species?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignContent: 'start' }}>
          {renderSpeciesPanel()}

          <div 
            className="aura-card" 
            style={{ padding: '2rem', display: 'flex', gap: '1.2rem', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => onSelectPet && onSelectPet(pet.id)}
          >
            <div style={{ background: 'rgba(0,245,255,0.05)', padding: '1rem', borderRadius: 2 }}><Wind color="var(--aura-neon-cyan)" /></div>
            <div>
              <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.85rem', color: 'var(--aura-text)' }}>{t('dashboard.globalImmunity')}</h4>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--aura-text-muted)' }}>ISO-Cert: 2026-XQ</p>
            </div>
          </div>

          <div 
            className="aura-card" 
            style={{ padding: '2rem', display: 'flex', gap: '1.2rem', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowPerformanceDetail(true)}
          >
            <div style={{ background: 'rgba(255,0,122,0.05)', padding: '1rem', borderRadius: 2 }}><Zap color="var(--aura-neon-pink)" /></div>
            <div>
              <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.85rem', color: 'var(--aura-text)' }}>{t('dashboard.cardio')}</h4>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--aura-text-muted)' }}>Optimum Performance</p>
            </div>
          </div>

          <button className="btn-aura" style={{ gridColumn: 'span 2', padding: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={() => onSelectPet && onSelectPet(pet?.id)}>
            {t('dashboard.reportBtn')} <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Performance Modal ── */}
      <AnimatePresence>
        {showPerformanceDetail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
            }}
            onClick={() => setShowPerformanceDetail(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="aura-card"
              style={{ maxWidth: 500, width: '100%', padding: '3rem', position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--aura-neon-pink)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Zap /> {t('dashboard.cardio')}
              </h2>
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: 'var(--aura-text-muted)', marginBottom: '1rem' }}>Estado de actividad en tiempo real</p>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 4, display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pulsaciones</span>
                    <span style={{ color: 'var(--aura-neon-pink)', fontWeight: 700 }}>72 BPM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Actividad Diaria</span>
                    <span style={{ color: 'var(--aura-gold)', fontWeight: 700 }}>85%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Estado</span>
                    <span style={{ color: 'var(--aura-neon-cyan)', fontWeight: 700 }}>OPTIMO</span>
                  </div>
                </div>
              </div>
              <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                {[40, 60, 45, 70, 50, 80, 65, 90, 75, 85].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    style={{ flex: 1, background: 'var(--aura-neon-pink)', borderRadius: '2px 2px 0 0' }}
                  />
                ))}
              </div>
              <button 
                className="btn-aura btn-full" 
                style={{ marginTop: '2.5rem' }}
                onClick={() => setShowPerformanceDetail(false)}
              >
                CERRAR DETALLE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Members Vault ── */}
      {pets.length > 1 && (
        <section style={{ marginTop: '6rem' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '2.5rem' }}>{t('dashboard.vaultTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.5rem' }}>
            {pets.map(p => (
              <motion.div key={p.id} whileHover={{ y: -6 }} className="aura-card"
                style={{ cursor: 'pointer', padding: '1.8rem' }} onClick={() => onSelectPet(p.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ width: 40, height: 40, border: '1px solid var(--aura-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    {p.avatar}
                  </div>
                  <span style={{ fontSize: '0.6rem', letterSpacing: '2px', opacity: 0.5 }}>VAULT ID</span>
                </div>
                <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.3rem', color: 'var(--aura-text)' }}>{p.name}</h3>
                <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.6 }}>{p.speciesLabel || p.species} • TIER 1</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <div style={{ height: '6rem' }} />
    </div>
  );
};

export default Dashboard;
