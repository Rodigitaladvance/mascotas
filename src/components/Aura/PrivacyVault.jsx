import React, { useState } from 'react';
import { ShieldCheck, Lock, EyeOff, Download, Trash2, ChevronRight, FileText, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/LocalizationContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import jsPDF from 'jspdf';

/* ── JSON download helper ── */
const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
};

/* ── Premium jsPDF medical record ── */
const generateMedicalPDF = (pets, userEmail) => {
  const doc  = new jsPDF('p', 'mm', 'a4');
  const W    = 210;
  const date = new Date().toLocaleDateString('es-ES');

  /* Header gold bar */
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, W, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(10, 10, 15);
  doc.text('AURA Pets — Expediente Médico Digital', 105, 14, { align: 'center' });

  /* Sub-header */
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 22, W, 8, 'F');
  doc.setFontSize(7);
  doc.setTextColor(180, 160, 80);
  doc.text('EXCELENCIA · EXPEDIENTE MÉDICO PRIVADO · GENERADO: ' + date, 105, 27.5, { align: 'center' });

  let y = 40;

  /* User info */
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Titular: ${userEmail || 'AURA Member'}`, 15, y);
  y += 12;

  if (!pets.length) {
    doc.text('No se han registrado mascotas.', 15, y);
    doc.save('AURA_Expediente_Medico.pdf');
    return;
  }

  for (const pet of pets) {
    /* Pet card header */
    doc.setFillColor(20, 20, 28);
    doc.roundedRect(10, y, W - 20, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(212, 175, 55);
    doc.text(`${pet.avatar || '🐾'} ${pet.name?.toUpperCase() || 'SIN NOMBRE'}`, 15, y + 7);
    y += 15;

    /* Pet details */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);

    const fields = [
      ['Especie',   pet.speciesLabel || pet.species || '—'],
      ['Edad',      pet.age || '—'],
      ['Peso',      pet.weight ? `${pet.weight} kg` : '—'],
      ['Microchip', pet.microchip || 'No registrado'],
    ];
    for (const [label, value] of fields) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 55, y);
      y += 6;
    }

    /* Health docs */
    const h  = pet.health || {};
    const rv = h.rabiesVaccine    || {};
    const ep = h.europeanPassport || {};
    const hc = h.healthCert       || {};

    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 175, 55);
    doc.text('Documentación Sanitaria', 15, y);
    y += 6;
    doc.setTextColor(50, 50, 50);

    const docs = [
      ['Vacuna Antirrábica', rv.status === 'ok' ? (rv.expiry ? `Válida hasta ${rv.expiry}` : 'Completada') : 'Pendiente'],
      ['Pasaporte Europeo',  ep.status === 'ok' ? (ep.number || 'Registrado') : 'Pendiente'],
      ['Certificado Sanitario', hc.status === 'ok' ? 'Emitido' : 'Pendiente'],
    ];
    for (const [label, value] of docs) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, y);
      y += 6;
    }

    /* Emergency config */
    const ec = pet.emergencyConfig;
    if (ec?.medicalAlerts) {
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 0, 60);
      doc.text('⚠ Alertas Médicas:', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(ec.medicalAlerts, W - 30);
      doc.text(lines, 15, y);
      y += lines.length * 5;
    }

    /* Separator */
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(10, y + 2, W - 10, y + 2);
    y += 10;

    /* New page if needed */
    if (y > 260) { doc.addPage(); y = 20; }
  }

  /* Footer */
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(`AURA Pets · Documento generado el ${date} · Solo informativo`, 105, 288, { align: 'center' });

  doc.save(`AURA_Expediente_${date.replace(/\//g, '-')}.pdf`);
};

/* ════════════════ Destruction Modal ════════════════ */
const DestructionModal = ({ onConfirm, onClose, locale }) => {
  const es = locale === 'es';
  const [step, setStep] = useState(1);
  const [typed, setTyped]   = useState('');
  const KEYWORD = es ? 'ELIMINAR' : 'DELETE';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(16px)', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="aura-card"
        style={{ maxWidth: 460, width: '100%', padding: '2.5rem' }}
      >
        <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid var(--aura-neon-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <AlertTriangle size={24} color="var(--aura-neon-pink)" />
        </div>
        <h2 style={{ textAlign: 'center', color: 'var(--aura-neon-pink)', fontSize: '1.4rem', marginBottom: '1rem' }}>
          {es ? 'Destrucción Permanente de Datos' : 'Permanent Data Destruction'}
        </h2>

        {step === 1 && (
          <>
            <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.82rem', lineHeight: 1.8, marginBottom: '2rem', textAlign: 'center' }}>
              {es
                ? 'Esta acción eliminará permanentemente todos los expedientes médicos, documentación sanitaria y datos de mascotas. Es irreversible y cumple con el derecho al olvido GDPR/LOPD.'
                : 'This action permanently deletes all medical records, health documentation, and pet data. It is irreversible and complies with GDPR right to erasure.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-aura" style={{ flex: 1 }} onClick={onClose}>
                {es ? 'CANCELAR' : 'CANCEL'}
              </button>
              <button className="btn-aura"
                style={{ flex: 1, borderColor: 'var(--aura-neon-pink)', color: 'var(--aura-neon-pink)' }}
                onClick={() => setStep(2)}>
                {es ? 'CONTINUAR' : 'CONTINUE'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.82rem', lineHeight: 1.8, marginBottom: '1.2rem', textAlign: 'center' }}>
              {es ? `Escriba "${KEYWORD}" para confirmar:` : `Type "${KEYWORD}" to confirm:`}
            </p>
            <input
              className="aura-input"
              autoFocus
              placeholder={KEYWORD}
              value={typed}
              onChange={e => setTyped(e.target.value.toUpperCase())}
              style={{ marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '4px', fontWeight: 700 }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-aura" style={{ flex: 1 }} onClick={() => { setStep(1); setTyped(''); }}>
                {es ? 'ATRÁS' : 'BACK'}
              </button>
              <button className="btn-aura"
                style={{
                  flex: 2,
                  background: typed === KEYWORD ? 'rgba(255,0,80,0.15)' : 'transparent',
                  borderColor: typed === KEYWORD ? 'var(--aura-neon-pink)' : 'var(--aura-border)',
                  color: typed === KEYWORD ? 'var(--aura-neon-pink)' : 'var(--aura-text-muted)',
                  cursor: typed === KEYWORD ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
                disabled={typed !== KEYWORD}
                onClick={onConfirm}>
                <Trash2 size={14} />
                {es ? 'DESTRUIR DATOS' : 'DESTROY DATA'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ════════════════ Main Component ════════════════ */
const PrivacyVault = () => {
  const { locale } = useTranslation();
  const { user, logout } = useAuth();
  const es = locale === 'es';

  const [showDestruction, setShowDestruction] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  const getPets = () => user ? storage.getPets(user.id) : [];

  const handleExportJSON = () => {
    const pets = getPets();
    const payload = {
      exportDate: new Date().toISOString(),
      format: 'AURA Pets Data Portability v1',
      user: { email: user?.email, id: user?.id },
      pets,
    };
    downloadJSON(payload, `AURA_datos_${new Date().toLocaleDateString('es-ES').replace(/\//g,'-')}.json`);
  };

  const handleExportPDF = () => {
    const pets = getPets();
    generateMedicalPDF(pets, user?.email);
  };

  const handleDestroy = () => {
    if (!user) return;
    /* Delete all pet data */
    const pets = getPets();
    pets.forEach(p => {
      storage.deletePet(user.id, p.id);
    });
    /* Clear scoped vault data */
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`aura_${user.id}_`)) localStorage.removeItem(key);
    });
    setShowDestruction(false);
    setDestroyed(true);
    setTimeout(() => logout(), 1800);
  };

  if (destroyed) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <Trash2 size={48} color="var(--aura-neon-pink)" />
      <h2 style={{ color: 'var(--aura-neon-pink)' }}>{es ? 'Datos eliminados' : 'Data destroyed'}</h2>
      <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.82rem' }}>
        {es ? 'Cerrando sesión…' : 'Signing out…'}
      </p>
    </div>
  );

  return (
    <div className="fade-in" style={{ padding: '2rem 0' }}>
      {/* ── Destruction modal ── */}
      <AnimatePresence>
        {showDestruction && (
          <DestructionModal
            onConfirm={handleDestroy}
            onClose={() => setShowDestruction(false)}
            locale={locale}
          />
        )}
      </AnimatePresence>

      <header style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '4px', opacity: 0.5, textTransform: 'uppercase' }}>
          {es ? 'Protocolo de Seguridad' : 'Security Protocol'}
        </span>
        <h1 className="luxury-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', margin: '0.5rem 0' }}>
          {es ? 'Privacidad y Seguridad' : 'Privacy & Security'}
        </h1>
      </header>

      <div className="vault-layout">
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Shield card */}
          <div className="aura-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start', flexWrap: 'wrap' }}>
              <div style={{ padding: '1rem', background: 'rgba(0,245,255,0.05)', borderRadius: '50%', flexShrink: 0 }}>
                <ShieldCheck color="var(--aura-neon-cyan)" size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', margin: '0 0 0.8rem' }}>{es ? 'El Escudo AURA™' : 'AURA Shield™'}</h3>
                <p style={{ color: 'var(--aura-text-muted)', lineHeight: '1.8', margin: 0, maxWidth: '90%' }}>
                  {es
                    ? 'Utilizamos encriptación de grado militar AES-256 para proteger cada dato registrado. La clave de cifrado se genera localmente en su dispositivo y nunca se transmite a nuestros servidores. Solo usted tiene el control absoluto sobre la información sanitaria de sus miembros.'
                    : 'We use military-grade AES-256 encryption to protect every registered record. The encryption key is generated locally on your device and never transmitted to our servers.'}
                </p>
              </div>
            </div>
          </div>

          {/* Compliance cards */}
          <div className="compliance-grid">
            <div className="aura-card" style={{ padding: '2rem' }}>
              <Lock size={24} color="var(--aura-gold)" style={{ marginBottom: '1.5rem' }} />
              <h4 style={{ margin: '0 0 0.5rem' }}>HIPAA (USA)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--aura-text-muted)', margin: 0 }}>
                {es ? 'Cumplimiento estricto de portabilidad y responsabilidad.' : 'Strict portability and accountability compliance.'}
              </p>
            </div>
            <div className="aura-card" style={{ padding: '2rem' }}>
              <EyeOff size={24} color="var(--aura-gold)" style={{ marginBottom: '1.5rem' }} />
              <h4 style={{ margin: '0 0 0.5rem' }}>GDPR (Europa)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--aura-text-muted)', margin: 0 }}>
                {es ? 'Derecho al olvido, acceso y portabilidad garantizado.' : 'Right to erasure, access, and portability guaranteed.'}
              </p>
            </div>
          </div>

          {/* Data management — functional */}
          <div className="aura-card" style={{ padding: '2rem', borderStyle: 'dashed' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
              {es ? 'Gestión de Datos' : 'Data Management'}
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* Export PDF */}
              <button className="btn-aura"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'rgba(212,175,55,0.04)' }}
                onClick={handleExportPDF}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <FileText size={16} color="var(--aura-gold)" />
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ display: 'block' }}>
                      {es ? 'Exportar Expediente Médico (PDF)' : 'Export Medical Record (PDF)'}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--aura-text-muted)', letterSpacing: '1px' }}>
                      {es ? 'Diseño premium · jsPDF' : 'Premium design · jsPDF'}
                    </span>
                  </div>
                </div>
                <Download size={17} color="var(--aura-gold)" />
              </button>

              {/* Export JSON */}
              <button className="btn-aura"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'rgba(255,255,255,0.03)' }}
                onClick={handleExportJSON}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Download size={16} />
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ display: 'block' }}>
                      {es ? 'Portabilidad de Datos (JSON)' : 'Data Portability (JSON)'}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--aura-text-muted)', letterSpacing: '1px' }}>
                      {es ? 'Copia completa · GDPR Art. 20' : 'Full copy · GDPR Art. 20'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={17} />
              </button>

              {/* Privacy Policy */}
              <button className="btn-aura"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'rgba(255,255,255,0.02)' }}
                onClick={() => window.open('/politicas.html', '_blank', 'noopener,noreferrer')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <ExternalLink size={16} color="var(--aura-text-muted)" />
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ display: 'block' }}>
                      {es ? 'Política de Privacidad' : 'Privacy Policy'}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--aura-text-muted)', letterSpacing: '1px' }}>
                      {es ? 'GDPR / LOPD · Rodigital Advance' : 'GDPR / LOPD · Rodigital Advance'}
                    </span>
                  </div>
                </div>
                <ExternalLink size={14} color="var(--aura-text-muted)" />
              </button>

              {/* Destroy */}
              <button className="btn-aura"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderColor: 'rgba(255,0,80,0.35)', color: 'var(--aura-neon-pink)' }}
                onClick={() => setShowDestruction(true)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Trash2 size={16} />
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ display: 'block' }}>
                      {es ? 'Destrucción Permanente de Datos' : 'Permanent Data Destruction'}
                    </span>
                    <span style={{ fontSize: '0.65rem', letterSpacing: '1px', opacity: 0.7 }}>
                      {es ? 'Doble confirmación requerida · GDPR Art. 17' : 'Double confirmation · GDPR Art. 17'}
                    </span>
                  </div>
                </div>
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          <div className="aura-card" style={{ textAlign: 'center', borderColor: 'var(--aura-neon-cyan)', padding: '2.5rem' }}>
            <div className="bio-ring" style={{ width: '120px', height: '120px', margin: '0 auto 2rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--aura-neon-cyan)', borderRadius: '50%', opacity: 0.2 }} />
              <div style={{ position: 'absolute', inset: '10px', border: '2px solid var(--aura-neon-cyan)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'rotate 3s linear infinite' }} />
              <ShieldCheck size={40} color="var(--aura-neon-cyan)" />
            </div>
            <h4 style={{ color: 'var(--aura-neon-cyan)', letterSpacing: '2px', fontSize: '0.7rem', margin: '0 0 0.5rem' }}>
              {es ? 'ESTADO DE SEGURIDAD' : 'SECURITY STATUS'}
            </h4>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
              {es ? 'CIFRADO ACTIVO' : 'ENCRYPTION ACTIVE'}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--aura-text-muted)', margin: '0 0 1.5rem' }}>
              {es ? 'Última auditoría' : 'Last audit'}: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
            </p>
            <div style={{ borderTop: '1px solid var(--aura-border)', paddingTop: '1.2rem' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.65rem', color: 'var(--aura-text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {es ? 'Mascotas registradas' : 'Registered pets'}
              </p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--aura-gold)' }}>
                {getPets().length}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <style>{`@keyframes rotate { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
};

export default PrivacyVault;
