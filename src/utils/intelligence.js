/* Motor de intervalos preventivos.

   Aquí vivían también una tabla VACCINE_INTERVALS y un objeto `intelligence`
   de una versión anterior. No los importaba nadie, pero eran peligrosos de
   dejar: indexaban por 'Perro' y 'Gato' —la app usa 'dog' y 'cat'— y daban
   intervalo anual a todas las vacunas, que es justo lo que se corrigió al
   contrastar con las guías de la WSAVA. Quien los reactivara sin mirar
   reintroduciría la revacunación de más. */


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
    { label: 'Rabia',                   labelEn: 'Rabies',              days: ANUAL,   match: ['rabia', 'rabic', 'rabies'] },
    { label: 'Polivalente',             labelEn: 'Combination vaccine', days: TRIENAL, match: ['polivalente', 'hexavalente', 'pentavalente', 'moquillo', 'parvo', 'distemper'] },
    { label: 'Desparasitación interna', labelEn: 'Internal worming',    days: 90,      match: ['interna', 'lombric', 'deworm', 'endoparas'] },
    { label: 'Desparasitación externa', labelEn: 'External parasites',  days: 30,      match: ['externa', 'pulga', 'garrapata', 'flea', 'tick', 'ectoparas'] },
  ],
  cat: [
    { label: 'Rabia',                   labelEn: 'Rabies',              days: ANUAL,   match: ['rabia', 'rabic', 'rabies'] },
    { label: 'Trivalente',              labelEn: 'Three-way vaccine',   days: TRIENAL, match: ['trivalente', 'triple', 'panleucopenia', 'calicivirus', 'rinotraqueitis'],
      /* La WSAVA separa los tres componentes: la panleucopenia deja memoria
         larga y aguanta el trienio, pero la protección frente a herpesvirus y
         calicivirus es solo parcial. Para un gato que sale a la calle o vive
         con otros, la guía contempla repetir esa parte cada año. Decir «cada
         3 años» a secas es correcto para el gato de interior y se queda corto
         para el resto. */
      nota: 'Vale para un gato de interior. Si sale a la calle o vive con otros, la parte respiratoria puede tocar cada año: pregunta a tu veterinario.',
      notaEn: 'That holds for an indoor cat. If yours goes outside or lives with others, the respiratory part may be due yearly: ask your vet.' },
    { label: 'Leucemia felina',         labelEn: 'Feline leukaemia',    days: ANUAL,   match: ['leucemia', 'leucosis', 'felv'], opcional: true },
    { label: 'Desparasitación interna', labelEn: 'Internal worming',    days: 90,      match: ['interna', 'lombric', 'deworm', 'endoparas'] },
    { label: 'Desparasitación externa', labelEn: 'External parasites',  days: 30,      match: ['externa', 'pulga', 'garrapata', 'flea', 'tick', 'ectoparas'] },
  ],
  horse: [
    { label: 'Tétanos',                 labelEn: 'Tetanus',             days: ANUAL,   match: ['tetano', 'tetanus'] },
    { label: 'Gripe equina',            labelEn: 'Equine influenza',    days: 182,     match: ['gripe', 'influenza', 'equina'] },
    { label: 'Desparasitación',         labelEn: 'Worming',             days: 90,      match: ['desparasit', 'lombric', 'deworm'] },
  ],
  ferret: [
    { label: 'Rabia',                   labelEn: 'Rabies',              days: ANUAL,   match: ['rabia', 'rabic', 'rabies'] },
    { label: 'Moquillo',                labelEn: 'Distemper',           days: ANUAL,   match: ['moquillo', 'distemper', 'polivalente'] },
    { label: 'Desparasitación',         labelEn: 'Worming',             days: 90,      match: ['desparasit', 'lombric', 'deworm', 'pulga', 'flea'] },
  ],
  rabbit: [
    { label: 'Mixomatosis',             labelEn: 'Myxomatosis',         days: ANUAL,   match: ['mixomatosis', 'myxomatosis'] },
    { label: 'Enfermedad hemorrágica',  labelEn: 'Haemorrhagic disease',days: ANUAL,   match: ['hemorrag', 'rhd', 'vhd'] },
    { label: 'Desparasitación',         labelEn: 'Worming',             days: 90,      match: ['desparasit', 'lombric', 'deworm'] },
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

  /* Cada apartado viaja con sus dos nombres: el módulo no sabe en qué idioma
     está la pantalla, y quien lo pinta sí. */
  const items = protocolo.map(({ label, labelEn, days, match, opcional }) => {
    const propias = dosis.filter(d => match.some(m => d.nombre.includes(m)));
    if (propias.length === 0) {
      if (opcional) return { label, labelEn, estado: 'no-aplica', opcional: true };
      exigibles += 1;
      return { label, labelEn, estado: 'ausente' };
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
    if (diasPasados < 0)            { puntos += 1;   return { label, labelEn, estado: 'al-dia',    vence }; }
    if (diasPasados <= GRACIA_DIAS) { puntos += 0.5; return { label, labelEn, estado: 'por-vencer', vence }; }
    return { label, labelEn, estado: 'vencida', vence };
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


/**
 * Fecha sugerida para la próxima dosis.
 *
 * Al anotar una vacuna, el intervalo suele conocerse: la misma tabla que
 * calcula el nivel de protección sirve para proponer cuándo toca la siguiente.
 * Se propone, no se impone —el campo sigue siendo editable— porque el producto
 * concreto o el criterio del veterinario mandan sobre cualquier calendario
 * genérico.
 *
 * @param {string} species  especie del animal
 * @param {string} nombre   lo que el usuario escribió como nombre de la vacuna
 * @param {string} fecha    fecha de administración, en formato YYYY-MM-DD
 * @returns {{ fecha: string, etiqueta: string } | null}
 */
export const sugerirProximaDosis = (species, nombre, fecha) => {
  if (!fecha) return null;
  const protocolo = PROTOCOLS[species];
  if (!protocolo) return null;

  const buscado = normalizar(nombre);
  if (!buscado.trim()) return null;

  const encontrado = protocolo.find(({ match }) => match.some(m => buscado.includes(m)));
  if (!encontrado) return null;

  const base = new Date(fecha);
  if (Number.isNaN(base.getTime())) return null;

  const siguiente = new Date(base.getTime() + encontrado.days * 86400000);
  return {
    fecha: siguiente.toISOString().split('T')[0],
    etiqueta: encontrado.label,
    nota: encontrado.nota,
    notaEn: encontrado.notaEn,
    etiquetaEn: encontrado.labelEn,
    dias: encontrado.days,
  };
};
