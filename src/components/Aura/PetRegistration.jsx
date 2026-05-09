import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, Upload, PlusCircle } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';
import { readImageAsDataURL } from '../../utils/imageUpload';

/* ── Species config ── */
const SPECIES = [
  { id: 'dog',    label: 'Perro',        labelEn: 'Dog',       emoji: '🐕',
    img: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'cat',    label: 'Gato',         labelEn: 'Cat',       emoji: '🐈',
    img: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'horse',  label: 'Caballo',      labelEn: 'Horse',     emoji: '🐴',
    img: 'https://images.pexels.com/photos/635499/pexels-photo-635499.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'bird',   label: 'Ave',          labelEn: 'Bird',      emoji: '🦜',
    img: 'https://images.pexels.com/photos/56733/pexels-photo-56733.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'rabbit', label: 'Conejo',       labelEn: 'Rabbit',    emoji: '🐇',
    img: 'https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'other',  label: 'OTRA MASCOTA', labelEn: 'Other Pet', emoji: '+', img: null, isOther: true },
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

/* ── Campo con ✓ cuando está relleno ── */
const FieldWrap = ({ filled, children }) => (
  <div style={{ position: 'relative' }}>
    {children}
    {filled && (
      <span style={{
        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
        color: '#1D9E75', fontSize: '0.85rem', fontWeight: 700, pointerEvents: 'none',
        lineHeight: 1,
      }}>✓</span>
    )}
  </div>
);

/* ════════ Main Component ════════ */
const PetRegistration = ({ onSave, onCancel }) => {
  const { t, locale } = useTranslation();
  const [subTab, setSubTab] = useState('info');
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [basicData, setBasicData] = useState({ name: '', age: '', weight: '', microchip: '', customPhoto: null });
  const [specificData, setSpecificData] = useState({});
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = carouselRef.current;
    if (!el) return;
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [checkScroll]);

  const scrollCarousel = (dir) => {
    carouselRef.current?.scrollBy({ left: dir * 110, behavior: 'smooth' });
  };

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
        <label className="input-label" style={{ textAlign:'center', display:'block', marginBottom:'1.2rem' }}>
          {locale==='es'?'Seleccionar Especie':'Select Species'}
        </label>

        {/* Carousel wrapper — relative so arrows can be positioned over it */}
        <div style={{ position:'relative' }}>

          {/* Left fade + arrow */}
          {canScrollLeft && (
            <>
              <div style={{
                position:'absolute', left:0, top:0, bottom:'1rem', width:48,
                background:'linear-gradient(to right, var(--aura-glass) 40%, transparent)',
                pointerEvents:'none', zIndex:2,
              }} />
              <button onClick={() => scrollCarousel(-1)} style={{
                position:'absolute', left:0, top:'50%', transform:'translateY(-60%)',
                zIndex:3, background:'transparent', border:'none', cursor:'pointer',
                color:'#F0D060', fontSize:'1.6rem', lineHeight:1, padding:'0 4px',
                textShadow:'0 0 10px rgba(240,208,96,0.9)',
              }}>‹</button>
            </>
          )}

          {/* Right fade + arrow */}
          {canScrollRight && (
            <>
              <div style={{
                position:'absolute', right:0, top:0, bottom:'1rem', width:48,
                background:'linear-gradient(to left, var(--aura-glass) 40%, transparent)',
                pointerEvents:'none', zIndex:2,
              }} />
              <button onClick={() => scrollCarousel(1)} style={{
                position:'absolute', right:0, top:'50%', transform:'translateY(-60%)',
                zIndex:3, background:'transparent', border:'none', cursor:'pointer',
                color:'#F0D060', fontSize:'1.6rem', lineHeight:1, padding:'0 4px',
                textShadow:'0 0 10px rgba(240,208,96,0.9)',
              }}>›</button>
            </>
          )}

          {/* Scrollable row */}
          <div className="species-selector" ref={carouselRef} onScroll={checkScroll}>
            {SPECIES.map(sp => {
              const isSelected = selectedSpecies?.id === sp.id;
              return sp.isOther ? (
                <div key={sp.id}
                  onClick={() => { setSelectedSpecies(sp); setSpecificData({}); setSubTab('specific'); }}
                  style={{
                    flexShrink: 0, width: 100, height: 100,
                    border: isSelected ? '2px solid #D4AF37' : '1px dashed rgba(212,175,55,0.35)',
                    borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 5, background: isSelected ? 'rgba(212,175,55,0.1)' : 'rgba(30,10,53,0.9)',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 12px rgba(212,175,55,0.4)' : 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  <PlusCircle size={24} color="var(--aura-gold)" strokeWidth={1.5} />
                  <span style={{ fontSize:'0.48rem', letterSpacing:'1px', color:'#F0D060', textTransform:'uppercase', textAlign:'center', lineHeight:1.2, padding:'0 6px', fontWeight:700, textShadow:'0 0 8px rgba(240,208,96,0.5)' }}>
                    {locale === 'es' ? 'OTRA' : 'OTHER'}
                  </span>
                </div>
              ) : (
                <div key={sp.id}
                  className={`species-card${isSelected ? ' selected' : ''}`}
                  onClick={() => {
                    setSelectedSpecies(sp);
                    setSpecificData({});
                    const hasSpecific = ['horse','bird'].includes(sp.id);
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

          {/* Dot indicators */}
          <div style={{ display:'flex', justifyContent:'center', gap:'6px', marginTop:'0.8rem' }}>
            {SPECIES.map((_, i) => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(212,175,55,0.3)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
        </div>

        {selectedSpecies && (
          <p style={{ margin:'0.8rem 0 0', fontSize:'0.72rem', letterSpacing:'2px', color:'#F0D060', textTransform:'uppercase', textAlign:'center', textShadow:'0 0 10px rgba(240,208,96,0.5)' }}>
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
                    width:96, height:96, borderRadius:'12px', overflow:'hidden',
                    border: basicData.customPhoto ? '2px solid #D4AF37' : '1px dashed rgba(212,175,55,0.4)',
                    background:'rgba(30,10,53,0.6)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'border-color 0.3s, box-shadow 0.3s',
                    boxShadow: basicData.customPhoto ? '0 0 12px rgba(212,175,55,0.35)' : 'none',
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
                    <FieldWrap filled={!!basicData.name}>
                      <input className="aura-input"
                        placeholder={locale==='es'?'Nombre de tu mascota':"Your pet's name"}
                        value={basicData.name}
                        onChange={e => setBasicData({...basicData, name:e.target.value})} />
                    </FieldWrap>
                  </div>
                  <div className="form-group">
                    <label className="input-label">{locale==='es'?'Raza / Variedad':'Breed / Variety'}</label>
                    <FieldWrap filled={!!basicData.breed}>
                      <input className="aura-input"
                        placeholder={locale==='es'?'Ej: Golden Retriever':'E.g: Golden Retriever'}
                        value={basicData.breed || ''}
                        onChange={e => setBasicData({...basicData, breed:e.target.value})} />
                    </FieldWrap>
                  </div>
                </div>
              </div>

              {/* ── Metrics row ── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.8rem' }}>
                <div className="form-group">
                  <label className="input-label">{locale==='es'?'Edad':'Age'}</label>
                  <FieldWrap filled={!!basicData.age}>
                    <input className="aura-input" placeholder={locale==='es'?'Años':'Years'}
                      value={basicData.age} onChange={e => setBasicData({...basicData, age:e.target.value})} />
                  </FieldWrap>
                </div>
                <div className="form-group">
                  <label className="input-label">{locale==='es'?'Peso':'Weight'}</label>
                  <FieldWrap filled={!!basicData.weight}>
                    <input className="aura-input" placeholder="kg"
                      value={basicData.weight} onChange={e => setBasicData({...basicData, weight:e.target.value})} />
                  </FieldWrap>
                </div>
                <div className="form-group">
                  <label className="input-label">Microchip</label>
                  <FieldWrap filled={!!basicData.microchip}>
                    <input className="aura-input" placeholder="900XXXXXXXXX"
                      value={basicData.microchip} onChange={e => setBasicData({...basicData, microchip:e.target.value})} />
                  </FieldWrap>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="specific" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }}>
              {selectedSpecies?.id === 'horse'  && <HorseFields  data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'exotic' && <ExoticFields data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'bird'   && <BirdFields   data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'other'  && <OtherFields  data={specificData} onChange={setSpecificData} locale={locale} />}
              {(!selectedSpecies || ['dog','cat','rabbit'].includes(selectedSpecies?.id)) && (
                <p style={{ color:'var(--aura-text-muted)', textAlign:'center', padding:'2rem 0', fontSize:'0.85rem' }}>
                  {locale==='es'
                    ? 'Selecciona Caballo, Ave u Otro para ver campos específicos.'
                    : 'Select Horse, Bird or Other for species-specific fields.'}
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

      {/* ── Footer de marca ── */}
      <p style={{ textAlign:'center', fontSize:'0.58rem', letterSpacing:'1.5px', color:'var(--aura-text-muted)', margin:'0 0 1rem', opacity:0.6 }}>
        AURA PETS GLOBAL · EXPEDIENTE MÉDICO DIGITAL
      </p>

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
