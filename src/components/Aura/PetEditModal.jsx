import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, HeartHandshake, Download, ShieldOff, Search, Leaf, Clipboard } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';
import { readImageAsDataURL } from '../../utils/imageUpload';
import jsPDF from 'jspdf';

const TABS = (es) => [
  { id: 'profile', label: es ? 'Perfil'        : 'Profile'    },
  { id: 'health',  label: es ? 'Documentación' : 'Health Docs' },
];

const STATUS_OPTS = (es) => [
  { value: 'ok',      label: es ? '✓ Completado' : '✓ Completed' },
  { value: 'pending', label: es ? '⏳ Pendiente' : '⏳ Pending'  },
];

const REASONS = (es) => [
  { id: 'lost',     Icon: Search,      label: es ? 'Extravío'          : 'Lost / Missing',        note: es ? 'El miembro no ha sido localizado.' : 'The member could not be located.' },
  { id: 'deceased', Icon: Leaf,        label: es ? 'Fallecimiento'     : 'Passing Away',           note: es ? 'Descansa en paz. El expediente puede conservarse.' : 'Rest in peace. Records can be preserved.' },
  { id: 'leave',    Icon: Clipboard,   label: es ? 'Baja del Servicio' : 'Service Cancellation',   note: es ? 'Alta voluntaria del sistema AURA.' : 'Voluntary removal from AURA.' },
];

const CONFIRM_KEYWORD = 'BAJA';

