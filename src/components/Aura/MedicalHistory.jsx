import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Download, Calendar, Shield, Activity, Award, FileText, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';

// ─── Storage ──────────────────────────────────────────────────────────────────
const storageKey = (petId) => `aura_medical_${petId}`;
const EMPTY_DATA = { visits: [], vaccines: [], medications: [], analyses: [] };

const EMPTY_VISIT    = { date: '', clinic: '', vet: '', reason: '', diagnosis: '', treatment: '', cost: '' };
const EMPTY_VACCINE  = { name: '', date: '', nextDose: '', vet: '' };
const EMPTY_MED      = { name: '', dose: '', frequency: '', startDate: '', endDate: '' };
const EMPTY_ANALYSIS = { type: '', date: '', result: '', notes: '' };

const TABS = [
  { id: 'visits',      label: 'Visitas',    icon: Calendar },
  { id: 'vaccines',    label: 'Vacunas',    icon: Shield   },
  { id: 'medications', label: 'Medicación', icon: Activity },
  { id: 'analyses',    label: 'Análisis',   icon: Award    },
];

const ADD_LABELS = {
  visits:      'Nueva visita',
  vaccines:    'Añadir vacuna',
  medications: 'Añadir medicamento',
  analyses:    'Añadir análisis',
};

const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3 MB antes de base64

// ─── Helpers ──────────────────────────────────────────────────────────────────
const loadData = (petId) => {
  try { return JSON.parse(localStorage.getItem(storageKey(petId))) || EMPTY_DATA; }
  catch { return EMPTY_DATA; }
};

const vaccineStatus = (nextDose) => {
  if (!nextDose) return null;
  const days = Math.ceil((new Date(nextDose) - new Date()) / 86400000);
  if (days < 0)   return { label: 'Vencida', bg: 'rgba(255,0,110,0.15)',  color: '#ff006e', border: 'rgba(255,0,110,0.4)'  };
  if (days <= 30) return { label: `${days}d`, bg: 'rgba(255,170,0,0.15)', color: '#ffaa00', border: 'rgba(255,170,0,0.4)'  };
  return               { label: 'Al día',   bg: 'rgba(0,245,255,0.1)',   color: '#00f5ff', border: 'rgba(0,245,255,0.3)' };
};

const isActiveMed = (m) => !m.endDate || new Date(m.endDate) >= new Date();

