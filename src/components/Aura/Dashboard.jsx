import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, ChevronRight, Zap, Wind, Calendar, Award, PlusCircle, Pencil, Heart } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { assessProtection } from '../../utils/intelligence';
import { accentFor } from '../../utils/species';
import PawPrint from './PawPrint';
import gatoYPerro from '../../assets/gato-y-perro.png';
import ChronographGauge from './ChronographGauge';
import PetEditModal from './PetEditModal';
import MedicalHistory from './MedicalHistory';

const EMPTY_VITALS = { heartRate: '', activity: 50, weight: '', status: 'good', notes: '' };

/* Huellas pastel repartidas por el fondo de las tarjetas grandes. Posiciones
   y giros fijos: si fueran aleatorios cambiarían en cada render. */
const SCATTERED_PAWS = [
  { size: 46, top: '12%',  left: '6%',   color: 'var(--pastel-lavender)', opacity: 0.55, rot: -18 },
  { size: 30, top: '24%',  right: '9%',  color: 'var(--pastel-mint)',     opacity: 0.60, rot: 22 },
  { size: 38, bottom: '16%', left: '13%', color: 'var(--pastel-peach)',   opacity: 0.55, rot: 8  },
  { size: 26, bottom: '24%', right: '15%', color: 'var(--pastel-pink)',   opacity: 0.60, rot: -30 },
  { size: 22, top: '52%',  left: '3%',   color: 'var(--pastel-sky)',      opacity: 0.50, rot: 40 },
  { size: 34, top: '8%',   right: '26%', color: 'var(--pastel-pink)',     opacity: 0.40, rot: -6 },
];

