/* ═══════════════════════════════════════════════════════════════════════════
   Vigilancia de las fuentes oficiales — `npm run normativa`

   La aplicación dice a sus usuarios «revisado el 13 de septiembre de 2026» y
   les da un enlace a la fuente oficial de cada trámite. Las dos cosas caducan:
   las normas de importación cambian, y las páginas de los ministerios se
   mueven de sitio. Un enlace roto en el PDF que alguien lleva a la frontera
   es peor que no haberlo puesto.

   Esto comprueba:
     1. cuánto hace que se revisó, y avisa a partir de seis meses
     2. que las fuentes oficiales siguen donde estaban

   No sustituye a leer las normas: solo dice cuándo toca hacerlo.
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync } from 'node:fs';

const AVISO_MESES = 6;

/* fuentes.js no se puede importar directamente: usa sintaxis de módulo que
   Node acepta, pero arrastra el resto del árbol. Se lee como texto. */
const src = readFileSync('src/utils/fuentes.js', 'utf8');

const fecha = src.match(/FECHA_REVISION\s*=\s*'([\d-]+)'/)?.[1];
if (!fecha) {
  console.error('  No encuentro FECHA_REVISION en src/utils/fuentes.js');
  process.exit(1);
}

const urls = [...new Set([...src.matchAll(/'(https?:\/\/[^']+)'/g)].map(m => m[1]))];

/* ── 1. Antigüedad de la revisión ──────────────────────────────────────── */
const revisado = new Date(fecha);
const hoy = new Date();
const meses = (hoy.getFullYear() - revisado.getFullYear()) * 12
            + (hoy.getMonth() - revisado.getMonth())
            - (hoy.getDate() < revisado.getDate() ? 1 : 0);

console.log('');
console.log(`  Última revisión: ${revisado.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`);
console.log(`  Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`);
console.log('');

let problemas = 0;
if (meses >= AVISO_MESES) {
  console.log(`  TOCA  han pasado ${meses} meses: hay que repasar las listas y mover FECHA_REVISION`);
  problemas = 1;
} else {
  console.log(`  OK    dentro de plazo (se avisa a los ${AVISO_MESES} meses)`);
}

/* ── 2. Las fuentes siguen en pie ──────────────────────────────────────── */
console.log('');
console.log(`  Comprobando ${urls.length} fuentes oficiales…`);
console.log('');

const comprobar = async (url) => {
  try {
    const ctrl = new AbortController();
    const reloj = setTimeout(() => ctrl.abort(), 15000);
    /* Algunos ministerios rechazan HEAD; se usa GET y se corta al recibir
       la cabecera. También rechazan peticiones sin navegador declarado. */
    const r = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AURAPets/1.0; +comprobacion-de-enlaces)' },
    });
    clearTimeout(reloj);
    /* 401, 403 y 429: el servidor está y responde, pero no atiende consultas
       automáticas. La página existe; no se puede comprobar desde aquí. */
    const rechaza = [401, 403, 429].includes(r.status);
    return { url, estado: r.status, veredicto: r.ok ? 'ok' : rechaza ? 'robots' : 'rota' };
  } catch (err) {
    return {
      url,
      estado: err.name === 'AbortError' ? 'sin respuesta' : 'error de red',
      veredicto: 'rota',
    };
  }
};

const resultados = await Promise.all(urls.map(comprobar));
const rotas   = resultados.filter(r => r.veredicto === 'rota');
const arobots = resultados.filter(r => r.veredicto === 'robots');

const ORDEN = { rota: 0, robots: 1, ok: 2 };
const MARCA = { rota: 'ROTA', robots: 'a ojo', ok: 'OK  ' };
for (const r of resultados.sort((a, b) => ORDEN[a.veredicto] - ORDEN[b.veredicto])) {
  console.log(`  ${MARCA[r.veredicto]}  ${String(r.estado).padEnd(12)} ${r.url}`);
}

console.log('');
if (rotas.length) {
  console.log(`  ${rotas.length} de ${urls.length} fuentes se han movido de sitio. Hay que buscarlas:`);
  console.log('  la referencia va impresa en el PDF que el usuario lleva a la frontera.');
  problemas = 1;
} else {
  console.log(`  Ninguna de las ${urls.length} fuentes se ha movido.`);
}
if (arobots.length) {
  console.log(`  ${arobots.length} rechazan consultas automáticas: hay que abrirlas a mano de vez en cuando.`);
}
console.log('');

process.exit(problemas);
