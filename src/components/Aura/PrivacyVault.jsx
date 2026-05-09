import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, EyeOff, Download, Trash2, ChevronRight, FileText, AlertTriangle, ExternalLink, Send, X, MessageSquare } from 'lucide-react';
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

  doc.setFillColor(212, 175, 55);
  doc.rect(0, 0, W, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(10, 10, 15);
  doc.text('AURA Pets — Expediente Médico Digital', 105, 14, { align: 'center' });

  doc.setFillColor(10, 10, 15);
  doc.rect(0, 22, W, 8, 'F');
  doc.setFontSize(7);
  doc.setTextColor(180, 160, 80);
  doc.text('EXCELENCIA · EXPEDIENTE MÉDICO PRIVADO · GENERADO: ' + date, 105, 27.5, { align: 'center' });

  let y = 40;

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
    doc.setFillColor(20, 20, 28);
    doc.roundedRect(10, y, W - 20, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(212, 175, 55);
    doc.text(`${pet.avatar || '🐾'} ${pet.name?.toUpperCase() || 'SIN NOMBRE'}`, 15, y + 7);
    y += 15;

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

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(10, y + 2, W - 10, y + 2);
    y += 10;

    if (y > 260) { doc.addPage(); y = 20; }
  }

  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(`AURA Pets · Documento generado el ${date} · Solo informativo`, 105, 288, { align: 'center' });

  doc.save(`AURA_Expediente_${date.replace(/\//g, '-')}.pdf`);
};

/* ── Legal content — locale-aware ── */
const getLegalContent = (locale) => {
  const es = locale === 'es';
  const langInstruction = es ? 'Responde siempre en español.' : 'Always respond in English.';
  return {
    hipaa: {
      title: 'HIPAA — Health Insurance Portability and Accountability Act',
      accentColor: '#C9A84C',
      icon: <Lock size={22} />,
      cardDesc: es
        ? 'Protege la privacidad y seguridad de la información médica de los pacientes en EE.UU. Otorga a los pacientes el derecho a acceder a sus registros, solicitar correcciones y saber quién ha accedido a sus datos.'
        : 'Protects the privacy and security of patients medical information in the USA. Grants patients the right to access their health records, request corrections, and know who has accessed their data.',
      sections: [
        {
          label: es ? '¿Qué protege?' : 'What it protects',
          text: es
            ? 'Registros médicos, información de facturación, historial de salud, resultados de pruebas'
            : 'Medical records, billing information, health history, test results',
        },
        {
          label: es ? '¿A quién aplica?' : 'Who it applies to',
          text: es
            ? 'Hospitales, clínicas, aseguradoras y cualquier app que maneje datos de salud'
            : 'Hospitals, clinics, insurers, and any app handling health data',
        },
        {
          label: es ? 'Tus derechos' : 'Your rights',
          text: es
            ? '• Acceder a tus registros\n• Solicitar correcciones\n• Saber quién accedió a tus datos\n• Presentar quejas'
            : '• Access your records\n• Request corrections\n• Know who accessed your data\n• File complaints',
        },
      ],
      systemPrompt: `Eres un experto en HIPAA. Responde preguntas sobre esta ley de forma clara y sencilla. Contexto: el usuario tiene una app de salud para mascotas llamada AURA Pets Global. ${langInstruction}`,
      placeholder: es
        ? 'Ej: ¿Qué es PHI? ¿Cómo afecta HIPAA a mi clínica veterinaria?'
        : 'E.g. What is PHI? How does HIPAA affect my veterinary clinic?',
      chatLabel: es ? 'PREGUNTA AL EXPERTO IA' : 'ASK THE AI EXPERT',
      chatHint: es
        ? 'Escribe tu pregunta sobre HIPAA y el asistente IA te responderá.'
        : 'Type your question about HIPAA and the AI assistant will reply.',
      consultLabel: es ? 'Consultar experto IA' : 'Ask AI Expert',
    },
    gdpr: {
      title: 'GDPR — General Data Protection Regulation',
      accentColor: '#B57BFF',
      icon: <EyeOff size={22} />,
      cardDesc: es
        ? 'Protege los datos personales y la privacidad de los ciudadanos de la UE. Los usuarios tienen derecho a acceder, corregir, eliminar y transferir sus datos.'
        : 'Protects personal data and privacy of EU citizens. Gives users the right to access, correct, delete and transfer their data. Organizations must report breaches within 72 hours.',
      sections: [
        {
          label: es ? '¿Qué protege?' : 'What it protects',
          text: es
            ? 'Nombre, email, ubicación, datos de salud, comportamiento de navegación, identificadores de dispositivo'
            : 'Name, email, location, health data, browsing behavior, device identifiers',
        },
        {
          label: es ? '¿A quién aplica?' : 'Who it applies to',
          text: es
            ? 'Cualquier organización que procese datos de residentes de la UE, sin importar dónde esté ubicada'
            : 'Any organization processing data of EU residents, regardless of where they are based',
        },
        {
          label: es ? 'Tus derechos' : 'Your rights',
          text: es
            ? '• Acceso\n• Rectificación\n• Supresión (derecho al olvido)\n• Portabilidad de datos\n• Retirar el consentimiento'
            : '• Access\n• Rectification\n• Erasure (right to be forgotten)\n• Data portability\n• Withdraw consent',
        },
      ],
      systemPrompt: `Eres un experto en GDPR europeo. Responde preguntas sobre esta ley de forma clara y sencilla. Contexto: el usuario tiene una app de salud para mascotas llamada AURA Pets Global. ${langInstruction}`,
      placeholder: es
        ? 'Ej: ¿Qué es el derecho al olvido? ¿Necesito un DPO?'
        : 'E.g. What is the right to erasure? Do I need a DPO?',
      chatLabel: es ? 'PREGUNTA AL EXPERTO IA' : 'ASK THE AI EXPERT',
      chatHint: es
        ? 'Escribe tu pregunta sobre GDPR y el asistente IA te responderá.'
        : 'Type your question about GDPR and the AI assistant will reply.',
      consultLabel: es ? 'Consultar experto IA' : 'Ask AI Expert',
    },
  };
};

