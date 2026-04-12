import React, { useState } from 'react';
import { Globe, PlaneTakeoff, CheckCircle2, AlertCircle, FileText, X, Shield, Syringe, Stethoscope, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/LocalizationContext';

/* ── Country data with full requirements ── */
const COUNTRIES = [
  {
    id: 'ES', name: 'España', code: 'ESP', flag: '🇪🇸', status: 'compliant',
    requirements: [
      { icon: 'chip',   label: 'Microchip ISO 11784/11785', status: 'ok',      detail: 'Verificado · 985XXXXXXXXXX' },
      { icon: 'syringe',label: 'Vacuna Antirrábica',        status: 'ok',      detail: 'Válida hasta Dic 2026' },
      { icon: 'doc',    label: 'Pasaporte Europeo EU',      status: 'ok',      detail: 'N.º ES-2024-XXXX — Firmado' },
      { icon: 'vet',    label: 'Certificado Sanitario',     status: 'pending', detail: 'Firma veterinaria pendiente' },
    ],
    readiness: 94,
    note: null,
  },
  {
    id: 'AU', name: 'Australia', code: 'AUS', flag: '🇦🇺', status: 'notice',
    requirements: [
      { icon: 'chip',   label: 'Microchip ISO 11784',       status: 'ok',      detail: 'Verificado' },
      { icon: 'syringe',label: 'Rabies Titre Test (RNATT)', status: 'pending', detail: 'Requiere análisis de Titer ≥0.5 IU/mL' },
      { icon: 'doc',    label: 'Import Permit (DAWE)',       status: 'pending', detail: 'Permiso de importación requerido' },
      { icon: 'vet',    label: 'Cuarentena (10 días)',       status: 'alert',   detail: 'Cuarentena obligatoria en instalación aprobada' },
    ],
    readiness: 48,
    note: 'Requiere Neutralisation Antibody Test (RNATT) y cuarentena aprobada.',
  },
  {
    id: 'UK', name: 'United Kingdom', code: 'GBR', flag: '🇬🇧', status: 'compliant',
    requirements: [
      { icon: 'chip',   label: 'Microchip ISO 11784',       status: 'ok',      detail: 'Verified' },
      { icon: 'syringe',label: 'Rabies Vaccination',        status: 'ok',      detail: 'Valid until Dec 2026' },
      { icon: 'doc',    label: 'Animal Health Certificate',  status: 'ok',      detail: 'AHC issued — APHA compliant' },
      { icon: 'vet',    label: 'Tapeworm Treatment (dogs)',  status: 'ok',      detail: 'Administered 1–5 days pre-entry' },
    ],
    readiness: 91,
    note: null,
  },
  {
    id: 'US', name: 'United States', code: 'USA', flag: '🇺🇸', status: 'compliant',
    requirements: [
      { icon: 'chip',   label: 'Microchip (recommended)',   status: 'ok',      detail: 'ISO 11784 — on record' },
      { icon: 'syringe',label: 'Rabies Certificate',        status: 'ok',      detail: 'Valid — USDA accredited vet' },
      { icon: 'doc',    label: 'CDC Health Certificate',    status: 'ok',      detail: 'Issued within 10 days of travel' },
      { icon: 'vet',    label: 'Screwworm Inspection',      status: 'ok',      detail: 'Required from specific origins' },
    ],
    readiness: 96,
    note: null,
  },
  {
    id: 'CA', name: 'Canada', code: 'CAN', flag: '🇨🇦', status: 'notice',
    requirements: [
      { icon: 'chip',   label: 'Microchip (recommended)',   status: 'ok',      detail: 'On record' },
      { icon: 'syringe',label: 'Rabies Vaccination',        status: 'ok',      detail: 'Valid certificate required' },
      { icon: 'doc',    label: 'CFIA Import Certificate',   status: 'pending', detail: 'Certificate d\'importation requis' },
      { icon: 'vet',    label: 'Tick Policy Update 2025',   status: 'alert',   detail: 'Recent regulatory update — verify origin country' },
    ],
    readiness: 72,
    note: 'Recent Tick Policy Update — verify with CFIA before travel.',
  },
];

/* ── Req icon helper ── */
const ReqIcon = ({ type, color }) => {
  const props = { size: 16, color };
  if (type === 'chip')   return <Shield {...props} />;
  if (type === 'syringe')return <Syringe {...props} />;
  if (type === 'vet')    return <Stethoscope {...props} />;
  return <FileCheck {...props} />;
};

const STATUS_COLOR = { ok: 'var(--aura-neon-cyan)', pending: 'var(--aura-gold)', alert: 'var(--aura-neon-pink)' };
const STATUS_LABEL = { ok: '✓ OK', pending: '⏳ PENDIENTE', alert: '⚠ ATENCIÓN' };

/* ── Country detail modal ── */
const CountryModal = ({ country, onClose }) => {
  if (!country) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="aura-card"
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.8rem' }}>
                <span style={{ fontSize:'2.5rem' }}>{country.flag}</span>
                <div>
                  <h2 style={{ fontSize:'1.8rem', margin:0 }}>{country.name}</h2>
                  <span style={{ fontSize:'0.65rem', letterSpacing:'3px', color:'var(--aura-text-muted)' }}>
                    PASAPORTE SANITARIO GLOBAL — {country.code}
                  </span>
                </div>
              </div>
              {/* Readiness bar */}
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.05)', borderRadius:2 }}>
                  <motion.div
                    initial={{ width:0 }}
                    animate={{ width:`${country.readiness}%` }}
                    transition={{ duration:1, delay:0.3, ease:'easeOut' }}
                    style={{
                      height:'100%', borderRadius:2,
                      background: country.readiness > 85 ? 'var(--aura-neon-cyan)' : country.readiness > 60 ? 'var(--aura-gold)' : 'var(--aura-neon-pink)',
                    }}
                  />
                </div>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--aura-gold)', whiteSpace:'nowrap' }}>
                  {country.readiness}% Listo
                </span>
              </div>
            </div>
            <button onClick={onClose}
              style={{ background:'none', border:'1px solid var(--aura-border)', color:'var(--aura-text-muted)', cursor:'pointer', padding:'0.5rem', borderRadius:4, flexShrink:0 }}>
              <X size={16} />
            </button>
          </div>

          {/* Warning note */}
          {country.note && (
            <div style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:4, padding:'1rem 1.2rem', marginBottom:'2rem' }}>
              <p style={{ margin:0, fontSize:'0.8rem', color:'var(--aura-gold)', lineHeight:1.6 }}>⚠ {country.note}</p>
            </div>
          )}

          {/* Requirements list */}
          <div style={{ display:'grid', gap:'1rem', marginBottom:'2rem' }}>
            {country.requirements.map((req, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:'1.2rem',
                padding:'1.2rem 1.4rem',
                background:'rgba(255,255,255,0.02)',
                border:'1px solid var(--aura-border)',
                borderLeft:`3px solid ${STATUS_COLOR[req.status]}`,
                borderRadius:4,
              }}>
                <ReqIcon type={req.icon} color={STATUS_COLOR[req.status]} />
                <div style={{ flex:1 }}>
                  <p style={{ margin:'0 0 3px', fontSize:'0.85rem', fontWeight:600 }}>{req.label}</p>
                  <p style={{ margin:0, fontSize:'0.72rem', color:'var(--aura-text-muted)' }}>{req.detail}</p>
                </div>
                <span style={{ fontSize:'0.6rem', letterSpacing:'1.5px', color:STATUS_COLOR[req.status], fontWeight:700, whiteSpace:'nowrap' }}>
                  {STATUS_LABEL[req.status]}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:'1rem' }}>
            <button className="btn-aura" style={{ flex:1 }} onClick={onClose}>Cerrar</button>
            <button className="btn-aura" style={{ flex:2, borderColor:'var(--aura-neon-cyan)', color:'var(--aura-neon-cyan)' }}>
              DESCARGAR REQUISITOS PDF
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ════════ Main Component ════════ */
const GlobalPassport = ({ pet }) => {
  const { locale } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <>
      <div className="fade-in">
        {/* Header */}
        <header style={{ padding:'3rem 0 2.5rem', display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <span style={{ fontSize:'0.7rem', letterSpacing:'5px', color:'var(--aura-gold)', fontWeight:700, textTransform:'uppercase', display:'block', marginBottom:'0.8rem' }}>
              {locale==='es'?'Logística Transfronteriza':'Cross-Border Logistics'}
            </span>
            <h1 style={{ fontSize:'clamp(2.2rem,4vw,3.5rem)', margin:0 }}>
              {locale==='es'?'Pasaporte Sanitario Global':'Global Sanitary Passport'}
            </h1>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ margin:'0 0 4px', fontWeight:700, fontSize:'1.1rem' }}>{pet?.name || 'AURA Member'}</p>
            <span className="locale-chip">TIER 1 TRAVELER</span>
          </div>
        </header>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2.5rem', alignItems:'start' }}>
          {/* Left – Compliance summary */}
          <div className="aura-card" style={{ padding:'2.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2.5rem' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--aura-gold)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <PlaneTakeoff color="var(--aura-black)" size={28} />
              </div>
              <div>
                <h2 style={{ fontSize:'1.6rem', margin:'0 0 4px' }}>Readiness: 94%</h2>
                <p style={{ margin:0, color:'var(--aura-text-muted)', fontSize:'0.82rem' }}>
                  {locale==='es'?'Alineado con protocolos bio-sanitarios IATA.':'Aligned with IATA bio-security protocols.'}
                </p>
              </div>
            </div>

            {[
              { label: 'Microchip Registry', value: 'ISO 11784 VERIFIED', color: 'var(--aura-neon-cyan)' },
              { label: 'Rabies Titre (RNATT)', value: 'VALID — 2026', color: 'var(--aura-neon-cyan)' },
              { label: 'Health Certificate (ES)', value: 'PENDING SIGNATURE', color: 'var(--aura-gold)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding:'1.2rem 0', borderBottom:'1px solid var(--aura-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.85rem', color:'var(--aura-text-muted)' }}>{label}</span>
                <span style={{ fontWeight:600, fontSize:'0.75rem', letterSpacing:'1px', color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Right – Destination cards (clickable) */}
          <div style={{ display:'grid', gap:'1rem' }}>
            <h3 style={{ margin:'0 0 0.8rem', fontSize:'1rem', opacity:0.7, letterSpacing:'2px', textTransform:'uppercase', fontFamily:'var(--font-sans)', color:'var(--aura-text-muted)' }}>
              {locale==='es'?'Destinos Prioritarios — pulsa para detalles':'Priority Destinations — tap for details'}
            </h3>
            {COUNTRIES.map(country => (
              <motion.div
                key={country.id}
                whileHover={{ x: 6, borderColor:'var(--aura-gold)' }}
                whileTap={{ scale: 0.98 }}
                className="aura-card"
                onClick={() => setSelectedCountry(country)}
                style={{
                  padding:'1.2rem 1.6rem', cursor:'pointer',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  borderLeft: country.status === 'compliant' ? '3px solid var(--aura-neon-cyan)' : '3px solid var(--aura-gold)',
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
                  <span style={{ fontSize:'1.5rem' }}>{country.flag}</span>
                  <div>
                    <h4 style={{ margin:'0 0 2px', fontSize:'0.95rem', fontWeight:600, color:'var(--aura-text)' }}>{country.name}</h4>
                    {country.note && <p style={{ margin:0, fontSize:'0.68rem', color:'var(--aura-gold)' }}>⚠ {country.note.split('—')[0]}</p>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                  <span style={{ fontSize:'0.72rem', fontWeight:700, color: country.status === 'compliant' ? 'var(--aura-neon-cyan)' : 'var(--aura-gold)' }}>
                    {country.readiness}%
                  </span>
                  {country.status === 'compliant'
                    ? <CheckCircle2 size={18} color="var(--aura-neon-cyan)" />
                    : <AlertCircle size={18} color="var(--aura-gold)" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Export bar */}
        <div className="aura-card" style={{ marginTop:'2rem', marginBottom:'4rem', padding:'1.6rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
            <FileText size={22} color="var(--aura-gold)" />
            <p style={{ margin:0, fontSize:'0.88rem' }}>
              {locale==='es'?'Exportar datos oficiales IATA para cumplimiento normativo':'Export official IATA data for regulatory compliance'}
            </p>
          </div>
          <button className="btn-aura">DOWNLOAD PDF</button>
        </div>
      </div>

      {/* ── Country detail modal ── */}
      {selectedCountry && (
        <CountryModal country={selectedCountry} onClose={() => setSelectedCountry(null)} />
      )}
    </>
  );
};

export default GlobalPassport;
