import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import logo from '../../assets/logo-aura.png';
import { useTranslation } from '../../context/LocalizationContext';
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
  const { t } = useTranslation();
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
    if (!raw) { setError(t('recover.errCodeGone')); return; }
    const { token, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { setError(t('recover.errExpired')); return; }
    if (code.trim() !== token) { setError(t('recover.errWrongCode')); return; }
    setStep(3);
  };

  /* ── Step 3: set new password ── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass.length < 6) { setError(t('recover.errShort')); return; }
    if (newPass !== newPass2) { setError(t('recover.errMismatch')); return; }
    if (!confirmed) { setError(t('recover.errNotConfirmed')); return; }
    setLoading(true);
    try {
      const users = storage.getUsers();
      const target = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!target) { setError(t('recover.errNoAccount')); return; }

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
      setError(t('recover.errUpdate'));
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
          <img src={logo} alt="AURA" style={{ height: 58, marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(217, 164, 65, 0.35))' }} />
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.4rem' }}>
            {t('recover.titleLead')} <span style={{ color: 'var(--gold-ink)' }}>{t('recover.titleAccent')}</span>
          </h1>
          <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.75rem', letterSpacing: '2px', margin: 0 }}>
            {t('recover.subtitle')}
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
                {t('recover.step1Intro')}
              </p>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem', color: 'var(--gold-ink)', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>
                  <Mail size={14} /> {t('auth.emailLabel')}
                </label>
                <input type="email" required
                  className="aura-input"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              {error && <p style={{ color: 'var(--pink-ink)', fontSize: '0.78rem', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn-aura" style={{ padding: '1.1rem', width: '100%' }}>
                {t('recover.btnRequest')}
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
                background: 'rgba(217, 164, 65, 0.07)', border: '1px solid rgba(217, 164, 65, 0.3)',
                borderRadius: 4, padding: '1rem 1.2rem',
              }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.68rem', letterSpacing: '2px', color: 'var(--gold-ink)', textTransform: 'uppercase' }}>
                  {t('recover.codeGenerated')}
                </p>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '8px', color: 'var(--gold-ink)' }}>
                  {localCode}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '0.65rem', color: 'var(--aura-text-muted)', lineHeight: 1.6 }}>
                  {t('recover.codeNote')}
                </p>
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem', color: 'var(--gold-ink)', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>
                  <KeyRound size={14} /> {t('recover.codeLabel')}
                </label>
                <input type="text" required maxLength={6}
                  className="aura-input"
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.4rem' }}
                />
              </div>
              {error && <p style={{ color: 'var(--pink-ink)', fontSize: '0.78rem', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn-aura" style={{ padding: '1.1rem', width: '100%' }}>
                {t('recover.btnVerify')}
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
                {t('recover.step3Intro')}
              </p>

              {/* El cifrado no tiene puerta trasera: hay que decirlo antes, no después */}
              <div style={{
                display: 'flex', gap: '0.8rem', alignItems: 'flex-start',
                padding: '1rem 1.1rem', background: 'rgba(236, 92, 141, 0.06)',
                border: '1px solid rgba(236, 92, 141, 0.32)', borderRadius: '0.6rem',
              }}>
                <AlertTriangle size={17} color="var(--aura-neon-pink)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', lineHeight: 1.65, color: '#C93B5C', fontWeight: 600 }}>
                    {t('recover.warnTitle')}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.65, color: 'var(--aura-text-muted)' }}>
                    {t('recover.warnBody')}
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
                <span>{t('recover.confirmCheck')}</span>
              </label>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem', color: 'var(--gold-ink)', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>
                  {t('recover.newPass')}
                </label>
                <input type="password" required
                  className="aura-input"
                  placeholder="••••••••"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label style={{ marginBottom: '0.7rem', color: 'var(--gold-ink)', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600, display: 'block' }}>
                  {t('recover.confirmPass')}
                </label>
                <input type="password" required
                  className="aura-input"
                  placeholder="••••••••"
                  value={newPass2}
                  onChange={e => setNewPass2(e.target.value)}
                />
              </div>
              {error && <p style={{ color: 'var(--pink-ink)', fontSize: '0.78rem', margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn-aura" style={{ padding: '1.1rem', width: '100%' }}>
                {loading ? t('recover.btnSetting') : t('recover.btnSet')}
              </button>
            </motion.form>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <motion.div key="s4"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'grid', gap: '1.5rem' }}
            >
              <CheckCircle2 size={56} color="var(--aura-neon-cyan)" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 16px rgba(67, 191, 199, 0.4))' }} />
              <h2 style={{ color: 'var(--cyan-ink)', margin: 0 }}>{t('recover.doneTitle')}</h2>
              <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.82rem', margin: 0 }}>
                {t('recover.doneBody')}
              </p>
              <button className="btn-aura" style={{ padding: '1.1rem' }} onClick={() => navigate('/')}>
                {t('recover.btnGo')}
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
            <ArrowLeft size={13} /> {t(step > 1 ? 'recover.back' : 'recover.backToLogin')}
          </button>
        )}
      </div>
    </div>
  );
};

export default RecuperarAcceso;