/* ════════════════ Legal Chat Modal ════════════════ */
const LegalChatModal = ({ type, onClose }) => {
  const { locale } = useTranslation();
  const content = getLegalContent(locale)[type];
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
      if (!apiKey) throw new Error('VITE_ANTHROPIC_KEY no está configurada en .env.local');

      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: content.systemPrompt,
          messages: history,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text || '—';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(18px)', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1E0830 0%, #280D3D 100%)',
          border: `1px solid ${content.accentColor}40`,
          borderRadius: '1.2rem',
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 40px ${content.accentColor}18`,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.9rem',
          padding: '1.4rem 1.6rem',
          borderBottom: `1px solid ${content.accentColor}25`,
          flexShrink: 0,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `${content.accentColor}18`,
            border: `1px solid ${content.accentColor}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: content.accentColor, flexShrink: 0,
          }}>
            {content.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              margin: 0, fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)',
              color: content.accentColor, fontWeight: 700, lineHeight: 1.3,
              textShadow: `0 0 16px ${content.accentColor}50`,
            }}>
              {content.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--aura-text-muted)', padding: '0.3rem', flexShrink: 0,
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

          {/* Legal summary sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {content.sections.map((s, i) => (
              <div key={i} style={{
                background: `${content.accentColor}08`,
                border: `1px solid ${content.accentColor}20`,
                borderRadius: '0.8rem',
                padding: '1rem 1.2rem',
              }}>
                <p style={{
                  margin: '0 0 0.4rem',
                  fontSize: '0.68rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: content.accentColor,
                  fontWeight: 700,
                }}>
                  {s.label}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  color: 'var(--aura-text-muted)',
                  lineHeight: 1.75,
                  whiteSpace: 'pre-line',
                }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            color: 'var(--aura-text-muted)', fontSize: '0.72rem', letterSpacing: '2px',
          }}>
            <div style={{ flex: 1, height: 1, background: `${content.accentColor}20` }} />
            <MessageSquare size={13} color={content.accentColor} />
            <span style={{ color: content.accentColor }}>{content.chatLabel}</span>
            <div style={{ flex: 1, height: 1, background: `${content.accentColor}20` }} />
          </div>

          {/* Chat messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {messages.length === 0 && (
              <p style={{
                textAlign: 'center',
                color: 'var(--aura-text-muted)',
                fontSize: '0.78rem',
                opacity: 0.6,
                margin: '0.5rem 0',
              }}>
                {content.chatHint}
              </p>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '0.7rem 1rem',
                  borderRadius: m.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                  background: m.role === 'user' ? '#3D1A6B' : '#1E0830',
                  border: m.role === 'user'
                    ? `1px solid ${content.accentColor}35`
                    : '1px solid rgba(255,255,255,0.06)',
                  fontSize: '0.83rem',
                  lineHeight: 1.65,
                  color: '#FFFFFF',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '0.7rem 1rem',
                  borderRadius: '1rem 1rem 1rem 0.25rem',
                  background: '#1E0830',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', gap: '5px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(d => (
                    <span key={d} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: content.accentColor,
                      display: 'inline-block',
                      animation: `dotPulse 1.2s ${d * 0.2}s infinite`,
                      opacity: 0.7,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p style={{
                color: 'var(--aura-danger)',
                fontSize: '0.75rem',
                textAlign: 'center',
                background: 'rgba(240,149,149,0.08)',
                border: '1px solid rgba(240,149,149,0.2)',
                borderRadius: '0.5rem',
                padding: '0.6rem 1rem',
                margin: 0,
              }}>
                {error}
              </p>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div style={{
          display: 'flex', gap: '0.7rem', padding: '1rem 1.4rem',
          borderTop: `1px solid ${content.accentColor}20`,
          flexShrink: 0,
          background: 'rgba(10,5,20,0.5)',
        }}>
          <input
            className="aura-input"
            style={{ flex: 1, margin: 0, fontSize: '0.85rem', padding: '0.65rem 1rem' }}
            placeholder={content.placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? `${content.accentColor}20` : 'transparent',
              border: `1px solid ${input.trim() && !loading ? content.accentColor : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '0.6rem',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              color: input.trim() && !loading ? content.accentColor : 'var(--aura-text-muted)',
              padding: '0 1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
              height: 42,
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </motion.div>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
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
  const [destroyed, setDestroyed]             = useState(false);
  const [legalModal, setLegalModal]           = useState(null); // 'hipaa' | 'gdpr' | null

  const legalContent = getLegalContent(locale);

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
    const pets = getPets();
    pets.forEach(p => { storage.deletePet(user.id, p.id); });
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
      <AnimatePresence>
        {showDestruction && (
          <DestructionModal
            onConfirm={handleDestroy}
            onClose={() => setShowDestruction(false)}
            locale={locale}
          />
        )}
        {legalModal && (
          <LegalChatModal
            key={legalModal}
            type={legalModal}
            onClose={() => setLegalModal(null)}
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

          {/* Compliance cards — clickable */}
          <div className="compliance-grid">
            <div
              className="aura-card"
              onClick={() => setLegalModal('hipaa')}
              style={{
                padding: '2rem', cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                borderColor: 'rgba(201,168,76,0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.55)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), 0 0 24px rgba(201,168,76,0.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <Lock size={24} color="var(--aura-gold)" style={{ marginBottom: '1.5rem' }} />
              <h4 style={{ margin: '0 0 0.5rem' }}>HIPAA (USA)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--aura-text-muted)', margin: '0 0 1rem' }}>
                {legalContent.hipaa.cardDesc}
              </p>
              <span style={{
                fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase',
                color: 'var(--aura-gold)', display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                <MessageSquare size={11} /> {legalContent.hipaa.consultLabel}
              </span>
            </div>

            <div
              className="aura-card"
              onClick={() => setLegalModal('gdpr')}
              style={{
                padding: '2rem', cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                borderColor: 'rgba(181,123,255,0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(181,123,255,0.55)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), 0 0 24px rgba(181,123,255,0.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = 'rgba(181,123,255,0.2)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <EyeOff size={24} color="#B57BFF" style={{ marginBottom: '1.5rem' }} />
              <h4 style={{ margin: '0 0 0.5rem' }}>GDPR (Europa)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--aura-text-muted)', margin: '0 0 1rem' }}>
                {legalContent.gdpr.cardDesc}
              </p>
              <span style={{
                fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase',
                color: '#B57BFF', display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                <MessageSquare size={11} /> {legalContent.gdpr.consultLabel}
              </span>
            </div>
          </div>

          {/* Data management */}
          <div className="aura-card" style={{ padding: '2rem', borderStyle: 'dashed' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
              {es ? 'Gestión de Datos' : 'Data Management'}
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <button className="btn-aura"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'rgba(212,175,55,0.05)' }}
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

      <style>{`
        @keyframes rotate { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PrivacyVault;
