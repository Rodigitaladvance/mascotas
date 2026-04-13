import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PlaneTakeoff, CheckCircle2, AlertCircle, FileText, X, Shield, Syringe, Stethoscope, FileCheck, Upload, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/LocalizationContext';

/* ── Icon helper ── */
const ReqIcon = ({ type, color }) => {
  const props = { size: 16, color };
  if (type === 'chip')    return <Shield {...props} />;
  if (type === 'syringe') return <Syringe {...props} />;
  if (type === 'vet')     return <Stethoscope {...props} />;
  return <FileCheck {...props} />;
};

const STATUS_COLOR = {
  ok:      'var(--aura-neon-cyan)',
  pending: 'var(--aura-gold)',
  alert:   'var(--aura-neon-pink)',
};
const statusLabel = (s, locale) => ({
  ok:      locale === 'es' ? '✓ OK'          : '✓ OK',
  pending: locale === 'es' ? '⏳ PENDIENTE'  : '⏳ PENDING',
  alert:   locale === 'es' ? '⚠ ATENCIÓN'   : '⚠ ATTENTION',
}[s]);

/* ── Build requirements dynamically from pet data ── */
const buildRequirements = (pet, countryId, locale) => {
  const es = locale === 'es';
  const hasMicrochip = !!pet?.microchip?.trim();
  const h = pet?.health || {};

  /* Microchip */
  const chip = {
    icon: 'chip',
    label: 'Microchip ISO 11784/11785',
    status: hasMicrochip ? 'ok' : 'pending',
    detail: hasMicrochip
      ? `${es ? 'Verificado' : 'Verified'} · ${pet.microchip}`
      : es ? 'Introduce el nº de microchip en el registro' : 'Enter microchip number in registration',
  };

  /* Rabies vaccine — uses real data from pet.health */
  const rv = h.rabiesVaccine || {};
  const rabies = {
    icon: 'syringe',
    label: es ? 'Vacuna Antirrábica' : 'Rabies Vaccination',
    status: rv.status || 'pending',
    detail: rv.status === 'ok' && rv.expiry
      ? `${es ? 'Válida hasta' : 'Valid until'} ${new Date(rv.expiry).toLocaleDateString(es ? 'es-ES' : 'en-GB')}`
      : es ? 'Pendiente — añade en Documentación' : 'Pending — add in Health Docs',
  };

  /* Physical Passport — linked to uploaded file */
  const pp = h.physicalPassport || {};
  const euPassport = {
    icon: 'doc',
    label: es ? 'Pasaporte Físico' : 'Physical Passport',
    status: pp.status || 'pending',
    detail: pp.status === 'ok' && pp.fileName
      ? `${es ? 'Documento custodiado' : 'Document on file'}: ${pp.fileName.length > 30 ? pp.fileName.slice(0,28)+'…' : pp.fileName}`
      : es ? 'Vincula el pasaporte físico para completar' : 'Link physical passport to complete',
  };

  /* Health cert — real data */
  const hc = h.healthCert || {};
  const healthCert = {
    icon: 'vet',
    label: es ? 'Certificado Sanitario' : 'Health Certificate',
    status: hc.status || 'pending',
    detail: hc.status === 'ok'
      ? es ? 'Certificado emitido' : 'Certificate issued'
      : hc.notes || (es ? 'Firma veterinaria pendiente' : 'Pending vet signature'),
  };

  const titreTest = {
    icon: 'syringe',
    label: 'Rabies Titre Test (RNATT)',
    status: 'pending',
    detail: es ? 'Requiere análisis Titer ≥ 0.5 IU/mL' : 'Requires Titer ≥ 0.5 IU/mL analysis',
  };

  const tapeworm = {
    icon: 'vet',
    label: es ? 'Tratamiento Antiparásitos' : 'Tapeworm Treatment',
    status: 'pending',
    detail: es ? 'Administrar 1–5 días antes de la entrada' : 'Administer 1–5 days before entry',
  };

  switch (countryId) {
    case 'ES': return [chip, rabies, euPassport, healthCert];
    case 'UK': return [
      chip,
      rabies,
      { ...healthCert, label: 'Animal Health Certificate (AHC)' },
      tapeworm,
    ];
    case 'US': return [
      chip,
      { ...rabies, label: 'Rabies Certificate (USDA)',
        detail: rabies.status === 'ok' ? rabies.detail : (es ? 'Veterinario acreditado USDA' : 'USDA-accredited vet required') },
      { ...healthCert, label: 'CDC Health Certificate' },
      { icon: 'vet', label: 'Screwworm Inspection', status: 'pending',
        detail: es ? 'Requerido desde ciertos orígenes' : 'Required from specific origins' },
    ];
    case 'CA': return [
      chip,
      rabies,
      { icon: 'doc', label: 'CFIA Import Certificate', status: 'pending',
        detail: es ? 'Certificado de importación requerido' : 'Import certificate required' },
      { icon: 'vet', label: es ? 'Actualización Política Garrapatas 2025' : 'Tick Policy Update 2025', status: 'alert',
        detail: es ? 'Verificar país de origen con CFIA' : 'Verify origin country with CFIA' },
    ];
    case 'AU': return [
      chip,
      titreTest,
      { icon: 'doc', label: 'Import Permit (DAWE)', status: 'pending',
        detail: es ? 'Permiso de importación requerido' : 'Import permit required' },
      { icon: 'vet', label: es ? 'Cuarentena (10 días)' : 'Quarantine (10 days)', status: 'alert',
        detail: es ? 'Cuarentena obligatoria en instalación aprobada' : 'Mandatory quarantine at approved facility' },
    ];
    default: return [chip, rabies];
  }
};

