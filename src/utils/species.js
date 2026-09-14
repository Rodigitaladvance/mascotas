/**
 * Color de acento por especie.
 *
 * Cada animal tiñe su ficha con un color propio. No es solo decoración: con
 * varias mascotas, el color permite saber de un vistazo de cuál es cada tarjeta
 * sin leer el nombre. El oro sigue siendo el color de marca y no se sustituye;
 * lo que cambia es el acento de la ficha activa.
 *
 * Todos los tonos están elegidos para leerse sobre el fondo violeta oscuro
 * (#080010) con contraste suficiente.
 */
const PALETA = {
  dog:    { base: '#E8944A', nombre: 'ámbar'     },
  cat:    { base: '#B565D8', nombre: 'violeta'   },
  horse:  { base: '#3BBFA9', nombre: 'verde mar' },
  rabbit: { base: '#E87A9A', nombre: 'rosa'      },
  ferret: { base: '#C98B6B', nombre: 'canela'    },
  exotic: { base: '#7FB84F', nombre: 'verde hoja' },
  other:  { base: '#D4AF37', nombre: 'oro'       },
};

/** Convierte #RRGGBB a "r, g, b" para poder componer rgba() con opacidad. */
const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

/**
 * Devuelve la familia de colores de una mascota.
 * Las especies sin color propio caen en el oro de la marca.
 */
export const accentFor = (pet) => {
  const { base, nombre } = PALETA[pet?.species] || PALETA.other;
  const canal = rgb(base);
  return {
    base,
    nombre,
    /** Fondo muy tenue para tarjetas y píldoras */
    soft:   `rgba(${canal}, 0.10)`,
    /** Borde visible pero no estridente */
    border: `rgba(${canal}, 0.42)`,
    /** Halo para el elemento activo */
    glow:   `0 0 24px rgba(${canal}, 0.35), 0 0 48px rgba(${canal}, 0.12)`,
    /** Degradado para anillos y barras */
    gradient: `linear-gradient(140deg, ${base} 0%, rgba(${canal}, 0.55) 100%)`,
  };
};

export const SPECIES_PALETTE = PALETA;
