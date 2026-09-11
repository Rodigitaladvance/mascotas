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

/* ══════════════════════════════════════════════════════════════════════════
   Protocolo preventivo por especie
   ──────────────────────────────────────────────────────────────────────────
   Cada entrada define cada cuántos días toca repetir, y las palabras con las
   que reconocer la vacuna en el historial: el usuario escribe el nombre a
   mano, así que "Antirrábica", "rabia" o "rabies" deben valer lo mismo.
   ══════════════════════════════════════════════════════════════════════════ */
/* ── Calendarios de referencia ───────────────────────────────────────────────
   Contrastados el 11 de septiembre de 2026 con las guías de vacunación de la
   WSAVA (2024) para perros y gatos.

   Dos ideas que gobiernan esta tabla:

   1. Estos intervalos son solo el recurso de última hora. Si el veterinario
      anotó la fecha de la próxima dosis, manda esa. Un calendario genérico no
      puede saber qué producto se usó ni qué exige la comunidad autónoma.

   2. Las vacunas centrales de perro y gato NO son anuales. La WSAVA
      recomienda expresamente abandonar la revacunación anual: tras la pauta
      inicial y el refuerzo del año, los estudios serológicos respaldan el
      refuerzo trienal. Marcar como "vencida" a los doce meses empujaba a
      vacunar de más, que es justo lo que las guías tratan de evitar.

   Las marcadas como opcionales no son obligatorias para todos los animales:
   solo se vigilan si consta alguna dosis, y si no, quedan fuera del cálculo en
   vez de restar. La leucemia felina es el caso claro: la WSAVA la considera no
   esencial en gatos adultos sin acceso al exterior, así que penalizar a un gato
   de interior por no tenerla sería sencillamente incorrecto.
──────────────────────────────────────────────────────────────────────────── */
const ANUAL = 365;
const TRIENAL = 1095;

const PROTOCOLS = {
  dog: [
    { label: 'Rabia',                   days: ANUAL,   match: ['rabia', 'rabic', 'rabies'] },
    { label: 'Polivalente',             days: TRIENAL, match: ['polivalente', 'hexavalente', 'pentavalente', 'moquillo', 'parvo', 'distemper'] },
    { label: 'Desparasitación interna', days: 90,      match: ['interna', 'lombric', 'deworm', 'endoparas'] },
    { label: 'Desparasitación externa', days: 30,      match: ['externa', 'pulga', 'garrapata', 'flea', 'tick', 'ectoparas'] },
  ],
  cat: [
    { label: 'Rabia',                   days: ANUAL,   match: ['rabia', 'rabic', 'rabies'] },
    { label: 'Trivalente',              days: TRIENAL, match: ['trivalente', 'triple', 'panleucopenia', 'calicivirus', 'rinotraqueitis'] },
    { label: 'Leucemia felina',         days: ANUAL,   match: ['leucemia', 'leucosis', 'felv'], opcional: true },
    { label: 'Desparasitación interna', days: 90,      match: ['interna', 'lombric', 'deworm', 'endoparas'] },
    { label: 'Desparasitación externa', days: 30,      match: ['externa', 'pulga', 'garrapata', 'flea', 'tick', 'ectoparas'] },
  ],
  horse: [
    { label: 'Tétanos',                 days: ANUAL,   match: ['tetano', 'tetanus'] },
    { label: 'Gripe equina',            days: 182,     match: ['gripe', 'influenza', 'equina'] },
    { label: 'Desparasitación',         days: 90,      match: ['desparasit', 'lombric', 'deworm'] },
  ],
  rabbit: [
    { label: 'Mixomatosis',             days: ANUAL,   match: ['mixomatosis', 'myxomatosis'] },
    { label: 'Enfermedad hemorrágica',  days: ANUAL,   match: ['hemorrag', 'rhd', 'vhd'] },
    { label: 'Desparasitación',         days: 90,      match: ['desparasit', 'lombric', 'deworm'] },
  ],
  // Aves y "otra especie" no tienen calendario vacunal estándar: se omiten a
  // propósito en lugar de inventar uno.
};

const normalizar = (texto) =>
  (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // quita tildes

const GRACIA_DIAS = 30;

/**
 * Calcula la protección real de un animal a partir de su historial clínico.
 *
 * @param {object} pet      la mascota
 * @param {object} history  { vaccines: [{ name, date, nextDose }] }
 * @returns {{ score:number|null, reason:string|null, items:Array }}
 *          score null significa que no se puede calcular, y `reason` dice por qué.
 */
export const assessProtection = (pet, history) => {
  const protocolo = PROTOCOLS[pet?.species];
  if (!protocolo) return { score: null, reason: 'sin-protocolo', items: [] };

  /* Dosis registradas en el historial clínico */
  const dosis = (history?.vaccines || [])
    .filter(v => v?.date)
    .map(v => ({ nombre: normalizar(v.name), fecha: new Date(v.date), proxima: v.nextDose ? new Date(v.nextDose) : null }));

  /* La antirrábica también puede venir del Pasaporte Global */
  const rv = pet?.health?.rabiesVaccine;
  if (rv?.date) {
    dosis.push({ nombre: 'rabia', fecha: new Date(rv.date), proxima: rv.expiry ? new Date(rv.expiry) : null });
  }

  if (dosis.length === 0) return { score: null, reason: 'sin-datos', items: [] };

  const ahora = new Date();
  let puntos = 0;

  /* Las opcionales sin ninguna dosis registrada no cuentan: no son un olvido
     del dueño, es que ese animal no las necesita. */
  let exigibles = 0;

  const items = protocolo.map(({ label, days, match, opcional }) => {
    const propias = dosis.filter(d => match.some(m => d.nombre.includes(m)));
    if (propias.length === 0) {
      if (opcional) return { label, estado: 'no-aplica', opcional: true };
      exigibles += 1;
      return { label, estado: 'ausente' };
    }
    exigibles += 1;

    // La dosis más reciente manda
    const ultima = propias.reduce((a, b) => (b.fecha > a.fecha ? b : a));
    // Si el usuario indicó la próxima dosis, se respeta su criterio; si no,
    // se calcula con el intervalo del protocolo.
    const vence = ultima.proxima && !isNaN(ultima.proxima)
      ? ultima.proxima
      : new Date(ultima.fecha.getTime() + days * 86400000);

    const diasPasados = Math.floor((ahora - vence) / 86400000);
    if (diasPasados < 0)            { puntos += 1;   return { label, estado: 'al-dia',    vence }; }
    if (diasPasados <= GRACIA_DIAS) { puntos += 0.5; return { label, estado: 'por-vencer', vence }; }
    return { label, estado: 'vencida', vence };
  });

  /* Si todo lo del calendario era opcional y no hay nada registrado, no se
     puede afirmar nada: mejor no dar número que dar uno inventado. */
  if (exigibles === 0) return { score: null, reason: 'sin-datos', items };

  return {
    score: Math.round((puntos / exigibles) * 100),
    reason: null,
    items,
  };
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