/* Reusable circular action card — icon circle + title + subtitle */
const ActionCard = ({ icon: Icon, color, bgColor, borderColor, title, subtitle, onClick }) => (
  <div
    className="aura-card"
    style={{ flex: 1, padding: '1.4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.7rem', textAlign: 'center', cursor: 'pointer', borderRadius: 12 }}
    onClick={onClick}
  >
    <div style={{ width: 52, height: 52, borderRadius: '50%', background: bgColor, border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon color={color} size={22} />
    </div>
    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', color: 'var(--aura-text)' }}>{title}</h4>
    <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--aura-text-muted)' }}>{subtitle}</p>
  </div>
);

const Dashboard = ({ pets, activePetId, onActivePetChange, onAddPet, onSelectPet, onUpdatePet, onDeletePet }) => {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const [showPerformanceDetail, setShowPerformanceDetail] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVitals, setEditingVitals] = useState(false);
  /* Se incrementa al cerrar el historial para recalcular la protección */
  const [historyVersion, setHistoryVersion] = useState(0);
  const [vitalsForm, setVitalsForm] = useState(EMPTY_VITALS);
  /* Active pet: prop-driven with first-pet fallback */
  const pet = pets?.find(p => p.id === activePetId) || pets?.[0] || null;
  /* Protección real, calculada desde el historial clínico del animal.
     Antes esta línea era `const healthScore = 95`: un número fijo, idéntico
     para todas las mascotas, que nunca cambiaba con los datos. */
  const protection = useMemo(
    () => assessProtection(pet, user ? storage.getHistory(user.id, pet?.id, null) : null),
    [pet, user, historyVersion],
  );
  /* Cada especie tiñe su ficha con su propio color */
  const accent = accentFor(pet);
  const sinDatos = protection.score === null;

  const es = locale === 'es';

  const openPerformance = () => {
    const v = pet?.vitals;
    setVitalsForm(v ? { ...EMPTY_VITALS, ...v } : EMPTY_VITALS);
    setEditingVitals(!v);        // show form if no data, show view if data exists
    setShowPerformanceDetail(true);
  };

  const saveVitals = () => {
    if (!onUpdatePet || !pet) return;
    const updated = { ...pet, vitals: { ...vitalsForm, lastUpdated: new Date().toISOString() } };
    onUpdatePet(updated);
    setEditingVitals(false);
    setShowPerformanceDetail(false);
  };

  const STATUS_OPTS = es
    ? [['optimal','Óptimo'],['good','Bueno'],['fair','Regular'],['critical','Crítico']]
    : [['optimal','Optimal'],['good','Good'],['fair','Fair'],['critical','Critical']];

  const STATUS_COLOR = { optimal:'var(--aura-neon-cyan)', good:'var(--aura-gold)', fair:'#D98A1F', critical:'var(--aura-neon-pink)' };

  const renderSpeciesPanel = () => {
    if (!pet) return null;
    const sid = pet.species?.toLowerCase();

    if (sid === 'horse') return (
      <div className="aura-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2rem' }}>
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
      <div className="aura-card" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        {pet.specific?.temp
          ? <ChronographGauge value={Number(pet.specific.temp)} min={0} max={50} label={t('species.exotic.temp')} unit="°C" color="var(--aura-neon-cyan)" />
          : <div style={{ textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>{t('species.exotic.temp')}</h4>
              <p style={{ margin: 0, fontSize: '1.4rem', opacity: 0.45 }}>—</p>
            </div>}
        {pet.specific?.humidity
          ? <ChronographGauge value={Number(pet.specific.humidity)} min={0} max={100} label={t('species.exotic.humidity')} unit="%" color="var(--aura-gold)" />
          : <div style={{ textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>{t('species.exotic.humidity')}</h4>
              <p style={{ margin: 0, fontSize: '1.4rem', opacity: 0.45 }}>—</p>
            </div>}
        <div style={{ textAlign: 'center' }}>
          <Wind color="var(--aura-neon-pink)" size={32} style={{ marginBottom: '1rem' }} />
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>CITES</h4>
          <span style={{ fontWeight: 600 }}>
            {pet.specific?.citesAppendix && pet.specific.citesAppendix !== 'no'
              ? `${es ? 'Apéndice' : 'Appendix'} ${pet.specific.citesAppendix}`
              : pet.specific?.citesAppendix === 'no'
                ? (es ? 'No listada' : 'Not listed')
                : '—'}
          </span>
        </div>
      </div>
    );

    if (sid === 'bird') {
      const sp = pet.specific || {};
      const cites = sp.citesAppendix && sp.citesAppendix !== 'no'
        ? `${es ? 'Apéndice' : 'Appendix'} ${sp.citesAppendix}`
        : sp.citesAppendix === 'no'
          ? (es ? 'No listada' : 'Not listed')
          : '—';
      return (
        <div className="aura-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {[
            { label: es ? 'Identificación' : 'Identification',
              value: sp.ringing || '—',
              nota: sp.idType || '' },
            { label: es ? 'Especie' : 'Species',
              value: sp.scientificName || '—',
              nota: es ? 'Nombre científico' : 'Scientific name' },
            { label: 'CITES',
              value: cites,
              nota: sp.citesNumber || '' },
          ].map(({ label, value, nota }) => (
            <div key={label}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5, margin: '0 0 0.4rem' }}>{label}</p>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, wordBreak: 'break-word' }}>{value}</p>
              {nota && <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: '0.25rem 0 0' }}>{nota}</p>}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="aura-card" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>EXPEDIENTE MÉDICO</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Shield color="var(--aura-gold)" size={18} /> <span style={{ fontWeight: 600 }}>CIFRADO ACTIVO</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.5 }}>MICROCHIP</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Award color="var(--aura-gold)" size={18} />
            <span style={{ fontWeight: 600 }}>{pet.microchip?.trim() || '—'}</span>
          </div>
        </div>
      </div>
    );
  };

  /* ── Empty state ── */
  if (!pet) return (
    <div className="aura-hero" style={{ textAlign: 'center', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Huellas de colores repartidas, como en la maqueta */}
      {SCATTERED_PAWS.map((h, i) => (
        <PawPrint
          key={i}
          size={h.size}
          style={{
            position: 'absolute', top: h.top, left: h.left, right: h.right, bottom: h.bottom,
            color: h.color, opacity: h.opacity, transform: `rotate(${h.rot}deg)`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.6rem' }}>
          <PawPrint size={26} style={{ color: 'var(--pastel-lavender)' }} />
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', margin: 0, color: 'var(--ink)' }}>
            {locale === 'es' ? 'Mis Archivos' : 'My Records'}
          </h2>
          <PawPrint size={20} style={{ color: 'var(--pastel-mint)' }} />
        </div>
        <p style={{ color: 'var(--ink-muted)', marginBottom: '2.6rem', fontSize: '1rem' }}>
          {locale === 'es' ? 'Registra tu primer miembro premium.' : 'Register your first premium member.'}
        </p>
        <button className="btn-aura" onClick={onAddPet} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
          padding: '1.1rem 2.8rem', fontSize: '0.8rem',
        }}>
          <PlusCircle size={17} />
          {locale === 'es' ? 'ADMITIR PRIMER MIEMBRO' : 'ADMIT FIRST MEMBER'}
        </button>

        <img
          src={gatoYPerro}
          alt={locale === 'es' ? 'Un perro y un gato con sus medallas AURA' : 'A dog and a cat wearing their AURA tags'}
          style={{
            width: 'min(340px, 70vw)', height: 'auto', display: 'block',
            margin: '2.6rem auto 0',
            filter: 'drop-shadow(0 14px 28px rgba(42, 45, 124, 0.18))',
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      {/* ── Cabecera de bienvenida ── */}
      <header className="aura-hero" style={{ padding: '3rem 2.4rem', margin: '2rem 0 2.5rem', position: 'relative' }}>
        {SCATTERED_PAWS.map((h, i) => (
          <PawPrint
            key={i}
            size={h.size}
            style={{
              position: 'absolute', top: h.top, left: h.left, right: h.right, bottom: h.bottom,
              color: h.color, opacity: h.opacity, transform: `rotate(${h.rot}deg)`,
              pointerEvents: 'none',
            }}
          />
        ))}

        <div style={{
          position: 'relative', zIndex: 1, display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.6rem',
        }}>
          <div>
            <p className="aura-script" style={{ margin: 0 }}>
              {locale === 'es' ? 'Bienvenido a' : 'Welcome to'}
            </p>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: '0.1rem 0 0' }}>
              Aura <span style={{ color: 'var(--gold)' }}>Pets</span> Global
            </h1>
            <p style={{
              margin: '0.7rem 0 0', fontSize: '0.74rem', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600,
            }}>
              {locale === 'es' ? 'El pasaporte digital de tu mascota' : 'Your pet\u2019s digital passport'}
            </p>
            <div className="aura-rainbow-rule" style={{ marginInline: 0 }} />
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--ink-body)' }}>
              {locale === 'es' ? 'Viaja, explora, vive… siempre a su lado' : 'Travel, explore, live… always by their side'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
            <img
              src={gatoYPerro}
              alt={locale === 'es' ? 'Un perro y un gato con sus medallas AURA' : 'A dog and a cat wearing their AURA tags'}
              style={{
                width: 'min(300px, 46vw)', height: 'auto', display: 'block',
                filter: 'drop-shadow(0 14px 28px rgba(42, 45, 124, 0.18))',
              }}
            />
            <button className="btn-aura" onClick={onAddPet} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <PlusCircle size={15} /> {locale === 'es' ? 'ADMITIR MIEMBRO' : 'ADD MEMBER'}
            </button>
          </div>
        </div>
      </header>

      {/* ══ Medallion carousel ══ */}
      {pets.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '2.5rem' }}>
          {pets.map(p => {
            const isActive = p.id === (activePetId || pets[0]?.id);
            return (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => onActivePetChange?.(p.id)}
                style={{
                  flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem', padding: 0,
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                  border: isActive ? `2px solid ${accentFor(p).base}` : '1px solid rgba(217, 164, 65, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', background: 'var(--aura-surface)',
                  boxShadow: isActive ? accentFor(p).glow : 'none',
                  transition: 'box-shadow 0.3s, border-color 0.3s',
                }}>
                  {p.customImage
                    ? <img src={p.customImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span>{p.avatar || '🐾'}</span>}
                </div>
                <span style={{
                  fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase',
                  color: isActive ? accentFor(p).base : 'var(--aura-text-muted)',
                  fontWeight: isActive ? 700 : 400, whiteSpace: 'nowrap',
                  textShadow: isActive ? `0 0 8px ${accentFor(p).border}` : 'none',
                  maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {p.name}
                </span>
                {p.status === 'BUSCANDO' && (
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                    style={{ fontSize: '0.5rem', color: '#D98A1F', letterSpacing: '1px', marginTop: -4 }}>
                    🔍 {es ? 'BUSCANDO' : 'MISSING'}
                  </motion.span>
                )}
              </motion.button>
            );
          })}

          {/* ── Add new member button ── */}
          <button onClick={onAddPet} style={{
            flexShrink: 0, width: 64, height: 64, borderRadius: '50%',
            border: '1px dashed rgba(217, 164, 65, 0.35)', background: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--aura-gold)', transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(217, 164, 65, 0.7)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(217, 164, 65, 0.35)'}
          >
            <PlusCircle size={22} />
          </button>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="dashboard-layout">

        {/* Bio-Ring */}
        <div className="aura-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.2rem 1.6rem' }}>
          {(() => {
            const exigibles = protection.items.filter(i => i.estado !== 'no-aplica');
            const alDia = exigibles.filter(i => i.estado === 'al-dia').length;
            const total = exigibles.length;
            const completo = total > 0 && alDia === total;

            return (
              <div style={{ width: '100%', maxWidth: 300 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.9rem' }}>
                  <PawPrint size={26} style={{ color: accent.base, opacity: 0.65, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: '0.62rem', letterSpacing: '2.5px',
                      textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 700,
                    }}>
                      {es ? 'Calendario de salud' : 'Health schedule'}
                    </p>
                    <p style={{
                      margin: '2px 0 0', fontSize: '1.15rem', fontWeight: 600,
                      color: 'var(--ink)', lineHeight: 1.25,
                    }}>
                      {sinDatos
                        ? (es ? 'Sin datos todavía' : 'No data yet')
                        : completo
                          ? (es ? 'Todo al día' : 'All up to date')
                          : (es ? `${alDia} de ${total} al día` : `${alDia} of ${total} up to date`)}
                    </p>
                  </div>
                </div>

                {!sinDatos && total > 0 && (
                  <div style={{
                    height: 6, borderRadius: 3, background: 'var(--bg-soft)',
                    border: '1px solid var(--border)', overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((alDia / total) * 100)}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      style={{ height: '100%', background: accent.base }}
                    />
                  </div>
                )}

                {sinDatos && (
                  <p style={{
                    margin: '0.2rem 0 0', fontSize: '0.72rem', lineHeight: 1.6,
                    color: 'var(--ink-muted)',
                  }}>
                    {protection.reason === 'sin-protocolo'
                      ? (es ? 'Esta especie no tiene un calendario vacunal estándar, así que no hay nada que contar aquí.'
                            : 'This species has no standard vaccination schedule, so there is nothing to count here.')
                      : (es ? 'Anota las vacunas en el Historial Médico y aparecerán aquí, con su próxima fecha.'
                            : 'Log the vaccines in the Medical History and they will show up here, with their next date.')}
                  </p>
                )}
              </div>
            );
          })()}

          {/* ── Detalle, uno por uno ── */}
          {!sinDatos && protection.items.length > 0 && (
            <div style={{ width: '100%', maxWidth: 300, marginTop: '1.1rem', display: 'grid', gap: '0.4rem' }}>
              {protection.items.map((it, i) => {
                const V = {
                  'al-dia':     { color: '#2E9C7A', texto: es ? 'Al día'     : 'Up to date' },
                  'por-vencer': { color: '#C9821F', texto: es ? 'Por vencer' : 'Due soon'   },
                  'vencida':    { color: '#C0392B', texto: es ? 'Vencida'    : 'Overdue'    },
                  'ausente':    { color: 'var(--ink-muted)', texto: es ? 'Sin registrar' : 'Not recorded' },
                  'no-aplica':  { color: 'var(--ink-muted)', texto: es ? 'No necesaria'  : 'Not needed'   },
                }[it.estado] || { color: 'var(--ink-muted)', texto: '—' };
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.5rem 0.7rem', borderRadius: 8,
                    background: 'var(--bg-soft)', border: '1px solid var(--border)',
                  }}>
                    <span aria-hidden="true" style={{
                      flexShrink: 0, width: 7, height: 7, borderRadius: '50%', background: V.color,
                    }} />
                    <span style={{
                      flex: 1, textAlign: 'left', fontSize: '0.74rem',
                      color: 'var(--ink-body)', lineHeight: 1.3,
                    }}>
                      {it.label}
                      {it.vence && it.estado !== 'no-aplica' && (
                        <span style={{ display: 'block', fontSize: '0.63rem', color: 'var(--ink-muted)' }}>
                          {it.estado === 'vencida'
                            ? (es ? 'Tocaba el ' : 'Was due ')
                            : (es ? 'Siguiente: ' : 'Next: ')}
                          {new Date(it.vence).toLocaleDateString(es ? 'es-ES' : 'en-GB')}
                        </span>
                      )}
                    </span>
                    <span style={{
                      fontSize: '0.6rem', letterSpacing: '1px', fontWeight: 700,
                      color: V.color, whiteSpace: 'nowrap', textTransform: 'uppercase',
                    }}>
                      {V.texto}
                    </span>
                  </div>
                );
              })}
              <p style={{
                margin: '0.5rem 0 0', fontSize: '0.64rem', lineHeight: 1.5,
                color: 'var(--ink-muted)', textAlign: 'left',
              }}>
                {es
                  ? 'Calculado sobre las vacunas anotadas en el historial. Si tu veterinario fijó otra fecha, esa manda.'
                  : 'Based on the vaccines logged in the history. If your vet set a different date, that one prevails.'}
              </p>
            </div>
          )}

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            {/* Pet photo / avatar */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${accent.base}`, margin: '0 auto 1rem', boxShadow: accent.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', background: '#FFFFFF' }}>
              {pet.customImage
                ? <img src={pet.customImage} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : pet.avatar || '🐾'}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.8rem' }}>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--aura-text)', margin:0 }}>{pet.name}</h3>
              <button onClick={() => setShowEditModal(true)}
                title={es?'Editar perfil':'Edit profile'}
                style={{ background:'none', border:'1px solid var(--aura-border)', color:'var(--aura-text-muted)',
                  cursor:'pointer', borderRadius:'50%', width:28, height:28,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.2s', flexShrink:0 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--aura-gold)';e.currentTarget.style.color='var(--aura-gold)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--aura-border)';e.currentTarget.style.color='var(--aura-text-muted)';}}>
                <Pencil size={13} />
              </button>
            </div>
            {pet.status === 'BUSCANDO' && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                style={{ margin:'0.6rem auto 0', display:'inline-flex', alignItems:'center', gap:'0.5rem',
                  background:'rgba(255,170,0,0.12)', border:'1px solid rgba(255,170,0,0.5)',
                  borderRadius:4, padding:'0.35rem 0.9rem' }}>
                <span style={{ fontSize:'0.62rem', letterSpacing:'2.5px', color:'#D98A1F', fontWeight:700 }}>
                  🔍 {es ? 'BUSCANDO — QR ACTIVO' : 'MISSING — QR ACTIVE'}
                </span>
              </motion.div>
            )}
            {/* Status line premium */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.6rem 0 0', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.64rem', color: '#2E9C7A', letterSpacing: '0.5px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E9C7A', display: 'inline-block', boxShadow: '0 0 6px #2E9C7A' }} />
                {es ? 'Activo' : 'Active'}
              </span>
              <span style={{ color: 'var(--aura-border)', fontSize: '0.6rem' }}>·</span>
              <span style={{ fontSize: '0.64rem', color: '#B8862C', letterSpacing: '0.5px', textShadow: '0 0 8px rgba(184, 134, 44, 0.4)' }}>✓ {es ? 'Verificado' : 'Verified'}</span>
              <span style={{ color: 'var(--aura-border)', fontSize: '0.6rem' }}>·</span>
              <span style={{ fontSize: '0.64rem', color: 'var(--aura-text-muted)', letterSpacing: '0.5px' }}>
                📅 {es ? 'Última visita' : 'Last visit'}: {pet.vitals?.lastUpdated ? new Date(pet.vitals.lastUpdated).toLocaleDateString(es ? 'es-ES' : 'en-GB') : '—'}
              </span>
            </div>
            <div style={{ marginTop: '1.2rem' }}>
              <span className="locale-chip">{pet.speciesLabel?.toUpperCase() || pet.species?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {renderSpeciesPanel()}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <ActionCard
              icon={Wind}
              color="var(--aura-neon-cyan)"
              bgColor="rgba(67, 191, 199, 0.06)"
              borderColor="rgba(67, 191, 199, 0.22)"
              title={t('dashboard.globalImmunity')}
              subtitle={locale === 'es' ? 'Ver por país' : 'By country'}
              onClick={() => onSelectPet && onSelectPet(pet.id)}
            />
            <ActionCard
              icon={Heart}
              color="var(--aura-gold)"
              bgColor="rgba(217, 164, 65, 0.06)"
              borderColor="rgba(217, 164, 65, 0.25)"
              title={es ? 'Historial Médico' : 'Medical History'}
              subtitle="Vacunas · Visitas · Medicación"
              onClick={() => setShowMedicalHistory(true)}
            />
          </div>

          <button className="btn-aura" style={{ width: '100%', padding: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={() => onSelectPet && onSelectPet(pet.id)}>
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
              position: 'fixed', inset: 0, background: 'rgba(42, 45, 124, 0.42)', backdropFilter: 'blur(10px)',
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
              {/* Header */}
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--aura-neon-pink)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Zap /> {t('dashboard.cardio')}
              </h2>

              {/* ── VIEW MODE — vitals already saved ── */}
              {!editingVitals && pet?.vitals ? (
                <>
                  <div style={{ display: 'grid', gap: '0.8rem', marginBottom: '2rem' }}>
                    {[
                      { label: es?'Frecuencia Cardíaca':'Heart Rate', value: `${pet.vitals.heartRate} BPM`, color: 'var(--aura-neon-pink)' },
                      { label: es?'Actividad Diaria':'Daily Activity',  value: `${pet.vitals.activity}%`,         color: 'var(--aura-gold)' },
                      { label: es?'Peso Actual':'Current Weight',       value: pet.vitals.weight ? `${pet.vitals.weight} kg` : '—', color: 'var(--aura-text)' },
                      { label: es?'Estado General':'Overall Status',    value: STATUS_OPTS.find(o=>o[0]===pet.vitals.status)?.[1] || pet.vitals.status, color: STATUS_COLOR[pet.vitals.status] || 'var(--aura-text)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.2rem', background:'#FFFFFF', borderRadius:4 }}>
                        <span style={{ fontSize:'0.85rem', color:'var(--aura-text-muted)' }}>{label}</span>
                        <span style={{ fontWeight:700, color }}>{value}</span>
                      </div>
                    ))}
                    {pet.vitals.notes && (
                      <div style={{ padding:'1rem 1.2rem', background:'#FFFFFF', borderRadius:4 }}>
                        <p style={{ margin:'0 0 4px', fontSize:'0.7rem', letterSpacing:'2px', color:'var(--aura-text-muted)', textTransform:'uppercase' }}>{es?'Notas':'Notes'}</p>
                        <p style={{ margin:0, fontSize:'0.85rem' }}>{pet.vitals.notes}</p>
                      </div>
                    )}
                    <p style={{ margin:'4px 0 0', fontSize:'0.65rem', color:'var(--aura-text-muted)', textAlign:'right' }}>
                      {es?'Actualizado':'Updated'}: {new Date(pet.vitals.lastUpdated).toLocaleDateString(es?'es-ES':'en-GB')}
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:'1rem' }}>
                    <button className="btn-aura" style={{ flex:1 }} onClick={() => setShowPerformanceDetail(false)}>{es?'CERRAR':'CLOSE'}</button>
                    <button className="btn-aura" style={{ flex:2, borderColor:'var(--aura-neon-pink)', color:'var(--aura-neon-pink)' }}
                      onClick={() => setEditingVitals(true)}>{es?'EDITAR DATOS':'EDIT DATA'}</button>
                  </div>
                </>
              ) : (
                /* ── FORM MODE — enter / edit vitals ── */
                <>
                  <p style={{ color:'var(--aura-text-muted)', fontSize:'0.8rem', marginBottom:'1.5rem' }}>
                    {es ? 'Introduce los últimos datos de salud de tu mascota:' : "Enter your pet's latest health data:"}
                  </p>

                  {/* Heart rate */}
                  <div className="form-group">
                    <label className="input-label">{es?'Frecuencia Cardíaca (BPM)':'Heart Rate (BPM)'}</label>
                    <input type="number" className="aura-input" min="1" max="400"
                      placeholder={es?'Ej: 72':'E.g. 72'}
                      value={vitalsForm.heartRate}
                      onChange={e => setVitalsForm(p=>({...p, heartRate: e.target.value}))} />
                  </div>

                  {/* Activity slider */}
                  <div className="form-group">
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem' }}>
                      <label className="input-label" style={{ marginBottom:0 }}>{es?'Actividad Diaria':'Daily Activity'}</label>
                      <span style={{ fontSize:'0.9rem', color:'var(--aura-gold)', fontWeight:700 }}>{vitalsForm.activity}%</span>
                    </div>
                    <input type="range" className="aura-range" min="0" max="100"
                      value={vitalsForm.activity}
                      onChange={e => setVitalsForm(p=>({...p, activity: parseInt(e.target.value)}))} />
                  </div>

                  {/* Weight */}
                  <div className="form-group">
                    <label className="input-label">{es?'Peso Actual (kg)':'Current Weight (kg)'}</label>
                    <input type="number" className="aura-input" min="0" step="0.1"
                      placeholder={es?'Ej: 28.5':'E.g. 28.5'}
                      value={vitalsForm.weight}
                      onChange={e => setVitalsForm(p=>({...p, weight: e.target.value}))} />
                  </div>

                  {/* Status */}
                  <div className="form-group">
                    <label className="input-label">{es?'Estado General':'Overall Status'}</label>
                    <select className="aura-input aura-select"
                      value={vitalsForm.status}
                      onChange={e => setVitalsForm(p=>({...p, status: e.target.value}))}>
                      {STATUS_OPTS.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="form-group">
                    <label className="input-label">{es?'Notas Veterinarias (opcional)':'Vet Notes (optional)'}</label>
                    <textarea className="aura-input" rows={3} style={{ resize:'vertical', minHeight:70 }}
                      placeholder={es?'Observaciones del veterinario...':'Vet observations...'}
                      value={vitalsForm.notes}
                      onChange={e => setVitalsForm(p=>({...p, notes: e.target.value}))} />
                  </div>

                  <div style={{ display:'flex', gap:'1rem' }}>
                    <button className="btn-aura" style={{ flex:1 }}
                      onClick={() => { setShowPerformanceDetail(false); setEditingVitals(false); }}>
                      {es?'CANCELAR':'CANCEL'}
                    </button>
                    <button className="btn-aura"
                      style={{ flex:2, borderColor: vitalsForm.heartRate ? 'var(--aura-gold)' : 'var(--aura-border)', opacity: vitalsForm.heartRate ? 1 : 0.45 }}
                      disabled={!vitalsForm.heartRate}
                      onClick={saveVitals}>
                      {es?'GUARDAR DATOS':'SAVE DATA'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: '6rem' }} />

      {/* ── Medical History ── */}
      <AnimatePresence>
        {showMedicalHistory && pet && (
          <MedicalHistory pet={pet} onClose={() => { setShowMedicalHistory(false); setHistoryVersion(v => v + 1); }} />
        )}
      </AnimatePresence>

      {/* ── Pet Edit Modal ── */}
      <AnimatePresence>
        {showEditModal && (
          <PetEditModal
            pet={pet}
            onSave={(updated) => onUpdatePet && onUpdatePet(updated)}
            onDelete={(id)  => onDeletePet && onDeletePet(id)}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
