/* ═══════════════════════════════════════════════════════════════════════════
   Castellano que se verá pase lo que pase — `npm run castellano`

   `npm run i18n` comprueba el diccionario: que ninguna clave falte y que las
   dos ramas estén parejas. Pero no ve el texto que nunca llegó al diccionario,
   que es justo por donde se cuelan estas cosas: un rótulo escrito a mano
   dentro del JSX se salta la comprobación entera.

   El truco de aquí es al revés: quitar primero todo lo que SÍ está traducido
   —las llamadas a t(), y las parejas «es ? 'esto' : 'that'» aunque ocupen
   varias líneas— y mirar lo que queda. Lo que sobrevive a esa limpieza se verá
   igual en los dos idiomas.

   No sabe distinguir una palabra castellana de un identificador, así que la
   lista hay que leerla. Pero son veinte líneas en vez de dos mil, y los falsos
   positivos son siempre los mismos y se reconocen a la primera: nombres de
   razas, listas con su pareja _EN al lado, y mensajes de consola.
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/* El diccionario y la tabla de fuentes están en castellano por definición. */
const EXCLUIDOS = /translations|fuentes/;

const archivos = [];
(function recorrer(dir) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) recorrer(ruta);
    else if (/\.jsx?$/.test(ruta) && !EXCLUIDOS.test(ruta)) archivos.push(ruta);
  }
})('src');

/* Señales de que un texto es castellano y no código. */
const PALABRAS = 'el|la|los|las|un|una|unos|unas|de|del|que|con|para|por|sin|tus|tu|sus|su|hay|no|mas|ya|solo|antes|debe|puede|este|esta|cada|desde|hasta';
const ES = new RegExp('[\\u00e1\\u00e9\\u00ed\\u00f3\\u00fa\\u00f1\\u00c1\\u00c9\\u00cd\\u00d3\\u00da\\u00d1\\u00bf\\u00a1]|\\b(?:' + PALABRAS + ')\\b', 'i');

/* Al limpiar hay que conservar los saltos de línea. Si no, los números que se
   informan dejan de corresponder con el archivo y mandan a mirar donde no es. */
const hueco = (trozo) => trozo.replace(/[^\n]/g, ' ');

let total = 0;

for (const archivo of archivos) {
  let src = readFileSync(archivo, 'utf8');

  /* 1. Los comentarios son para quien lee el código, no para el usuario. */
  src = src.replace(/\/\*[\s\S]*?\*\//g, hueco).replace(/^[ \t]*\/\/.*$/gm, hueco);

  /* 2. Lo que ya pasa por el diccionario. */
  src = src.replace(/\bt\(\s*'[^']*'(?:\s*,[^)]*)?\)/g, hueco);

  /* 3. Las parejas es/en, incluidas las que ocupan varias líneas. Se repite
        hasta que no quede ninguna: en un archivo pueden ir anidadas. */
  const pareja = /(?:\bes\b|locale\s*===\s*'es'|locale\s*!==\s*'en')\s*\?[\s\S]{0,700}?:\s*(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g;
  let antes;
  do { antes = src; src = src.replace(pareja, hueco); } while (src !== antes);

  /* 4. Las tablas que guardan las dos versiones una al lado de la otra.
        El patrón del proyecto es `algo` junto a `algoEn`, aunque entre los dos
        se cuele un comentario o un salto de línea. */
  src = src.replace(/(\w+):\s*'(?:[^'\\]|\\.)*',[\s\S]{0,400}?\1En:\s*'(?:[^'\\]|\\.)*'/g, hueco);
  src = src.replace(/es:\s*'[^']*',\s*en:\s*'[^']*'/g, hueco);

  /* 5. Lo que queda: literales sueltos y texto plano dentro del JSX. */
  const encontrados = new Map();
  src.split(/\r?\n/).forEach((linea, i) => {
    const patron = /'((?:[^'\\]|\\.){4,}?)'|"((?:[^"\\]|\\.){4,}?)"|>\s*([^<>{}\n]{4,}?)\s*</g;
    for (const m of linea.matchAll(patron)) {
      const texto = (m[1] || m[2] || m[3] || '').trim();
      if (!texto || !ES.test(texto)) continue;
      if (/^[\w./-]+$/.test(texto)) continue;                    // rutas, clases, identificadores
      if (/^(?:https?:|\.\/|\.\.\/|[\w-]+\/)/.test(texto)) continue;
      const clave = `${i + 1}|${texto}`;
      if (!encontrados.has(clave)) encontrados.set(clave, { linea: i + 1, texto });
    }
  });

  if (encontrados.size) {
    console.log(`\n  ${archivo}`);
    for (const { linea, texto } of encontrados.values()) {
      console.log(`    ${String(linea).padStart(4)}  ${texto.slice(0, 88)}`);
    }
    total += encontrados.size;
  }
}

console.log('');
console.log(total
  ? `  ${total} textos se verán en castellano aunque la app esté en inglés.`
  : '  Nada en castellano fuera del diccionario.');
console.log('');
console.log('  Revísalos a ojo: los nombres de razas, las listas con su pareja _EN');
console.log('  al lado y los mensajes de consola son falsos positivos conocidos.');
console.log('');
