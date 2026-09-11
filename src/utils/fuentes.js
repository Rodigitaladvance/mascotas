/**
 * Fuentes oficiales y nivel de riesgo del trayecto.
 *
 * AURA no es la autoridad: es quien lleva al usuario hasta ella. Cada bloque de
 * requisitos se acompaña del enlace al organismo que lo dicta y de la fecha en
 * que se contrastó, para que cualquiera pueda comprobarlo por su cuenta.
 *
 * Eso cambia el papel de la aplicación. No afirma "necesitas esto": dice "esto
 * es lo que suele exigirse, y aquí está la fuente". La diferencia importa
 * cuando el dato caduca, que es lo que acaba pasando siempre.
 *
 * REGLA DE MANTENIMIENTO: si se toca un requisito, se actualiza FECHA_REVISION.
 * Una fecha vieja es una señal honesta; una fecha falsa es peor que ninguna.
 */

/** Última vez que las listas se contrastaron contra las webs oficiales. */
export const FECHA_REVISION = '2026-09-11';

/** Organismo competente por país. */
const ORGANISMO = {
  ES: 'Comisión Europea',
  UK: 'GOV.UK / APHA',
  US: 'CDC · USDA APHIS',
  CA: 'CFIA',
  AU: 'DAFF',
};

/* Perros, gatos y hurones: el régimen de animales de compañía propiamente dicho. */
const COMPANIA = {
  ES: 'https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/movements-within-eu_en',
  UK: 'https://www.gov.uk/bring-pet-to-great-britain',
  US: 'https://www.cdc.gov/importation/dogs/index.html',
  CA: 'https://inspection.canada.ca/en/importing-food-plants-animals/pets',
  AU: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs/how-to-import/step-by-step-guides/category-3-step-by-step-guide-for-dogs',
};

/* Équidos: normativa de sanidad animal, no la de mascotas. */
const EQUINOS = {
  ES: 'https://food.ec.europa.eu/animals/live-animal-movements/equidae_en',
  UK: 'https://www.gov.uk/guidance/export-horses-and-ponies-special-rules',
  US: 'https://www.aphis.usda.gov/live-animal-import/equine',
  CA: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports',
  AU: 'https://bicon.agriculture.gov.au/',
};

/* Aves: sanidad aviar y, casi siempre, CITES por encima. */
const AVES = {
  ES: 'https://food.ec.europa.eu/animals/live-animal-movements/pet-birds_en',
  UK: 'https://www.gov.uk/guidance/importing-live-animals-or-animal-products-from-non-eu-countries',
  US: 'https://www.aphis.usda.gov/pet-travel/another-country-to-us-import/birds',
  CA: 'https://inspection.canada.ca/en/importing-food-plants-animals/pets',
  AU: 'https://bicon.agriculture.gov.au/',
};

/* Conejos, reptiles y todo lo demás: norma nacional, muy variable. */
const OTROS = {
  ES: 'https://www.mapa.gob.es/es/ganaderia/temas/comercio-exterior-ganadero/',
  UK: 'https://www.gov.uk/guidance/importing-live-animals-or-animal-products-from-non-eu-countries',
  US: 'https://www.fws.gov/program/office-of-law-enforcement/information-importers-exporters',
  CA: 'https://inspection.canada.ca/en/importing-food-plants-animals/pets',
  AU: 'https://www.agriculture.gov.au/biosecurity-trade/travelling/bringing-mailing-goods/unique-exotic-pets',
};

const POR_ESPECIE = {
  dog: COMPANIA, cat: COMPANIA, ferret: COMPANIA,
  horse: EQUINOS,
  bird: AVES,
  rabbit: OTROS, exotic: OTROS, other: OTROS,
};

/**
 * Fuente oficial para una especie y un destino.
 * @returns {{ organismo: string, url: string }}
 */
export const fuenteOficial = (species, countryId) => {
  const mapa = POR_ESPECIE[species] || OTROS;
  return {
    organismo: ORGANISMO[countryId] || '',
    url: mapa[countryId] || mapa.ES,
  };
};

/**
 * Nivel de riesgo del trayecto, que decide cuánto avisa la interfaz.
 *
 *   verde  El régimen es único, estable y está bien cubierto. Aviso mínimo.
 *   ambar  Requisitos que cambian por país. Conviene confirmar.
 *   rojo   Cuarentena, permiso previo, CITES o prohibición. Puede tardar meses
 *          y no se arregla con prisa: hay que confirmarlo antes de pagar nada.
 */
export const nivelRiesgo = (species, countryId, origen = 'ES') => {
  if (origen === countryId) return 'verde';

  const esCompania = species === 'dog' || species === 'cat' || species === 'ferret';

  /* Australia impone cuarentena y permiso previo a todo lo vivo. */
  if (countryId === 'AU') return 'rojo';

  /* Fuera del régimen de mascotas siempre hay trámite previo. */
  if (!esCompania) return 'rojo';

  /* Perro o gato cruzando a un tercer país: requisitos propios del destino. */
  return 'ambar';
};

export const TEXTO_RIESGO = {
  verde: {
    es: 'Movimiento cubierto por un régimen único y estable. Aun así, confirma las fechas con tu veterinario.',
    en: 'Movement covered by a single, stable regime. Even so, confirm the dates with your vet.',
  },
  ambar: {
    es: 'Los requisitos los fija el país de destino y cambian sin previo aviso. Confírmalos en la fuente oficial antes de comprar el billete.',
    en: 'Requirements are set by the destination country and change without notice. Confirm them at the official source before buying the ticket.',
  },
  rojo: {
    es: 'Este trayecto exige permisos previos y puede incluir cuarentena. Los plazos se miden en meses, no en días. No compres billetes ni reserves transporte sin confirmarlo antes con la autoridad competente.',
    en: 'This route requires permits in advance and may involve quarantine. Lead times are measured in months, not days. Do not buy tickets or book transport without confirming with the competent authority first.',
  },
};
