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

  // sessionWarning: true → show the modern expiry modal
  const [sessionWarning, setSessionWarning] = useState(false);

  const login = (userData) => {
    const session = { user: userData, startTime: Date.now() };
    localStorage.setItem('mascota_health_session', JSON.stringify(session));
    setUser(userData);
    setSessionWarning(false);
  };

  const logout = () => {
    localStorage.removeItem('mascota_health_session');
    setUser(null);
    setSessionWarning(false);
  };

  // Extend session by another 2 hours without forcing re-login
  const renewSession = () => {
    const session = JSON.parse(localStorage.getItem('mascota_health_session'));
    if (session) {
      const renewed = { ...session, startTime: Date.now() };
      localStorage.setItem('mascota_health_session', JSON.stringify(renewed));
    }
    setSessionWarning(false);
  };

  // Auto-lock timer — checks every 60 s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const session = JSON.parse(localStorage.getItem('mascota_health_session'));
      if (session && vault.isSessionExpired(session.startTime)) {
        setSessionWarning(true); // show modal instead of alert
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, renewSession, sessionWarning }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
