import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { vault } from '../utils/vault';
import { KeyRound, Mail, ShieldCheck, UserPlus } from 'lucide-react';

const Auth = () => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
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
          setError('Este email ya está en uso');
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
          setError('Credenciales no válidas');
        }
      }
    } catch (err) {
      setError('Error en la bóveda de seguridad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in" style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      background: 'radial-gradient(circle at top right, rgba(74, 124, 89, 0.1), transparent)'
    }}>
      <div className="glass-card" style={{ padding: '3.5rem', width: '100%', maxWidth: '480px', border: '1px solid rgba(255,255,255,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '15px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(74, 124, 89, 0.3)'
          }}>
            <ShieldCheck color="white" size={32} />
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: 800 }}>MascotaHealth <span style={{ color: 'var(--primary)', fontSize: '1rem', verticalAlign: 'top' }}>PRO</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {isRegister ? 'Crea tu bóveda sanitaria personal' : 'Puerto seguro para tus mascotas'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.8rem' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem', fontWeight: 600, fontSize: '0.9rem' }}>
              <Mail size={16} /> Correo Electrónico
            </label>
            <input 
              type="email" 
              required
              className="btn" 
              placeholder="ejemplo@correo.com"
              style={{ width: '100%', background: 'rgba(255,255,255,0.8)', padding: '1.1rem', fontSize: '1rem' }}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem', fontWeight: 600, fontSize: '0.9rem' }}>
              <KeyRound size={16} /> Contraseña de Bóveda
            </label>
            <input 
              type="password" 
              required
              className="btn" 
              placeholder="••••••••"
              style={{ width: '100%', background: 'rgba(255,255,255,0.8)', padding: '1.1rem', fontSize: '1rem' }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '0.8rem', background: 'rgba(230, 75, 75, 0.1)', borderLeft: '3px solid var(--status-urgent)',
              color: 'var(--status-urgent)', fontSize: '0.85rem', textAlign: 'center' 
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1.2rem', justifyContent: 'center', fontSize: '1.1rem', borderRadius: '12px' }}>
            {loading ? 'Validando...' : (isRegister ? 'Activar Cuenta' : 'Acceder al Panel')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            className="btn" 
            style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? '¿Ya proteges mascotas? Entra aquí' : '¿Nuevo en MascotaHealth? Crea tu cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
