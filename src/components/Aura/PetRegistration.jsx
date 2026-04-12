import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';

/* ── Species config ── */
const SPECIES = [
  { id: 'dog',   label: 'Perro',   labelEn: 'Dog',    emoji: '🐕', 
    img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80&fit=crop' },
  { id: 'cat',   label: 'Gato',    labelEn: 'Cat',    emoji: '🐈',
    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80&fit=crop' },
  { id: 'horse', label: 'Caballo', labelEn: 'Horse',  emoji: '🐴',
    img: 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=200&q=80&fit=crop' },
  { id: 'exotic', label: 'Exótico', labelEn: 'Exotic', emoji: '🦎',
    img: 'https://images.unsplash.com/photo-1627825407513-5f54d839b57e?w=200&q=80&fit=crop' },
  { id: 'bird',  label: 'Ave',     labelEn: 'Bird',   emoji: '🦜',
    img: 'https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=200&q=80&fit=crop' },
];

const COMPETITION_ES = ['Doma Clásica','Salto de Obstáculos','Endurance','Polo','Hipismo de Reining'];
const COMPETITION_EN = ['Dressage','Show Jumping','Endurance','Polo','Reining'];

const DIET_ES = ['Insectívora','Carnívora Estricta','Omnívora','Frugívora','Herbívora'];
const DIET_EN  = ['Insectivore','Strict Carnivore','Omnivore','Frugivore','Herbivore'];

/* ── Sub-tab heading ── */
const SubTabs = ({ tabs, active, onChange }) => (
  <div className="aura-tabs">
    {tabs.map(tab => (
      <button key={tab.id} className={`aura-tab${active === tab.id ? ' active' : ''}`} onClick={() => onChange(tab.id)}>
        {tab.label}
      </button>
    ))}
  </div>
);

/* ── Horse fields ── */
const HorseFields = ({ data, onChange, locale }) => {
  const competitions = locale === 'es' ? COMPETITION_ES : COMPETITION_EN;
  return (
    <div>
      <div className="form-group">
        <label className="input-label">{locale === 'es' ? 'Pasaporte REGA (España)' : 'REGA Passport (Spain)'}</label>
        <input className="aura-input" placeholder="ES-XXX-XXXX" value={data.rega || ''} onChange={e => onChange({ ...data, rega: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="input-label">{locale === 'es' ? 'Fecha Último Herraje' : 'Last Farrier Date'}</label>
        <input type="date" className="aura-input" value={data.lastFarrier || ''} onChange={e => onChange({ ...data, lastFarrier: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="input-label">{locale === 'es' ? 'Rendimiento / Competición' : 'Performance / Competition'}</label>
        <select className="aura-input aura-select" value={data.competition || ''} onChange={e => onChange({ ...data, competition: e.target.value })}>
          <option value="">{locale === 'es' ? 'Seleccionar...' : 'Select...'}</option>
          {competitions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};

/* ── Exotic fields ── */
const ExoticFields = ({ data, onChange, locale }) => {
  const [habitatOn, setHabitatOn] = useState(true);
  const diets = locale === 'es' ? DIET_ES : DIET_EN;
  return (
    <div>
      {/* Habitat toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--aura-text)' }}>
          {locale === 'es' ? 'Hábitat de Exóticos' : 'Exotic Habitat'}
        </span>
        <label className="aura-toggle">
          <input type="checkbox" checked={habitatOn} onChange={e => setHabitatOn(e.target.checked)} />
          <span className="aura-toggle-slider" />
        </label>
      </div>

      {habitatOn && (
        <>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>
                {locale === 'es' ? 'Temperatura' : 'Temperature'}
              </label>
              <span style={{ fontSize: '0.9rem', color: 'var(--aura-neon-cyan)', fontWeight: 600 }}>
                {data.temp ?? 28}°C
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--aura-text-muted)' }}>0</span>
              <input type="range" className="aura-range" min="0" max="50" value={data.temp ?? 28}
                onChange={e => onChange({ ...data, temp: parseInt(e.target.value) })} />
              <span style={{ fontSize: '0.65rem', color: 'var(--aura-text-muted)' }}>50</span>
            </div>
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>
                {locale === 'es' ? 'Humedad' : 'Humidity'}
              </label>
              <span style={{ fontSize: '0.9rem', color: 'var(--aura-gold)', fontWeight: 600 }}>
                {data.humidity ?? 65}%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--aura-text-muted)' }}>0</span>
              <input type="range" className="aura-range" min="0" max="100" value={data.humidity ?? 65}
                onChange={e => onChange({ ...data, humidity: parseInt(e.target.value) })} />
              <span style={{ fontSize: '0.65rem', color: 'var(--aura-text-muted)' }}>100</span>
            </div>
          </div>
        </>
      )}

      <div className="form-group">
        <label className="input-label">{locale === 'es' ? 'Ciclo de Muda' : 'Shedding Cycle'}</label>
        <input type="date" className="aura-input" value={data.lastShed || ''}
          onChange={e => onChange({ ...data, lastShed: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="input-label">{locale === 'es' ? 'Dieta Especializada' : 'Specialized Diet'}</label>
        <select className="aura-input aura-select" value={data.diet || ''}
          onChange={e => onChange({ ...data, diet: e.target.value })}>
          <option value="">{locale === 'es' ? 'Seleccionar...' : 'Select...'}</option>
          {diets.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </div>
  );
};

/* ── Bird fields ── */
const BirdFields = ({ data, onChange, locale }) => (
  <div>
    <div className="form-group">
      <label className="input-label">{locale === 'es' ? 'Número de Anilla' : 'Ringing Number'}</label>
      <input className="aura-input" placeholder="AUR-XXXX" value={data.ringing || ''}
        onChange={e => onChange({ ...data, ringing: e.target.value })} />
    </div>
    <div className="form-group">
      <label className="input-label">{locale === 'es' ? 'Inicio Ciclo de Muda' : 'Feather Cycle Start'}</label>
      <input type="date" className="aura-input" value={data.featherCycle || ''}
        onChange={e => onChange({ ...data, featherCycle: e.target.value })} />
    </div>
    <div className="form-group">
      <label className="input-label">{locale === 'es' ? 'Ciclo de Canto' : 'Song Cycle'}</label>
      <select className="aura-input aura-select" value={data.songCycle || ''}
        onChange={e => onChange({ ...data, songCycle: e.target.value })}>
        {['Optimal','Reduced','Breeding Season'].map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
);

/* ── Main component ── */
const PetRegistration = ({ onSave, onCancel }) => {
  const { t, locale } = useTranslation();
  const [step, setStep] = useState('species'); // 'species' | 'info' | 'specific'
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [basicData, setBasicData] = useState({ name: '', age: '', weight: '', microchip: '' });
  const [specificData, setSpecificData] = useState({});
  const [saved, setSaved] = useState(false);

  const speciesLabel = (sp) => locale === 'es' ? sp.label : sp.labelEn;

  const handleSave = () => {
    if (!selectedSpecies || !basicData.name) return;
    const newPet = {
      species: selectedSpecies.id,
      speciesLabel: speciesLabel(selectedSpecies),
      avatar: selectedSpecies.emoji,
      ...basicData,
      specific: specificData,
    };
    setSaved(true);
    setTimeout(() => onSave(newPet), 1200);
  };

  if (saved) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <CheckCircle2 size={72} color="var(--aura-neon-cyan)" style={{ filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.5))' }} />
        </motion.div>
        <h2 style={{ color: 'var(--aura-neon-cyan)' }}>{locale === 'es' ? 'Miembro Registrado' : 'Member Registered'}</h2>
        <p style={{ color: 'var(--aura-text-muted)', textAlign: 'center' }}>
          {locale === 'es' ? 'Añadido a la Bóveda AURA con encriptación AES-256.' : 'Added to the AURA Vault with AES-256 encryption.'}
        </p>
      </div>
    );
  }

  return (
    <motion.div className="fade-in" style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 0' }}>
      <h1 className="luxury-title" style={{ fontSize: '2.4rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        {locale === 'es' ? 'Registro de Mascota' : 'Pet Registration'}
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--aura-text-muted)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '2.5rem' }}>
        VAULT™ BIOMETRIC ENROLLMENT
      </p>

      {/* ── Step: Species ── */}
      <div className="aura-card" style={{ marginBottom: '1.5rem' }}>
        <label className="input-label" style={{ marginBottom: '1.2rem' }}>
          {locale === 'es' ? 'Seleccionar Especie' : 'Select Species'}
        </label>
        <div className="species-selector">
          {SPECIES.map(sp => (
            <div
              key={sp.id}
              className={`species-card${selectedSpecies?.id === sp.id ? ' selected' : ''}`}
              onClick={() => { setSelectedSpecies(sp); setSpecificData({}); }}
            >
              <img src={sp.img} alt={sp.label}
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.fontSize='2.5rem'; }} />
              <div style={{ fontSize: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'absolute', inset:0 }}>
                {sp.emoji}
              </div>
              {selectedSpecies?.id === sp.id && (
                <div className="species-check">✓ {locale === 'es' ? 'Seleccionado' : 'Selected'}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step: Basic Info ── */}
      <div className="aura-card" style={{ marginBottom: '1.5rem' }}>
        <SubTabs
          tabs={[
            { id: 'info', label: locale === 'es' ? 'Especie' : 'Species' },
            { id: 'specific', label: selectedSpecies?.id === 'horse' || selectedSpecies?.id === 'caballo' ? (locale === 'es' ? 'Equino' : 'Equine') : (locale === 'es' ? 'Específico' : 'Specific') },
          ]}
          active={step === 'specific' ? 'specific' : 'info'}
          onChange={v => setStep(v)}
        />

        <AnimatePresence mode="wait">
          {step !== 'specific' ? (
            <motion.div key="info" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <div className="form-group">
                <label className="input-label">{locale === 'es' ? 'Nombre del Miembro' : 'Member Name'}</label>
                <input className="aura-input" placeholder={locale === 'es' ? 'Nombre de tu mascota' : "Your pet's name"}
                  value={basicData.name} onChange={e => setBasicData({ ...basicData, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="input-label">{locale === 'es' ? 'Edad' : 'Age'}</label>
                  <input className="aura-input" placeholder={locale === 'es' ? 'Años' : 'Years'}
                    value={basicData.age} onChange={e => setBasicData({ ...basicData, age: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="input-label">{locale === 'es' ? 'Peso' : 'Weight'}</label>
                  <input className="aura-input" placeholder="kg"
                    value={basicData.weight} onChange={e => setBasicData({ ...basicData, weight: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="input-label">Microchip ID</label>
                <input className="aura-input" placeholder="900XXXXXXXXXXXX"
                  value={basicData.microchip} onChange={e => setBasicData({ ...basicData, microchip: e.target.value })} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="specific" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {(selectedSpecies?.id === 'horse') && (
                <HorseFields data={specificData} onChange={setSpecificData} locale={locale} />
              )}
              {(selectedSpecies?.id === 'exotic') && (
                <ExoticFields data={specificData} onChange={setSpecificData} locale={locale} />
              )}
              {(selectedSpecies?.id === 'bird') && (
                <BirdFields data={specificData} onChange={setSpecificData} locale={locale} />
              )}
              {(!selectedSpecies || ['dog','cat'].includes(selectedSpecies?.id)) && (
                <p style={{ color: 'var(--aura-text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                  {locale === 'es'
                    ? 'Selecciona Caballo, Exótico o Ave para ver campos específicos.'
                    : 'Select Horse, Exotic or Bird for species-specific fields.'}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── AURA Shield Banner ── */}
      <div className="shield-banner" style={{ marginBottom: '1.5rem' }}>
        <div className="shield-icon">
          <Shield size={22} />
        </div>
        <div className="shield-text">
          <h4>Escudo AURA: {locale === 'es' ? 'Encriptación AES-256 Activa' : 'AES-256 Encryption Active'}</h4>
          <p>{locale === 'es' ? 'Tus datos están protegidos bajo HIPAA/GDPR' : 'Your data is protected under HIPAA/GDPR'}</p>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn-aura" style={{ flex: 1 }} onClick={onCancel}>{t('common.cancel')}</button>
        <button
          className="btn-aura"
          style={{ flex: 2, borderColor: selectedSpecies && basicData.name ? 'var(--aura-gold)' : 'var(--aura-border)', opacity: selectedSpecies && basicData.name ? 1 : 0.4 }}
          onClick={handleSave}
          disabled={!selectedSpecies || !basicData.name}
        >
          {locale === 'es' ? 'CONFIRMAR REGISTRO' : 'CONFIRM REGISTRATION'}
        </button>
      </div>
    </motion.div>
  );
};

export default PetRegistration;
