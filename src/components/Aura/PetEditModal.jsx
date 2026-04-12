import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';

const TABS = (es) => [
  { id: 'profile', label: es ? 'Perfil'           : 'Profile'    },
  { id: 'health',  label: es ? 'Documentación'    : 'Health Docs' },
];

const STATUS_OPTS = (es) => [
  { value: 'ok',      label: es ? '✓ Completado' : '✓ Completed' },
  { value: 'pending', label: es ? '⏳ Pendiente' : '⏳ Pending'  },
];

/* ─── helpers ─── */
const Field = ({ label, children }) => (
  <div className="form-group">
    <label className="input-label">{label}</label>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <p style={{ fontSize:'0.65rem', letterSpacing:'3px', color:'var(--aura-text-muted)',
    textTransform:'uppercase', margin:'1.8rem 0 1rem', borderTop:'1px solid var(--aura-border)',
    paddingTop:'1.4rem' }}>
    {children}
  </p>
);

/* ════════════════════════════════════════════
   PetEditModal
   Props: pet, onSave(updatedPet), onDelete(), onClose
════════════════════════════════════════════ */
const PetEditModal = ({ pet, onSave, onDelete, onClose }) => {
  const { locale } = useTranslation();
  const es = locale === 'es';

  /* ── form state mirrors pet shape ── */
  const [tab, setTab]         = useState('profile');
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* Profile fields */
  const [name,      setName]      = useState(pet.name      || '');
  const [age,       setAge]       = useState(pet.age       || '');
  const [weight,    setWeight]    = useState(pet.weight    || '');
  const [microchip, setMicrochip] = useState(pet.microchip || '');
  const [photo,     setPhoto]     = useState(pet.customImage || null);

  /* Health / documentation fields */
  const h = pet.health || {};
  const rv = h.rabiesVaccine    || {};
  const ep = h.europeanPassport || {};
  const hc = h.healthCert       || {};

  const [rabiesDate,   setRabiesDate]   = useState(rv.date   || '');
  const [rabiesExpiry, setRabiesExpiry] = useState(rv.expiry || '');
  const [rabiesStatus, setRabiesStatus] = useState(rv.status || 'pending');

  const [euNumber,  setEuNumber]  = useState(ep.number || '');
  const [euStatus,  setEuStatus]  = useState(ep.status || 'pending');

  const [certStatus, setCertStatus] = useState(hc.status || 'pending');
  const [certNotes,  setCertNotes]  = useState(hc.notes  || '');

  /* REGA (horse only) */
  const [rega, setRega] = useState(pet.specific?.rega || '');

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated = {
      ...pet,
      name: name.trim() || pet.name,
      age, weight, microchip,
      customImage: photo,
      specific: {
        ...pet.specific,
        ...(pet.species === 'horse' ? { rega } : {}),
      },
      health: {
        rabiesVaccine:    { date: rabiesDate, expiry: rabiesExpiry, status: rabiesStatus },
        europeanPassport: { number: euNumber,  status: euStatus  },
        healthCert:       { status: certStatus, notes: certNotes  },
      },
    };
    onSave(updated);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.88)',
        backdropFilter:'blur(14px)', zIndex:2000,
        display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem',
      }}
    >
      <motion.div
        initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }}
        exit={{ scale:0.95, opacity:0 }}
        transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}
        className="aura-card"
        onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', padding:'2.5rem' }}
      >
        {/* ── Header ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
          <div>
            <h2 style={{ fontSize:'1.6rem', margin:0 }}>{es?'Editar Perfil':'Edit Profile'}</h2>
            <p style={{ margin:'4px 0 0', fontSize:'0.7rem', letterSpacing:'2px', color:'var(--aura-text-muted)' }}>
              {pet.name?.toUpperCase()}
            </p>
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'1px solid var(--aura-border)', color:'var(--aura-text-muted)',
              cursor:'pointer', padding:'0.5rem', borderRadius:4 }}>
            <X size={16} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="aura-tabs" style={{ marginBottom:'1.8rem' }}>
          {TABS(es).map(t => (
            <button key={t.id} className={`aura-tab${tab===t.id?' active':''}`}
              onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ════════ PROFILE TAB ════════ */}
        {tab === 'profile' && (
          <div>
            {/* Photo */}
            <div className="form-group" style={{ display:'flex', alignItems:'center', gap:'1.4rem' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden',
                border:'2px solid var(--aura-gold)', flexShrink:0,
                background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {photo
                  ? <img src={photo} alt={pet.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize:'2rem' }}>{pet.avatar || '🐾'}</span>}
              </div>
              <div>
                <p style={{ margin:'0 0 0.6rem', fontSize:'0.72rem', color:'var(--aura-text-muted)' }}>
                  {es?'Foto de perfil':'Profile photo'}
                </p>
                <label style={{ cursor:'pointer' }}>
                  <span className="btn-aura" style={{ padding:'0.5rem 1.2rem', fontSize:'0.65rem',
                    display:'inline-flex', alignItems:'center', gap:'0.5rem' }}>
                    <Upload size={13} />{es?'Cambiar foto':'Change photo'}
                  </span>
                  <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
                </label>
              </div>
            </div>

            <Field label={es?'Nombre de la Mascota *':'Pet Name *'}>
              <input className="aura-input" value={name}
                onChange={e => setName(e.target.value)}
                placeholder={es?'Nombre...':'Name...'} />
            </Field>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <Field label={es?'Edad':'Age'}>
                <input className="aura-input" value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder={es?'Años':'Years'} />
              </Field>
              <Field label={es?'Peso (kg)':'Weight (kg)'}>
                <input type="number" step="0.1" className="aura-input" value={weight}
                  onChange={e => setWeight(e.target.value)} placeholder="kg" />
              </Field>
            </div>

            <Field label="Microchip ID">
              <input className="aura-input" value={microchip}
                onChange={e => setMicrochip(e.target.value)}
                placeholder="900XXXXXXXXXXXX" />
            </Field>
          </div>
        )}

        {/* ════════ HEALTH / DOCS TAB ════════ */}
        {tab === 'health' && (
          <div>
            {/* ─ Vacuna Antirrábica ─ */}
            <SectionTitle>{es?'Vacuna Antirrábica':'Rabies Vaccine'}</SectionTitle>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <Field label={es?'Fecha de Aplicación':'Application Date'}>
                <input type="date" className="aura-input" value={rabiesDate}
                  onChange={e => setRabiesDate(e.target.value)} />
              </Field>
              <Field label={es?'Fecha de Vencimiento':'Expiry Date'}>
                <input type="date" className="aura-input" value={rabiesExpiry}
                  onChange={e => setRabiesExpiry(e.target.value)} />
              </Field>
            </div>
            <Field label={es?'Estado':'Status'}>
              <select className="aura-input aura-select" value={rabiesStatus}
                onChange={e => setRabiesStatus(e.target.value)}>
                {STATUS_OPTS(es).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            {/* ─ Pasaporte Europeo ─ */}
            <SectionTitle>{es?'Pasaporte Europeo EU':'European Passport EU'}</SectionTitle>
            <Field label={es?'Número de Pasaporte':'Passport Number'}>
              <input className="aura-input" value={euNumber}
                onChange={e => setEuNumber(e.target.value)}
                placeholder="ES-2024-XXXX" />
            </Field>
            <Field label={es?'Estado':'Status'}>
              <select className="aura-input aura-select" value={euStatus}
                onChange={e => setEuStatus(e.target.value)}>
                {STATUS_OPTS(es).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            {/* ─ Certificado Sanitario ─ */}
            <SectionTitle>{es?'Certificado Sanitario':'Health Certificate'}</SectionTitle>
            <Field label={es?'Estado':'Status'}>
              <select className="aura-input aura-select" value={certStatus}
                onChange={e => setCertStatus(e.target.value)}>
                {STATUS_OPTS(es).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label={es?'Notas del Veterinario (opcional)':'Vet Notes (optional)'}>
              <textarea className="aura-input" rows={3} style={{ resize:'vertical', minHeight:70 }}
                value={certNotes} onChange={e => setCertNotes(e.target.value)}
                placeholder={es?'Observaciones...':'Observations...'} />
            </Field>

            {/* ─ REGA (horse only) ─ */}
            {pet.species === 'horse' && (
              <>
                <SectionTitle>{es?'Pasaporte REGA (España)':'REGA Passport (Spain)'}</SectionTitle>
                <Field label={es?'Número REGA':'REGA Number'}>
                  <input className="aura-input" value={rega}
                    onChange={e => setRega(e.target.value)}
                    placeholder="ES-XXX-XXXX" />
                </Field>
              </>
            )}
          </div>
        )}

        {/* ── Save button ── */}
        <button className="btn-aura btn-full"
          style={{ marginTop:'2rem', borderColor: name ? 'var(--aura-gold)' : 'var(--aura-border)', opacity: name ? 1 : 0.4 }}
          disabled={!name}
          onClick={handleSave}>
          {es?'GUARDAR CAMBIOS':'SAVE CHANGES'}
        </button>

        {/* ════════ DANGER ZONE ════════ */}
        <div style={{ marginTop:'2.5rem', paddingTop:'1.8rem', borderTop:'1px solid rgba(255,0,122,0.2)' }}>
          <p style={{ fontSize:'0.65rem', letterSpacing:'3px', color:'var(--aura-neon-pink)',
            textTransform:'uppercase', margin:'0 0 1rem' }}>
            {es?'Zona de Peligro':'Danger Zone'}
          </p>

          {!confirmDelete ? (
            <button className="btn-aura"
              style={{ width:'100%', borderColor:'var(--aura-neon-pink)', color:'var(--aura-neon-pink)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem' }}
              onClick={() => setConfirmDelete(true)}>
              <Trash2 size={15} />
              {es?'ELIMINAR MASCOTA':'DELETE PET'}
            </button>
          ) : (
            <motion.div
              initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              style={{ background:'rgba(255,0,122,0.06)', border:'1px solid rgba(255,0,122,0.3)',
                borderRadius:4, padding:'1.4rem' }}>
              <p style={{ margin:'0 0 0.6rem', fontWeight:600, fontSize:'0.9rem', color:'var(--aura-neon-pink)' }}>
                {es?`¿Eliminar a ${pet.name}?`:`Delete ${pet.name}?`}
              </p>
              <p style={{ margin:'0 0 1.2rem', fontSize:'0.78rem', color:'var(--aura-text-muted)', lineHeight:1.6 }}>
                {es
                  ? 'Esta acción es irreversible. Todo el historial médico y documentación de esta mascota será eliminado permanentemente.'
                  : 'This action cannot be undone. All medical history and documentation for this pet will be permanently deleted.'}
              </p>
              <div style={{ display:'flex', gap:'0.8rem' }}>
                <button className="btn-aura" style={{ flex:1 }}
                  onClick={() => setConfirmDelete(false)}>
                  {es?'CANCELAR':'CANCEL'}
                </button>
                <button className="btn-aura"
                  style={{ flex:2, background:'rgba(255,0,122,0.15)', borderColor:'var(--aura-neon-pink)',
                    color:'var(--aura-neon-pink)', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}
                  onClick={() => { onDelete(pet.id); onClose(); }}>
                  <Trash2 size={14} />
                  {es?'CONFIRMAR ELIMINACIÓN':'CONFIRM DELETION'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
};

export default PetEditModal;
