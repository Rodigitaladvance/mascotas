import React, { createContext, useContext, useState, useEffect } from 'react';
import { vault } from '../utils/vault';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const session = JSON.parse(localStorage.getItem('mascota_health_session'));
    if (session && !vault.isSessionExpired(session.startTime)) {
      return session.user;
    }
    localStorage.removeItem('mascota_health_session');
    return null;
  });

  const login = (userData) => {
    const session = {
      user: userData,
      startTime: Date.now()
    };
    localStorage.setItem('mascota_health_session', JSON.stringify(session));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('mascota_health_session');
    setUser(null);
  };

  // Auto-lock timer
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      const session = JSON.parse(localStorage.getItem('mascota_health_session'));
      if (session && vault.isSessionExpired(session.startTime)) {
        logout();
        alert('Sesión expirada por seguridad. La bóveda ha sido bloqueada.');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
