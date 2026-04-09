import React, { useState } from 'react';

const Auth = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const users = JSON.parse(localStorage.getItem('mascota_health_users') || '[]');
    
    if (isRegister) {
      if (users.find(u => u.email === formData.email)) {
        setError('El usuario ya existe');
        return;
      }
      const newUser = { 
        id: Date.now().toString(), 
        email: formData.email, 
        password: btoa(formData.password) // Basic simulation of encryption
      };
      localStorage.setItem('mascota_health_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } else {
      const user = users.find(u => u.email === formData.email && u.password === btoa(formData.password));
      if (user) {
        onLogin(user);
      } else {
        setError('Credenciales incorrectas');
      }
    }
  };

  return (
    <div className="auth-container fade-in" style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' 
    }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🐾 MascotaHealth</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isRegister ? 'Crea tu cuenta profesional' : 'Bienvenido de nuevo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label>
            <input 
              type="email" 
              required
              className="btn" 
              style={{ width: '100%', background: 'white', border: '1px solid var(--glass-border)', padding: '1rem' }}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Contraseña</label>
            <input 
              type="password" 
              required
              className="btn" 
              style={{ width: '100%', background: 'white', border: '1px solid var(--glass-border)', padding: '1rem' }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && <p style={{ color: 'var(--status-urgent)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', justifyContent: 'center', fontSize: '1.1rem' }}>
            {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            className="btn" 
            style={{ color: 'var(--primary)', fontWeight: 600 }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
