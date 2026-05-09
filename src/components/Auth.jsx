import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { vault } from '../utils/vault';
import { KeyRound, Mail, ShieldCheck, UserPlus, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo-aura-pets.png';
import { IntroVideoModal } from './IntroVideoPlayer';

const Auth = () => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const users = JSON.parse(localStorage.getItem('mascota_health_users') || '[]');
      const hashedPass = await vault.hashPassword(formData.password);
      
      if (isRegister) {
        if (users.find(u => u.email === formData.email)) {
          setError('Identidad ya registrada en la red AURA');
          return;
        }
        const newUser = { 
          id: Date.now().toString(), 
          email: formData.email, 
          password: hashedPass 
        };
        localStorage.setItem('mascota_health_users', JSON.stringify([...users, newUser]));
        login(newUser);
      } else {
        const user = users.find(u => u.email === formData.email && u.password === hashedPass);
        if (user) {
          login(user);
        } else {
          setError('Clave de acceso o identidad no válida');
        }
      }
    } catch (err) {
      setError('Error en el protocolo de seguridad Vault™');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <IntroVideoModal
      isOpen={showIntroModal}
      onContinue={() => { setShowIntroModal(false); setIsRegister(true); }}
    />
    <div className="auth-container fade-in" style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      background: 'var(--aura-black)',
      padding: '1.5rem'
    }}>
      <div className="aura-card" style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <header style={{ marginBottom: '3.5rem' }}>
          <img 
            src={logo} 
            alt="AURA Logo" 
            style={{ height: '70px', marginBottom: '2rem', filter: 'drop-shadow(0 0 10px var(--aura-gold-muted))' }} 
          />
          <h1 style={{ fontSize: '2.4rem', margin: '0 0 0.5rem', letterSpacing: '-1px' }}>AURA <span style={{ color: 'var(--aura-gold)' }}>Pets Global</span></h1>
          <p style={{ color: 'var(--aura-text-muted)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {isRegister ? 'Crear Registro Biométrico' : 'Portal de Acceso AURA'}
          </p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem', textAlign: 'left' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.8rem', color: 'var(--aura-gold)', fontWeight: 500, fontSize: '0.8rem', letterSpacing: '1px' }}>
              <Mail size={16} /> DIRECCIÓN DE ENLACE
            </label>
            <input 
              type="email" 
              required
              placeholder="ejemplo@aura.com"
              style={{ 
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--aura-border)', 
                padding: '1.2rem', color: 'white', fontSize: '1rem', outline: 'none'
              }}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.8rem', color: 'var(--aura-gold)', fontWeight: 500, fontSize: '0.8rem', letterSpacing: '1px' }}>
              <Lock size={16} /> CLAVE DE SEGURIDAD
            </label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              style={{ 
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--aura-border)', 
                padding: '1.2rem', color: 'white', fontSize: '1rem', outline: 'none'
              }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '1rem', background: 'rgba(255, 0, 110, 0.05)', border: '1px solid var(--aura-neon-pink)',
              color: 'var(--aura-neon-pink)', fontSize: '0.8rem', textAlign: 'center', letterSpacing: '1px'
            }}>
              {error.toUpperCase()}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-aura" style={{ padding: '1.2rem', width: '100%' }}>
            {loading ? 'AUTENTICANDO...' : (isRegister ? 'ACTIVAR AURA PROTOCOL' : 'ACCEDER AL EXPEDIENTE')}
          </button>
        </form>

        <footer style={{ marginTop: '2.5rem', display: 'grid', gap: '0.8rem', justifyItems: 'center' }}>
          <button
            style={{
              background: 'none', border: 'none', color: 'var(--aura-text-muted)',
              fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', letterSpacing: '1px'
            }}
            onClick={() => {
              if (!isRegister) {
                setShowIntroModal(true);
              } else {
                setIsRegister(false);
              }
            }}
          >
            {isRegister ? '¿YA TIENES UN REGISTRO? ENTRA AQUÍ' : '¿NUEVO EN EL ECOSISTEMA? CREAR CUENTA'}
          </button>
          {!isRegister && (
            <a
              href="/recuperar-acceso"
              style={{
                color: 'var(--aura-gold)', fontSize: '0.75rem', letterSpacing: '1.5px',
                textDecoration: 'none', opacity: 0.75, fontWeight: 600,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.75'}
            >
              ¿OLVIDÓ SU CLAVE DE SEGURIDAD?
            </a>
          )}
        </footer>
      </div>
    </div>
    </>
  );
};

export default Auth;
