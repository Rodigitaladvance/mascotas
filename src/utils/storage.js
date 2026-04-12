import { vault } from './vault';

// Professional Multi-tenant Storage Layer
export const storage = {
  // Users are stored globally but passwords are hashed
  getUsers: () => JSON.parse(localStorage.getItem('mascota_health_users') || '[]'),
  
  saveUser: (user) => {
    const users = storage.getUsers();
    localStorage.setItem('mascota_health_users', JSON.stringify([...users, user]));
  },

  // Pets are stored per-user using the Vault scoped key
  getPets: (userId) => {
    return vault.getScopedData(userId, 'pets') || [];
  },

  savePet: (userId, pet) => {
    const allPets = storage.getPets(userId);
    vault.setScopedData(userId, 'pets', [...allPets, pet]);
  },

  updatePet: (userId, petId, updateFn) => {
    const allPets = storage.getPets(userId);
    const updated = allPets.map(p => p.id === petId ? updateFn(p) : p);
    vault.setScopedData(userId, 'pets', updated);
  },

  // Document Storage (Base64)
  saveDocument: (userId, petId, doc) => {
    const docs = vault.getScopedData(userId, `docs_${petId}`) || [];
    vault.setScopedData(userId, `docs_${petId}`, [...docs, doc]);
  },

  getDocuments: (userId, petId) => {
    return vault.getScopedData(userId, `docs_${petId}`) || [];
  },

  deletePet: (userId, petId) => {
    const allPets = storage.getPets(userId);
    vault.setScopedData(userId, 'pets', allPets.filter(p => p.id !== petId));
  },
};
