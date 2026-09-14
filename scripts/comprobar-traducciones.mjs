/* ═══════════════════════════════════════════════════════════════════════════
   Comprobación del diccionario — `npm run i18n`

   Cuatro pantallas de la aplicación llegaron a estar solo en castellano sin
   que nadie se diera cuenta: no había forma de notarlo salvo cambiando el
   idioma y recorriéndolas a mano. Esto lo comprueba en un segundo.

   Avisa de:
     1. claves que el código pide y el diccionario no tiene
     2. claves que existen en un idioma y faltan en el otro
     3. sustituciones {x} que no coinciden entre los dos idiomas
     4. claves definidas que ya no usa nadie (solo informativo)

   Sale con código 1 si algo de lo primero falla, para poder encadenarlo.
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { translations } from '../src/utils/translations.js';

const IDIOMAS = Object.keys(translations);

/* ── Recorrer el código fuente ─────────────────────────────────────────── */
const archivos = [];
(function recorrer(dir) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) recorrer(ruta);
    else if (/\.jsx?$/.test(ruta) && !ruta.includes('translations')) archivos.push(ruta);
  }
})('src');

/* ── Buscar una clave dentro de un idioma ──────────────────────────────── */
const buscar = (idioma, clave) => {
  let nodo = translations[idioma];
  for (const parte of clave.split('.')) {
    if (nodo == null || typeof nodo !== 'object' || !(parte in nodo)) return undefined;
    nodo = nodo[parte];
  }
  return typeof nodo === 'string' ? nodo : undefined;
};

const aplanar = (obj, prefijo = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    (v && typeof v === 'object') ? aplanar(v, `${prefijo}${k}.`) : [`${prefijo}${k}`]);

/* ── Claves que pide el código ─────────────────────────────────────────────
   Dos listas distintas, porque las preguntas son distintas: «¿falta alguna?»
   solo puede responderse sobre lo que se le pide a t() de forma explícita,
   mientras que «¿sobra alguna?» necesita ver también las que viajan dentro
   de tablas y variables.                                                   */
const pedidas = new Map();   // las que el código pide explícitamente a t()
const usadas  = new Set();   // esas, más las que viajan en variables o tablas
const apunta = (clave, archivo) => {
  if (!pedidas.has(clave)) pedidas.set(clave, relative('.', archivo));
};

const PARECE_CLAVE = /'([a-z][\w]*(?:\.[\w]+)+)'/g;

for (const archivo of archivos) {
  const src = readFileSync(archivo, 'utf8');

  /* Lo que se le pide a t() directamente: aquí sí exigimos que exista, porque
     si falta, el usuario ve el nombre de la clave en pantalla. */
  for (const m of src.matchAll(/\bt\(\s*'([a-z][\w]*(?:\.[\w]+)+)'/g)) apunta(m[1], archivo);
  for (const m of src.matchAll(/\bt\(([^()]*\?[^()]*)\)/g)) {
    for (const lit of m[1].matchAll(PARECE_CLAVE)) apunta(lit[1], archivo);
  }

  /* Para saber si una clave sobra basta con verla escrita en alguna parte:
     puede estar en una tabla, en una constante o dentro de un array. Se
     recoge cualquier literal con forma de clave y se queda el que resuelve
     contra el diccionario; 'react-router-dom' no resuelve y cae solo. */
  for (const m of src.matchAll(PARECE_CLAVE)) {
    if (IDIOMAS.some(i => buscar(i, m[1]) !== undefined)) usadas.add(m[1]);
  }

  /* Claves que se arman al vuelo: t(`errors.${codigo}`). El nombre exacto no
     está escrito en ninguna parte, así que se da por usada toda la sección.
     Es menos fino, pero el error contrario es peor: marcar como sobrante una
     clave que sí hace falta lleva a borrarla y a dejar al usuario mirando un
     identificador en mitad de un aviso. */
  for (const m of src.matchAll(/\bt\(\s*`([a-z][\w]*(?:\.[\w]+)*)\.\$\{/g)) {
    for (const idioma of IDIOMAS) {
      for (const clave of aplanar(translations[idioma])) {
        if (clave.startsWith(`${m[1]}.`)) usadas.add(clave);
      }
    }
  }
}
for (const clave of pedidas.keys()) usadas.add(clave);

/* ── Comprobaciones ────────────────────────────────────────────────────── */
const faltantes = [];
for (const [clave, archivo] of pedidas) {
  for (const idioma of IDIOMAS) {
    if (buscar(idioma, clave) === undefined) {
      faltantes.push(`${clave}  —  falta en «${idioma}»  (${archivo})`);
    }
  }
}

const porIdioma = Object.fromEntries(IDIOMAS.map(i => [i, new Set(aplanar(translations[i]))]));
const desparejadas = [];
for (const idioma of IDIOMAS) {
  for (const otro of IDIOMAS) {
    if (idioma === otro) continue;
    for (const clave of porIdioma[idioma]) {
      if (!porIdioma[otro].has(clave)) desparejadas.push(`${clave}  —  está en «${idioma}» y no en «${otro}»`);
    }
  }
}

const variablesDe = (texto) => [...texto.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(', ');
const variablesMal = [];
for (const clave of porIdioma[IDIOMAS[0]]) {
  const juegos = IDIOMAS
    .map(i => [i, buscar(i, clave)])
    .filter(([, txt]) => txt !== undefined)
    .map(([i, txt]) => [i, variablesDe(txt)]);
  const distintos = new Set(juegos.map(([, v]) => v));
  if (distintos.size > 1) {
    variablesMal.push(`${clave}  —  ${juegos.map(([i, v]) => `${i}: {${v || '—'}}`).join('   ')}`);
  }
}

const huerfanas = [...porIdioma[IDIOMAS[0]]].filter(c => !usadas.has(c));

/* ── Informe ───────────────────────────────────────────────────────────── */
const bloque = (titulo, lista, grave = true) => {
  if (!lista.length) { console.log(`  OK   ${titulo}`); return 0; }
  console.log(`  ${grave ? 'MAL ' : 'nota'}  ${titulo}`);
  for (const linea of lista) console.log(`         ${linea}`);
  return grave ? 1 : 0;
};

console.log('');
console.log(`  Idiomas: ${IDIOMAS.join(', ')}`);
console.log(`  Claves definidas: ${porIdioma[IDIOMAS[0]].size} · usadas en el código: ${usadas.size}`);
console.log('');

let problemas = 0;
problemas += bloque('todas las claves que pide el código existen en los dos idiomas', faltantes);
problemas += bloque('los dos idiomas tienen exactamente las mismas claves', desparejadas);
problemas += bloque('las sustituciones {x} coinciden entre idiomas', variablesMal);
if (huerfanas.length) {
  console.log(`  nota  ${huerfanas.length} claves definidas que no usa nadie`);
  console.log(`         ${huerfanas.join(', ')}`);
}
console.log('');

process.exit(problemas ? 1 : 0);
