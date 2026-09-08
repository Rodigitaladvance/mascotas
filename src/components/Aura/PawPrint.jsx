/**
 * Huella de AURA Pets.
 *
 * Se usa donde antes había un punto o un icono genérico: el centro del anillo
 * de protección, las viñetas de las listas y la pantalla de carga. Hereda el
 * color del contexto con currentColor, así que adopta el acento de cada
 * especie sin necesidad de pasárselo.
 */
export const PawPrint = ({ size = 16, style, className, title }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 32"
    fill="currentColor"
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : undefined}
    style={style}
    className={className}
  >
    {title && <title>{title}</title>}
    {/* Almohadilla principal */}
    <ellipse cx="18" cy="24" rx="9.5" ry="7.8" />
    {/* Cuatro dedos */}
    <ellipse cx="6.6"  cy="10.5" rx="3.6" ry="4.9" transform="rotate(-22 6.6 10.5)" />
    <ellipse cx="14.6" cy="5.2"  rx="3.6" ry="5.1" transform="rotate(-8 14.6 5.2)" />
    <ellipse cx="22.6" cy="5.6"  rx="3.6" ry="5.1" transform="rotate(9 22.6 5.6)" />
    <ellipse cx="30.2" cy="11.4" rx="3.4" ry="4.6" transform="rotate(24 30.2 11.4)" />
  </svg>
);

export default PawPrint;