/* ── Memorial PDF ── */
const generateMemorialPDF = (pet, t, locale, unidadPeso) => {
  const doc  = new jsPDF('p', 'mm', 'a4');
  const W    = 210;
  const date = new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB');

  // ─ Gold header ─
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, W, 30, 'F');
  doc.setTextColor(10, 10, 15);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text(t('memorialPdf.header'), W / 2, 13, { align: 'center' });
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text(`${t('memorialPdf.inMemoriam')} · ${date}`, W / 2, 21, { align: 'center' });

  // ─ Pet name ─
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 30, W, 270, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(30); doc.setFont('helvetica', 'bold');
  doc.text(pet.name || t('common.noName'), W / 2, 60, { align: 'center' });
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text((pet.speciesLabel || pet.species || '').toUpperCase(), W / 2, 70, { align: 'center' });

  // ─ Divider ─
  doc.setDrawColor(212, 175, 55); doc.setLineWidth(0.4);
  doc.line(20, 77, W - 20, 77);

  // ─ Bio fields ─
  let y = 90;
  const rows = [
    [t('memorialPdf.fName'),      pet.name         || '—'],
    [t('memorialPdf.fSpecies'),   pet.speciesLabel || pet.species || '—'],
    [t('memorialPdf.fBreed'),     pet.breed        || '—'],
    [t('memorialPdf.fAge'),       pet.age    ? t('memorialPdf.ageYears', { n: pet.age }) : '—'],
    [t('memorialPdf.fWeight'),    pet.weight ? `${pet.weight} ${unidadPeso}` : '—'],
    [t('memorialPdf.fMicrochip'), pet.microchip    || '—'],
  ];
  for (const [label, value] of rows) {
    doc.setTextColor(120, 120, 120); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), 22, y);
    doc.setTextColor(230, 230, 230); doc.setFont('helvetica', 'bold');
    doc.text(value, 80, y);
    y += 9;
  }

  // ─ Health section ─
  y += 4;
  doc.setFillColor(25, 25, 35);
  doc.rect(20, y - 4, W - 40, 8, 'F');
  doc.setTextColor(212, 175, 55); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
  doc.text(t('memorialPdf.sectionHealth'), 25, y + 1);
  y += 12;

  const h  = pet.health          || {};
  const rv = h.rabiesVaccine     || {};
  const ep = h.europeanPassport  || {};
  const hRows = [
    [t('memorialPdf.rabies'),       rv.status === 'ok' ? `${t('memorialPdf.completed')} · ${rv.date || ''}` : t('memorialPdf.pending')],
    [t('memorialPdf.rabiesExpiry'), rv.expiry || '—'],
    [t('memorialPdf.euPassport'),   ep.status === 'ok' ? t('memorialPdf.passportNo', { n: ep.number || '—' }) : t('memorialPdf.pending')],
  ];
  for (const [label, value] of hRows) {
    doc.setTextColor(120, 120, 120); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(label, 22, y);
    doc.setTextColor(200, 200, 200); doc.setFont('helvetica', 'bold');
    doc.text(value, 100, y);
    y += 9;
  }

  // ─ Memorial quote ─
  y += 10;
  doc.setDrawColor(212, 175, 55); doc.line(30, y, W - 30, y);
  y += 12;
  doc.setTextColor(170, 150, 100); doc.setFontSize(10); doc.setFont('helvetica', 'italic');
  doc.text(t('memorialPdf.quote'), W / 2, y, { align: 'center' });

  // ─ Footer ─
  doc.setFillColor(5, 5, 10);
  doc.rect(0, 272, W, 25, 'F');
  doc.setTextColor(80, 80, 80); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text(t('memorialPdf.footer'), W / 2, 281, { align: 'center' });
  doc.text(t('memorialPdf.generated', { fecha: date }), W / 2, 288, { align: 'center' });

  const nombre = (pet.name || t('memorialPdf.fallbackPet')).replace(/\s+/g, '_');
  doc.save(`${t('memorialPdf.fileName')}_${nombre}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/* ════════════════════════════════════════════════════
   DeregistrationModal — 4-step deregistration flow
   Steps:
     1 — choose reason
     2 — (deceased only) memorial PDF offer
     3 — final confirmation (type BAJA)
     4 — done / success
════════════════════════════════════════════════════ */
const DeregistrationModal = ({ pet, onConfirm, onCancel }) => {
  const { locale, t, units } = useTranslation();
  const es = locale === 'es';
  const [step,     setStep]    = useState(1);
  const [reason,   setReason]  = useState(null);
  const [typed,    setTyped]   = useState('');
  const reasons = REASONS(es);

  const proceed = () => {
    if (reason?.id === 'deceased') { setStep(2); return; }
    /* Lost: non-destructive — mark BUSCANDO without data deletion */
    if (reason?.id === 'lost') {
      setStep(4);
      setTimeout(() => onConfirm(pet.id, 'lost'), 1500);
      return;
    }
    setStep(3);
  };

  const confirm = () => {
    setStep(4);
    setTimeout(() => onConfirm(pet.id, reason?.id), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(42, 45, 124, 0.42)', backdropFilter: 'blur(18px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}
      onClick={step < 4 ? onCancel : undefined}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="aura-card"
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, padding: '2.8rem' }}
      >

        <AnimatePresence mode="wait">

          {/* ── Step 1: Choose reason ── */}
          {step === 1 && (
            <motion.div key="s1"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: '1px solid rgba(217, 164, 65, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.4rem',
                }}>
                  <HeartHandshake size={26} color="var(--aura-gold)" />
                </div>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.6rem' }}>
                  {es ? 'Dar de Baja al Miembro' : 'Deregister Member'}
                </h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--aura-text-muted)', lineHeight: 1.7 }}>
                  {es
                    ? `Lamentamos que ${pet.name} deba abandonar AURA. Por favor, indícanos el motivo para gestionar el proceso con el cuidado que merece.`
                    : `We're sorry ${pet.name} must leave AURA. Please tell us the reason so we can manage this process with the care it deserves.`}
                </p>
              </div>

              <div style={{ display: 'grid', gap: '0.8rem', marginBottom: '2rem' }}>
                {reasons.map(({ id, Icon, label, note }) => (
                  <button key={id} type="button"
                    onClick={() => setReason({ id, label })}
                    style={{
                      background: reason?.id === id ? 'rgba(217, 164, 65, 0.08)' : '#FFFFFF',
                      border: `1px solid ${reason?.id === id ? 'var(--aura-gold)' : 'var(--aura-border)'}`,
                      borderRadius: 4, padding: '1.1rem 1.3rem',
                      cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'flex-start', gap: '1rem',
                      transition: 'all 0.2s',
                    }}>
                    <Icon size={18} color={reason?.id === id ? 'var(--aura-gold)' : 'var(--aura-text-muted)'} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: 600,
                        color: reason?.id === id ? 'var(--gold-ink)' : 'var(--aura-text)' }}>
                        {label}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--aura-text-muted)' }}>{note}</p>
                    </div>
                  </button>
                ))}
              </div>

              <p style={{ margin: '0 0 1.5rem', fontSize: '0.7rem', color: 'var(--aura-text-muted)', textAlign: 'center' }}>
                {es ? 'El motivo es opcional y no afecta al proceso.' : 'The reason is optional and does not affect the process.'}
              </p>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button className="btn-aura btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
                  {es ? 'CANCELAR' : 'CANCEL'}
                </button>
                <button className="btn-aura"
                  style={{ flex: 2 }}
                  onClick={proceed}>
                  {es ? 'CONTINUAR' : 'CONTINUE'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Memorial PDF (deceased only) ── */}
          {step === 2 && (
            <motion.div key="s2"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: '1px solid rgba(67, 191, 199, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.4rem',
                }}>
                  <Download size={24} color="var(--aura-neon-cyan)" />
                </div>
                <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.6rem' }}>
                  {es ? `Expediente de Recuerdo` : `Memorial Record`}
                </h2>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--aura-text-muted)', lineHeight: 1.8 }}>
                  {es
                    ? `Antes de cerrar el expediente de ${pet.name}, puedes descargar un documento de recuerdo con todo su historial médico y su ficha completa. Este archivo quedará guardado en tu dispositivo.`
                    : `Before closing ${pet.name}'s record, you can download a memorial document with the full health history and profile. This file will be saved to your device.`}
                </p>
              </div>

              <div style={{
                background: 'rgba(67, 191, 199, 0.04)', border: '1px solid rgba(67, 191, 199, 0.2)',
                borderRadius: 4, padding: '1.4rem', marginBottom: '2rem', textAlign: 'center',
              }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--cyan-ink)', textTransform: 'uppercase' }}>
                  {es ? 'Contenido del expediente' : 'Record contents'}
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--aura-text-muted)', lineHeight: 1.7 }}>
                  {es
                    ? `Ficha del animal · Historial de vacunas · Microchip · Pasaporte sanitario`
                    : `Animal profile · Vaccination history · Microchip · Health passport`}
                </p>
              </div>

              <div style={{ display: 'grid', gap: '0.8rem' }}>
                <button className="btn-aura"
                  style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                  onClick={() => { generateMemorialPDF(pet, t, locale, units); setStep(3); }}>
                  <Download size={16} />
                  {es ? 'DESCARGAR EXPEDIENTE DE RECUERDO' : 'DOWNLOAD MEMORIAL RECORD'}
                </button>
                <button className="btn-aura btn-ghost"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setStep(3)}>
                  {es ? 'Continuar sin descargar' : 'Continue without downloading'}
                </button>
                <button className="btn-aura btn-ghost" onClick={onCancel}>
                  {es ? 'CANCELAR' : 'CANCEL'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Final irreversible confirmation ── */}
          {step === 3 && (
            <motion.div key="s3"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: '1px solid rgba(236, 92, 141, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.4rem',
                  background: 'rgba(236, 92, 141, 0.06)',
                }}>
                  <ShieldOff size={24} color="var(--aura-neon-pink)" />
                </div>
                <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.6rem', color: 'var(--pink-ink)' }}>
                  {es ? 'Destrucción Permanente de Datos' : 'Permanent Data Destruction'}
                </h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--aura-text-muted)', lineHeight: 1.7 }}>
                  {es
                    ? `Todo el historial clínico, la ficha y los pasaportes de ${pet.name} serán eliminados de la bóveda de forma permanente e irreversible.`
                    : `All clinical history, profile data and passports for ${pet.name} will be permanently and irreversibly deleted from the vault.`}
                </p>
              </div>

              <div style={{
                background: 'rgba(236, 92, 141, 0.04)', border: '1px dashed rgba(236, 92, 141, 0.3)',
                borderRadius: 4, padding: '1.2rem', marginBottom: '1.6rem',
              }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.65rem', letterSpacing: '2px',
                  color: 'var(--pink-ink)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {es ? 'Datos que serán eliminados' : 'Data to be deleted'}
                </p>
                {[
                  es ? '✗ Perfil e identificación' : '✗ Profile & identification',
                  es ? '✗ Historial médico completo' : '✗ Full medical history',
                  es ? '✗ Vacunas y certificados' : '✗ Vaccines & certificates',
                  es ? '✗ Pasaporte sanitario global' : '✗ Global health passport',
                  es ? '✗ Contactos de emergencia' : '✗ Emergency contacts',
                ].map(item => (
                  <p key={item} style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--aura-text-muted)' }}>{item}</p>
                ))}
              </div>

              <div style={{ marginBottom: '1.6rem' }}>
                <p style={{ margin: '0 0 0.7rem', fontSize: '0.72rem', color: 'var(--aura-text-muted)', letterSpacing: '0.5px' }}>
                  {es
                    ? <>Para confirmar, escribe <strong style={{ color: 'var(--pink-ink)' }}>BAJA</strong> en el campo siguiente:</>
                    : <>To confirm, type <strong style={{ color: 'var(--pink-ink)' }}>BAJA</strong> in the field below:</>}
                </p>
                <input
                  className="aura-input"
                  value={typed}
                  onChange={e => setTyped(e.target.value.toUpperCase())}
                  placeholder={es ? 'Escribe BAJA para confirmar' : 'Type BAJA to confirm'}
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1rem',
                    borderColor: typed === CONFIRM_KEYWORD ? 'var(--aura-neon-pink)' : 'var(--aura-border)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button className="btn-aura btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
                  {es ? 'CANCELAR' : 'CANCEL'}
                </button>
                <button className="btn-aura btn-ghost"
                  disabled={typed !== CONFIRM_KEYWORD}
                  style={{
                    flex: 2,
                    '--btn-accent': 'var(--danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                  onClick={confirm}>
                  <Trash2 size={15} />
                  {es ? 'DAR DE BAJA DEFINITIVAMENTE' : 'PERMANENTLY DEREGISTER'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Success / done ── */}
          {step === 4 && (
            <motion.div key="s4"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '1rem 0' }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 1, duration: 0.6 }}
                style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
                {reason?.id === 'lost' ? '🔍' : '🕊'}
              </motion.div>
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 1rem', color: reason?.id === 'lost' ? 'var(--gold-ink)' : 'var(--cyan-ink)' }}>
                {reason?.id === 'lost'
                  ? (es ? 'Estado: BUSCANDO' : 'Status: MISSING')
                  : (es ? 'Expediente Cerrado' : 'Record Closed')}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--aura-text-muted)', lineHeight: 1.8, margin: 0 }}>
                {reason?.id === 'lost'
                  ? (es
                      ? `El expediente de ${pet.name} permanece activo. El código QR de emergencia ha sido activado en el Panel de Control.`
                      : `${pet.name}'s record remains active. The emergency QR code has been activated in the Dashboard.`)
                  : (es
                      ? `Los datos de ${pet.name} han sido eliminados de la bóveda de forma permanente y segura.`
                      : `${pet.name}'s data has been permanently and securely deleted from the vault.`)}
              </p>
              {reason?.id === 'deceased' && (
                <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--gold-ink)', fontStyle: 'italic' }}>
                  {es ? '"Guardado en el corazón, recordado para siempre."' : '"Kept in the heart, remembered forever."'}
                </p>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

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
  const { locale, t, units } = useTranslation();
  const es = locale === 'es';

  const [tab, setTab]                       = useState('profile');
  const [showDeregistration, setShowDeregistration] = useState(false);

  /* Profile fields */
  const [name,      setName]      = useState(pet.name      || '');
  const [age,       setAge]       = useState(pet.age       || '');
  const [birthDate, setBirthDate] = useState(pet.birthDate || pet.specific?.birthDate || '');
  const [weight,    setWeight]    = useState(pet.weight    || '');
  const [microchip, setMicrochip] = useState(pet.microchip || '');
  const [photo,     setPhoto]     = useState(pet.customImage || null);

  /* Health / documentation fields — single object */
  const h  = pet.health            || {};
  const rv = h.rabiesVaccine       || {};
  const ep = h.europeanPassport    || {};
  const hc = h.healthCert          || {};

  const [health, setHealth] = useState({
    rabiesDate:   rv.date           || '',
    rabiesExpiry: rv.expiry         || '',
    rabiesStatus: rv.status         || 'pending',
    euNumber:     ep.number         || '',
    euStatus:     ep.status         || 'pending',
    certStatus:   hc.status         || 'pending',
    certNotes:    hc.notes          || '',
    rega:         pet.specific?.rega || '',
  });

  const setH = (field) => (e) => setHealth(prev => ({ ...prev, [field]: e.target.value }));

  const handlePhoto = (e) => readImageAsDataURL(e.target.files?.[0], setPhoto);

  const handleSave = () => {
    const updated = {
      ...pet,
      name: name.trim() || pet.name,
      age: (() => {
        /* La edad en años se recalcula desde la fecha, que es el dato que
           deciden los requisitos de entrada. Si no hay fecha, se respeta lo
           que hubiera escrito antes. */
        if (!birthDate) return age;
        const n = new Date(birthDate);
        if (Number.isNaN(n.getTime())) return age;
        const hoy = new Date();
        let años = hoy.getFullYear() - n.getFullYear();
        const m = hoy.getMonth() - n.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) años -= 1;
        return años >= 0 ? String(años) : age;
      })(),
      birthDate,
      weight, microchip,
      customImage: photo,
      specific: {
        ...pet.specific,
        ...(pet.species === 'horse' ? { rega: health.rega } : {}),
      },
      // Se conserva todo lo que esta pantalla no edita. Antes se reconstruía
      // el objeto desde cero, así que al guardar aquí se destruían los datos
      // que se habían introducido en el Pasaporte Global: el número de lote de
      // la antirrábica, el certificado sanitario y el pasaporte físico entero.
      health: {
        ...pet.health,
        rabiesVaccine: {
          ...pet.health?.rabiesVaccine,
          date:   health.rabiesDate,
          expiry: health.rabiesExpiry,
          status: health.rabiesStatus,
        },
        europeanPassport: {
          ...pet.health?.europeanPassport,
          number: health.euNumber,
          status: health.euStatus,
        },
        healthCert: {
          ...pet.health?.healthCert,
          status: health.certStatus,
          notes:  health.certNotes,
        },
      },
    };
    onSave(updated);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position:'fixed', inset:0, background:'rgba(42, 45, 124, 0.42)',
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
                  background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
                <Field label={es?'Fecha de nacimiento':'Date of birth'}>
                  <input type="date" className="aura-input" value={birthDate}
                    max={new Date().toISOString().slice(0,10)}
                    onChange={e => setBirthDate(e.target.value)} />
                </Field>
                <Field label={es?'Peso (kg)':'Weight (kg)'}>
                  <input type="number" step="0.1" className="aura-input" value={weight}
                    onChange={e => setWeight(e.target.value)} placeholder={units} />
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
                  <input type="date" className="aura-input" value={health.rabiesDate}
                    onChange={setH('rabiesDate')} />
                </Field>
                <Field label={es?'Fecha de Vencimiento':'Expiry Date'}>
                  <input type="date" className="aura-input" value={health.rabiesExpiry}
                    onChange={setH('rabiesExpiry')} />
                </Field>
              </div>
              <Field label={es?'Estado':'Status'}>
                <select className="aura-input aura-select" value={health.rabiesStatus}
                  onChange={setH('rabiesStatus')}>
                  {STATUS_OPTS(es).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              {/* ─ Pasaporte Europeo ─ */}
              <SectionTitle>{es?'Pasaporte Europeo EU':'European Passport EU'}</SectionTitle>
              <Field label={es?'Número de Pasaporte':'Passport Number'}>
                <input className="aura-input" value={health.euNumber}
                  onChange={setH('euNumber')}
                  placeholder="ES-2024-XXXX" />
              </Field>
              <Field label={es?'Estado':'Status'}>
                <select className="aura-input aura-select" value={health.euStatus}
                  onChange={setH('euStatus')}>
                  {STATUS_OPTS(es).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              {/* ─ Certificado Sanitario ─ */}
              <SectionTitle>{es?'Certificado Sanitario':'Health Certificate'}</SectionTitle>
              <Field label={es?'Estado':'Status'}>
                <select className="aura-input aura-select" value={health.certStatus}
                  onChange={setH('certStatus')}>
                  {STATUS_OPTS(es).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label={es?'Notas del Veterinario (opcional)':'Vet Notes (optional)'}>
                <textarea className="aura-input" rows={3} style={{ resize:'vertical', minHeight:70 }}
                  value={health.certNotes} onChange={setH('certNotes')}
                  placeholder={es?'Observaciones...':'Observations...'} />
              </Field>

              {/* ─ REGA (horse only) ─ */}
              {pet.species === 'horse' && (
                <>
                  <SectionTitle>{es?'Pasaporte REGA (España)':'REGA Passport (Spain)'}</SectionTitle>
                  <Field label={es?'Número REGA':'REGA Number'}>
                    <input className="aura-input" value={health.rega}
                      onChange={setH('rega')}
                      placeholder="ES-XXX-XXXX" />
                  </Field>
                </>
              )}
            </div>
          )}

          {/* ── Save button ── */}
          <button className="btn-aura btn-full"
            style={{ marginTop:'2rem' }}
            disabled={!name}
            onClick={handleSave}>
            {es?'GUARDAR CAMBIOS':'SAVE CHANGES'}
          </button>

          {/* ── Deregistration zone ── */}
          <div style={{ marginTop:'2.5rem', paddingTop:'1.8rem', borderTop:'1px solid #FFFFFF' }}>
            <button
              type="button"
              style={{
                width: '100%', background: 'none',
                border: '1px solid #FFFFFF',
                color: 'var(--aura-text-muted)', cursor: 'pointer',
                padding: '0.9rem 1.2rem', borderRadius: 4,
                fontSize: '0.7rem', letterSpacing: '1.5px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(236, 92, 141, 0.35)'; e.currentTarget.style.color = 'var(--aura-neon-pink)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#FFFFFF'; e.currentTarget.style.color = 'var(--aura-text-muted)'; }}
              onClick={() => setShowDeregistration(true)}
            >
              <HeartHandshake size={14} />
              {es ? 'GESTIONAR ESTADO DEL MIEMBRO' : 'MANAGE MEMBER STATUS'}
            </button>
          </div>

        </motion.div>
      </motion.div>

      {/* ── Deregistration modal (rendered above edit modal) ── */}
      <AnimatePresence>
        {showDeregistration && (
          <DeregistrationModal
            pet={pet}
            onConfirm={(id, reasonId) => {
              if (reasonId === 'lost') {
                onSave({ ...pet, status: 'BUSCANDO' });
              } else {
                onDelete(id);
              }
              onClose();
            }}
            onCancel={() => setShowDeregistration(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PetEditModal;
