/**
 * Requisitos de la compañía aérea.
 *
 * La documentación oficial y la política de la aerolínea son dos cosas
 * distintas, y se pueden perder por separado. Un animal puede llevar todos los
 * papeles del país de destino en regla y que le rechacen en el mostrador
 * porque el transportín mide dos centímetros de más o porque la raza no vuela
 * en bodega.
 *
 * Aquí no se recogen políticas de compañías concretas: cambian sin previo
 * aviso y publicar un dato erróneo sobre una aerolínea es peor que no publicar
 * nada. Lo que sí se puede hacer con certeza es avisar de los dos motivos de
 * rechazo más frecuentes —el peso y la raza— a partir de datos que la
 * aplicación ya tiene, y entregar la lista de lo que hay que confirmar.
 */

/* Límite habitual de cabina, transportín incluido. Oscila entre 6 y 10 kg
   según compañía, así que 8 se usa solo como umbral de aviso. */
const LIMITE_CABINA_KG = 8;

/* Por encima de este peso la mayoría de compañías no admiten el envío como
   equipaje facturado y obligan a contratarlo como carga. */
const LIMITE_BODEGA_KG = 32;

/**
 * Razas braquicéfalas: hocico corto y vías respiratorias comprometidas.
 * Muchas aerolíneas las rechazan en bodega —algunas también en cabina— porque
 * el estrés y el calor les provocan dificultad respiratoria. No es una manía
 * de las compañías: hay historial de muertes en vuelo.
 */
const BRAQUICEFALAS = [
  // Perros
  'bulldog', 'buldog', 'carlino', 'pug', 'boxer', 'bóxer',
  'boston terrier', 'shih tzu', 'shitzu', 'pekines', 'pequines',
  'lhasa apso', 'cavalier', 'king charles', 'bullmastiff',
  'dogo de burdeos', 'chow chow', 'shar pei', 'sharpei',
  'affenpinscher', 'grifon', 'griffon', 'pekingese',
  // Gatos
  'persa', 'himalayo', 'himalaya', 'exotico de pelo corto', 'exotic shorthair',
  'burmes', 'birmano', 'scottish fold',
];

/** Especies que la mayoría de compañías no transportan. */
const ESPECIES_POCO_ACEPTADAS = ['bird', 'rabbit', 'ferret', 'exotic', 'other'];

const normalizar = (texto) =>
  (texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Evalúa el riesgo de rechazo en el mostrador a partir de la ficha del animal.
 *
 * @param {object} pet
 * @param {string} locale  'es' | 'en'
 * @returns {{ avisos: Array, comprobaciones: Array }}
 */
export const assessAirline = (pet, locale = 'es') => {
  const es = locale === 'es';
  const avisos = [];

  const peso = parseFloat(String(pet?.weight ?? '').replace(',', '.'));
  const raza = normalizar(pet?.breed);

  /* ── Peso ── */
  if (!Number.isFinite(peso) || peso <= 0) {
    avisos.push({
      nivel: 'info',
      titulo: es ? 'Falta el peso' : 'Weight missing',
      detalle: es
        ? 'Sin el peso no se puede saber si viaja en cabina. Anótalo en la ficha del animal.'
        : 'Without the weight there is no way to tell whether it flies in the cabin. Add it to the animal’s record.',
    });
  } else if (peso > LIMITE_BODEGA_KG) {
    avisos.push({
      nivel: 'alerta',
      titulo: es ? 'Fuera de equipaje facturado' : 'Beyond checked baggage',
      detalle: es
        ? `${peso} kg supera el límite habitual de bodega (${LIMITE_BODEGA_KG} kg con transportín). Casi con seguridad habrá que contratarlo como carga, con agente y trámite aparte.`
        : `${peso} kg exceeds the usual hold limit (${LIMITE_BODEGA_KG} kg with crate). It will almost certainly need to travel as cargo, with an agent and a separate procedure.`,
    });
  } else if (peso > LIMITE_CABINA_KG) {
    avisos.push({
      nivel: 'aviso',
      titulo: es ? 'Probablemente no viaja en cabina' : 'Probably not a cabin traveller',
      detalle: es
        ? `${peso} kg supera el umbral típico de cabina (${LIMITE_CABINA_KG} kg con transportín incluido). El límite exacto cambia según compañía: confírmalo antes de comprar el billete.`
        : `${peso} kg is above the typical cabin threshold (${LIMITE_CABINA_KG} kg including the carrier). The exact limit varies by airline: confirm before buying the ticket.`,
    });
  }

  /* ── Raza braquicéfala ── */
  const coincide = BRAQUICEFALAS.find((r) => raza.includes(r));
  if (coincide) {
    avisos.push({
      nivel: 'alerta',
      titulo: es ? 'Raza de hocico corto' : 'Snub-nosed breed',
      detalle: es
        ? 'Muchas aerolíneas no admiten razas braquicéfalas en bodega, y algunas tampoco en cabina, por riesgo respiratorio. Confírmalo antes que cualquier otra gestión: si la compañía no la acepta, el resto del viaje no se puede planificar.'
        : 'Many airlines refuse brachycephalic breeds in the hold, and some in the cabin too, because of the respiratory risk. Confirm this before anything else: if the airline will not carry it, the rest of the trip cannot be planned.',
    });
  }

  /* ── Especie ── */
  if (ESPECIES_POCO_ACEPTADAS.includes(pet?.species)) {
    avisos.push({
      nivel: 'aviso',
      titulo: es ? 'Especie poco habitual en vuelo' : 'Species rarely carried',
      detalle: es
        ? 'La mayoría de compañías solo transportan perros y gatos. Para el resto suele hacer falta carga aérea o un transportista especializado.'
        : 'Most airlines carry only dogs and cats. Anything else usually needs air cargo or a specialist shipper.',
    });
  }

  /* ── Lo que hay que confirmar siempre ──────────────────────────────────────
     Cada punto lleva identificador propio para poder recordar cuáles ya has
     confirmado. No puede derivarse del texto: el texto está traducido y al
     cambiar de idioma se perderían las marcas. */
  const COMPROBACIONES = [
    ['medidas',     'Medidas máximas del transportín, en cabina y en bodega',
                    'Maximum carrier dimensions, in cabin and in hold'],
    ['peso',        'Peso máximo admitido, con el transportín incluido',
                    'Maximum accepted weight, carrier included'],
    ['ubicacion',   'Si viaja en cabina, en bodega o como carga',
                    'Whether it travels in the cabin, in the hold or as cargo'],
    ['raza',        'Restricciones de raza',
                    'Breed restrictions'],
    ['temperatura', 'Embargo por temperatura: muchas compañías no vuelan animales en verano ni en pleno invierno',
                    'Temperature embargo: many airlines will not fly animals in summer or deep winter'],
    ['reserva',     'Plazo mínimo de reserva: suele exigirse con días o semanas de antelación',
                    'Minimum booking notice: often required days or weeks ahead'],
    ['cupo',        'Cuántos animales admite el vuelo y cuántos por pasajero',
                    'How many animals the flight accepts, and how many per passenger'],
    ['tarifa',      'Tarifa y forma de pago',
                    'Fee and how it is paid'],
    ['escalas',     'Si hay escalas: cada tramo puede ser de otra compañía, con otras reglas',
                    'If there are connections: each leg may be a different airline with different rules'],
  ];

  const comprobaciones = COMPROBACIONES.map(([id, textoEs, textoEn]) => ({
    id,
    texto: es ? textoEs : textoEn,
  }));

  return { avisos, comprobaciones };
};

export const UMBRALES = { LIMITE_CABINA_KG, LIMITE_BODEGA_KG };
