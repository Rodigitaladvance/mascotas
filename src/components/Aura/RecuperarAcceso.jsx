import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import logo from '../../assets/logo-aura-pets.png';
import { vault } from '../../utils/vault';

/* ── Client-side token: stored in localStorage ── */
const TOKEN_TTL_MS = 20 * 60 * 1000; // 20 min

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ══════════════════════════════════════════════
   RecuperarAcceso
   Route: /recuperar-acceso
   Flow:
     Step 1 — enter email
     Step 2 — enter 6-digit code (shown locally, email requires backend)
     Step 3 — set new password
══════════════════════════════════════════════ */
const RecuperarAcceso = () => {
  const navigate = useNavigate();
  const [step,     setStep]     = useState(1);
  const [email,    setEmail]    = useState('');
  const [code,     setCode]     = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [localCode, setLocalCode] = useState(''); // shown in demo banner

  /* ── Step 1: validate email exists ── */
  const handleRequestCode = (e) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem('mascota_health_users') || '[]');
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      /* Don't reveal if email exists (security best-practice) */
      /* Still proceed to step 2 to prevent enumeration */
    }

    const token = generateCode();
    const expiry = Date.now() + TOKEN_TTL_MS;
    localStorage.setItem(`aura_reset_${email.toLowerCase()}`, JSON.stringify({ token, expiry }));
    setLocalCode(token); // only shown because there's no backend mailer
    setStep(2);
  };

  /* ── Step 2: verify code ── */
  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError('');
    const raw = localStorage.getItem(`aura_reset_${email.toLowerCase()}`);
    if (!raw) { setError('Código caducado. Solicita uno nuevo.'); return; }
    const { token, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { setError('El código ha expirado (20 min). Solicita uno nuevo.'); return; }
    if (code.trim() !== token) { setError('Código incorrecto.'); return; }
    setStep(3);
  };

  /* ── Step 3: set new password ── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass.length < 6) { setError('La clave debe tener al menos 6 caracteres.'); return; }
    if (newPass !== newPass2) { setError('Las claves no coinciden.'); return; }
    setLoading(true);
    try {
      const hashed = await vault.hashPassword(newPass);
      const users  = JSON.parse(localStorage.getItem('mascota_health_users') || '[]');
      const updated = users.map(u =>
        u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: hashed } : u,
      );
      localStorage.setItem('mascota_health_users', JSON.stringify(updated));
      localStorage.removeItem(`aura_reset_${email.toLowerCase()}`);
      setStep(4);
    } catch {
      setError('Error al actualizar la clave.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'var(--aura-black)', padding: '1.5rem',
    }}>
      <div className="aura-card" style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        {/* Logo */}
        <header style={{ marginBottom: '2.5rem' }}>
          <img src={logo} alt="AURA" style={{ height: 58, marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.35))' }} />
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.4rem' }}>
            Recuperar <span style={{ color: 'var(--aura-gold)' }}>Acceso</span>
          </h1>
          <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.75rem', letterSpacing: '2px', margin: 0 }}>
            PORTAL DE SEGURIDAD AURA
          </p>
        </header>

        <AnimatePresence mode="wait">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <motion.form key="s1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRequestCode}
              style={{ display: 'grid', gap: '1.5rem', textAlign: 'left' }}
            >
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--aura-text-muted)', lineHeight: 1.7, textAlign: 'center' }}>
                Introduce tu dirección de enlace registrada. Recibirás un código de acceso temporal válido por 20 minutos.
              </p>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem', color: 'var(--aura-gold)', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>
                  <Mail size={14} /> DIRECCIÓN DE ENLACE
                </label>
                <input type="email" required
                  className="aura-input"
                  placeholder="ejemplo@aura.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              {error && <p style={{ color: 'var(--aura-neon-pink)', fontSize: '0.78rem', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn-aura" style={{ padding: '1.1rem', width: '100%' }}>
                SOLICITAR CÓDIGO TEMPORAL
              </button>
            </motion.form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <motion.form key="s2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyCode}
              style={{ display: 'grid', gap: '1.5rem', textAlign: 'left' }}
            >
              {/* Demo banner — shown because there's no backend mailer */}
              <div style={{
                background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 4, padding: '1rem 1.2rem',
              }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.68rem', letterSpacing: '2px', color: 'var(--aura-gold)', textTransform: 'uppercase' }}>
                  Código temporal generado
                </p>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '8px', color: 'var(--aura-gold)' }}>
                  {localCode}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '0.65rem', color: 'var(--aura-text-muted)', lineHeight: 1.6 }}>
                  En producción este código llegaría por email. El envío de emails requiere un servicio backend (Resend, SendGrid, etc.). El código expira en 20 min.
                </p>
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem', color: 'var(--aura-gold)', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>
                  <KeyRound size={14} /> CÓDIGO DE SEGURIDAD
                </label>
                <input type="text" required maxLength={6}
                  className="aura-input"
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem' }}
                />
              </div>
              {error && <p style={{ color: 'var(--aura-neon-pink)', fontSize: '0.78rem', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn-aura" style={{ padding: '1.1rem', width: '100%' }}>
                VERIFICAR CÓDIGO
              </button>
            </motion.form>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <motion.form key="s3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword}
              style={{ display: 'grid', gap: '1.5rem', textAlign: 'left' }}
            >
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--aura-text-muted)', lineHeight: 1.7, textAlign: 'center' }}>
                Introduce tu nueva clave de seguridad.
              </p>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem', color: 'var(--aura-gold)', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>
                  NUEVA CLAVE
                </label>
                <input type="password" required
                  className="aura-input"
                  placeholder="••••••••"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label style={{ marginBottom: '0.7rem', color: 'var(--aura-gold)', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600, display: 'block' }}>
                  CONFIRMAR CLAVE
                </label>
                <input type="password" required
                  className="aura-input"
                  placeholder="••••••••"
                  value={newPass2}
                  onChange={e => setNewPass2(e.target.value)}
                />
              </div>
              {error && <p style={{ color: 'var(--aura-neon-pink)', fontSize: '0.78rem', margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn-aura" style={{ padding: '1.1rem', width: '100%' }}>
                {loading ? 'ACTUALIZANDO…' : 'ESTABLECER NUEVA CLAVE'}
              </button>
            </motion.form>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <motion.div key="s4"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'grid', gap: '1.5rem' }}
            >
              <CheckCircle2 size={56} color="var(--aura-neon-cyan)" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 16px rgba(0,245,255,0.4))' }} />
              <h2 style={{ color: 'var(--aura-neon-cyan)', margin: 0 }}>Clave Actualizada</h2>
              <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.82rem', margin: 0 }}>
                Tu clave de seguridad ha sido actualizada correctamente.
              </p>
              <button className="btn-aura" style={{ padding: '1.1rem' }} onClick={() => navigate('/')}>
                ACCEDER AL EXPEDIENTE
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Back link */}
        {step < 4 && (
          <button
            style={{ background: 'none', border: 'none', color: 'var(--aura-text-muted)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '2rem auto 0' }}
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
          >
            <ArrowLeft size={13} /> {step > 1 ? 'Volver' : 'Volver al acceso'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RecuperarAcceso;
