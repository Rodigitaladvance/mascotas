// Simulated Database Layer
export const storage = {
  getUsers: () => JSON.parse(localStorage.getItem('mascota_health_users') || '[]'),
  
  saveUser: (user) => {
    const users = storage.getUsers();
    localStorage.setItem('mascota_health_users', JSON.stringify([...users, user]));
  },

  getPets: (userId) => {
    const allPets = JSON.parse(localStorage.getItem('mascota_health_pets') || '[]');
    return allPets.filter(p => p.userId === userId);
  },

  savePet: (pet) => {
    const allPets = JSON.parse(localStorage.getItem('mascota_health_pets') || '[]');
    localStorage.setItem('mascota_health_pets', JSON.stringify([...allPets, pet]));
  },

  updatePet: (petId, updateFn) => {
    const allPets = JSON.parse(localStorage.getItem('mascota_health_pets') || '[]');
    const updated = allPets.map(p => p.id === petId ? updateFn(p) : p);
    localStorage.setItem('mascota_health_pets', JSON.stringify(updated));
  },

  getSession: () => JSON.parse(localStorage.getItem('mascota_health_session')),
  
  setSession: (user) => localStorage.setItem('mascota_health_session', JSON.stringify(user)),
  
  clearSession: () => localStorage.removeItem('mascota_health_session')
};
