// Security Vault Utility (Bank-Grade Simulation)
export const vault = {
  // Hashing a password using SHA-256
  hashPassword: async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'mascota_salt_2024'); // Simple salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Multi-tenant data barrier
  getScopedData: (userId, key) => {
    const rawData = localStorage.getItem(`vault_${userId}_${key}`);
    return rawData ? JSON.parse(rawData) : null;
  },

  setScopedData: (userId, key, data) => {
    try {
      localStorage.setItem(`vault_${userId}_${key}`, JSON.stringify(data));
    } catch (err) {
      console.error('[AURA Vault] Error al guardar datos:', err);
      throw err;
    }
  },

  // Vault auto-lock logic
  sessionDuration: 2 * 60 * 60 * 1000, // 2 hours
  
  isSessionExpired: (startTime) => {
    return (Date.now() - startTime) > vault.sessionDuration;
  }
};
