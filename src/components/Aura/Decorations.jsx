/**
 * Adornos de AURA Pets.
 *
 * Todos son SVG dibujados aquí mismo: ni una imagen externa, ni una petición
 * de red. Heredan el color del contexto con currentColor, así que se recolorean
 * pasándoles `color` en el estilo.
 */

/** Avión de papel con estela de puntos en forma de corazón. */
export const PlaneTrail = ({ size = 120, style, className }) => (
  <svg
    width={size}
    height={size * 0.62}
    viewBox="0 0 120 74"
    fill="none"
    aria-hidden="true"
    style={style}
    className={className}
  >
    {/* Bucle en corazón */}
    <path
      d="M30 60C12 46 14 24 30 27C40 29 43 37 43 42C43 37 46 29 56 27C72 24 74 46 56 60C50 65 43 68 43 68C43 68 36 65 30 60Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 5"
    />
    {/* Estela hacia el avión */}
    <path
      d="M58 52C72 52 84 44 94 30"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 5"
    />
    {/* Avión */}
    <path
      d="M118 4L95 21L86 17L83 20L89 25L88 32L92 33L96 27L103 30L102 38L106 40L110 30L118 26L120 22L118 4Z"
      fill="currentColor"
      transform="translate(-6 -2) rotate(6 100 20)"
    />
  </svg>
);

/** Destello de cuatro puntas, para acompañar al logo. */
export const Sparkle = ({ size = 16, style, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={style} className={className}>
    <path d="M12 0C13.1 7 17 10.9 24 12C17 13.1 13.1 17 12 24C10.9 17 7 13.1 0 12C7 10.9 10.9 7 12 0Z" />
  </svg>
);

/** Corazón trazado a mano, suelto. */
export const HeartOutline = ({ size = 26, style, className }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 30 27" fill="none" aria-hidden="true" style={style} className={className}>
    <path
      d="M15 25C4 17 1 10 4 5.5C7 1 13 2 15 7C17 2 23 1 26 5.5C29 10 26 17 15 25Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Rayitas de energía, como las que salen del logo en la maqueta. */
export const Rays = ({ size = 40, style, className }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" style={style} className={className}>
    <path d="M34 6L20 12" stroke="#FCE1A8" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M32 18L17 20" stroke="#BFE0F5" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M30 30L17 27" stroke="#F9C9D8" strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

/**
 * Mancha orgánica pastel. Las esquinas asimétricas evitan que parezca
 * un círculo o una elipse: es lo que da la sensación de forma dibujada.
 */
export const Blob = ({ size = 160, color = '#A5E3DC', style, className }) => (
  <div
    aria-hidden="true"
    className={className}
    style={{
      width: size,
      height: size * 0.82,
      background: color,
      borderRadius: '58% 42% 37% 63% / 46% 58% 42% 54%',
      position: 'absolute',
      pointerEvents: 'none',
      ...style,
    }}
  />
);
