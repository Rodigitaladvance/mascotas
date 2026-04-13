import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, Upload, PlusCircle } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';
import { readImageAsDataURL } from '../../utils/imageUpload';

/* ── Species config ── */
const SPECIES = [
  { id: 'dog',   label: 'Perro',    labelEn: 'Dog',    emoji: '🐕',
    img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80&fit=crop' },
  { id: 'cat',   label: 'Gato',     labelEn: 'Cat',    emoji: '🐈',
    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80&fit=crop' },
  { id: 'horse', label: 'Caballo',  labelEn: 'Horse',  emoji: '🐴',
    img: 'https://images.unsplash.com/photo-1553284966-19b8815c7817?w=200&q=80&fit=crop' },
  { id: 'exotic', label: 'Exótico', labelEn: 'Exotic', emoji: '🦎',
    img: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=200&q=80&fit=crop' },
  { id: 'bird',  label: 'Ave',      labelEn: 'Bird',   emoji: '🦜',
    img: 'https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=200&q=80&fit=crop' },
  { id: 'other', label: 'OTRA MASCOTA', labelEn: 'Other Pet', emoji: '+', img: null, isOther: true },
];

const COMPETITION_ES = ['Doma Clásica','Salto de Obstáculos','Endurance','Polo','Reining'];
const COMPETITION_EN = ['Dressage','Show Jumping','Endurance','Polo','Reining'];
const DIET_ES = ['Insectívora','Carnívora Estricta','Omnívora','Frugívora','Herbívora'];
const DIET_EN  = ['Insectivore','Strict Carnivore','Omnivore','Frugivore','Herbivore'];

/* Stored as English key; displayed in active locale */
const SONG_OPTIONS = [
  { value: 'Optimal',         es: 'Óptimo',           en: 'Optimal'        },
  { value: 'Reduced',         es: 'Reducido',          en: 'Reduced'        },
  { value: 'Breeding Season', es: 'Temporada de Cría', en: 'Breeding Season'},
];

/* ── Sub-tabs ── */
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
        <input className="aura-input" placeholder="ES-XXX-XXXX" value={data.rega || ''}
          onChange={e => onChange({ ...data, rega: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="input-label">{locale === 'es' ? 'Fecha Último Herraje' : 'Last Farrier Date'}</label>
        <input type="date" className="aura-input" value={data.lastFarrier || ''}
          onChange={e => onChange({ ...data, lastFarrier: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="input-label">{locale === 'es' ? 'Rendimiento / Competición' : 'Performance / Competition'}</label>
        <select className="aura-input aura-select" value={data.competition || ''}
          onChange={e => onChange({ ...data, competition: e.target.value })}>
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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <span style={{ fontSize:'0.85rem', fontWeight:600 }}>
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
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem' }}>
              <label className="input-label" style={{ marginBottom:0 }}>{locale==='es'?'Temperatura':'Temperature'}</label>
              <span style={{ fontSize:'0.9rem', color:'var(--aura-neon-cyan)', fontWeight:600 }}>{data.temp ?? 28}°C</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <span style={{ fontSize:'0.65rem', color:'var(--aura-text-muted)' }}>0</span>
              <input type="range" className="aura-range" min="0" max="50" value={data.temp ?? 28}
                onChange={e => onChange({ ...data, temp: parseInt(e.target.value) })} />
              <span style={{ fontSize:'0.65rem', color:'var(--aura-text-muted)' }}>50</span>
            </div>
          </div>
          <div className="form-group">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem' }}>
              <label className="input-label" style={{ marginBottom:0 }}>{locale==='es'?'Humedad':'Humidity'}</label>
              <span style={{ fontSize:'0.9rem', color:'var(--aura-gold)', fontWeight:600 }}>{data.humidity ?? 65}%</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <span style={{ fontSize:'0.65rem', color:'var(--aura-text-muted)' }}>0</span>
              <input type="range" className="aura-range" min="0" max="100" value={data.humidity ?? 65}
                onChange={e => onChange({ ...data, humidity: parseInt(e.target.value) })} />
              <span style={{ fontSize:'0.65rem', color:'var(--aura-text-muted)' }}>100</span>
            </div>
          </div>
        </>
      )}
      <div className="form-group">
        <label className="input-label">{locale==='es'?'Ciclo de Muda':'Shedding Cycle'}</label>
        <input type="date" className="aura-input" value={data.lastShed || ''}
          onChange={e => onChange({ ...data, lastShed: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="input-label">{locale==='es'?'Dieta Especializada':'Specialized Diet'}</label>
        <select className="aura-input aura-select" value={data.diet || ''}
          onChange={e => onChange({ ...data, diet: e.target.value })}>
          <option value="">{locale==='es'?'Seleccionar...':'Select...'}</option>
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
      <label className="input-label">{locale==='es'?'Número de Anilla':'Ringing Number'}</label>
      <input className="aura-input" placeholder="AUR-XXXX" value={data.ringing || ''}
        onChange={e => onChange({ ...data, ringing: e.target.value })} />
    </div>
    <div className="form-group">
      <label className="input-label">{locale==='es'?'Inicio Ciclo de Muda':'Feather Cycle Start'}</label>
      <input type="date" className="aura-input" value={data.featherCycle || ''}
        onChange={e => onChange({ ...data, featherCycle: e.target.value })} />
    </div>
    <div className="form-group">
      <label className="input-label">{locale==='es'?'Ciclo de Canto':'Song Cycle'}</label>
      <select className="aura-input aura-select" value={data.songCycle || ''}
        onChange={e => onChange({ ...data, songCycle: e.target.value })}>
        <option value="">{locale === 'es' ? 'Seleccionar…' : 'Select…'}</option>
        {SONG_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{locale === 'es' ? o.es : o.en}</option>
        ))}
      </select>
    </div>
  </div>
);

/* ── Other/Special fields ── */
const OtherFields = ({ data, onChange, locale }) => {
  const handlePhoto = (e) =>
    readImageAsDataURL(e.target.files?.[0], (src) => onChange({ ...data, customPhoto: src }));

  return (
    <div>
      <div className="form-group">
        <label className="input-label">{locale==='es'?'Especie Personalizada':'Custom Species'}</label>
        <input className="aura-input"
          placeholder={locale==='es'?'Ej: Hurón, Erizo, Araña...':'E.g: Ferret, Hedgehog, Tarantula...'}
          value={data.customSpecies || ''}
          onChange={e => onChange({ ...data, customSpecies: e.target.value })} />
      </div>

      <div className="form-group">
        <label className="input-label">{locale==='es'?'Fotografía de Perfil':'Profile Photo'}</label>
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
          border: '1px dashed var(--aura-border-strong)', borderRadius: 4,
          padding: '2rem', cursor: 'pointer', transition: 'border-color 0.3s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor='var(--aura-gold)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='var(--aura-border-strong)'}
        >
          {data.customPhoto ? (
            <img src={data.customPhoto} alt="preview"
              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--aura-gold)' }} />
          ) : (
            <Upload size={28} color="var(--aura-gold)" />
          )}
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--aura-gold)', fontWeight: 600 }}>
              {locale==='es'?'Subir Fotografía':'Upload Photo'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: 'var(--aura-text-muted)' }}>
              JPG, PNG — {locale==='es'?'máx 5MB':'max 5MB'}
            </p>
          </div>
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
        </label>
      </div>

      <div className="form-group">
        <label className="input-label">{locale==='es'?'Notas Especiales':'Special Notes'}</label>
        <textarea className="aura-input" rows={3}
          placeholder={locale==='es'?'Hábitat, dieta, cuidados especiales...':'Habitat, diet, special care...'}
          value={data.notes || ''}
          onChange={e => onChange({ ...data, notes: e.target.value })}
          style={{ resize: 'vertical', minHeight: 80 }} />
      </div>
    </div>
  );
};

/* ════════ Main Component ════════ */
const PetRegistration = ({ onSave, onCancel }) => {
  const { t, locale } = useTranslation();
  const [subTab, setSubTab] = useState('info');
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [basicData, setBasicData] = useState({ name: '', age: '', weight: '', microchip: '', customPhoto: null });
  const [specificData, setSpecificData] = useState({});

  const handleBasicPhoto = (e) =>
    readImageAsDataURL(e.target.files?.[0], (src) => setBasicData(prev => ({ ...prev, customPhoto: src })));
  const [saved, setSaved] = useState(false);

  const speciesLabel = (sp) => locale === 'es' ? sp.label : sp.labelEn;

  const handleSave = () => {
    if (!selectedSpecies || !basicData.name) return;
    const newPet = {
      species: selectedSpecies.id,
      speciesLabel: speciesLabel(selectedSpecies),
      avatar: selectedSpecies.emoji,
      customImage: basicData.customPhoto || specificData.customPhoto || null,
      ...basicData,
      specific: specificData,
    };
    setSaved(true);
    setTimeout(() => onSave(newPet), 1200);
  };

  const specificTabLabel = () => {
    if (selectedSpecies?.id === 'horse') return locale==='es'?'Equino':'Equine';
    if (selectedSpecies?.id === 'exotic') return locale==='es'?'Hábitat':'Habitat';
    if (selectedSpecies?.id === 'bird')  return locale==='es'?'Ave':'Bird';
    if (selectedSpecies?.id === 'other') return locale==='es'?'Especial':'Special';
    return locale==='es'?'Específico':'Specific';
  };

  /* Success screen */
  if (saved) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1.5rem' }}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200 }}>
        <CheckCircle2 size={72} color="var(--aura-neon-cyan)" style={{ filter:'drop-shadow(0 0 20px rgba(0,245,255,0.5))' }} />
      </motion.div>
      <h2 style={{ color:'var(--aura-neon-cyan)' }}>{locale==='es'?'Miembro Registrado':'Member Registered'}</h2>
      <p style={{ color:'var(--aura-text-muted)', textAlign:'center' }}>
        {locale==='es'?'Añadido a tu Expediente Médico AURA con encriptación AES-256.':'Added to your AURA Medical Record with AES-256 encryption.'}
      </p>
    </div>
  );

  return (
    <motion.div className="fade-in" style={{ maxWidth:580, margin:'0 auto', padding:'2rem 0 8rem' }}>
      <h1 className="luxury-title" style={{ fontSize:'2.4rem', textAlign:'center', marginBottom:'0.5rem' }}>
        {locale==='es'?'Registro de Mascota':'Pet Registration'}
      </h1>
      <p style={{ textAlign:'center', color:'var(--aura-text-muted)', fontSize:'0.75rem', letterSpacing:'3px', marginBottom:'2.5rem' }}>
        EXPEDIENTE MÉDICO DIGITAL
      </p>

      {/* ── Species selector ── */}
      <div className="aura-card" style={{ marginBottom:'1.5rem' }}>
        <label className="input-label" style={{ marginBottom:'1.2rem' }}>
          {locale==='es'?'Seleccionar Especie':'Select Species'}
        </label>
        <div className="species-selector">
          {SPECIES.map(sp => {
            const isSelected = selectedSpecies?.id === sp.id;
            return sp.isOther ? (
              /* ── Special "Other" card with gold + icon ── */
              <div key={sp.id}
                onClick={() => { setSelectedSpecies(sp); setSpecificData({}); setSubTab('specific'); }}
                style={{
                  flexShrink: 0, width: 120, height: 120,
                  border: isSelected ? '2px solid #d4af37' : '2px dashed rgba(212,175,55,0.45)',
                  borderRadius: '50%', cursor: 'pointer', position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 6, background: isSelected ? 'rgba(212,175,55,0.1)' : 'rgba(10,10,15,0.9)',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isSelected ? '0 0 0 3px rgba(212,175,55,0.35), 0 0 20px rgba(212,175,55,0.8)' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                <PlusCircle size={30} color="var(--aura-gold)" strokeWidth={1.5} />
                <span style={{ fontSize: '0.52rem', letterSpacing: '1px', color: 'var(--aura-gold)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.2, padding: '0 8px', fontWeight: 700 }}>
                  {locale === 'es' ? 'OTRA' : 'OTHER'}
                </span>
              </div>
            ) : (
              <div key={sp.id}
                className={`species-card${isSelected ? ' selected' : ''}`}
                onClick={() => {
                  setSelectedSpecies(sp);
                  setSpecificData({});
                  /* Auto-switch to specific tab for species with dedicated fields */
                  const hasSpecific = ['horse','exotic','bird'].includes(sp.id);
                  setSubTab(hasSpecific ? 'specific' : 'info');
                }}
              >
                <img src={sp.img} alt={sp.label} />
                {isSelected && (
                  <div className="species-check">✓ {locale==='es'?'Seleccionado':'Selected'}</div>
                )}
              </div>
            );
          })}
        </div>
        {selectedSpecies && (
          <p style={{ margin:'1rem 0 0', fontSize:'0.72rem', letterSpacing:'2px', color:'var(--aura-gold)', textTransform:'uppercase' }}>
            {speciesLabel(selectedSpecies)} {locale==='es'?'seleccionado':'selected'}
          </p>
        )}
      </div>

      {/* ── Info / Specific tabs ── */}
      <div className="aura-card" style={{ marginBottom:'1.5rem' }}>
        <SubTabs
          tabs={[
            { id:'info',     label: locale==='es'?'Info General':'General Info' },
            { id:'specific', label: specificTabLabel() },
          ]}
          active={subTab}
          onChange={setSubTab}
        />

        <AnimatePresence mode="wait">
          {subTab === 'info' ? (
            <motion.div key="info" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}>
              {/* ── Photo + fields side by side ── */}
              <div style={{ display:'grid', gridTemplateColumns:'96px 1fr', gap:'1.4rem', alignItems:'start', marginBottom:'1rem' }}>
                {/* Photo circle */}
                <label style={{ cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
                  <div style={{
                    width:96, height:96, borderRadius:'50%', overflow:'hidden',
                    border: basicData.customPhoto ? '2px solid var(--aura-gold)' : '2px dashed rgba(212,175,55,0.4)',
                    background:'rgba(255,255,255,0.03)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'border-color 0.3s, box-shadow 0.3s',
                    boxShadow: basicData.customPhoto ? '0 0 14px rgba(212,175,55,0.35)' : 'none',
                  }}>
                    {basicData.customPhoto
                      ? <img src={basicData.customPhoto} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <Upload size={22} color="var(--aura-gold)" />}
                  </div>
                  <span style={{ fontSize:'0.58rem', letterSpacing:'1px', color:'var(--aura-text-muted)', textTransform:'uppercase' }}>
                    {locale==='es'?'Foto':'Photo'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleBasicPhoto} style={{ display:'none' }} />
                </label>

                {/* Name + Breed/Notes stacked */}
                <div>
                  <div className="form-group">
                    <label className="input-label">{locale==='es'?'Nombre del Miembro':'Member Name'}</label>
                    <input className="aura-input"
                      placeholder={locale==='es'?'Nombre de tu mascota':"Your pet's name"}
                      value={basicData.name}
                      onChange={e => setBasicData({...basicData, name:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="input-label">{locale==='es'?'Raza / Variedad':'Breed / Variety'}</label>
                    <input className="aura-input"
                      placeholder={locale==='es'?'Ej: Golden Retriever':'E.g: Golden Retriever'}
                      value={basicData.breed || ''}
                      onChange={e => setBasicData({...basicData, breed:e.target.value})} />
                  </div>
                </div>
              </div>

              {/* ── Metrics row ── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.8rem' }}>
                <div className="form-group">
                  <label className="input-label">{locale==='es'?'Edad':'Age'}</label>
                  <input className="aura-input" placeholder={locale==='es'?'Años':'Years'}
                    value={basicData.age} onChange={e => setBasicData({...basicData, age:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="input-label">{locale==='es'?'Peso':'Weight'}</label>
                  <input className="aura-input" placeholder="kg"
                    value={basicData.weight} onChange={e => setBasicData({...basicData, weight:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="input-label">Microchip</label>
                  <input className="aura-input" placeholder="900XXXXXXXXX"
                    value={basicData.microchip} onChange={e => setBasicData({...basicData, microchip:e.target.value})} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="specific" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }}>
              {selectedSpecies?.id === 'horse'  && <HorseFields  data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'exotic' && <ExoticFields data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'bird'   && <BirdFields   data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'other'  && <OtherFields  data={specificData} onChange={setSpecificData} locale={locale} />}
              {(!selectedSpecies || ['dog','cat'].includes(selectedSpecies?.id)) && (
                <p style={{ color:'var(--aura-text-muted)', textAlign:'center', padding:'2rem 0', fontSize:'0.85rem' }}>
                  {locale==='es'
                    ? 'Selecciona Caballo, Exótico, Ave u Otro para ver campos específicos.'
                    : 'Select Horse, Exotic, Bird or Other for species-specific fields.'}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Shield banner ── */}
      <div className="shield-banner" style={{ marginBottom:'1.5rem' }}>
        <div className="shield-icon"><Shield size={22} /></div>
        <div className="shield-text">
          <h4>Escudo AURA: {locale==='es'?'Encriptación AES-256 Activa':'AES-256 Encryption Active'}</h4>
          <p>{locale==='es'?'Tus datos están protegidos bajo HIPAA/GDPR':'Your data is protected under HIPAA/GDPR'}</p>
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display:'flex', gap:'1rem' }}>
        <button className="btn-aura" style={{ flex:1 }} onClick={onCancel}>{t('common.cancel')}</button>
        <button
          className="btn-aura"
          style={{
            flex:2,
            borderColor: selectedSpecies && basicData.name ? 'var(--aura-gold)' : 'var(--aura-border)',
            opacity: selectedSpecies && basicData.name ? 1 : 0.4,
          }}
          disabled={!selectedSpecies || !basicData.name}
          onClick={handleSave}
        >
          {locale==='es'?'CONFIRMAR REGISTRO':'CONFIRM REGISTRATION'}
        </button>
      </div>
    </motion.div>
  );
};

export default PetRegistration;
