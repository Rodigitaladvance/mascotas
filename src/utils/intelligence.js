// Preventive Intelligence Engine
const VACCINE_INTERVALS = {
  Perro: {
    'Rabia': 365,
    'Parvovirus': 365,
    'Moquillo': 365,
    'Hexavalente': 365,
    'Leishmania': 365,
    'Desparasitación Interna': 90,
    'Desparasitación Externa': 30
  },
  Gato: {
    'Trivalente': 365,
    'Leucemia': 365,
    'Rabia': 365,
    'Desparasitación Interna': 90,
    'Desparasitación Externa': 30
  }
};

export const intelligence = {
  // Suggest next date based on species and vaccine type
  getNextDate: (species, type, lastDate) => {
    const intervals = VACCINE_INTERVALS[species] || VACCINE_INTERVALS['Perro'];
    const days = intervals[type] || 365;
    const date = new Date(lastDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  },

  // Calculate protection level (0-100)
  calculateProtection: (pet) => {
    if (!pet.history || pet.history.length === 0) return 0;
    
    const now = new Date();
    const speciesIntervals = VACCINE_INTERVALS[pet.species] || VACCINE_INTERVALS['Perro'];
    
    // We consider a core set of protections (Vax + Desp)
    const coreTypes = Object.keys(speciesIntervals);
    let totalScore = 0;
    
    coreTypes.forEach(type => {
      const treatments = pet.history.filter(h => h.type === type || h.name?.includes(type));
      if (treatments.length === 0) return;
      
      const last = new Date(Math.max(...treatments.map(t => new Date(t.date))));
      const nextDue = new Date(last);
      nextDue.setDate(nextDue.getDate() + (speciesIntervals[type] || 365));
      
      if (nextDue > now) {
        totalScore += 1; // Active protection
      } else {
        const overdueDays = (now - nextDue) / (1000 * 60 * 60 * 24);
        if (overdueDays < 30) totalScore += 0.5; // Grace period
      }
    });

    return Math.round((totalScore / coreTypes.length) * 100);
  },

  getStatusEmoji: (score) => {
    if (score > 80) return '🛡️';
    if (score > 50) return '⚠️';
    return '🚨';
  }
};
