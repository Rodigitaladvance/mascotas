import { vault } from './vault';

/**
 * Capa de almacenamiento multiusuario.
 *
 * Las lecturas son síncronas porque van contra el caché descifrado que el vault
 * carga al abrir sesión. Las escrituras devuelven una promesa: hay que esperarla
 * antes de dar por buena la operación, porque es donde afloran los errores de
 * cifrado o de falta de espacio.
 */
export const storage = {
  /* ── Usuarios ── */
  // La lista de cuentas no va cifrada: solo contiene email, sal y verificador.
  // El verificador no permite descifrar nada, únicamente comprobar la contraseña.
  getUsers: () => {
    try {
      return JSON.parse(localStorage.getItem('mascota_health_users') || '[]');
    } catch {
      return [];
    }
  },

  saveUser: (user) => {
    const users = storage.getUsers();
    localStorage.setItem('mascota_health_users', JSON.stringify([...users, user]));
  },

  updateUser: (user) => {
    const users = storage.getUsers().map((u) => (u.id === user.id ? user : u));
    localStorage.setItem('mascota_health_users', JSON.stringify(users));
  },

  /* ── Mascotas ── */
  getPets: (userId) => vault.getScopedData(userId, 'pets') || [],

  savePet: (userId, pet) => {
    const allPets = storage.getPets(userId);
    return vault.setScopedData(userId, 'pets', [...allPets, pet]);
  },

  updatePet: (userId, petId, updateFn) => {
    const updated = storage.getPets(userId).map((p) => (p.id === petId ? updateFn(p) : p));
    return vault.setScopedData(userId, 'pets', updated);
  },

  deletePet: (userId, petId) => {
    const remaining = storage.getPets(userId).filter((p) => p.id !== petId);
    vault.removeScopedData(userId, `history_${petId}`);
    vault.removeScopedData(userId, `docs_${petId}`);
    return vault.setScopedData(userId, 'pets', remaining);
  },

  /* ── Documentos adjuntos ── */
  getDocuments: (userId, petId) => vault.getScopedData(userId, `docs_${petId}`) || [],

  saveDocument: (userId, petId, doc) => {
    const docs = storage.getDocuments(userId, petId);
    return vault.setScopedData(userId, `docs_${petId}`, [...docs, doc]);
  },

  /* ── Historial clínico ── */
  // Antes vivía suelto en localStorage, sin cifrar y sin separar por usuario.
  getHistory: (userId, petId, fallback) => vault.getScopedData(userId, `history_${petId}`) ?? fallback,

  saveHistory: (userId, petId, data) => vault.setScopedData(userId, `history_${petId}`, data),
};
