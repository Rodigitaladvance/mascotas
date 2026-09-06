import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import logo from '../../assets/logo-aura-pets.png';
import { vault } from '../../utils/vault';
import { storage } from '../../utils/storage';

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
  const [confirmed, setConfirmed] = useState(false);
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
    if (!confirmed) { setError('Debes confirmar que entiendes que perderás los expedientes.'); return; }
    setLoading(true);
    try {
      const users = storage.getUsers();
      const target = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!target) { setError('No existe ninguna cuenta con ese correo.'); return; }

      // La clave de cifrado se deriva de la contraseña. Sin la contraseña
      // anterior no hay forma de descifrar lo guardado, así que restablecerla
      // obliga a partir de una bóveda nueva y vacía: lo contrario dejaría al
      // usuario con una cuenta que abre pero cuyos datos no puede leer nadie.
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`vault_${target.id}_`)) localStorage.removeItem(key);
      });

      const { salt, verifier } = await vault.createSession(target.id, newPass);
      vault.lock(); // que tenga que iniciar sesión de forma explícita

      const rebuilt = { id: target.id, email: target.email, salt, verifier };
      localStorage.setItem(
        'mascota_health_users',
        JSON.stringify(users.map(u => (u.id === target.id ? rebuilt : u))),
      );
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

              {/* El cifrado no tiene puerta trasera: hay que decirlo antes, no después */}
              <div style={{
                display: 'flex', gap: '0.8rem', alignItems: 'flex-start',
                padding: '1rem 1.1rem', background: 'rgba(255,0,110,0.06)',
                border: '1px solid rgba(255,0,110,0.32)', borderRadius: '0.6rem',
              }}>
                <AlertTriangle size={17} color="var(--aura-neon-pink)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', lineHeight: 1.65, color: '#ff8fb4', fontWeight: 600 }}>
                    Perderás todos los expedientes guardados.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.65, color: 'var(--aura-text-muted)' }}>
                    Tus datos están cifrados con una clave que nace de tu contraseña anterior.
                    Sin ella no se pueden descifrar: ni tú ni nosotros podemos recuperarlos.
                    Al establecer una clave nueva empiezas con una bóveda vacía.
                  </p>
                </div>
              </div>

              <label style={{
                display: 'flex', gap: '0.7rem', alignItems: 'flex-start', cursor: 'pointer',
                fontSize: '0.78rem', lineHeight: 1.6, color: 'var(--aura-text-muted)',
              }}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--aura-gold)', width: 16, height: 16, flexShrink: 0 }}
                />
                <span>Entiendo que los expedientes guardados se perderán de forma irreversible.</span>
              </label>
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