const calcReadiness = (reqs) => {
  if (!reqs.length) return 0;
  const weights = { ok: 1, pending: 0.3, alert: 0 };
  const score = reqs.reduce((s, r) => s + (weights[r.status] ?? 0), 0);
  return Math.round((score / reqs.length) * 100);
};

/* ── Country metadata ── */
const COUNTRY_META = {
  ES: { name: 'España',          code: 'ESP', flag: '🇪🇸', note: null },
  UK: { name: 'United Kingdom',  code: 'GBR', flag: '🇬🇧', note: null },
  US: { name: 'United States',   code: 'USA', flag: '🇺🇸', note: null },
  CA: { name: 'Canada',          code: 'CAN', flag: '🇨🇦',
        note: 'Recent Tick Policy Update — verify with CFIA before travel.' },
  AU: { name: 'Australia',       code: 'AUS', flag: '🇦🇺',
        note: 'Requiere Neutralisation Antibody Test (RNATT) y cuarentena aprobada.' },
};
const COUNTRY_IDS = ['ES', 'UK', 'US', 'CA', 'AU'];

/* ── PDF export ── */
const exportPDF = (country, reqs, pet, readiness, locale) => {
  const es = locale === 'es';
  const name = pet?.name || 'AURA Member';
  const date = new Date().toLocaleDateString(es ? 'es-ES' : 'en-GB');

  const rows = reqs.map(r => `
    <tr style="border-bottom:1px solid #e0e0e0;">
      <td style="padding:10px 8px;font-weight:600;">${r.label}</td>
      <td style="padding:10px 8px;color:#555;font-size:0.85em;">${r.detail}</td>
      <td style="padding:10px 8px;font-weight:700;white-space:nowrap;color:${
        r.status==='ok'?'#0a9a6e':r.status==='pending'?'#b88a00':'#c0392b'
      };">${r.status==='ok'?'✓ '+(es?'CUMPLIDO':'DONE'):r.status==='pending'?'⏳ '+(es?'PENDIENTE':'PENDING'):'⚠ '+(es?'ATENCIÓN':'ATTENTION')}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="${locale}"><head>
    <meta charset="UTF-8">
    <title>AURA Pets — ${es?'Pasaporte Sanitario':'Health Passport'} ${country.name}</title>
    <style>
      body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;color:#111;}
      h1{color:#D4AF37;font-size:1.8rem;margin:0 0 4px;}
      .sub{letter-spacing:3px;font-size:0.7rem;text-transform:uppercase;color:#888;margin:0 0 20px;}
      .meta{display:flex;gap:40px;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #D4AF37;}
      .meta-item label{font-size:0.65rem;letter-spacing:2px;text-transform:uppercase;color:#888;display:block;}
      .meta-item span{font-weight:700;font-size:1.05rem;}
      .bar-bg{background:#eee;height:6px;border-radius:3px;margin:6px 0;}
      .bar-fill{height:6px;border-radius:3px;background:${readiness>85?'#0a9a6e':readiness>60?'#b88a00':'#c0392b'};}
      table{width:100%;border-collapse:collapse;margin-top:20px;}
      th{background:#f5f0e0;padding:10px 8px;text-align:left;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;}
      .note{background:#fff8e0;border-left:4px solid #D4AF37;padding:12px 16px;margin:20px 0;font-size:0.85rem;}
      .footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:0.75rem;color:#888;text-align:center;}
      @media print{body{padding:20px;}button{display:none;}}
    </style>
  </head><body>
    <h1>${country.flag} AURA Pets</h1>
    <p class="sub">${es?'Pasaporte Sanitario Global':'Global Sanitary Passport'} — ${country.code}</p>
    <div class="meta">
      <div class="meta-item"><label>${es?'Miembro':'Member'}</label><span>${name}</span></div>
      <div class="meta-item"><label>${es?'Destino':'Destination'}</label><span>${country.name}</span></div>
      <div class="meta-item"><label>${es?'Disponibilidad':'Readiness'}</label>
        <span>${readiness}%</span>
        <div class="bar-bg"><div class="bar-fill" style="width:${readiness}%;"></div></div>
      </div>
      <div class="meta-item"><label>${es?'Generado':'Generated'}</label><span>${date}</span></div>
    </div>
    ${country.note ? `<div class="note">⚠ ${country.note}</div>` : ''}
    <table>
      <thead><tr>
        <th>${es?'Requisito':'Requirement'}</th>
        <th>${es?'Detalle':'Detail'}</th>
        <th>${es?'Estado':'Status'}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">
      AURA Pets · ${es?'Solo informativo — verificar con autoridades oficiales antes del viaje':'Informational only — verify with official authorities before travel'}
    </div>
  </body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 100);
  }
};

/* ── Country modal ── */
const CountryModal = ({ countryId, pet, locale, onClose }) => {
  const meta = COUNTRY_META[countryId];
  const reqs = buildRequirements(pet, countryId, locale);
  const readiness = calcReadiness(reqs);
  const es = locale === 'es';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.85)',
          backdropFilter:'blur(12px)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem',
        }}
      >
        <motion.div
          initial={{ opacity:0, y:30, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:20, scale:0.97 }}
          transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
          className="aura-card"
          onClick={e => e.stopPropagation()}
          style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}
        >
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.8rem' }}>
                <span style={{ fontSize:'2.5rem' }}>{meta.flag}</span>
                <div>
                  <h2 style={{ fontSize:'1.8rem', margin:0 }}>{meta.name}</h2>
                  <span style={{ fontSize:'0.65rem', letterSpacing:'3px', color:'var(--aura-text-muted)' }}>
                    {es?'PASAPORTE SANITARIO':'SANITARY PASSPORT'} — {meta.code}
                  </span>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.05)', borderRadius:2 }}>
                  <motion.div
                    initial={{ width:0 }} animate={{ width:`${readiness}%` }}
                    transition={{ duration:1, delay:0.3, ease:'easeOut' }}
                    style={{
                      height:'100%', borderRadius:2,
                      background: readiness>85?'var(--aura-neon-cyan)':readiness>60?'var(--aura-gold)':'var(--aura-neon-pink)',
                    }}
                  />
                </div>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--aura-gold)', whiteSpace:'nowrap' }}>
                  {readiness}% {es?'Listo':'Ready'}
                </span>
              </div>
            </div>
            <button onClick={onClose}
              style={{ background:'none', border:'1px solid var(--aura-border)', color:'var(--aura-text-muted)',
                cursor:'pointer', padding:'0.5rem', borderRadius:4, flexShrink:0, marginLeft:'1rem' }}>
              <X size={16} />
            </button>
          </div>

          {/* Warning note */}
          {meta.note && (
            <div style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.25)',
              borderRadius:4, padding:'1rem 1.2rem', marginBottom:'2rem' }}>
              <p style={{ margin:0, fontSize:'0.8rem', color:'var(--aura-gold)', lineHeight:1.6 }}>⚠ {meta.note}</p>
            </div>
          )}

          {/* Requirements */}
          <div style={{ display:'grid', gap:'1rem', marginBottom:'2rem' }}>
            {reqs.map((req, i) => (
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
                  {statusLabel(req.status, locale)}
                </span>
              </div>
            ))}
          </div>

          {/* Pending notice */}
          {!pet?.microchip && (
            <div style={{ background:'rgba(212,175,55,0.05)', border:'1px dashed rgba(212,175,55,0.3)',
              borderRadius:4, padding:'0.9rem 1.2rem', marginBottom:'1.5rem' }}>
              <p style={{ margin:0, fontSize:'0.75rem', color:'var(--aura-gold)' }}>
                💡 {es
                  ? 'Añade el número de microchip en el registro para mejorar tu disponibilidad de viaje.'
                  : 'Add the microchip number in registration to improve your travel readiness.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:'1rem' }}>
            <button className="btn-aura" style={{ flex:1 }} onClick={onClose}>
              {es?'Cerrar':'Close'}
            </button>
            <button className="btn-aura"
              style={{ flex:2, borderColor:'var(--aura-neon-cyan)', color:'var(--aura-neon-cyan)' }}
              onClick={() => exportPDF(meta, reqs, pet, readiness, locale)}>
              {es?'DESCARGAR REQUISITOS PDF':'DOWNLOAD PDF REQUIREMENTS'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const FIELD_LABEL = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase',
  color: 'var(--aura-gold)', fontWeight: 700,
};

/* ════════ Main Component ════════ */
const GlobalPassport = ({ pet, onUpdatePet }) => {
  const { locale } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [saved, setSaved]                     = useState(false);
  const certInputRef     = useRef(null);
  const passportInputRef = useRef(null);
  const es = locale === 'es';

  /* Draft state — editable fields in left panel */
  const [draft, setDraft] = useState(() => ({
    microchip:        pet?.microchip                            || '',
    rabiesDate:       pet?.health?.rabiesVaccine?.date          || '',
    rabiesBatch:      pet?.health?.rabiesVaccine?.batch         || '',
    certFileName:     pet?.health?.healthCert?.fileName         || '',
    passportFileName: pet?.health?.physicalPassport?.fileName   || '',
  }));

  /* Re-init when pet identity changes (different animal selected) */
  useEffect(() => {
    setDraft({
      microchip:        pet?.microchip                            || '',
      rabiesDate:       pet?.health?.rabiesVaccine?.date          || '',
      rabiesBatch:      pet?.health?.rabiesVaccine?.batch         || '',
      certFileName:     pet?.health?.healthCert?.fileName         || '',
      passportFileName: pet?.health?.physicalPassport?.fileName   || '',
    });
  }, [pet?.id]);

  const setD = (field) => (e) => setDraft(prev => ({ ...prev, [field]: e.target.value }));

  /* Microchip validation: ISO 11784/11785 = exactly 15 digits */
  const chipValid = draft.microchip.length === 15;

  /* Compute a draft-based pet snapshot for real-time readiness */
  const draftPet = useMemo(() => {
    if (!pet) return pet;
    return {
      ...pet,
      microchip: draft.microchip || pet.microchip,
      health: {
        ...pet.health,
        rabiesVaccine: {
          ...pet.health?.rabiesVaccine,
          date:   draft.rabiesDate,
          status: draft.rabiesDate ? 'ok' : (pet.health?.rabiesVaccine?.status || 'pending'),
        },
        healthCert: {
          ...pet.health?.healthCert,
          status:   draft.certFileName ? 'ok' : (pet.health?.healthCert?.status || 'pending'),
          fileName: draft.certFileName,
        },
        physicalPassport: {
          ...pet.health?.physicalPassport,
          status:   draft.passportFileName ? 'ok' : (pet.health?.physicalPassport?.status || 'pending'),
          fileName: draft.passportFileName || pet.health?.physicalPassport?.fileName || '',
        },
      },
    };
  }, [pet, draft]);

  /* Memoize all country requirements — left panel uses draftPet for live feedback */
  const draftReqs = useMemo(() => buildRequirements(draftPet, 'ES', locale), [draftPet, locale]);
  const draftReadiness = calcReadiness(draftReqs);

  /* Country cards (right panel) still reflect saved pet data */
  const allReqs = useMemo(
    () => Object.fromEntries(COUNTRY_IDS.map(id => [id, buildRequirements(pet, id, locale)])),
    [pet, locale],
  );

  /* ── Save handler ── */
  const handleSave = () => {
    if (!onUpdatePet) return;
    const rabiesExpiry = draft.rabiesDate
      ? new Date(new Date(draft.rabiesDate).setFullYear(new Date(draft.rabiesDate).getFullYear() + 1))
          .toISOString().split('T')[0]
      : (pet?.health?.rabiesVaccine?.expiry || '');

    onUpdatePet({
      ...pet,
      microchip: draft.microchip || pet?.microchip,
      health: {
        ...pet?.health,
        rabiesVaccine: {
          date:   draft.rabiesDate,
          batch:  draft.rabiesBatch,
          expiry: rabiesExpiry,
          status: draft.rabiesDate ? 'ok' : 'pending',
        },
        healthCert: {
          ...pet?.health?.healthCert,
          status:   draft.certFileName ? 'ok' : (pet?.health?.healthCert?.status || 'pending'),
          fileName: draft.certFileName,
          notes:    pet?.health?.healthCert?.notes || '',
        },
        physicalPassport: {
          fileName: draft.passportFileName,
          status:   draft.passportFileName ? 'ok' : 'pending',
        },
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportAll = () => {
    const reqs = allReqs['ES'];
    exportPDF(COUNTRY_META['ES'], reqs, pet, calcReadiness(reqs), locale);
  };

  return (
    <>
      <div className="fade-in">
        {/* Header */}
        <header style={{ padding:'3rem 0 2.5rem', display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <span style={{ fontSize:'0.7rem', letterSpacing:'5px', color:'var(--aura-gold)', fontWeight:700, textTransform:'uppercase', display:'block', marginBottom:'0.8rem' }}>
              {es?'Logística Transfronteriza':'Cross-Border Logistics'}
            </span>
            <h1 style={{ fontSize:'clamp(2.2rem,4vw,3.5rem)', margin:0 }}>
              {es?'Pasaporte Sanitario Global':'Global Sanitary Passport'}
            </h1>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ margin:'0 0 4px', fontWeight:700, fontSize:'1.1rem' }}>{pet?.name || 'AURA Member'}</p>
            <span className="locale-chip">TIER 1 TRAVELER</span>
          </div>
        </header>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2.5rem', alignItems:'start' }}>

          {/* ── Left – editable passport form ── */}
          <div className="aura-card" style={{ padding:'2.5rem' }}>
            {/* Readiness header — updates live as form is filled */}
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2.5rem' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--aura-gold)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <PlaneTakeoff color="var(--aura-black)" size={28} />
              </div>
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:'1.6rem', margin:'0 0 6px' }}>
                  {es?'Disponibilidad':'Readiness'}: {draftReadiness}%
                </h2>
                <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2 }}>
                  <motion.div
                    animate={{ width:`${draftReadiness}%` }}
                    transition={{ duration:0.5, ease:'easeOut' }}
                    style={{
                      height:'100%', borderRadius:2,
                      background: draftReadiness>85?'var(--aura-neon-cyan)':draftReadiness>60?'var(--aura-gold)':'var(--aura-neon-pink)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Microchip ISO ── */}
            <div style={{ padding:'1.2rem 0', borderBottom:'1px solid var(--aura-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
                <label style={FIELD_LABEL}><Shield size={13}/> Microchip ISO 11784/11785</label>
                <span style={{ fontSize:'0.6rem', letterSpacing:'1.5px', fontWeight:700,
                  color: chipValid ? 'var(--aura-neon-cyan)' : 'var(--aura-gold)' }}>
                  {chipValid ? '✓ VERIFICADO' : '⏳ PENDIENTE'}
                </span>
              </div>
              <input
                type="text"
                className="aura-input"
                maxLength={15}
                placeholder={es ? '000000000000000 (15 dígitos)' : '000000000000000 (15 digits)'}
                value={draft.microchip}
                onChange={e => setDraft(p => ({ ...p, microchip: e.target.value.replace(/\D/g,'') }))}
                style={{ width:'100%', fontSize:'0.9rem', padding:'0.7rem 1rem', letterSpacing:'3px', fontFamily:'var(--font-mono, monospace)' }}
              />
              {draft.microchip.length > 0 && !chipValid && (
                <p style={{ margin:'5px 0 0', fontSize:'0.68rem', color:'var(--aura-neon-pink)' }}>
                  {draft.microchip.length}/15 {es ? 'dígitos' : 'digits'}
                </p>
              )}
            </div>

            {/* ── Vacuna Antirrábica ── */}
            <div style={{ padding:'1.2rem 0', borderBottom:'1px solid var(--aura-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
                <label style={FIELD_LABEL}><Syringe size={13}/> {es ? 'Vacuna Antirrábica' : 'Rabies Vaccination'}</label>
                {draft.rabiesDate && (
                  <span style={{ fontSize:'0.6rem', letterSpacing:'1.5px', fontWeight:700, color:'var(--aura-neon-cyan)' }}>
                    ✓ {es ? 'REGISTRADA' : 'REGISTERED'}
                  </span>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem' }}>
                <div>
                  <p style={{ margin:'0 0 5px', fontSize:'0.62rem', letterSpacing:'1px', color:'var(--aura-text-muted)', textTransform:'uppercase' }}>
                    {es ? 'Fecha aplicación' : 'Date applied'}
                  </p>
                  <input
                    type="date"
                    className="aura-input"
                    value={draft.rabiesDate}
                    onChange={setD('rabiesDate')}
                    style={{ width:'100%', fontSize:'0.8rem', padding:'0.6rem 0.8rem' }}
                  />
                </div>
                <div>
                  <p style={{ margin:'0 0 5px', fontSize:'0.62rem', letterSpacing:'1px', color:'var(--aura-text-muted)', textTransform:'uppercase' }}>
                    {es ? 'Nº de lote' : 'Batch number'}
                  </p>
                  <input
                    type="text"
                    className="aura-input"
                    placeholder="LOT-XXXXXX"
                    value={draft.rabiesBatch}
                    onChange={setD('rabiesBatch')}
                    style={{ width:'100%', fontSize:'0.8rem', padding:'0.6rem 0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* ── Certificado Sanitario (upload) ── */}
            <div style={{ padding:'1.2rem 0', borderBottom:'1px solid var(--aura-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
                <label style={FIELD_LABEL}><FileCheck size={13}/> {es ? 'Certificado Sanitario' : 'Health Certificate'}</label>
                {draft.certFileName && (
                  <span style={{ fontSize:'0.6rem', letterSpacing:'1.5px', fontWeight:700, color:'var(--aura-neon-cyan)' }}>
                    ✓ ADJUNTO
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={certInputRef}
                style={{ display:'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setDraft(p => ({ ...p, certFileName: file.name }));
                }}
              />
              <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
                <button
                  type="button"
                  className="btn-aura"
                  onClick={() => certInputRef.current?.click()}
                  style={{
                    flex:1, fontSize:'0.72rem', padding:'0.7rem 1rem',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
                    borderColor: draft.certFileName ? 'var(--aura-neon-cyan)' : 'var(--aura-border)',
                    color: draft.certFileName ? 'var(--aura-neon-cyan)' : 'var(--aura-text-muted)',
                    overflow:'hidden',
                  }}
                >
                  <Upload size={13}/>
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {draft.certFileName
                      ? draft.certFileName.length > 26 ? draft.certFileName.slice(0,24)+'…' : draft.certFileName
                      : (es ? 'SUBIR ARCHIVO (PDF)' : 'UPLOAD FILE (PDF)')}
                  </span>
                </button>
                {draft.certFileName && (
                  <button
                    type="button"
                    style={{ background:'none', border:'none', color:'var(--aura-text-muted)', cursor:'pointer', padding:'4px', flexShrink:0 }}
                    onClick={() => setDraft(p => ({ ...p, certFileName: '' }))}
                  >
                    <X size={14}/>
                  </button>
                )}
              </div>
            </div>

            {/* ── Pasaporte Físico (PDF/JPG) ── */}
            <div style={{ padding:'1.2rem 0', borderBottom:'1px solid var(--aura-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem' }}>
                <label style={FIELD_LABEL}><FileText size={13}/> {es ? 'Pasaporte Físico' : 'Physical Passport'}</label>
                {draft.passportFileName && (
                  <motion.span
                    initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                    style={{ fontSize:'0.6rem', letterSpacing:'1.5px', fontWeight:700, color:'var(--aura-neon-cyan)' }}>
                    ✓ {es ? 'DOCUMENTO CUSTODIADO' : 'DOCUMENT ON FILE'}
                  </motion.span>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={passportInputRef}
                style={{ display:'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setDraft(p => ({ ...p, passportFileName: file.name }));
                }}
              />
              <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
                <button
                  type="button"
                  className="btn-aura"
                  onClick={() => passportInputRef.current?.click()}
                  style={{
                    flex:1, fontSize:'0.72rem', padding:'0.75rem 1rem',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
                    borderColor: draft.passportFileName ? 'var(--aura-neon-cyan)' : 'var(--aura-gold)',
                    color:       draft.passportFileName ? 'var(--aura-neon-cyan)' : 'var(--aura-gold)',
                    background:  draft.passportFileName ? 'rgba(0,245,255,0.05)' : 'rgba(212,175,55,0.04)',
                    overflow:'hidden',
                  }}
                >
                  <Upload size={13}/>
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {draft.passportFileName
                      ? (draft.passportFileName.length > 26 ? draft.passportFileName.slice(0,24)+'…' : draft.passportFileName)
                      : (es ? 'VINCULAR PASAPORTE ORIGINAL' : 'LINK ORIGINAL PASSPORT')}
                  </span>
                </button>
                {draft.passportFileName && (
                  <button
                    type="button"
                    style={{ background:'none', border:'none', color:'var(--aura-text-muted)', cursor:'pointer', padding:'4px', flexShrink:0 }}
                    onClick={() => setDraft(p => ({ ...p, passportFileName: '' }))}
                  >
                    <X size={14}/>
                  </button>
                )}
              </div>
            </div>

            {/* ── Save button ── */}
            <button
              type="button"
              className="btn-aura"
              onClick={handleSave}
              style={{
                marginTop:'1.8rem', width:'100%', padding:'1.1rem',
                borderColor:'var(--aura-gold)', color:'var(--aura-gold)',
                background:'rgba(212,175,55,0.06)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem',
              }}
            >
              <Save size={16}/> {es ? 'GUARDAR CAMBIOS' : 'SAVE CHANGES'}
            </button>

            <AnimatePresence>
              {saved && (
                <motion.p
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{ margin:'0.7rem 0 0', fontSize:'0.72rem', color:'var(--aura-neon-cyan)', textAlign:'center', letterSpacing:'1px' }}
                >
                  ✓ {es ? 'Registros actualizados correctamente' : 'Records updated successfully'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right – destination cards ── */}
          <div style={{ display:'grid', gap:'1rem' }}>
            <h3 style={{ margin:'0 0 0.8rem', fontSize:'1rem', opacity:0.7, letterSpacing:'2px',
              textTransform:'uppercase', fontFamily:'var(--font-sans)', color:'var(--aura-text-muted)' }}>
              {es?'Destinos Prioritarios — pulsa para detalles':'Priority Destinations — tap for details'}
            </h3>
            {COUNTRY_IDS.map(id => {
              const meta = COUNTRY_META[id];
              const reqs = allReqs[id];
              const ready = calcReadiness(reqs);
              const compliant = ready >= 80;
              return (
                <motion.div
                  key={id}
                  whileHover={{ x:6, borderColor:'var(--aura-gold)' }}
                  whileTap={{ scale:0.98 }}
                  className="aura-card"
                  onClick={() => setSelectedCountry(id)}
                  style={{
                    padding:'1.2rem 1.6rem', cursor:'pointer',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    borderLeft: compliant ? '3px solid var(--aura-neon-cyan)' : '3px solid var(--aura-gold)',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
                    <span style={{ fontSize:'1.5rem' }}>{meta.flag}</span>
                    <div>
                      <h4 style={{ margin:'0 0 2px', fontSize:'0.95rem', fontWeight:600 }}>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            window.open(`/politicas.html?lang=${locale}`, '_blank', 'noopener,noreferrer');
                          }}
                          style={{ color:'var(--aura-text)', cursor:'pointer', transition:'color 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#d4af37'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--aura-text)'; }}
                        >
                          {meta.name}
                        </span>
                      </h4>
                      {meta.note && <p style={{ margin:0, fontSize:'0.68rem', color:'var(--aura-gold)' }}>⚠ {meta.note.split('.')[0]}</p>}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:700, color:compliant?'var(--aura-neon-cyan)':'var(--aura-gold)' }}>
                      {ready}%
                    </span>
                    {compliant
                      ? <CheckCircle2 size={18} color="var(--aura-neon-cyan)" />
                      : <AlertCircle  size={18} color="var(--aura-gold)" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Export bar */}
        <div className="aura-card" style={{ marginTop:'2rem', marginBottom:'4rem', padding:'1.6rem 2rem',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
            <FileText size={22} color="var(--aura-gold)" />
            <p style={{ margin:0, fontSize:'0.88rem' }}>
              {es?'Exportar datos oficiales IATA para cumplimiento normativo':'Export official IATA data for regulatory compliance'}
            </p>
          </div>
          <button className="btn-aura" onClick={handleExportAll}>
            {es?'DESCARGAR PDF':'DOWNLOAD PDF'}
          </button>
        </div>
      </div>

      {selectedCountry && (
        <CountryModal
          countryId={selectedCountry}
          pet={pet}
          locale={locale}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </>
  );
};

export default GlobalPassport;