// ─── PDF ──────────────────────────────────────────────────────────────────────
const generatePDF = (pet, data) => {
  const doc = new jsPDF();
  let y = 20;

  const line = (text, indent = 20) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const lines = doc.splitTextToSize(text, 170 - (indent - 20));
    doc.text(lines, indent, y);
    y += lines.length * 6;
  };
  const section = (title) => {
    y += 6;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(title, 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
  };

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(`Historial Médico — ${pet.name}`, 20, y); y += 8;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} · AURA Pets Global`, 20, y); y += 14;

  if (data.visits.length) {
    section('Visitas Veterinarias');
    data.visits.forEach((v) => {
      line(`${v.date}  ·  ${v.clinic || '—'}  ·  ${v.vet || '—'}`);
      if (v.reason)    line(`Motivo: ${v.reason}`, 26);
      if (v.diagnosis) line(`Diagnóstico: ${v.diagnosis}`, 26);
      if (v.treatment) line(`Tratamiento: ${v.treatment}`, 26);
      if (v.cost)      line(`Coste: €${v.cost}`, 26);
      y += 3;
    });
  }
  if (data.vaccines.length) {
    section('Vacunas');
    data.vaccines.forEach((v) => {
      line(`${v.name}  ·  ${v.date}  ·  Próxima: ${v.nextDose || 'N/A'}  ·  ${v.vet || '—'}`);
    });
  }
  if (data.medications.length) {
    section('Medicación');
    data.medications.forEach((m) => {
      line(`${m.name}  ·  ${m.dose}  ·  ${m.frequency}  ${isActiveMed(m) ? '(activo)' : '(finalizado)'}`);
      line(`Inicio: ${m.startDate}${m.endDate ? `  Fin: ${m.endDate}` : ''}`, 26);
    });
  }
  if (data.analyses.length) {
    section('Análisis');
    data.analyses.forEach((a) => {
      line(`${a.type}  ·  ${a.date}  ·  Resultado: ${a.result}`);
      if (a.notes) line(a.notes, 26);
      if (a.document) line(`[Documento adjunto: ${a.document.name}]`, 26);
    });
  }

  doc.save(`${pet.name.replace(/\s+/g, '_')}_historial_medico.pdf`);
};

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, as, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <label style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--aura-gold)', textTransform: 'uppercase' }}>
      {label}
    </label>
    {as === 'textarea'
      ? <textarea rows={2} className="aura-input" style={{ resize: 'vertical', minHeight: 56 }} {...props} />
      : <input className="aura-input" {...props} />}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const MedicalHistory = ({ pet, onClose }) => {
  const [tab, setTab]             = useState('visits');
  const [data, setData]           = useState(() => loadData(pet.id));
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_VISIT);
  const [docPreview, setDocPreview] = useState(null);   // { dataUrl, type, name }
  const [viewDoc, setViewDoc]     = useState(null);     // { dataUrl, type, name }
  const [dragOver, setDragOver]   = useState(false);
  const [fileError, setFileError] = useState('');

  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  // ── Persistence ───────────────────────────────────────────────────────────
  const persist = (newData) => {
    setData(newData);
    localStorage.setItem(storageKey(pet.id), JSON.stringify(newData));
  };

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const openForm = () => {
    const empties = { visits: EMPTY_VISIT, vaccines: EMPTY_VACCINE, medications: EMPTY_MED, analyses: EMPTY_ANALYSIS };
    setForm({ ...empties[tab] });
    setDocPreview(null);
    setFileError('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setDocPreview(null);
    setFileError('');
  };

  const submit = () => {
    const item = { id: Date.now(), ...form };
    if (tab === 'analyses' && docPreview) item.document = docPreview;
    persist({ ...data, [tab]: [item, ...data[tab]] });
    setShowForm(false);
    setDocPreview(null);
  };

  const remove = (section, id) =>
    persist({ ...data, [section]: data[section].filter((i) => i.id !== id) });

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    setFileError('');
    if (file.size > MAX_FILE_BYTES) {
      setFileError('Archivo demasiado grande. Máximo 3 MB.');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setFileError('Formato no válido. Usa JPG, PNG, WEBP o PDF.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setDocPreview({ dataUrl: e.target.result, type: file.type, name: file.name });
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const activeMeds = data.medications.filter(isActiveMed).length;

  // ── Shared styles ─────────────────────────────────────────────────────────
  const formWrap  = { background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 10, padding: '1.4rem', marginBottom: '1rem', display: 'grid', gap: '1rem' };
  const grid2     = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
  const cardStyle = { background: 'rgba(10,5,20,0.88)', border: '1px solid rgba(212,175,55,0.16)', borderRadius: 8, padding: '1.2rem' };
  const mutedLabel = { margin: '0 0 3px', fontSize: '0.62rem', letterSpacing: '2px', color: 'var(--aura-text-muted)', textTransform: 'uppercase' };
  const deleteBtn  = { background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: 4, lineHeight: 1, flexShrink: 0 };
  const empty = (msg) => <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.88rem', padding: '2.5rem 0', textAlign: 'center' }}>{msg}</p>;

  // ── Drop zone (solo Análisis) ──────────────────────────────────────────────
  const DropZone = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--aura-gold)', textTransform: 'uppercase' }}>
        Documento adjunto
      </label>

      {!docPreview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '1.5px dashed rgba(212,175,55,0.45)',
            borderRadius: 8,
            padding: '1.5rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.04)',
            transition: 'background 0.2s',
          }}
        >
          <p style={{ margin: '0 0 0.9rem', color: 'var(--aura-text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            Arrastra tu análisis aquí o haz click para subir
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              style={{ padding: '7px 14px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: 6, color: 'var(--aura-gold)', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              📎 Subir documento
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              style={{ padding: '7px 14px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: 6, color: 'var(--aura-gold)', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              📷 Usar cámara
            </button>
          </div>
          {fileError && (
            <p style={{ margin: '0.7rem 0 0', fontSize: '0.73rem', color: '#ff006e' }}>{fileError}</p>
          )}
        </div>
      ) : (
        /* Preview del documento seleccionado */
        <div style={{ position: 'relative', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, overflow: 'hidden', background: 'rgba(10,5,20,0.85)' }}>
          {docPreview.type.startsWith('image/') ? (
            <img
              src={docPreview.dataUrl}
              alt="Preview"
              style={{ width: '100%', maxHeight: 180, objectFit: 'contain', display: 'block', background: '#000' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.2rem' }}>
              <FileText size={32} color="var(--aura-gold)" />
              <p style={{ margin: 0, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {docPreview.name}
              </p>
            </div>
          )}
          {/* Botón quitar */}
          <button
            type="button"
            onClick={() => setDocPreview(null)}
            style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Inputs ocultos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );

  // ── Forms ─────────────────────────────────────────────────────────────────
  const renderForm = () => {
    if (tab === 'visits') return (
      <div style={formWrap}>
        <div style={grid2}>
          <Field label="Fecha"     type="date"   value={form.date} onChange={f('date')} />
          <Field label="Coste (€)" type="number" placeholder="85"  value={form.cost}   onChange={f('cost')} />
        </div>
        <div style={grid2}>
          <Field label="Clínica"     type="text" placeholder="Clínica Veterinaria..." value={form.clinic} onChange={f('clinic')} />
          <Field label="Veterinario" type="text" placeholder="Dr. ..."               value={form.vet}    onChange={f('vet')} />
        </div>
        <Field label="Motivo"      type="text"    placeholder="Revisión, urgencia..."             value={form.reason}    onChange={f('reason')} />
        <Field label="Diagnóstico" as="textarea"  placeholder="Diagnóstico del veterinario..."    value={form.diagnosis} onChange={f('diagnosis')} />
        <Field label="Tratamiento" as="textarea"  placeholder="Medicación pautada, procedimientos..." value={form.treatment} onChange={f('treatment')} />
      </div>
    );

    if (tab === 'vaccines') return (
      <div style={formWrap}>
        <div style={grid2}>
          <Field label="Nombre vacuna" type="text" placeholder="Rabia, polivalente..." value={form.name} onChange={f('name')} />
          <Field label="Veterinario"   type="text" placeholder="Dr. ..."               value={form.vet}  onChange={f('vet')} />
        </div>
        <div style={grid2}>
          <Field label="Fecha administración" type="date" value={form.date}     onChange={f('date')} />
          <Field label="Próxima dosis"        type="date" value={form.nextDose} onChange={f('nextDose')} />
        </div>
      </div>
    );

    if (tab === 'medications') return (
      <div style={formWrap}>
        <div style={grid2}>
          <Field label="Medicamento" type="text" placeholder="Frontline, Nexgard..."     value={form.name}      onChange={f('name')} />
          <Field label="Dosis"       type="text" placeholder="1 comprimido, 1 pipeta..."  value={form.dose}     onChange={f('dose')} />
        </div>
        <Field label="Frecuencia" type="text" placeholder="Diario, Mensual, Cada 8h..." value={form.frequency} onChange={f('frequency')} />
        <div style={grid2}>
          <Field label="Fecha inicio"         type="date" value={form.startDate} onChange={f('startDate')} />
          <Field label="Fecha fin (opcional)" type="date" value={form.endDate}   onChange={f('endDate')} />
        </div>
      </div>
    );

    // Análisis — incluye drop zone
    return (
      <div style={formWrap}>
        <div style={grid2}>
          <Field label="Tipo de análisis" type="text" placeholder="Sangre, orina..." value={form.type}   onChange={f('type')} />
          <Field label="Fecha"            type="date"                                 value={form.date}   onChange={f('date')} />
        </div>
        <Field label="Resultado"     type="text"   placeholder="Normal, alterado..." value={form.result} onChange={f('result')} />
        <Field label="Observaciones" as="textarea" placeholder="Detalles..."         value={form.notes}  onChange={f('notes')} />
        <DropZone />
      </div>
    );
  };

  // ── Tab content ────────────────────────────────────────────────────────────
  const Visits = () => (
    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
      {data.visits.length > 0 && (
        <div style={{ position: 'absolute', left: 7, top: 10, bottom: 10, width: 1, background: 'linear-gradient(to bottom, #D4AF37, rgba(212,175,55,0.08))' }} />
      )}
      {!data.visits.length && empty('Sin visitas registradas')}
      {data.visits.map((v) => (
        <div key={v.id} style={{ position: 'relative', marginBottom: '1.1rem' }}>
          <div style={{ position: 'absolute', left: -29, top: 14, width: 10, height: 10, borderRadius: '50%', background: '#D4AF37', border: '2px solid #0A0514', boxShadow: '0 0 8px rgba(212,175,55,0.6)' }} />
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '0.68rem', color: 'var(--aura-gold)', letterSpacing: '2px' }}>{v.date}</p>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.98rem' }}>{v.clinic || '—'}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--aura-text-muted)' }}>{v.vet}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {v.cost && <span style={{ fontWeight: 700, color: 'var(--aura-gold)' }}>€{v.cost}</span>}
                <button style={deleteBtn} onClick={() => remove('visits', v.id)}><X size={14} /></button>
              </div>
            </div>
            {(v.reason || v.diagnosis || v.treatment) && (
              <div style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gap: '0.6rem' }}>
                {v.reason    && <div><p style={mutedLabel}>Motivo</p>      <p style={{ margin: 0, fontSize: '0.85rem' }}>{v.reason}</p></div>}
                {v.diagnosis && <div><p style={mutedLabel}>Diagnóstico</p> <p style={{ margin: 0, fontSize: '0.85rem' }}>{v.diagnosis}</p></div>}
                {v.treatment && <div><p style={mutedLabel}>Tratamiento</p> <p style={{ margin: 0, fontSize: '0.85rem' }}>{v.treatment}</p></div>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const Vaccines = () => (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      {!data.vaccines.length && empty('Sin vacunas registradas')}
      {data.vaccines.map((v) => {
        const st = vaccineStatus(v.nextDose);
        return (
          <div key={v.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '0.98rem' }}>{v.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--aura-text-muted)' }}>
                {v.date}{v.vet ? ` · ${v.vet}` : ''}{v.nextDose ? ` · Próxima: ${v.nextDose}` : ''}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
              {st && <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>}
              <button style={deleteBtn} onClick={() => remove('vaccines', v.id)}><X size={14} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const Medications = () => (
    <div>
      {activeMeds > 0 && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1.2rem', background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.18)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 8px #00f5ff', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#00f5ff' }}>
            {activeMeds} medicamento{activeMeds > 1 ? 's' : ''} activo{activeMeds > 1 ? 's' : ''}
          </p>
        </div>
      )}
      <div style={{ display: 'grid', gap: '0.8rem' }}>
        {!data.medications.length && empty('Sin medicación registrada')}
        {data.medications.map((m) => {
          const active = isActiveMed(m);
          return (
            <div key={m.id} style={{ ...cardStyle, border: `1px solid ${active ? 'rgba(93,202,165,0.3)' : 'rgba(212,175,55,0.12)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
                  {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f5ff', flexShrink: 0 }} />}
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.98rem' }}>{m.name}</p>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--aura-text-muted)' }}>
                  {m.dose}{m.frequency ? ` · ${m.frequency}` : ''}{m.startDate ? ` · Desde: ${m.startDate}` : ''}{m.endDate ? ` hasta ${m.endDate}` : ''}
                </p>
              </div>
              <button style={deleteBtn} onClick={() => remove('medications', m.id)}><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Analyses = () => (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      {!data.analyses.length && empty('Sin análisis registrados')}
      {data.analyses.map((a) => (
        <div key={a.id} style={cardStyle}>
          {/* Cabecera */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: '0.98rem' }}>{a.type}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--aura-text-muted)' }}>{a.date}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {a.result && (
                <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600, background: 'rgba(212,175,55,0.1)', color: 'var(--aura-gold)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  {a.result}
                </span>
              )}
              <button style={deleteBtn} onClick={() => remove('analyses', a.id)}><X size={14} /></button>
            </div>
          </div>

          {/* Notas */}
          {a.notes && (
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: 'var(--aura-text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
              {a.notes}
            </p>
          )}

          {/* Documento adjunto */}
          {a.document && (
            <div style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              {/* Miniatura / icono PDF */}
              {a.document.type.startsWith('image/') ? (
                <img
                  src={a.document.dataUrl}
                  alt="Análisis"
                  style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(212,175,55,0.3)', flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => setViewDoc(a.document)}
                />
              ) : (
                <div style={{ width: 52, height: 52, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={22} color="var(--aura-gold)" />
                </div>
              )}

              {/* Nombre + botón ver */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 5px', fontSize: '0.72rem', color: 'var(--aura-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.document.name}
                </p>
                <button
                  onClick={() => setViewDoc(a.document)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '5px 12px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 6, color: 'var(--aura-gold)', fontSize: '0.72rem', cursor: 'pointer' }}
                >
                  <Eye size={12} /> Ver documento
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const CONTENT = { visits: Visits, vaccines: Vaccines, medications: Medications, analyses: Analyses };
  const TabContent = CONTENT[tab];

  return (
    <>
      {/* ── Modal principal ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        style={{ position: 'fixed', inset: 0, zIndex: 2000, background: '#0A0514', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '1.4rem 2rem', borderBottom: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '0.6rem', letterSpacing: '3px', color: 'var(--aura-gold)', textTransform: 'uppercase' }}>
              AURA Pets Global · {pet.name}
            </p>
            <h2 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 700 }}>Historial Médico Completo</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
            <button onClick={() => generatePDF(pet, data)} className="btn-aura"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', padding: '0.55rem 1rem' }}>
              <Download size={13} /> PDF
            </button>
            <button onClick={onClose}
              style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--aura-text)' }}>
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(212,175,55,0.12)', overflowX: 'auto', flexShrink: 0 }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button key={id}
                onClick={() => { setTab(id); setShowForm(false); setDocPreview(null); setFileError(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.9rem 1.4rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: active ? '2px solid var(--aura-gold)' : '2px solid transparent', color: active ? 'var(--aura-gold)' : 'var(--aura-text-muted)', fontSize: '0.8rem', fontWeight: active ? 600 : 400, letterSpacing: '0.5px', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
              >
                <Icon size={14} /> {label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.4rem 2rem' }}>
          {/* Botón añadir / formulario */}
          {!showForm ? (
            <div style={{ marginBottom: '1.2rem' }}>
              <button onClick={openForm} className="btn-aura"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', padding: '0.55rem 1.1rem', borderColor: 'var(--aura-gold)', color: 'var(--aura-gold)' }}>
                <Plus size={13} /> {ADD_LABELS[tab]}
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '1.2rem' }}>
              {renderForm()}
              <div style={{ display: 'flex', gap: '0.7rem' }}>
                <button className="btn-aura" style={{ flex: 1, fontSize: '0.75rem' }} onClick={cancelForm}>CANCELAR</button>
                <button className="btn-aura" style={{ flex: 2, fontSize: '0.75rem', borderColor: 'var(--aura-gold)', color: 'var(--aura-gold)' }} onClick={submit}>GUARDAR</button>
              </div>
            </div>
          )}

          {/* Contenido del tab */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <TabContent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer de marca ── */}
        <div style={{ padding: '0.6rem 2rem', borderTop: '1px solid var(--aura-border)', flexShrink: 0, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.55rem', letterSpacing: '1.8px', color: 'var(--aura-text-muted)', opacity: 0.55, textTransform: 'uppercase' }}>
            AURA Pets Global · Expediente Médico Digital
          </p>
        </div>
      </motion.div>

      {/* ── Visor de documento fullscreen ── */}
      <AnimatePresence>
        {viewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9000, background: '#0A0514', display: 'flex', flexDirection: 'column' }}
          >
            {/* Barra superior */}
            <div style={{ padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--aura-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {viewDoc.name}
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                {/* Abrir en nueva pestaña (útil para PDFs en móvil) */}
                <a
                  href={viewDoc.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '6px 12px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 6, color: 'var(--aura-gold)', fontSize: '0.72rem', textDecoration: 'none' }}
                >
                  <Download size={12} /> Abrir
                </a>
                <button
                  onClick={() => setViewDoc(null)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--aura-text)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
              {viewDoc.type.startsWith('image/') ? (
                <img
                  src={viewDoc.dataUrl}
                  alt={viewDoc.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <iframe
                  src={viewDoc.dataUrl}
                  title={viewDoc.name}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MedicalHistory;
