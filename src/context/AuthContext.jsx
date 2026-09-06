import React, { createContext, useContext, useState, useEffect } from 'react';
import { vault } from '../utils/vault';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const session = JSON.parse(localStorage.getItem('mascota_health_session'));
      if (session && !vault.isSessionExpired(session.startTime)) return session.user;
    } catch { /* sesión ilegible: se descarta */ }
    localStorage.removeItem('mascota_health_session');
    return null;
  });

  // sessionWarning: true → show the modern expiry modal
  const [sessionWarning, setSessionWarning] = useState(false);

  /* La bóveda se abre de forma asíncrona. Hasta que termine no se puede leer
     ningún expediente, así que la app espera en lugar de mostrar datos vacíos.
     Se deriva en vez de guardarse en estado: sin usuario o con la bóveda ya
     abierta está lista, y el intento de restauración solo marca su final. */
  const [restoreAttempted, setRestoreAttempted] = useState(false);
  const vaultReady = !user || vault.isUnlocked() || restoreAttempted;

  useEffect(() => {
    if (!user || vault.isUnlocked()) return;

    let cancelled = false;
    (async () => {
      // Tras recargar la página la clave sigue en sessionStorage; si la pestaña
      // se cerró, no hay clave y hay que volver a pedir la contraseña.
      const restored = await vault.restoreSession(user.id);
      if (cancelled) return;
      if (!restored) {
        localStorage.removeItem('mascota_health_session');
        setUser(null);
      }
      setRestoreAttempted(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const login = (userData) => {
    const session = { user: userData, startTime: Date.now() };
    localStorage.setItem('mascota_health_session', JSON.stringify(session));
    setUser(userData);
    setSessionWarning(false);
  };

  const logout = () => {
    vault.lock(); // destruye la clave de cifrado
    localStorage.removeItem('mascota_health_session');
    setUser(null);
    setSessionWarning(false);
  };

  // Extend session by another 2 hours without forcing re-login
  const renewSession = () => {
    try {
      const session = JSON.parse(localStorage.getItem('mascota_health_session'));
      if (session) {
        localStorage.setItem(
          'mascota_health_session',
          JSON.stringify({ ...session, startTime: Date.now() }),
        );
      }
    } catch { /* sin sesión que renovar */ }
    setSessionWarning(false);
  };

  // Auto-lock timer — checks every 60 s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      try {
        const session = JSON.parse(localStorage.getItem('mascota_health_session'));
        if (session && vault.isSessionExpired(session.startTime)) {
          setSessionWarning(prev => prev ? prev : true);
        }
      } catch { /* ignorar */ }
    }, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, renewSession, sessionWarning, vaultReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
