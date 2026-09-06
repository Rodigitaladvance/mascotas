/**
 * Lectura de imágenes con reescalado y compresión previos al guardado.
 *
 * Por qué existe este paso: una foto tomada con un móvil pesa entre 3 y 12 MB,
 * y al convertirla a base64 crece otro 33 %. localStorage solo admite unos 5 MB
 * por dominio en total, así que una única foto sin comprimir agota la cuota y
 * hace fallar el guardado del expediente entero — incluidos los textos y el
 * resto de mascotas, porque el array se escribe de una sola vez.
 *
 * Reduciendo el lado mayor a 640 px y recodificando en JPEG, una foto típica
 * baja de ~8 MB a unos 60 KB: caben cientos de animales en la misma cuota.
 */

const MAX_DIMENSION = 640;      // px del lado mayor
const JPEG_QUALITY = 0.82;      // buen equilibrio nitidez/peso para retratos
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

/** Dibuja la fuente ya escalada y devuelve el data-URL comprimido. */
const compressToDataURL = (source, width, height) => {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // Fondo blanco: el JPEG no admite transparencia y un PNG con alfa
  // quedaría con el fondo en negro.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
};

/**
 * Lee un File de imagen, lo comprime y llama a onLoad con el data-URL.
 * No hace nada si el fichero es nulo. Los errores se notifican por onError.
 *
 * @param {File}     file    fichero elegido por el usuario
 * @param {Function} onLoad  recibe el data-URL ya comprimido
 * @param {Function} [onError] recibe un mensaje legible si algo falla
 */
export const readImageAsDataURL = async (file, onLoad, onError) => {
  if (!file) return;

  const fail = (msg) => {
    if (onError) onError(msg);
    else console.error('[AURA] Imagen:', msg);
  };

  if (!file.type?.startsWith('image/')) {
    fail('El archivo seleccionado no es una imagen.');
    return;
  }
  if (file.size > MAX_INPUT_BYTES) {
    fail('La imagen es demasiado grande. Elige una de menos de 25 MB.');
    return;
  }

  // createImageBitmap respeta la orientación EXIF, así que las fotos hechas
  // en vertical con el móvil no salen giradas.
  try {
    if (typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const dataUrl = compressToDataURL(bitmap, bitmap.width, bitmap.height);
      bitmap.close?.();
      onLoad(dataUrl);
      return;
    }
  } catch {
    /* Navegador sin soporte o imagen que no decodifica: se prueba la vía clásica */
  }

  // Alternativa para navegadores antiguos
  const reader = new FileReader();
  reader.onerror = () => fail('No se ha podido leer el archivo.');
  reader.onload = (ev) => {
    const img = new Image();
    img.onerror = () => fail('El archivo no es una imagen válida o está dañado.');
    img.onload = () => {
      try {
        onLoad(compressToDataURL(img, img.naturalWidth, img.naturalHeight));
      } catch {
        fail('No se ha podido procesar la imagen.');
      }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};
