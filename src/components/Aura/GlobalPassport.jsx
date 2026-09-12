import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PlaneTakeoff, CheckCircle2, AlertCircle, FileText, X, Shield, Syringe, Stethoscope, FileCheck, Upload, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { assessAirline } from '../../utils/airline';
import { fuenteOficial, nivelRiesgo, TEXTO_RIESGO, FECHA_REVISION } from '../../utils/fuentes';
import { PawScatter } from './Decorations';
import { useTranslation } from '../../context/LocalizationContext';
import perroPasaporte from '../../assets/perro-pasaporte.jpg';
import movilPasaporte from '../../assets/movil-pasaporte.jpg';
import huronPasaporte from '../../assets/huron.jpg';

/* ── Icon helper ── */
const ReqIcon = ({ type, color }) => {
  const props = { size: 16, color };
  if (type === 'chip')    return <Shield {...props} />;
  if (type === 'syringe') return <Syringe {...props} />;
  if (type === 'vet')     return <Stethoscope {...props} />;
  return <FileCheck {...props} />;
};

const STATUS_COLOR = {
  ok:      'var(--aura-neon-cyan)',
  pending: 'var(--aura-gold)',
  alert:   'var(--aura-neon-pink)',
};
const statusLabel = (s, locale) => ({
  ok:      locale === 'es' ? '✓ OK'          : '✓ OK',
  pending: locale === 'es' ? '⏳ PENDIENTE'  : '⏳ PENDING',
  alert:   locale === 'es' ? '⚠ ATENCIÓN'   : '⚠ ATTENTION',
}[s]);

/* ── Estatus sanitario equino de los cinco países que cubre la app ───────────
   Lo que se exige a un caballo no depende solo del destino: depende del
   corredor. Un caballo que sale de España no lleva las mismas pruebas que uno
   que sale de Australia, porque cambia el estatus sanitario del origen.
──────────────────────────────────────────────────────────────────────────── */

/* Países afectados por metritis contagiosa equina. EE. UU. impone cuarentena
   y pruebas específicas a los reproductores procedentes de estos orígenes. */
const CEM_AFECTADOS = ['ES', 'UK'];

/* Zonas donde la piroplasmosis es endémica. Los destinos libres exigen prueba
   a los animales que vienen de aquí. */
const PIROPLASMOSIS_ENDEMICA = ['ES'];

/* Destinos libres de gripe equina que exigen vacunación previa. */
const EXIGEN_GRIPE_EQUINA = ['AU'];

/* ── Requisitos equinos ──────────────────────────────────────────────────────
   Los équidos NO se mueven bajo el régimen de animales de compañía. Se rigen
   por la normativa de sanidad animal para équidos, que exige documento de
   identificación con UELN, pruebas serológicas y, en varios destinos,
   cuarentena. Por eso la lista es distinta y bastante más larga.

   AVISO: los requisitos equinos cambian con frecuencia y dependen del país de
   origen, no solo del destino. Esta lista sirve para preparar el viaje; la
   confirmación siempre corresponde a la autoridad competente del destino.
──────────────────────────────────────────────────────────────────────────── */
const buildEquineRequirements = (pet, countryId, locale, origen = 'ES') => {
  const es = locale === 'es';
  const sp = pet?.specific || {};
  const h = pet?.health || {};

  const hecho = (v) => (v && String(v).trim() ? 'ok' : 'pending');

  const chip = {
    icon: 'chip',
    label: es ? 'Microchip ISO y su ubicación' : 'ISO microchip and its location',
    status: pet?.microchip?.trim() && sp.chipLocation ? 'ok' : 'pending',
    detail: pet?.microchip?.trim()
      ? (sp.chipLocation
          ? `${pet.microchip} · ${sp.chipLocation}`
          : (es ? 'Falta indicar dónde está implantado' : 'Implant location missing'))
      : (es ? 'Introduce el microchip en el registro' : 'Enter the microchip in registration'),
  };

  const documento = {
    icon: 'doc',
    label: es ? 'Documento de identificación equina' : 'Equine identification document',
    status: hecho(sp.passportNumber),
    detail: sp.passportNumber
      ? `${es ? 'Nº' : 'No.'} ${sp.passportNumber}`
      : (es ? 'Pasaporte equino obligatorio de por vida' : 'Lifelong equine passport is mandatory'),
  };

  const ueln = {
    icon: 'doc',
    label: 'UELN',
    status: hecho(sp.ueln),
    detail: sp.ueln
      ? sp.ueln
      : (es ? 'Número único de por vida, 15 dígitos' : 'Unique lifetime number, 15 digits'),
  };

  const resena = {
    icon: 'vet',
    label: es ? 'Reseña completa' : 'Full description',
    status: sp.sex && sp.coatColor && sp.markings ? 'ok' : 'pending',
    detail: sp.sex && sp.coatColor && sp.markings
      ? (es ? 'Sexo, capa y marcas registrados' : 'Sex, coat and markings recorded')
      : (es ? 'Faltan sexo, capa o marcas distintivas' : 'Sex, coat colour or markings missing'),
  };

  const coggins = {
    icon: 'syringe', id: 'coggins', manual: true,
    label: es ? 'Test de Anemia Infecciosa Equina (Coggins)' : 'Equine Infectious Anaemia test (Coggins)',
    status: 'pending',
    detail: es
      ? 'Negativo en AGID (Coggins) o ELISA, en los 6 meses previos a la exportación'
      : 'Negative AGID (Coggins) or ELISA within the 6 months before export',
  };

  const piroplasmosis = {
    icon: 'syringe', id: 'piroplasmosis', manual: true,
    label: es ? 'Test de piroplasmosis' : 'Piroplasmosis test',
    status: 'pending',
    detail: es
      ? 'cELISA negativo. EE. UU. lo exige en los 15 días previos a la salida'
      : 'Negative cELISA. The US requires it within 15 days before departure',
  };

  const sanitario = {
    icon: 'vet',
    label: es ? 'Certificado sanitario oficial' : 'Official health certificate',
    status: h.healthCert?.status || 'pending',
    detail: h.healthCert?.status === 'ok'
      ? (es ? 'Emitido por veterinario oficial' : 'Issued by an official vet')
      : (es ? 'Debe firmarlo un veterinario oficial' : 'Must be signed by an official vet'),
  };

  const permiso = (organismo) => ({
    icon: 'doc', id: 'permiso', manual: true,
    label: `${es ? 'Permiso de importación' : 'Import permit'} · ${organismo}`,
    status: 'pending',
    detail: es ? 'Solicitar antes de organizar el transporte' : 'Apply before arranging transport',
  });

  const cuarentena = (texto) => ({
    icon: 'vet', id: 'cuarentena', manual: true,
    label: es ? 'Cuarentena' : 'Quarantine',
    status: 'alert',
    detail: texto,
  });

  /* Movimiento dentro del mismo país: solo hace falta la identificación */
  if (origen === countryId) {
    return [
      chip, documento, ueln, resena,
      { icon: 'doc', info: true, label: es ? 'Movimiento nacional' : 'Domestic movement', status: 'ok',
        detail: es
          ? 'Origen y destino coinciden: no hay trámite de exportación'
          : 'Origin and destination match: no export procedure needed' },
    ];
  }

  /* Extras que dependen del corredor, no solo del destino */
  const extras = [];
  if (PIROPLASMOSIS_ENDEMICA.includes(origen) && countryId !== 'ES') {
    extras.push({ ...piroplasmosis, status: 'alert',
      detail: es
        ? `Obligatorio: el origen (${origen}) es zona endémica`
        : `Mandatory: the origin (${origen}) is an endemic area` });
  }
  if (countryId === 'US' && CEM_AFECTADOS.includes(origen)) {
    extras.push({ icon: 'vet', id: 'cem', manual: true, label: es ? 'Metritis contagiosa equina (CEM)' : 'Contagious equine metritis (CEM)',
      status: 'alert',
      detail: es
        ? 'Sementales y yeguas que hayan residido o transitado por un país afectado en los últimos 12 meses: pruebas y reserva en instalación de cuarentena CEM aprobada'
        : 'Stallions and mares that lived in or transited a CEM-affected country in the last 12 months: testing plus a booking at an approved CEM quarantine facility' });
  }
  if (EXIGEN_GRIPE_EQUINA.includes(countryId)) {
    extras.push({ icon: 'syringe', id: 'gripe-equina', manual: true, label: es ? 'Vacuna de gripe equina' : 'Equine influenza vaccination',
      status: 'pending',
      detail: es ? 'Pauta completa antes de la salida' : 'Full course before departure' });
  }

  switch (countryId) {
    case 'ES': return [
      chip, documento, ueln, resena, ...extras,
      { ...sanitario, label: es ? 'Certificado sanitario · TRACES' : 'Health certificate · TRACES' },
      { icon: 'doc', label: es ? 'Registro REGA' : 'REGA registration', status: hecho(sp.rega),
        detail: sp.rega || (es ? 'Alta en el registro de explotaciones' : 'Registration in the national holdings register') },
      coggins,
    ];
    case 'UK': return [
      chip, documento, ueln, resena, ...extras,
      { ...sanitario, label: 'Export Health Certificate (EHC)',
        detail: es
          ? 'El AHC de mascotas no sirve para équidos'
          : 'The pet AHC is not valid for equines' },
      { icon: 'doc', id: 'bcp', manual: true, label: es ? 'Entrada por Puesto de Control Fronterizo' : 'Entry via Border Control Post',
        status: 'pending',
        detail: es ? 'La ruta debe pasar por un BCP autorizado' : 'The route must pass through an approved BCP' },
      coggins,
    ];
    case 'US': return [
      chip, documento, ueln, resena, ...extras,
      permiso('USDA APHIS'),
      coggins,
      { icon: 'syringe', id: 'muermo-durina', manual: true, label: es ? 'Muermo y durina' : 'Glanders and dourine', status: 'pending',
        detail: es
          ? 'Analítica obligatoria en el panel de entrada, junto con Coggins y piroplasmosis'
          : 'Mandatory tests in the entry panel, alongside Coggins and piroplasmosis' },
      cuarentena(es
        ? '3, 7 o 60 días en instalación aprobada por el USDA, según el estatus sanitario del país donde residió los 60 días previos. Mínimo 7 días de observación'
        : '3, 7 or 60 days at a USDA-approved facility, depending on the health status of the country of residence in the previous 60 days. Minimum 7 days of observation'),
      sanitario,
    ];
    case 'CA': return [
      chip, documento, ueln, resena, ...extras,
      permiso('CFIA'),
      coggins,
      { ...sanitario, label: es ? 'Certificado sanitario endosado' : 'Endorsed health certificate' },
      { icon: 'vet', info: true, label: es ? 'Inspección en el punto de entrada' : 'Inspection at the point of entry',
        status: 'pending',
        detail: es ? 'A cargo de la agencia canadiense' : 'Carried out by the Canadian agency' },
    ];
    case 'AU': return [
      chip, documento, ueln, resena, ...extras,
      permiso('DAFF'),
      coggins,
      cuarentena(es
        ? 'Cuarentena previa a la exportación y otra a la llegada'
        : 'Pre-export quarantine plus post-arrival quarantine'),
      sanitario,
    ];
    default: return [chip, documento, ueln, resena];
  }
};

/* ── Requisitos para aves ────────────────────────────────────────────────────
   Las aves tampoco entran en el régimen de animales de compañía habitual. Se
   identifican por anilla cerrada, no por microchip, y la mayoría de psitácidas
   están en los apéndices de CITES: cruzar una frontera exige permiso de
   exportación del país de salida y de importación del de entrada, aunque el
   animal haya nacido en cautividad y sea la mascota de toda la vida.

   A eso se suma la sanidad aviar: gripe aviar y enfermedad de Newcastle son
   las que cierran fronteras, y varios destinos imponen cuarentena.
──────────────────────────────────────────────────────────────────────────── */
const buildBirdRequirements = (pet, countryId, locale, origen = 'ES') => {
  const es = locale === 'es';
  const sp = pet?.specific || {};
  const h = pet?.health || {};
  const hecho = (v) => (v && String(v).trim() ? 'ok' : 'pending');

  /* Sin apéndice declarado no se puede saber si hace falta permiso */
  const enCites = sp.citesAppendix && sp.citesAppendix !== 'no';
  const citesDesconocido = !sp.citesAppendix;

  const anilla = {
    icon: 'chip',
    label: es ? 'Identificación por anilla o microchip' : 'Ring or microchip identification',
    status: sp.ringing?.trim() && sp.idType ? 'ok' : 'pending',
    detail: sp.ringing?.trim()
      ? `${sp.idType || (es ? 'Sin tipo' : 'No type')} · ${sp.ringing}`
      : (es ? 'La anilla cerrada acredita la cría en cautividad' : 'A closed ring proves captive breeding'),
  };

  const especie = {
    icon: 'doc',
    label: es ? 'Especie identificada' : 'Species identified',
    status: hecho(sp.scientificName),
    detail: sp.scientificName
      || (es ? 'El nombre científico determina si aplica CITES' : 'The scientific name determines whether CITES applies'),
  };

  const cites = citesDesconocido
    ? {
        icon: 'doc',
        label: 'CITES',
        status: 'alert',
        detail: es
          ? 'Sin determinar. Compruébalo antes de comprar el billete'
          : 'Undetermined. Check before booking the flight',
      }
    : enCites
      ? {
          icon: 'doc',
          label: `CITES · ${es ? 'Apéndice' : 'Appendix'} ${sp.citesAppendix}`,
          status: hecho(sp.citesNumber),
          detail: sp.citesNumber
            ? `${es ? 'Certificado' : 'Certificate'} ${sp.citesNumber}`
            : (es
                ? 'Requiere permiso de exportación e importación, uno por cada frontera'
                : 'Requires export and import permits, one for each border'),
        }
      : {
          icon: 'doc',
          label: 'CITES',
          status: 'ok',
          detail: es ? 'Especie no listada' : 'Species not listed',
        };

  const gripeAviar = {
    icon: 'syringe', id: 'gripe-aviar', manual: true,
    label: es ? 'Gripe aviar' : 'Avian influenza',
    status: 'pending',
    detail: es
      ? 'Certificado veterinario y, según el destino, aislamiento previo'
      : 'Veterinary certificate and, depending on destination, prior isolation',
  };

  const newcastle = {
    icon: 'syringe', id: 'newcastle', manual: true,
    label: es ? 'Enfermedad de Newcastle' : 'Newcastle disease',
    status: 'pending',
    detail: es ? 'Vacunación o prueba según el país de salida' : 'Vaccination or testing depending on country of departure',
  };

  const psitacosis = {
    icon: 'vet', id: 'psitacosis', manual: true,
    label: es ? 'Clamidiosis (psitacosis)' : 'Chlamydiosis (psittacosis)',
    status: 'pending',
    detail: es ? 'Exigida a psitácidas en varios destinos' : 'Required for parrots by several destinations',
  };

  const sanitario = {
    icon: 'vet',
    label: es ? 'Certificado sanitario oficial' : 'Official health certificate',
    status: h.healthCert?.status || 'pending',
    detail: h.healthCert?.status === 'ok'
      ? (es ? 'Emitido por veterinario oficial' : 'Issued by an official vet')
      : (es ? 'Debe firmarlo un veterinario oficial' : 'Must be signed by an official vet'),
  };

  const cuarentena = (dias, texto) => ({
    icon: 'vet', id: 'cuarentena', manual: true,
    label: es ? `Cuarentena (${dias})` : `Quarantine (${dias})`,
    status: 'alert',
    detail: texto || (es ? 'En instalación autorizada del destino' : 'At an approved facility in the destination'),
  });

  const permiso = (organismo, texto) => ({
    icon: 'doc', id: 'permiso', manual: true,
    label: `${es ? 'Permiso de importación' : 'Import permit'} · ${organismo}`,
    status: 'pending',
    detail: texto || (es ? 'Solicitar con antelación: los plazos son largos' : 'Apply well ahead: lead times are long'),
  });

  /* Movimiento dentro del mismo país */
  if (origen === countryId) {
    return [
      anilla, especie,
      { ...cites, detail: enCites
          ? (es ? 'Documenta la tenencia legal aunque no cruces frontera' : 'Documents lawful keeping even without crossing a border')
          : cites.detail },
      { icon: 'doc', info: true, label: es ? 'Movimiento nacional' : 'Domestic movement', status: 'ok',
        detail: es ? 'Sin trámite de exportación' : 'No export procedure needed' },
    ];
  }

  switch (countryId) {
    case 'ES': return [
      anilla, especie, cites, gripeAviar, newcastle,
      { ...sanitario, label: es ? 'Certificado sanitario · TRACES' : 'Health certificate · TRACES' },
    ];
    case 'UK': return [
      anilla, especie, cites,
      { icon: 'doc', id: 'aviso-apha', manual: true,
        label: es ? 'Avisar a la APHA antes de viajar' : 'Notify APHA before travelling',
        status: 'pending',
        detail: es
          ? 'Hay que comunicarlo con al menos un día de antelación. Sin ese aviso, el animal no entra'
          : 'It must be notified at least one day in advance. Without that notice the animal is not admitted' },
      { icon: 'doc', id: 'licencia-apha', manual: true,
        label: es ? 'Licencia de importación · APHA' : 'Import licence · APHA',
        status: 'pending',
        detail: es
          ? 'Obligatoria desde fuera de la UE. Desde países de la UE y la EFTA no se exige actualmente'
          : 'Required from outside the EU. Not currently required from EU and EFTA countries' },
      gripeAviar, newcastle,
      { ...sanitario, label: 'Export Health Certificate (EHC)',
        detail: es
          ? 'Emitido en el país de salida'
          : 'Issued in the country of departure' },
      { icon: 'doc', id: 'puerto-uk', manual: true,
        label: es ? 'Solo cuatro aeropuertos admiten aves' : 'Only four airports accept birds',
        status: 'alert',
        detail: es
          ? 'Heathrow, Gatwick, Edimburgo y Glasgow. Comprueba esto antes de comprar el billete'
          : 'Heathrow, Gatwick, Edinburgh and Glasgow. Check this before buying the ticket' },
      cuarentena(es ? '30 días' : '30 days', es
        ? 'En instalación autorizada por la APHA. Las psitácidas deben ir identificadas una a una'
        : 'At an APHA-licensed facility. Psittacines must be individually identified'),
    ];
    case 'US': return [
      anilla, especie, cites,
      { icon: 'doc', info: true, label: es ? 'Máximo 5 aves' : 'Five birds maximum', status: 'ok',
        detail: es
          ? 'La vía de mascota personal admite hasta 5 aves. A partir de ahí es importación comercial'
          : 'The personal pet route allows up to 5 birds. Beyond that it is a commercial import' },
      permiso('USDA APHIS eFile', es
        ? 'Solicítalo al menos 7 días hábiles antes de volar. Tarda entre 7 y 10 días hábiles y caduca a los 30'
        : 'Apply at least 7 business days before flying. It takes 7–10 business days and expires after 30'),
      gripeAviar, newcastle, psitacosis,
      cuarentena(es ? '30 días' : '30 days', es
        ? 'Puede hacerse en casa si el permiso lo autoriza. Se analiza dos veces contra gripe aviar y Newcastle'
        : 'May be done at home if the permit allows it. Tested twice for avian influenza and Newcastle disease'),
      { ...sanitario, detail: es
          ? 'Firmado por un veterinario funcionario del gobierno del país de salida'
          : 'Signed by a salaried government veterinarian of the country of departure' },
    ];
    case 'CA': return [
      anilla, especie, cites,
      { icon: 'doc', id: 'posesion-90', manual: true,
        label: es ? '90 días de posesión previa' : '90 days of prior ownership',
        status: 'pending',
        detail: es
          ? 'El ave debe haber estado en tu poder, en el país de origen, los 90 días anteriores a pedir el permiso, y sin contacto con otras aves'
          : 'The bird must have been in your possession, in the country of origin, for the 90 days before applying for the permit, with no contact with other birds' },
      permiso('CFIA', es
        ? 'La cuarentena debe estar aprobada ANTES de que emitan el permiso: contacta con la oficina del CFIA de tu provincia'
        : 'The quarantine must be approved BEFORE the permit is issued: contact the CFIA office for your province'),
      { icon: 'doc', id: 'acompanar', manual: true,
        label: es ? 'El dueño debe viajar con el ave' : 'The owner must travel with the bird',
        status: 'pending',
        detail: es
          ? 'No se admite que llegue sola ni enviada por separado'
          : 'It cannot arrive alone or be shipped separately' },
      gripeAviar, newcastle,
      { ...sanitario, label: es ? 'Certificado veterinario internacional' : 'International veterinary certificate',
        detail: es
          ? 'Debe declarar que no hubo gripe aviar notificable en los 6 meses previos, y que el ave se inspeccionó en las 72 horas anteriores al envío'
          : 'It must state that no notifiable avian influenza occurred in the previous 6 months, and that the bird was inspected within 72 hours before shipment' },
      cuarentena(es ? '45 días' : '45 days', es
        ? 'Mínimo, en un local tuyo que el CFIA debe aprobar de antemano'
        : 'Minimum, at your own premises, which the CFIA must approve beforehand'),
      { icon: 'doc', info: true, label: es ? 'Límite de ejemplares' : 'Limit on numbers', status: 'ok',
        detail: es
          ? 'Hasta 5 psitácidas o 20 aves de otras especies. Tampoco puedes haber importado aves en los 90 días anteriores'
          : 'Up to 5 psittacines or 20 birds of other species. You also cannot have imported birds in the previous 90 days' },
    ];
    case 'AU': return [
      anilla, especie, cites, permiso('DAFF'),
      gripeAviar, newcastle, psitacosis,
      cuarentena(es ? 'previa y posterior' : 'pre-export and post-arrival'),
      { icon: 'vet', info: true, label: es ? 'Restricciones de especie' : 'Species restrictions', status: 'alert',
        detail: es
          ? 'Australia solo admite aves de un listado muy corto: confírmalo antes de nada'
          : 'Australia admits only a very short list of birds: confirm before anything else' },
      sanitario,
    ];
    default: return [anilla, especie, cites];
  }
};

/* ── Requisitos para conejos ─────────────────────────────────────────────────
   El reglamento europeo de animales de compañía cubre perros, gatos y hurones.
   Los conejos quedan fuera: dependen de la norma nacional de cada país, y eso
   los hace más impredecibles. Australia, por ejemplo, prohíbe su entrada salvo
   desde Nueva Zelanda.
──────────────────────────────────────────────────────────────────────────── */
const buildRabbitRequirements = (pet, countryId, locale, origen = 'ES') => {
  const es = locale === 'es';
  const sp = pet?.specific || {};
  const h = pet?.health || {};

  const identificacion = {
    icon: 'chip',
    label: es ? 'Identificación' : 'Identification',
    status: (sp.rabbitId?.trim() || pet?.microchip?.trim()) ? 'ok' : 'pending',
    detail: sp.rabbitId?.trim() || pet?.microchip?.trim()
      || (es ? 'Tatuaje auricular o microchip' : 'Ear tattoo or microchip'),
  };

  const vacuna = (campo, etiqueta) => ({
    icon: 'syringe',
    label: etiqueta,
    status: sp[campo] ? 'ok' : 'pending',
    detail: sp[campo]
      ? `${es ? 'Última dosis' : 'Last dose'} ${new Date(sp[campo]).toLocaleDateString(es ? 'es-ES' : 'en-GB')}`
      : (es ? 'Sin registrar' : 'Not recorded'),
  });

  const mixomatosis = vacuna('myxoDate', es ? 'Mixomatosis' : 'Myxomatosis');
  const rhd = vacuna('rhdDate', es ? 'Enfermedad hemorrágica (RHD)' : 'Rabbit haemorrhagic disease (RHD)');

  const sanitario = {
    icon: 'vet',
    label: es ? 'Certificado sanitario oficial' : 'Official health certificate',
    status: h.healthCert?.status || 'pending',
    detail: h.healthCert?.status === 'ok'
      ? (es ? 'Emitido por veterinario oficial' : 'Issued by an official vet')
      : (es ? 'Debe firmarlo un veterinario oficial' : 'Must be signed by an official vet'),
  };

  const fueraDelReglamento = {
    icon: 'doc',
    info: true,
    label: es ? 'Fuera del régimen de mascotas' : 'Outside the pet travel scheme',
    status: 'alert',
    detail: es
      ? 'El reglamento europeo solo cubre perros, gatos y hurones: aquí manda la norma nacional del destino'
      : 'The EU pet regulation covers only dogs, cats and ferrets: national rules of the destination apply',
  };

  if (origen === countryId) {
    return [identificacion, mixomatosis, rhd,
      { icon: 'doc', info: true, label: es ? 'Movimiento nacional' : 'Domestic movement', status: 'ok',
        detail: es ? 'Sin trámite de exportación' : 'No export procedure needed' }];
  }

  switch (countryId) {
    case 'ES': return [identificacion, fueraDelReglamento, mixomatosis, rhd, sanitario];
    case 'UK': return [
      identificacion, fueraDelReglamento,
      { icon: 'doc', id: 'licencia-rabia-uk', manual: true,
        label: es ? 'Licencia de importación por rabia · APHA' : 'Rabies import licence · APHA',
        status: 'pending',
        detail: es
          ? 'El conejo se considera especie sensible a la rabia. La licencia se solicita a la APHA antes de viajar'
          : 'Rabbits are treated as a rabies-susceptible species. The licence is applied for from APHA before travelling' },
      { icon: 'vet', id: 'cuarentena-uk-conejo', manual: true,
        label: es ? 'Cuarentena de 4 meses, salvo exención' : 'Four months quarantine, unless exempt',
        status: 'alert',
        detail: es
          ? 'Cuatro meses en Inglaterra y Gales, tres en Escocia. Es el plazo por defecto y cambia por completo el viaje'
          : 'Four months in England and Wales, three in Scotland. This is the default and it changes the whole trip' },
      { icon: 'doc', id: 'exencion-uk-conejo', manual: true,
        label: es ? 'Exención de cuarentena desde la UE' : 'Quarantine exemption from the EU',
        status: 'pending',
        detail: es
          ? 'Saliendo de la UE se evita la cuarentena si el conejo nació en una explotación registrada y vivió siempre en cautividad, no hay rabia ni mixomatosis en ella, y el certificado sanitario lleva la declaración específica para lagomorfos'
          : 'From the EU the quarantine is avoided if the rabbit was born on a registered holding and always kept in captivity, the holding is free of rabies and myxomatosis, and the health certificate carries the specific lagomorph statement' },
      mixomatosis, rhd,
      { ...sanitario, label: es ? 'Certificado sanitario con declaración de lagomorfos' : 'Health certificate with lagomorph statement' },
    ];
    case 'US': return [
      identificacion, fueraDelReglamento, mixomatosis, rhd,
      { icon: 'vet', info: true, label: es ? 'Inspección en el punto de entrada' : 'Inspection at the point of entry',
        status: 'pending', detail: es ? 'Sin requisito de vacuna antirrábica' : 'No rabies vaccination requirement' },
      sanitario,
    ];
    case 'CA': return [
      identificacion,
      { ...fueraDelReglamento,
        detail: es
          ? 'Para el CFIA solo son mascotas los perros, gatos y hurones. El conejo se tramita como animal peletero, con otro procedimiento'
          : 'For the CFIA only dogs, cats and ferrets count as pets. Rabbits are processed as fur-bearing animals, under a different procedure' },
      { icon: 'doc', id: 'permiso-ca', manual: true,
        label: es ? 'Consulta previa · CFIA' : 'Prior enquiry · CFIA', status: 'pending',
        detail: es
          ? 'Los requisitos dependen del país de salida y del número de animales: confírmalos con la oficina del CFIA antes de mover nada'
          : 'Requirements depend on the country of departure and the number of animals: confirm with the CFIA office before arranging anything' },
      { icon: 'vet', id: 'cuarentena-ca-conejo', manual: true,
        label: es ? 'Cuarentena a partir de 3 animales' : 'Quarantine from three animals up',
        status: 'pending',
        detail: es
          ? 'Con más de dos conejos se exige cuarentena de 21 días y reconocimiento veterinario en los 5 días previos a la salida'
          : 'With more than two rabbits, a 21-day quarantine and a veterinary examination within 5 days before departure are required' },
      mixomatosis, rhd,
      sanitario,
    ];
    case 'AU': return [
      identificacion,
      { icon: 'doc', info: true, label: es ? 'Entrada prohibida' : 'Entry prohibited', status: 'alert',
        detail: es
          ? 'Australia no admite conejos salvo procedentes de Nueva Zelanda. Este viaje no es viable.'
          : 'Australia does not admit rabbits except from New Zealand. This trip is not viable.' },
    ];
    default: return [identificacion, fueraDelReglamento];
  }
};

/* ── Requisitos para reptiles y exóticos ─────────────────────────────────────
   Aquí manda CITES por encima de la sanidad animal: muchas especies de tortuga,
   camaleón, iguana o serpiente están listadas, y varias en el apéndice I, donde
   el comercio está prohibido salvo excepciones muy tasadas. Además, casi ningún
   país los admite por la vía de mascotas.
──────────────────────────────────────────────────────────────────────────── */
const buildExoticRequirements = (pet, countryId, locale, origen = 'ES') => {
  const es = locale === 'es';
  const sp = pet?.specific || {};
  const h = pet?.health || {};
  const hecho = (v) => (v && String(v).trim() ? 'ok' : 'pending');

  const enCites = sp.citesAppendix && sp.citesAppendix !== 'no';
  const citesDesconocido = !sp.citesAppendix;

  const especie = {
    icon: 'doc',
    label: es ? 'Especie identificada' : 'Species identified',
    status: hecho(sp.scientificName),
    detail: sp.scientificName
      || (es ? 'El nombre científico decide todo lo demás' : 'The scientific name determines everything else'),
  };

  const cites = citesDesconocido
    ? { icon: 'doc', label: 'CITES', status: 'alert',
        detail: es
          ? 'Sin determinar. Muchos reptiles están listados: compruébalo antes que nada'
          : 'Undetermined. Many reptiles are listed: check this before anything else' }
    : enCites
      ? { icon: 'doc', label: `CITES · ${es ? 'Apéndice' : 'Appendix'} ${sp.citesAppendix}`,
          status: sp.citesAppendix === 'I' ? 'alert' : hecho(sp.citesNumber),
          detail: sp.citesAppendix === 'I'
            ? (es
                ? 'Apéndice I: comercio prohibido salvo excepciones muy tasadas'
                : 'Appendix I: trade banned save for narrowly defined exceptions')
            : (sp.citesNumber
                ? `${es ? 'Certificado' : 'Certificate'} ${sp.citesNumber}`
                : (es ? 'Permiso de exportación e importación por cada frontera' : 'Export and import permits for each border')) }
      : { icon: 'doc', label: 'CITES', status: 'ok', detail: es ? 'Especie no listada' : 'Species not listed' };

  const identificacion = {
    icon: 'chip',
    label: es ? 'Identificación' : 'Identification',
    status: pet?.microchip?.trim() ? 'ok' : 'pending',
    detail: pet?.microchip?.trim()
      || (es ? 'Microchip o fotografía identificativa según especie' : 'Microchip or identifying photograph, by species'),
  };

  const sanitario = {
    icon: 'vet',
    label: es ? 'Certificado sanitario oficial' : 'Official health certificate',
    status: h.healthCert?.status || 'pending',
    detail: h.healthCert?.status === 'ok'
      ? (es ? 'Emitido por veterinario oficial' : 'Issued by an official vet')
      : (es ? 'Debe firmarlo un veterinario oficial' : 'Must be signed by an official vet'),
  };

  const fueraDelReglamento = {
    icon: 'doc',
    info: true,
    label: es ? 'Fuera del régimen de mascotas' : 'Outside the pet travel scheme',
    status: 'alert',
    detail: es
      ? 'Los reptiles no viajan como animales de compañía: cada país aplica su propia norma'
      : 'Reptiles do not travel as pets: each country applies its own rules',
  };

  if (origen === countryId) {
    return [especie, cites, identificacion,
      { icon: 'doc', info: true, label: es ? 'Movimiento nacional' : 'Domestic movement', status: 'ok',
        detail: es ? 'Sin trámite de exportación' : 'No export procedure needed' }];
  }

  const permiso = (org) => ({
    icon: 'doc', id: 'permiso', manual: true, label: `${es ? 'Permiso de importación' : 'Import permit'} · ${org}`, status: 'pending',
    detail: es ? 'Trámite específico por especie' : 'Species-specific procedure',
  });

  switch (countryId) {
    case 'ES': return [especie, cites, identificacion, fueraDelReglamento, sanitario];
    case 'UK': return [especie, cites, identificacion, fueraDelReglamento, permiso('APHA'), sanitario];
    case 'US': return [especie, cites, identificacion, fueraDelReglamento,
      { icon: 'doc', id: 'declaracion-3177', manual: true, label: es ? 'Declaración USFWS · formulario 3-177' : 'USFWS declaration · form 3-177',
        status: 'pending',
        detail: es
          ? 'Toda la fauna silvestre debe declararse. Se presenta en línea en eDecs'
          : 'All wildlife must be declared. Filed online through eDecs' },
      { icon: 'vet', id: 'puerto-designado', manual: true, label: es ? 'Puerto designado y aviso previo' : 'Designated port and advance notice',
        status: 'pending',
        detail: es
          ? 'Entrada solo por un puerto designado del USFWS, con aviso de llegada 48 horas antes por tratarse de animal vivo'
          : 'Entry only through a designated USFWS port, with 48 hours’ notice of arrival because the animal is alive' },
      sanitario];
    case 'CA': return [especie, cites, identificacion, fueraDelReglamento, permiso('CFIA / ECCC'), sanitario];
    case 'AU': return [especie, cites, identificacion,
      { icon: 'doc', info: true, label: es ? 'Entrada muy restringida' : 'Entry heavily restricted', status: 'alert',
        detail: es
          ? 'Australia prohíbe la entrada de casi todos los reptiles como mascota. Confírmalo antes de cualquier gestión.'
          : 'Australia bans almost all reptiles as pets. Confirm before taking any step.' }];
    default: return [especie, cites, identificacion, fueraDelReglamento];
  }
};

/* ── Especie sin determinar ──────────────────────────────────────────────────
   Si el usuario eligió "otra mascota", no se puede afirmar nada: fingir una
   lista de requisitos sería peor que reconocer que hace falta consultar.
──────────────────────────────────────────────────────────────────────────── */
const buildUnknownRequirements = (pet, countryId, locale) => {
  const es = locale === 'es';
  return [
    {
      icon: 'doc',
      label: es ? 'Especie sin determinar' : 'Species undetermined',
      status: 'alert',
      detail: es
        ? 'Indica la especie exacta en el registro para poder evaluar los requisitos'
        : 'Enter the exact species in registration so requirements can be assessed',
    },
    {
      icon: 'vet',
      info: true,
      label: es ? 'Consulta obligatoria' : 'Mandatory enquiry',
      status: 'alert',
      detail: es
        ? 'Cada especie tiene su propio régimen. Pregunta a la autoridad sanitaria del destino antes de reservar nada.'
        : 'Every species has its own regime. Ask the destination’s animal health authority before booking anything.',
    },
  ];
};

/* ── Hurones en los dos destinos que se salen de la norma ────────────────────
   En la Unión Europea y en Reino Unido el hurón va exactamente igual que un
   perro o un gato: el reglamento europeo cubre las tres especies. Canadá también
   lo admite con el certificado de vacunación antirrábica.

   Estados Unidos y Australia son otra historia, y en direcciones opuestas: allí
   el gobierno federal no le pide nada y el problema está en el estado de
   destino; allá sencillamente no entra.
──────────────────────────────────────────────────────────────────────────── */
const buildFerretRequirements = (pet, countryId, locale) => {
  const es = locale === 'es';
  const h = pet?.health || {};
  const hasMicrochip = !!pet?.microchip?.trim();

  if (countryId === 'AU') {
    return [
      { icon: 'doc', info: true, label: es ? 'Entrada no permitida' : 'Entry not permitted', status: 'alert',
        detail: es
          ? 'Australia no admite hurones como mascota, venga de donde venga. Confírmalo en BICON antes de dar cualquier paso.'
          : 'Australia does not admit pet ferrets, whatever the origin. Confirm in BICON before taking any step.' },
    ];
  }

  /* Estados Unidos */
  return [
    { icon: 'ok', info: true, label: es ? 'Sin requisitos federales' : 'No federal requirements', status: 'ok',
      detail: es
        ? 'El USDA APHIS no impone condiciones sanitarias a los hurones de compañía'
        : 'USDA APHIS sets no animal health conditions for pet ferrets' },
    { icon: 'doc', id: 'estado-destino', manual: true,
      label: es ? 'Comprueba el estado de destino' : 'Check the destination state', status: 'pending',
      detail: es
        ? 'Aquí manda el estado, no el gobierno federal: California los prohíbe y la ciudad de Nueva York también. Compruébalo antes de comprar el billete.'
        : 'The state decides here, not the federal government: California bans them, and so does New York City. Check before buying the ticket.' },
    { icon: 'chip', label: 'Microchip ISO 11784/11785', status: hasMicrochip ? 'ok' : 'pending',
      detail: hasMicrochip
        ? pet.microchip
        : (es ? 'No lo exige el gobierno federal, pero sí varios estados y las aerolíneas' : 'Not required federally, but several states and airlines ask for it') },
    { icon: 'syringe', label: es ? 'Vacuna antirrábica' : 'Rabies vaccination',
      status: h.rabiesVaccine?.status || 'pending',
      detail: es
        ? 'La exige la mayoría de estados aunque no la pida el gobierno federal'
        : 'Most states require it even though the federal government does not' },
    { icon: 'vet', label: es ? 'Certificado sanitario' : 'Health certificate',
      status: h.healthCert?.status || 'pending',
      detail: es
        ? 'Lo piden muchas aerolíneas y varios estados. Llévalo'
        : 'Many airlines and several states ask for it. Take it' },
  ];
};

/* ── Build requirements dynamically from pet data ── */
const buildRequirements = (pet, countryId, locale, origen = 'ES') => {
  /* Los équidos van por su propia normativa, no por la de mascotas */
  if (pet?.species === 'horse') return buildEquineRequirements(pet, countryId, locale, origen);
  if (pet?.species === 'bird') return buildBirdRequirements(pet, countryId, locale, origen);
  if (pet?.species === 'rabbit') return buildRabbitRequirements(pet, countryId, locale, origen);
  if (pet?.species === 'exotic') return buildExoticRequirements(pet, countryId, locale, origen);
  if (pet?.species === 'other') return buildUnknownRequirements(pet, countryId, locale);
  /* El hurón comparte el régimen europeo con perros y gatos, así que pasa por
     la lista común; solo Estados Unidos y Australia lo tratan aparte. */
  if (pet?.species === 'ferret' && (countryId === 'US' || countryId === 'AU')) {
    return buildFerretRequirements(pet, countryId, locale);
  }

  const es = locale === 'es';
  const esPerro = pet?.species === 'dog';
  const hasMicrochip = !!pet?.microchip?.trim();
  const h = pet?.health || {};
  const sp = pet?.specific || {};

  const fmt = (d) => new Date(d).toLocaleDateString(es ? 'es-ES' : 'en-GB');
  const diasDesde = (fecha) => {
    if (!fecha) return null;
    const t = new Date(fecha).getTime();
    if (Number.isNaN(t)) return null;
    return Math.floor((Date.now() - t) / 86400000);
  };

  /* ── Microchip ───────────────────────────────────────────────────────────
     El orden importa: una vacuna antirrábica puesta antes del microchip no
     vale, y hay que revacunar y volver a esperar. Es un error caro y común. */
  const chip = {
    icon: 'chip',
    label: 'Microchip ISO 11784/11785',
    status: hasMicrochip ? 'ok' : 'pending',
    detail: hasMicrochip
      ? `${es ? 'Registrado' : 'Recorded'} · ${pet.microchip} — ${es
          ? 'debe haberse implantado ANTES de la vacuna antirrábica'
          : 'must have been implanted BEFORE the rabies vaccination'}`
      : (es
          ? 'Introduce el nº de microchip. Debe implantarse antes de vacunar de rabia'
          : 'Enter the microchip number. It must be implanted before the rabies vaccination'),
  };

  /* ── Vacuna antirrábica ──────────────────────────────────────────────── */
  const rv = h.rabiesVaccine || {};
  const rabies = {
    icon: 'syringe',
    label: es ? 'Vacuna antirrábica' : 'Rabies vaccination',
    status: rv.status || 'pending',
    detail: rv.status === 'ok' && rv.expiry
      ? `${es ? 'Válida hasta' : 'Valid until'} ${fmt(rv.expiry)}`
      : (es ? 'Pendiente — añádela en Documentación' : 'Pending — add it in Health Docs'),
  };

  /* ── Espera de 21 días ───────────────────────────────────────────────────
     Tras la primera dosis hay que esperar 21 días completos antes de viajar.
     Si tenemos la fecha, se cuenta de verdad en vez de recitar la regla. */
  const diasVacuna = diasDesde(rv.date);
  const espera21 = {
    icon: 'syringe',
    label: es ? 'Espera de 21 días tras la vacuna' : '21-day wait after vaccination',
    status: diasVacuna === null ? 'pending' : (diasVacuna >= 21 ? 'ok' : 'alert'),
    detail: diasVacuna === null
      ? (es
          ? 'Anota la fecha de la vacuna para calcular cuándo puedes viajar'
          : 'Record the vaccination date to work out when you can travel')
      : diasVacuna >= 21
        ? (es ? `Cumplida: ${diasVacuna} días desde la vacunación` : `Met: ${diasVacuna} days since vaccination`)
        : (es
            ? `Faltan ${21 - diasVacuna} días. Solo aplica a la primera dosis o si se dejó caducar`
            : `${21 - diasVacuna} days to go. Applies to the first dose, or if the vaccine was allowed to lapse`),
  };

  /* ── Edad mínima ─────────────────────────────────────────────────────────
     La primera antirrábica no se puede poner antes de las 12 semanas, lo que
     sitúa el primer viaje posible alrededor de las 15. */
  const diasEdad = diasDesde(pet?.birthDate || sp.birthDate);
  const edadMinima = (semanas, etiqueta, motivo) => ({
    icon: 'vet',
    label: etiqueta,
    status: diasEdad === null ? 'pending' : (diasEdad >= semanas * 7 ? 'ok' : 'alert'),
    detail: diasEdad === null
      ? (es ? `Añade la fecha de nacimiento. ${motivo}` : `Add the date of birth. ${motivo}`)
      : diasEdad >= semanas * 7
        ? (es ? 'Cumple la edad mínima' : 'Meets the minimum age')
        : motivo,
  });

  /* ── Documentos ──────────────────────────────────────────────────────── */
  const pp = h.physicalPassport || {};
  const euPassport = {
    icon: 'doc',
    label: es ? 'Pasaporte europeo' : 'EU pet passport',
    status: pp.status || 'pending',
    detail: pp.status === 'ok' && pp.fileName
      ? `${es ? 'Documento custodiado' : 'Document on file'}: ${pp.fileName.length > 30 ? pp.fileName.slice(0, 28) + '…' : pp.fileName}`
      : (es
          ? 'Lo emite cualquier veterinario autorizado. Cubre perros, gatos y hurones'
          : 'Issued by any authorised vet. Covers dogs, cats and ferrets'),
  };

  const hc = h.healthCert || {};
  const healthCert = {
    icon: 'vet',
    label: es ? 'Certificado sanitario' : 'Health certificate',
    status: hc.status || 'pending',
    detail: hc.status === 'ok'
      ? (es ? 'Certificado emitido' : 'Certificate issued')
      : hc.notes || (es ? 'Firma veterinaria pendiente' : 'Pending vet signature'),
  };

  /* ── Antiparasitario contra Echinococcus ─────────────────────────────────
     Solo perros, y solo hacia territorios libres del parásito. */
  const tenia = {
    icon: 'vet', id: 'tenia', manual: true,
    label: es ? 'Tratamiento contra la tenia (Echinococcus)' : 'Tapeworm treatment (Echinococcus)',
    status: 'pending',
    detail: es
      ? 'Solo perros. Debe administrarlo un veterinario entre 24 y 120 horas antes de la llegada'
      : 'Dogs only. A vet must administer it between 24 and 120 hours before arrival',
  };

  switch (countryId) {
    /* ── España / Unión Europea ─────────────────────────────────────────── */
    case 'ES': return [
      chip,
      rabies,
      espera21,
      edadMinima(12, es ? 'Edad mínima para vacunar' : 'Minimum age to vaccinate',
        es ? 'La primera antirrábica no puede ponerse antes de las 12 semanas'
           : 'The first rabies vaccination cannot be given before 12 weeks'),
      euPassport,
      { icon: 'doc', info: true, label: es ? 'Antiparasitario: solo ciertos destinos' : 'Tapeworm: only certain destinations',
        status: 'ok',
        detail: es
          ? 'Dentro de la UE solo lo exigen Finlandia, Irlanda, Malta, Noruega e Irlanda del Norte, y solo a perros'
          : 'Within the EU only Finland, Ireland, Malta, Norway and Northern Ireland require it, and only for dogs' },
    ];

    /* ── Reino Unido ────────────────────────────────────────────────────── */
    case 'UK': return [
      chip,
      rabies,
      espera21,
      { ...healthCert,
        label: es ? 'Documento de viaje (AHC o pasaporte)' : 'Travel document (AHC or passport)',
        detail: hc.status === 'ok'
          ? healthCert.detail
          : (es
              ? 'Desde la UE sirve el pasaporte europeo; desde fuera hace falta un Animal Health Certificate'
              : 'From the EU the pet passport works; from outside an Animal Health Certificate is needed') },
      ...(esPerro ? [tenia] : [{
        icon: 'ok', info: true, label: es ? 'Antiparasitario no aplicable' : 'Tapeworm treatment not applicable',
        status: 'ok',
        detail: es ? 'El tratamiento contra la tenia solo se exige a perros' : 'Tapeworm treatment is required for dogs only',
      }]),
      { icon: 'vet', info: true, label: es ? 'Consecuencia de incumplir' : 'Consequence of non-compliance',
        status: 'alert',
        detail: es
          ? 'Si algo falla, el animal puede quedar en cuarentena hasta 4 meses, o ser rechazado si llegas por mar'
          : 'If anything is missing, the animal may be quarantined for up to 4 months, or refused entry if arriving by sea' },
    ];

    /* ── Estados Unidos ──────────────────────────────────────────────────
       Desde el 1 de agosto de 2024 el régimen cambió por completo. Para un
       perro procedente de país de riesgo bajo o libre de rabia canina —que es
       el caso de los cinco países de esta aplicación— el único documento
       exigido por los CDC es el recibo del CDC Dog Import Form. No hace falta
       certificado de rabia ni certificado sanitario de los CDC. */
    case 'US': return esPerro ? [
      { icon: 'doc', id: 'cdc-form', manual: true, label: 'CDC Dog Import Form', status: 'pending',
        detail: es
          ? 'Formulario en línea y gratuito. El recibo es el único documento que exigen los CDC desde origen de riesgo bajo'
          : 'Free online form. The receipt is the only document the CDC requires from a low-risk origin' },
      edadMinima(26, es ? 'Edad mínima: 6 meses' : 'Minimum age: 6 months',
        es ? 'Ningún perro menor de 6 meses puede entrar en EE. UU. No hay excepción ni trámite alternativo'
           : 'No dog under 6 months may enter the US. There is no exception or alternative procedure'),
      { ...chip, detail: hasMicrochip
          ? `${pet.microchip} — ${es ? 'debe leerse con escáner universal' : 'must be readable with a universal scanner'}`
          : (es ? 'Obligatorio, y legible con escáner universal' : 'Mandatory, and readable with a universal scanner') },
      { icon: 'doc', id: 'residencia-6m', manual: true, label: es ? 'Residencia previa de 6 meses' : 'Six months of prior residence', status: 'pending',
        detail: es
          ? 'El perro debe haber estado solo en países de riesgo bajo o libres de rabia canina durante los 6 meses previos'
          : 'The dog must have been only in low-risk or dog-rabies-free countries for the previous 6 months' },
      { icon: 'vet', info: true, label: es ? 'Buen estado aparente' : 'Healthy appearance', status: 'pending',
        detail: es ? 'Se comprueba a la llegada' : 'Checked on arrival' },
    ] : [
      { icon: 'ok', info: true, label: es ? 'Sin requisito federal para gatos' : 'No federal requirement for cats', status: 'ok',
        detail: es
          ? 'Los CDC no exigen vacuna antirrábica ni certificado a los gatos'
          : 'The CDC does not require rabies vaccination or a certificate for cats' },
      chip,
      { ...healthCert, status: 'pending',
        detail: es
          ? 'No lo exige el gobierno federal, pero sí muchas aerolíneas y algunos estados. Llévalo'
          : 'Not required federally, but many airlines and some states ask for it. Take it anyway' },
      { icon: 'vet', info: true, label: es ? 'Buen estado aparente' : 'Healthy appearance', status: 'pending',
        detail: es ? 'Se comprueba a la llegada' : 'Checked on arrival' },
    ];

    /* ── Canadá ──────────────────────────────────────────────────────────
       Para una mascota personal no hace falta permiso de importación: eso
       aplica a las importaciones comerciales de perros menores de 8 meses. */
    case 'CA': return [
      { ...rabies,
        label: es ? 'Certificado de vacunación antirrábica' : 'Rabies vaccination certificate',
        detail: rv.status === 'ok' && rv.expiry
          ? `${es ? 'Válida hasta' : 'Valid until'} ${fmt(rv.expiry)} — ${es
              ? 'el certificado debe identificar al animal y detallar la vacuna'
              : 'the certificate must identify the animal and detail the vaccine'}`
          : (es
              ? 'Es el documento principal. Debe identificar al animal y detallar la vacuna'
              : 'This is the main document. It must identify the animal and detail the vaccine') },
      chip,
      { icon: 'ok', info: true, label: es ? 'Sin permiso de importación' : 'No import permit needed', status: 'ok',
        detail: es
          ? 'Las mascotas personales no lo necesitan: el permiso es para importación comercial de perros menores de 8 meses'
          : 'Personal pets do not need one: the permit applies to commercial imports of dogs under 8 months' },
      { icon: 'ok', info: true, label: es ? 'Sin cuarentena' : 'No quarantine', status: 'ok',
        detail: es
          ? 'Canadá no impone cuarentena a las mascotas personales, vengan de donde vengan'
          : 'Canada does not quarantine personal pets, whatever their origin' },
      { icon: 'vet', info: true, label: es ? 'Inspección en frontera' : 'Inspection at the border', status: 'pending',
        detail: es ? 'Un agente comprueba la documentación y el animal a la llegada' : 'An officer checks the paperwork and the animal on arrival' },
    ];

    /* ── Australia ───────────────────────────────────────────────────────
       El trayecto más largo y más caro de los cinco. España y Reino Unido
       están en el Grupo 3, el de requisitos completos. */
    case 'AU': return [
      { icon: 'doc', id: 'permiso-daff', manual: true, label: es ? 'Permiso de importación · DAFF' : 'Import permit · DAFF', status: 'pending',
        detail: es
          ? 'Solicítalo antes que nada: sin él no arranca ningún otro trámite'
          : 'Apply for this first: nothing else can start without it' },
      { icon: 'doc', id: 'residencia-180', manual: true, label: es ? 'Residencia previa de 180 días' : '180 days of prior residence', status: 'pending',
        detail: es
          ? 'Residencia continuada en un país aprobado durante los 180 días previos a la salida. No es cuarentena: puede vivir contigo'
          : 'Continuous residence in an approved country for the 180 days before departure. Not quarantine: it can live with you' },
      chip,
      rabies,
      { icon: 'syringe', id: 'rnatt', manual: true, label: 'RNATT', status: 'pending',
        detail: es
          ? 'Análisis de anticuerpos antirrábicos, al menos 3–4 semanas después de la vacunación. Válido 365 días desde la extracción'
          : 'Rabies antibody titre test, at least 3–4 weeks after vaccination. Valid for 365 days from sampling' },
      { icon: 'vet', id: 'identity-check', manual: true, label: es ? 'Comprobación de identidad' : 'Identity check', status: 'pending',
        detail: es
          ? 'Opcional pero muy recomendable: reduce la cuarentena de 30 a 10 días. Debe hacerla un veterinario oficial ANTES del RNATT'
          : 'Optional but strongly advised: cuts quarantine from 30 to 10 days. An official vet must do it BEFORE the RNATT' },
      ...(esPerro ? [
        { icon: 'syringe', id: 'brucella', manual: true, label: 'Brucella canis', status: 'pending',
          detail: es
            ? 'Resultado negativo, con muestra tomada en los 45 días previos a la salida'
            : 'Negative result, sample taken within 45 days before departure' },
        { icon: 'syringe', id: 'leishmania', manual: true, label: 'Leishmania infantum', status: 'pending',
          detail: es
            ? 'Dentro de los 45 días previos. Especialmente relevante saliendo de España, donde es endémica'
            : 'Within 45 days before departure. Particularly relevant from Spain, where it is endemic' },
      ] : []),
      { icon: 'vet', id: 'parasitos-internos', manual: true, label: es ? 'Parásitos internos' : 'Internal parasites', status: 'pending',
        detail: es
          ? 'Dos tratamientos en los 45 días previos, separados al menos 14 días. El segundo, dentro de los 5 días anteriores a la salida'
          : 'Two treatments within 45 days, at least 14 days apart. The second within 5 days before departure' },
      { icon: 'vet', id: 'parasitos-externos', manual: true, label: es ? 'Parásitos externos' : 'External parasites', status: 'pending',
        detail: es
          ? 'Desde 30 días antes, con producto que mate por contacto. Los orales tipo NexGard o Bravecto NO se aceptan'
          : 'From 30 days before, with a contact-kill product. Oral products such as NexGard or Bravecto are NOT accepted' },
      { ...healthCert, label: es ? 'Certificado sanitario oficial' : 'Government health certificate' },
      { icon: 'vet', id: 'cuarentena', manual: true, label: es ? 'Cuarentena a la llegada' : 'Post-arrival quarantine', status: 'alert',
        detail: es
          ? 'Mínimo 30 días en instalación oficial, o 10 si se hizo la comprobación de identidad'
          : 'Minimum 30 days at the government facility, or 10 if the identity check was done' },
    ];

    default: return [chip, rabies];
  }
};

/**
 * Marca como cumplidos los trámites externos que el usuario ya ha hecho.
 * @param {Array}  reqs    lista construida por el motor
 * @param {object} marcas  { [id]: true } para este país
 */
const aplicarMarcas = (reqs, marcas = {}) =>
  reqs.map(r => (r.manual && marcas[r.id] ? { ...r, status: 'ok', hecho: true } : r));

const calcReadiness = (reqs) => {
  /* Las filas marcadas como informativas describen el régimen del destino
     —que no hay cuarentena, que el antiparasitario no aplica— y no son algo
     que el usuario tenga que conseguir. Quedan fuera del porcentaje. */
  const exigibles = reqs.filter(r => !r.info);
  if (!exigibles.length) return 0;
  const hechos = exigibles.filter(r => r.status === 'ok').length;
  return Math.round((hechos / exigibles.length) * 100);
};

/* ── Country metadata ── */
const COUNTRY_META = {
  ES: { name: 'España',         nameEn: 'Spain',          corto: 'España',      cortoEn: 'Spain',   code: 'ESP', note: null },
  UK: { name: 'Reino Unido',    nameEn: 'United Kingdom', corto: 'Reino Unido', cortoEn: 'UK',      code: 'GBR', note: null },
  US: { name: 'Estados Unidos', nameEn: 'United States',  corto: 'EE. UU.',     cortoEn: 'USA',     code: 'USA',
        note: {
          es: 'Desde agosto de 2024 ningún perro menor de 6 meses puede entrar, sin excepciones.',
          en: 'Since August 2024 no dog under 6 months may enter, without exception.',
        } },
  CA: { name: 'Canadá',         nameEn: 'Canada',         corto: 'Canadá',      cortoEn: 'Canada',  code: 'CAN', note: null },
  AU: { name: 'Australia',      nameEn: 'Australia',      corto: 'Australia',   cortoEn: 'Australia', code: 'AUS',
        note: {
          es: 'Exige permiso previo, análisis de anticuerpos (RNATT), 180 días de residencia en país aprobado y cuarentena a la llegada. Cuenta en meses, no en semanas.',
          en: 'Requires a prior permit, a rabies antibody test (RNATT), 180 days of residence in an approved country and quarantine on arrival. Plan in months, not weeks.',
        } },
};
const COUNTRY_IDS = ['ES', 'UK', 'US', 'CA', 'AU'];

/* ── PDF export ── */
const exportPDF = (country, reqs, pet, readiness, locale, countryId = 'ES') => {
  const { organismo, url: fuenteUrl } = fuenteOficial(pet?.species, countryId);
  const fechaRevision = new Date(FECHA_REVISION).toLocaleDateString(
    locale === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const es = locale === 'es';
  const name = pet?.name || 'AURA Member';
  const date = new Date().toLocaleDateString(es ? 'es-ES' : 'en-GB');

  const rows = reqs.map(r => `
    <tr style="border-bottom:1px solid #e0e0e0;">
      <td style="padding:10px 8px;font-weight:600;">${r.label}</td>
      <td style="padding:10px 8px;color:#555;font-size:0.85em;">${r.detail}</td>
      <td style="padding:10px 8px;font-weight:700;white-space:nowrap;color:${
        r.status==='ok'?'#2E9C7A':r.status==='pending'?'#B8862C':'#c0392b'
      };">${r.status==='ok'?'✓ '+(es?'CUMPLIDO':'DONE'):r.status==='pending'?'⏳ '+(es?'PENDIENTE':'PENDING'):'⚠ '+(es?'ATENCIÓN':'ATTENTION')}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="${locale}"><head>
    <meta charset="UTF-8">
    <title>AURA Pets — ${es?'Pasaporte Sanitario':'Health Passport'} ${country.name}</title>
    <style>
      body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;color:#111;}
      h1{color:#D9A441;font-size:1.8rem;margin:0 0 4px;}
      .sub{letter-spacing:3px;font-size:0.7rem;text-transform:uppercase;color:#888;margin:0 0 20px;}
      .meta{display:flex;gap:40px;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #D9A441;}
      .meta-item label{font-size:0.65rem;letter-spacing:2px;text-transform:uppercase;color:#888;display:block;}
      .meta-item span{font-weight:700;font-size:1.05rem;}
      .bar-bg{background:#eee;height:6px;border-radius:3px;margin:6px 0;}
      .bar-fill{height:6px;border-radius:3px;background:${readiness>85?'#2E9C7A':readiness>60?'#B8862C':'#c0392b'};}
      table{width:100%;border-collapse:collapse;margin-top:20px;}
      th{background:#f5f0e0;padding:10px 8px;text-align:left;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;}
      .note{background:#FEFBF4;border-left:4px solid #D9A441;padding:12px 16px;margin:20px 0;font-size:0.85rem;}
      .footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:0.75rem;color:#888;text-align:center;}
      @media print{body{padding:20px;}button{display:none;}}
    </style>
  </head><body>
    <h1>AURA Pets</h1>
    <p class="sub">${es?'Pasaporte Sanitario Global':'Global Sanitary Passport'} — ${es ? country.name : country.nameEn} (${country.code})</p>
    <div class="meta">
      <div class="meta-item"><label>${es?'Miembro':'Member'}</label><span>${name}</span></div>
      <div class="meta-item"><label>${es?'Destino':'Destination'}</label><span>${country.name}</span></div>
      <div class="meta-item"><label>${es?'Disponibilidad':'Readiness'}</label>
        <span>${readiness}%</span>
        <div class="bar-bg"><div class="bar-fill" style="width:${readiness}%;"></div></div>
      </div>
      <div class="meta-item"><label>${es?'Generado':'Generated'}</label><span>${date}</span></div>
    </div>
    ${country.note ? `<div class="note">⚠ ${typeof country.note === 'string' ? country.note : country.note[es ? 'es' : 'en']}</div>` : ''}
    <table>
      <thead><tr>
        <th>${es?'Requisito':'Requirement'}</th>
        <th>${es?'Detalle':'Detail'}</th>
        <th>${es?'Estado':'Status'}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">
      <p style="margin:0 0 6px;">
        ${es
          ? 'AURA Pets prepara y custodia documentación. No emite documentos oficiales ni sustituye a la autoridad competente.'
          : 'AURA Pets prepares and safeguards documentation. It does not issue official documents or replace the competent authority.'}
      </p>
      <p style="margin:0 0 6px;">
        ${es ? 'Fuente oficial' : 'Official source'}: ${organismo} — ${fuenteUrl}
      </p>
      <p style="margin:0;">
        ${es ? 'Requisitos contrastados el' : 'Requirements last checked on'} ${fechaRevision}
      </p>
    </div>
  </body></html>`;

  /* Blob URL approach — works on iOS Safari, avoids document.write() */
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => {
      try { win.print(); } catch (_) { /* iOS: user can print via share sheet */ }
    });
  } else {
    /* Popup blocked — fallback: download the HTML file */
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `AURA_Passport_${country.code}.html`,
    });
    document.body.appendChild(a);
    try { a.click(); } finally { document.body.removeChild(a); }
  }
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

/* ── Country modal ── */
const CountryModal = ({ countryId, pet, locale, onClose, origen = 'ES', marcas = {}, onMarcar }) => {
  const meta = COUNTRY_META[countryId];
  const reqs = aplicarMarcas(buildRequirements(pet, countryId, locale, origen), marcas);
  const readiness = calcReadiness(reqs);
  const es = locale === 'es';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position:'fixed', inset:0, background:'rgba(42, 45, 124, 0.42)',
          backdropFilter:'blur(12px)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem',
        }}
      >
        <motion.div
          initial={{ opacity:0, y:30, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:20, scale:0.97 }}
          transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
          className="aura-card"
          onClick={e => e.stopPropagation()}
          style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}
        >
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.8rem' }}>
                <span style={{
                  fontSize:'0.78rem', fontWeight:800, letterSpacing:'1.5px',
                  padding:'0.5rem 0.7rem', borderRadius:'var(--radius)',
                  background:'var(--violet)', color:'#FFFFFF', flexShrink:0,
                }}>
                  {meta.code}
                </span>
                <div>
                  <h2 style={{ fontSize:'1.8rem', margin:0 }}>{es ? meta.name : meta.nameEn}</h2>
                  <span style={{ fontSize:'0.65rem', letterSpacing:'3px', color:'var(--aura-text-muted)' }}>
                    {es?'PASAPORTE SANITARIO':'SANITARY PASSPORT'}
                  </span>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ flex:1, height:4, background:'#FFFFFF', borderRadius:2 }}>
                  <motion.div
                    initial={{ width:0 }} animate={{ width:`${readiness}%` }}
                    transition={{ duration:1, delay:0.3, ease:'easeOut' }}
                    style={{
                      height:'100%', borderRadius:2,
                      background: readiness>85?'var(--aura-neon-cyan)':readiness>60?'var(--aura-gold)':'var(--aura-neon-pink)',
                    }}
                  />
                </div>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--aura-gold)', whiteSpace:'nowrap' }}>
                  {readiness}% {es?'Listo':'Ready'}
                </span>
              </div>
            </div>
            <button onClick={onClose}
              style={{ background:'none', border:'1px solid var(--aura-border)', color:'var(--aura-text-muted)',
                cursor:'pointer', padding:'0.5rem', borderRadius:4, flexShrink:0, marginLeft:'1rem' }}>
              <X size={16} />
            </button>
          </div>

          {/* Warning note */}
          {meta.note && (
            <div style={{ background:'rgba(217, 164, 65, 0.06)', border:'1px solid rgba(217, 164, 65, 0.25)',
              borderRadius:4, padding:'1rem 1.2rem', marginBottom:'2rem' }}>
              <p style={{ margin:0, fontSize:'0.8rem', color:'var(--aura-gold)', lineHeight:1.6 }}>
                ⚠ {typeof meta.note === 'string' ? meta.note : meta.note[es ? 'es' : 'en']}
              </p>
            </div>
          )}

          {/* ── Nivel de riesgo del trayecto ─────────────────────────────────
              Un aviso que sale siempre e igual acaba siendo invisible. Este
              cambia de peso según lo que esté realmente en juego: un movimiento
              dentro del mismo régimen no merece la misma alarma que un destino
              con cuarentena y permiso previo. */}
          {(() => {
            const nivel = nivelRiesgo(pet?.species, countryId, origen);
            const V = {
              verde: { borde:'#2E9C7A', fondo:'rgba(46, 156, 122, 0.07)', texto:'#1F7A5D',
                       titulo: es ? 'Trámite acotado' : 'Contained procedure' },
              ambar: { borde:'var(--warn)', fondo:'rgba(240, 167, 60, 0.10)', texto:'#8F5C0C',
                       titulo: es ? 'Confirma antes de reservar' : 'Confirm before booking' },
              rojo:  { borde:'var(--danger)', fondo:'rgba(239, 95, 122, 0.08)', texto:'#B3324C',
                       titulo: es ? 'Trayecto de plazos largos' : 'Long lead times' },
            }[nivel];
            return (
              <div style={{
                borderLeft:`4px solid ${V.borde}`, background:V.fondo,
                borderRadius:'0 8px 8px 0', padding:'0.9rem 1.1rem', marginBottom:'1.5rem',
              }}>
                <p style={{ margin:'0 0 0.3rem', fontSize:'0.72rem', fontWeight:700,
                  letterSpacing:'1.5px', textTransform:'uppercase', color:V.texto }}>
                  {V.titulo}
                </p>
                <p style={{ margin:0, fontSize:'0.76rem', lineHeight:1.6, color:'var(--ink-body)' }}>
                  {TEXTO_RIESGO[nivel][es ? 'es' : 'en']}
                </p>
              </div>
            );
          })()}

          {/* Requirements */}
          <div style={{ display:'grid', gap:'1rem', marginBottom:'1.2rem' }}>
            {reqs.map((req, i) => {
              /* Un trámite externo se puede marcar a mano: la aplicación no
                 puede comprobar si ya pediste el permiso o te hicieron la
                 analítica, pero tú sí lo sabes. */
              const pulsable = !!(req.manual && onMarcar);
              const Fila = pulsable ? 'button' : 'div';
              return (
              <Fila
                key={req.id || i}
                type={pulsable ? 'button' : undefined}
                onClick={pulsable ? () => onMarcar(countryId, req.id, !req.hecho) : undefined}
                aria-pressed={pulsable ? !!req.hecho : undefined}
                style={{
                display:'flex', alignItems:'center', gap:'1.2rem',
                padding:'1.2rem 1.4rem',
                background:'#FFFFFF',
                border:'1px solid var(--aura-border)',
                borderLeft:`3px solid ${req.info ? 'var(--border-strong)' : STATUS_COLOR[req.status]}`,
                borderRadius:4,
                width:'100%', textAlign:'left', font:'inherit',
                cursor: pulsable ? 'pointer' : 'default',
              }}>
                {pulsable ? (
                  <span aria-hidden="true" style={{
                    flexShrink:0, width:20, height:20, borderRadius:6,
                    border: req.hecho ? '2px solid var(--ok, #2E9C7A)' : '2px solid var(--border-strong)',
                    background: req.hecho ? 'var(--ok, #2E9C7A)' : 'transparent',
                    color:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.7rem', fontWeight:900, lineHeight:1,
                  }}>
                    {req.hecho ? '✓' : ''}
                  </span>
                ) : (
                  <ReqIcon type={req.icon} color={req.info ? 'var(--ink-muted)' : STATUS_COLOR[req.status]} />
                )}
                <span style={{ flex:1, display:'block' }}>
                  <span style={{ display:'block', marginBottom:3, fontSize:'0.85rem', fontWeight:600 }}>{req.label}</span>
                  <span style={{ display:'block', fontSize:'0.72rem', color:'var(--aura-text-muted)' }}>{req.detail}</span>
                </span>
                <span style={{ fontSize:'0.6rem', letterSpacing:'1.5px',
                  color: req.info ? 'var(--ink-muted)' : STATUS_COLOR[req.status],
                  fontWeight:700, whiteSpace:'nowrap' }}>
                  {req.info
                    ? 'INFO'
                    : req.manual && !req.hecho
                      ? (es ? 'MARCAR' : 'MARK')
                      : statusLabel(req.status, locale)}
                </span>
              </Fila>
              );
            })}
          </div>

          <p style={{ margin:'-0.6rem 0 1.2rem', fontSize:'0.7rem', color:'var(--ink-muted)', lineHeight:1.55 }}>
            {es
              ? 'Los trámites que se gestionan fuera de la aplicación puedes marcarlos tú al completarlos. AURA no puede comprobarlos por su cuenta.'
              : 'You can tick off the steps handled outside the app once you complete them. AURA cannot verify those on its own.'}
          </p>

          {/* ── Fuente oficial ───────────────────────────────────────────────
              La pieza que convierte a AURA en guía en vez de en autoridad. El
              usuario puede comprobar cada requisito por su cuenta, y la fecha
              dice hasta qué punto el dato está fresco. */}
          {(() => {
            const { organismo, url } = fuenteOficial(pet?.species, countryId);
            return (
              <div style={{
                background:'var(--bg-soft)', border:'1px solid var(--border)',
                borderRadius:'var(--radius)', padding:'0.9rem 1.1rem', marginBottom:'1.5rem',
              }}>
                <p style={{ margin:'0 0 0.45rem', fontSize:'0.72rem', lineHeight:1.6, color:'var(--ink-body)' }}>
                  {es
                    ? 'AURA prepara y custodia tu documentación, pero no emite documentos oficiales ni sustituye a la autoridad competente. Comprueba los requisitos en la fuente:'
                    : 'AURA prepares and safeguards your documentation, but does not issue official documents or replace the competent authority. Check the requirements at the source:'}
                </p>
                <a href={url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:'0.76rem', fontWeight:700, color:'var(--violet)', textDecoration:'underline' }}>
                  {organismo} ↗
                </a>
                <p style={{ margin:'0.5rem 0 0', fontSize:'0.66rem', color:'var(--ink-muted)' }}>
                  {es ? 'Listas contrastadas el ' : 'Lists last checked on '}
                  {new Date(FECHA_REVISION).toLocaleDateString(es ? 'es-ES' : 'en-GB',
                    { day:'numeric', month:'long', year:'numeric' })}
                </p>
              </div>
            );
          })()}

          {/* Pending notice */}
          {!pet?.microchip && (
            <div style={{ background:'rgba(217, 164, 65, 0.05)', border:'1px dashed rgba(217, 164, 65, 0.3)',
              borderRadius:4, padding:'0.9rem 1.2rem', marginBottom:'1.5rem' }}>
              <p style={{ margin:0, fontSize:'0.75rem', color:'var(--aura-gold)' }}>
                💡 {es
                  ? 'Añade el número de microchip en el registro para mejorar tu disponibilidad de viaje.'
                  : 'Add the microchip number in registration to improve your travel readiness.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:'1rem' }}>
            <button className="btn-aura" style={{ flex:1 }} onClick={onClose}>
              {es?'Cerrar':'Close'}
            </button>
            <button className="btn-aura"
              style={{ flex:2, borderColor:'var(--aura-neon-cyan)', color:'var(--aura-neon-cyan)' }}
              onClick={() => exportPDF(meta, reqs, pet, readiness, locale, countryId)}>
              {es?'DESCARGAR REQUISITOS PDF':'DOWNLOAD PDF REQUIREMENTS'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const FIELD_LABEL = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase',
  color: 'var(--aura-gold)', fontWeight: 700,
};

/* ════════ Main Component ════════ */
const GlobalPassport = ({ pet, onUpdatePet }) => {
  const { locale } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState(null);
  /* País desde el que viaja el animal. Para los équidos cambia los requisitos,
     así que se recuerda entre visitas. */
  const [origen, setOrigen] = useState(() => {
    try { return localStorage.getItem('aura_origen') || 'ES'; } catch { return 'ES'; }
  });
  const cambiarOrigen = (id) => {
    setOrigen(id);
    try { localStorage.setItem('aura_origen', id); } catch { /* sin persistencia */ }
  };
  const [saved, setSaved]                     = useState(false);
  const certInputRef     = useRef(null);
  const passportInputRef = useRef(null);
  const es = locale === 'es';

  /* Draft state — editable fields in left panel */
  const [draft, setDraft] = useState(() => ({
    microchip:        pet?.microchip                            || '',
    rabiesDate:       pet?.health?.rabiesVaccine?.date          || '',
    rabiesBatch:      pet?.health?.rabiesVaccine?.batch         || '',
    certFileName:     pet?.health?.healthCert?.fileName         || '',
    passportFileName: pet?.health?.physicalPassport?.fileName   || '',
  }));

  /* Re-init when pet identity changes (different animal selected) */
  useEffect(() => {
    setDraft({
      microchip:        pet?.microchip                            || '',
      rabiesDate:       pet?.health?.rabiesVaccine?.date          || '',
      rabiesBatch:      pet?.health?.rabiesVaccine?.batch         || '',
      certFileName:     pet?.health?.healthCert?.fileName         || '',
      passportFileName: pet?.health?.physicalPassport?.fileName   || '',
    });
  }, [pet?.id]);

  const setD = (field) => (e) => setDraft(prev => ({ ...prev, [field]: e.target.value }));

  /* Microchip validation: ISO 11784/11785 = exactly 15 digits */
  const chipValid = draft.microchip.length === 15;

  /* Compute a draft-based pet snapshot for real-time readiness */
  const draftPet = useMemo(() => {
    if (!pet) return pet;
    return {
      ...pet,
      microchip: draft.microchip || pet.microchip,
      health: {
        ...pet.health,
        rabiesVaccine: {
          ...pet.health?.rabiesVaccine,
          date:   draft.rabiesDate,
          status: draft.rabiesDate ? 'ok' : (pet.health?.rabiesVaccine?.status || 'pending'),
        },
        healthCert: {
          ...pet.health?.healthCert,
          status:   draft.certFileName ? 'ok' : (pet.health?.healthCert?.status || 'pending'),
          fileName: draft.certFileName,
        },
        physicalPassport: {
          ...pet.health?.physicalPassport,
          status:   draft.passportFileName ? 'ok' : (pet.health?.physicalPassport?.status || 'pending'),
          fileName: draft.passportFileName || pet.health?.physicalPassport?.fileName || '',
        },
      },
    };
  }, [pet, draft]);

  /* Memoize all country requirements — left panel uses draftPet for live feedback */
  const draftReqs = useMemo(
    () => aplicarMarcas(buildRequirements(draftPet, 'ES', locale, origen), pet?.travelChecks?.ES || {}),
    [draftPet, locale, origen, pet],
  );
  const draftReadiness = calcReadiness(draftReqs);

  /* Country cards (right panel) still reflect saved pet data */
  const allReqs = useMemo(
    () => Object.fromEntries(COUNTRY_IDS.map(id => [
      id,
      aplicarMarcas(buildRequirements(pet, id, locale, origen), pet?.travelChecks?.[id] || {}),
    ])),
    [pet, locale, origen],
  );

  /* ── Trámites marcados a mano ─────────────────────────────────────────────
     Se guardan por país dentro de la ficha del animal, así que viajan con el
     resto del expediente y quedan cifrados igual que todo lo demás. */
  const marcarTramite = (pais, id, hecho) => {
    if (!onUpdatePet || !id) return;
    const previo = pet?.travelChecks || {};
    const delPais = { ...(previo[pais] || {}) };
    if (hecho) delPais[id] = true; else delete delPais[id];
    onUpdatePet({ ...pet, travelChecks: { ...previo, [pais]: delPais } });
  };

  /* Lo de la aerolínea no depende del país de destino sino de la compañía, así
     que se guarda bajo su propia clave en vez de por país. */
  const marcasAerolinea = pet?.travelChecks?.aerolinea || {};
  const marcarAerolinea = (id, hecho) => marcarTramite('aerolinea', id, hecho);

  /* ── Save handler ── */
  const handleSave = () => {
    if (!onUpdatePet) return;
    const rabiesExpiry = draft.rabiesDate
      ? new Date(new Date(draft.rabiesDate).setFullYear(new Date(draft.rabiesDate).getFullYear() + 1))
          .toISOString().split('T')[0]
      : (pet?.health?.rabiesVaccine?.expiry || '');

    onUpdatePet({
      ...pet,
      microchip: draft.microchip || pet?.microchip,
      health: {
        ...pet?.health,
        rabiesVaccine: {
          date:   draft.rabiesDate,
          batch:  draft.rabiesBatch,
          expiry: rabiesExpiry,
          status: draft.rabiesDate ? 'ok' : 'pending',
        },
        healthCert: {
          ...pet?.health?.healthCert,
          status:   draft.certFileName ? 'ok' : (pet?.health?.healthCert?.status || 'pending'),
          fileName: draft.certFileName,
          notes:    pet?.health?.healthCert?.notes || '',
        },
        physicalPassport: {
          fileName: draft.passportFileName,
          status:   draft.passportFileName ? 'ok' : 'pending',
        },
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportAll = () => {
    const reqs = allReqs['ES'];
    exportPDF(COUNTRY_META['ES'], reqs, pet, calcReadiness(reqs), locale, 'ES');
  };

  return (
    <>
      <div className="fade-in">
        {/* ── Banda ilustrada ────────────────────────────────────────────────
            Dos piezas: la escena del perro con el pasaporte y el móvil con la
            app. En pantallas estrechas se apilan; en anchas van una al lado de
            la otra. Ambas traen su propio fondo pastel, así que se funden con
            el crema de la tarjeta sin costuras visibles. */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.9rem',
          margin: '1.5rem 0 0.5rem',
        }}>
          {[
            { src: perroPasaporte, alt: es
                ? 'Un perro golden retriever junto a un pasaporte para mascotas'
                : 'A golden retriever beside a pet passport' },
            { src: movilPasaporte, alt: es
                ? 'Un gato apoyando las patas sobre un móvil que muestra el pasaporte en AURA Pets'
                : 'A cat resting its paws on a phone showing the passport in AURA Pets' },
            { src: huronPasaporte, alt: es
                ? 'Un hurón con una maleta y un pasaporte para mascotas'
                : 'A ferret with a suitcase and a pet passport' },
          ].map((im, i) => (
            <div key={i} style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={im.src}
                alt={im.alt}
                loading="lazy"
                style={{
                  width: '100%', height: 'auto',
                  maxHeight: 'clamp(180px, 26vw, 280px)',
                  objectFit: 'contain', display: 'block',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <header style={{ padding:'2rem 0 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <span style={{ fontSize:'0.7rem', letterSpacing:'5px', color:'var(--aura-gold)', fontWeight:700, textTransform:'uppercase', display:'block', marginBottom:'0.6rem' }}>
              {es?'Logística Transfronteriza':'Cross-Border Logistics'}
            </span>
            <h1 style={{ fontSize:'clamp(1.5rem,5vw,3.5rem)', margin:0 }}>
              {es?'Pasaporte Sanitario Global':'Global Sanitary Passport'}
            </h1>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
            {/* Pet avatar */}
            <div style={{
              width:52, height:52, borderRadius:'50%', overflow:'hidden',
              border:'2px solid var(--aura-gold)',
              background:'rgba(217, 164, 65, 0.08)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 12px rgba(217, 164, 65, 0.3)',
            }}>
              {pet?.customImage
                ? <img src={pet.customImage} alt={pet?.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ fontSize:'1.5rem' }}>{pet?.avatar || '🐾'}</span>
              }
            </div>
            <p style={{ margin:0, fontWeight:700, fontSize:'0.95rem', textAlign:'center' }}>{pet?.name || 'AURA Member'}</p>
            <span className="locale-chip">{(pet?.speciesLabel || '').toUpperCase() || (es ? 'SIN ESPECIE' : 'NO SPECIES')}</span>
          </div>
        </header>

        <div className="passport-layout">

          {/* ── Left – editable passport form ── */}
          <div className="aura-card aura-card--bloom" style={{ padding:'2.5rem', position:'relative' }}>
            <PawScatter variante="a" />
            {/* Readiness header — updates live as form is filled */}
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2.5rem' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--aura-gold)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <PlaneTakeoff color="var(--aura-black)" size={28} />
              </div>
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:'1.6rem', margin:'0 0 6px' }}>
                  {es?'Disponibilidad':'Readiness'}: {draftReadiness}%
                </h2>
                <div style={{ height:4, background:'#FFFFFF', borderRadius:2 }}>
                  <motion.div
                    animate={{ width:`${draftReadiness}%` }}
                    transition={{ duration:0.5, ease:'easeOut' }}
                    style={{
                      height:'100%', borderRadius:2,
                      background: draftReadiness>85?'var(--aura-neon-cyan)':draftReadiness>60?'var(--aura-gold)':'var(--aura-neon-pink)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Microchip ISO ── */}
            <div style={{ padding:'1.2rem 0', borderBottom:'1px solid var(--aura-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
                <label style={FIELD_LABEL}><Shield size={13}/> Microchip ISO 11784/11785</label>
                <span style={{ fontSize:'0.6rem', letterSpacing:'1.5px', fontWeight:700,
                  color: chipValid ? 'var(--aura-neon-cyan)' : 'var(--aura-gold)' }}>
                  {chipValid ? '✓ VERIFICADO' : '⏳ PENDIENTE'}
                </span>
              </div>
              <input
                type="text"
                className="aura-input"
                maxLength={15}
                placeholder={es ? '000000000000000 (15 dígitos)' : '000000000000000 (15 digits)'}
                value={draft.microchip}
                onChange={e => setDraft(p => ({ ...p, microchip: e.target.value.replace(/\D/g,'') }))}
                style={{ width:'100%', fontSize:'0.9rem', padding:'0.7rem 1rem', letterSpacing:'3px', fontFamily:'var(--font-mono, monospace)' }}
              />
              {draft.microchip.length > 0 && !chipValid && (
                <p style={{ margin:'5px 0 0', fontSize:'0.68rem', color:'var(--aura-neon-pink)' }}>
                  {draft.microchip.length}/15 {es ? 'dígitos' : 'digits'}
                </p>
              )}
            </div>

            {/* ── Vacuna Antirrábica ── */}
            <div style={{ padding:'1.2rem 0', borderBottom:'1px solid var(--aura-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
                <label style={FIELD_LABEL}><Syringe size={13}/> {es ? 'Vacuna Antirrábica' : 'Rabies Vaccination'}</label>
                {draft.rabiesDate && (
                  <span style={{ fontSize:'0.6rem', letterSpacing:'1.5px', fontWeight:700, color:'var(--aura-neon-cyan)' }}>
                    ✓ {es ? 'REGISTRADA' : 'REGISTERED'}
                  </span>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem' }}>
                <div>
                  <p style={{ margin:'0 0 5px', fontSize:'0.62rem', letterSpacing:'1px', color:'var(--aura-text-muted)', textTransform:'uppercase' }}>
                    {es ? 'Fecha aplicación' : 'Date applied'}
                  </p>
                  <input
                    type="date"
                    className="aura-input"
                    value={draft.rabiesDate}
                    onChange={setD('rabiesDate')}
                    style={{ width:'100%', fontSize:'0.8rem', padding:'0.6rem 0.8rem' }}
                  />
                </div>
                <div>
                  <p style={{ margin:'0 0 5px', fontSize:'0.62rem', letterSpacing:'1px', color:'var(--aura-text-muted)', textTransform:'uppercase' }}>
                    {es ? 'Nº de lote' : 'Batch number'}
                  </p>
                  <input
                    type="text"
                    className="aura-input"
                    placeholder="LOT-XXXXXX"
                    value={draft.rabiesBatch}
                    onChange={setD('rabiesBatch')}
                    style={{ width:'100%', fontSize:'0.8rem', padding:'0.6rem 0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* ── Certificado Sanitario (upload) ── */}
            <div style={{ padding:'1.2rem 0', borderBottom:'1px solid var(--aura-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem' }}>
                <label style={FIELD_LABEL}><FileCheck size={13}/> {es ? 'Certificado Sanitario' : 'Health Certificate'}</label>
                {draft.certFileName && (
                  <span style={{ fontSize:'0.6rem', letterSpacing:'1.5px', fontWeight:700, color:'var(--aura-neon-cyan)' }}>
                    ✓ ADJUNTO
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={certInputRef}
                style={{ display:'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setDraft(p => ({ ...p, certFileName: file.name }));
                }}
              />
              <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
                <button
                  type="button"
                  className="btn-aura"
                  onClick={() => certInputRef.current?.click()}
                  style={{
                    flex:1, fontSize:'0.72rem', padding:'0.7rem 1rem',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
                    borderColor: draft.certFileName ? 'var(--aura-neon-cyan)' : 'var(--aura-border)',
                    color: draft.certFileName ? 'var(--aura-neon-cyan)' : 'var(--aura-text-muted)',
                    overflow:'hidden',
                  }}
                >
                  <Upload size={13}/>
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {draft.certFileName
                      ? draft.certFileName.length > 26 ? draft.certFileName.slice(0,24)+'…' : draft.certFileName
                      : (es ? 'SUBIR ARCHIVO (PDF)' : 'UPLOAD FILE (PDF)')}
                  </span>
                </button>
                {draft.certFileName && (
                  <button
                    type="button"
                    style={{ background:'none', border:'none', color:'var(--aura-text-muted)', cursor:'pointer', padding:'4px', flexShrink:0 }}
                    onClick={() => setDraft(p => ({ ...p, certFileName: '' }))}
                  >
                    <X size={14}/>
                  </button>
                )}
              </div>
            </div>

            {/* ── Pasaporte Físico (PDF/JPG) ── */}
            <div style={{ padding:'1.2rem 0', borderBottom:'1px solid var(--aura-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem' }}>
                <label style={FIELD_LABEL}><FileText size={13}/> {es ? 'Pasaporte Físico' : 'Physical Passport'}</label>
                {draft.passportFileName && (
                  <motion.span
                    initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                    style={{ fontSize:'0.6rem', letterSpacing:'1.5px', fontWeight:700, color:'var(--aura-neon-cyan)' }}>
                    ✓ {es ? 'DOCUMENTO CUSTODIADO' : 'DOCUMENT ON FILE'}
                  </motion.span>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={passportInputRef}
                style={{ display:'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setDraft(p => ({ ...p, passportFileName: file.name }));
                }}
              />
              <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
                <button
                  type="button"
                  className="btn-aura"
                  onClick={() => passportInputRef.current?.click()}
                  style={{
                    flex:1, fontSize:'0.72rem', padding:'0.75rem 1rem',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
                    borderColor: draft.passportFileName ? 'var(--aura-neon-cyan)' : 'var(--aura-gold)',
                    color:       draft.passportFileName ? 'var(--aura-neon-cyan)' : 'var(--aura-gold)',
                    background:  draft.passportFileName ? 'rgba(67, 191, 199, 0.05)' : 'rgba(217, 164, 65, 0.04)',
                    overflow:'hidden',
                  }}
                >
                  <Upload size={13}/>
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {draft.passportFileName
                      ? (draft.passportFileName.length > 26 ? draft.passportFileName.slice(0,24)+'…' : draft.passportFileName)
                      : (es ? 'VINCULAR PASAPORTE ORIGINAL' : 'LINK ORIGINAL PASSPORT')}
                  </span>
                </button>
                {draft.passportFileName && (
                  <button
                    type="button"
                    style={{ background:'none', border:'none', color:'var(--aura-text-muted)', cursor:'pointer', padding:'4px', flexShrink:0 }}
                    onClick={() => setDraft(p => ({ ...p, passportFileName: '' }))}
                  >
                    <X size={14}/>
                  </button>
                )}
              </div>
            </div>

            {/* ── Save button ── */}
            <button
              type="button"
              className="btn-aura"
              onClick={handleSave}
              style={{
                marginTop:'1.8rem', width:'100%', padding:'1.1rem',
                borderColor:'var(--aura-gold)', color:'var(--aura-gold)',
                background:'rgba(217, 164, 65, 0.06)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem',
              }}
            >
              <Save size={16}/> {es ? 'GUARDAR CAMBIOS' : 'SAVE CHANGES'}
            </button>

            <AnimatePresence>
              {saved && (
                <motion.p
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  style={{ margin:'0.7rem 0 0', fontSize:'0.72rem', color:'var(--aura-neon-cyan)', textAlign:'center', letterSpacing:'1px' }}
                >
                  ✓ {es ? 'Registros actualizados correctamente' : 'Records updated successfully'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right – destination cards ── */}
          <div style={{ display:'grid', gap:'1.2rem' }}>
            <h3 style={{ margin:'0 0 1.2rem', fontSize:'0.68rem', letterSpacing:'4px',
              textTransform:'uppercase', fontFamily:'var(--font-sans)', color:'var(--aura-text-muted)', fontWeight:600 }}>
              {es?'Destinos Prioritarios':'Priority Destinations'}
            </h3>

            {/* ── País de origen ──────────────────────────────────────────────
                Para los équidos, lo que se exige depende del corredor completo
                y no solo del destino: la piroplasmosis, la metritis contagiosa
                y la gripe equina se piden o no según de dónde salga el animal. */}
            <div style={{
              background:'var(--bg-soft)', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', padding:'1rem 1.2rem', marginBottom:'0.4rem',
            }}>
              <label style={{
                display:'block', fontSize:'0.66rem', letterSpacing:'2.5px',
                textTransform:'uppercase', color:'var(--gold-deep)', fontWeight:700, marginBottom:'0.6rem',
              }}>
                {es ? 'Viaja desde' : 'Travelling from'}
              </label>
              <div style={{ display:'flex', gap:'0.45rem', flexWrap:'wrap' }}>
                {COUNTRY_IDS.map(id => {
                  const m = COUNTRY_META[id];
                  const activo = origen === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => cambiarOrigen(id)}
                      aria-pressed={activo}
                      style={{
                        display:'flex', alignItems:'center', gap:'0.4rem',
                        padding:'0.42rem 0.8rem', borderRadius:'var(--radius-pill)',
                        border: activo ? '1px solid var(--violet)' : '1px solid var(--border)',
                        background: activo ? 'var(--violet)' : 'transparent',
                        color: activo ? '#FFFFFF' : 'var(--ink-body)',
                        fontSize:'0.72rem', fontWeight:600, cursor:'pointer',
                        fontFamily:'var(--font-sans)', transition:'all 0.2s',
                      }}
                    >
                      {es ? m.corto : m.cortoEn}
                    </button>
                  );
                })}
              </div>
              {pet?.species === 'horse' && (
                <p style={{ margin:'0.75rem 0 0', fontSize:'0.72rem', lineHeight:1.55, color:'var(--ink-muted)' }}>
                  {es
                    ? 'Los équidos no viajan bajo el régimen de animales de compañía. Los requisitos cambian según el país de salida, así que confirma siempre con la autoridad del destino.'
                    : 'Equines do not travel under the pet scheme. Requirements change with the country of departure, so always confirm with the destination authority.'}
                </p>
              )}
            </div>

            {/* ── Requisitos de la compañía aérea ─────────────────────────────
                La documentación oficial y la política de la aerolínea son dos
                permisos distintos y se pierden por separado: un animal puede
                llevar todos los papeles del destino en regla y que lo rechacen
                en el mostrador por el tamaño del transportín o por la raza. */}
            {(() => {
              const { avisos, comprobaciones } = assessAirline(pet, locale);
              const COLOR = {
                alerta: { borde: 'var(--danger)', fondo: 'rgba(239, 95, 122, 0.07)', texto: '#B3324C' },
                aviso:  { borde: 'var(--warn)',   fondo: 'rgba(240, 167, 60, 0.10)', texto: '#8F5C0C' },
                info:   { borde: 'var(--violet)', fondo: 'rgba(139, 92, 246, 0.07)', texto: 'var(--violet)' },
              };
              return (
                <div style={{
                  background:'var(--bg-soft)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius)', padding:'1.2rem', marginBottom:'0.4rem',
                }}>
                  <p style={{
                    fontSize:'0.66rem', letterSpacing:'2.5px', textTransform:'uppercase',
                    color:'var(--gold-deep)', fontWeight:700, margin:'0 0 0.5rem',
                  }}>
                    {es ? '✈ La aerolínea es otro trámite' : '✈ The airline is a separate matter'}
                  </p>
                  <p style={{ margin:'0 0 1rem', fontSize:'0.76rem', lineHeight:1.6, color:'var(--ink-body)' }}>
                    {es
                      ? 'Cumplir con el país de destino no obliga a la compañía a llevar a tu animal. Son dos permisos distintos y se pierden por separado.'
                      : 'Meeting the destination country’s rules does not oblige the airline to carry your animal. They are two separate permissions, lost separately.'}
                  </p>

                  {avisos.map((a, i) => {
                    const c = COLOR[a.nivel] || COLOR.info;
                    return (
                      <div key={i} style={{
                        borderLeft:'3px solid ' + c.borde, background:c.fondo,
                        borderRadius:'0 8px 8px 0', padding:'0.7rem 0.9rem', marginBottom:'0.6rem',
                      }}>
                        <p style={{ margin:'0 0 0.25rem', fontSize:'0.78rem', fontWeight:700, color:c.texto }}>
                          {a.titulo}
                        </p>
                        <p style={{ margin:0, fontSize:'0.75rem', lineHeight:1.6, color:'var(--ink-body)' }}>
                          {a.detalle}
                        </p>
                      </div>
                    );
                  })}

                  <p style={{
                    margin:'1rem 0 0.6rem', fontSize:'0.66rem', letterSpacing:'2px',
                    textTransform:'uppercase', color:'var(--ink-muted)', fontWeight:700,
                  }}>
                    {es ? 'Confirma con la compañía' : 'Confirm with the airline'}
                  </p>
                  <ul style={{ margin:0, padding:0, listStyle:'none', display:'grid', gap:'0.2rem' }}>
                    {comprobaciones.map((c) => {
                      const hecho = !!marcasAerolinea[c.id];
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => marcarAerolinea(c.id, !hecho)}
                            aria-pressed={hecho}
                            style={{
                              display:'flex', gap:'0.6rem', alignItems:'flex-start',
                              width:'100%', textAlign:'left', font:'inherit', cursor:'pointer',
                              background:'none', border:'none', padding:'0.3rem 0.2rem',
                              borderRadius:6,
                              fontSize:'0.75rem', lineHeight:1.55,
                              color: hecho ? 'var(--ink-muted)' : 'var(--ink-body)',
                              textDecoration: hecho ? 'line-through' : 'none',
                            }}
                          >
                            <span aria-hidden="true" style={{
                              flexShrink:0, width:16, height:16, marginTop:2, borderRadius:5,
                              border: hecho ? '2px solid var(--ok)' : '1.5px solid var(--border-strong)',
                              background: hecho ? 'var(--ok)' : 'transparent',
                              color:'#FFFFFF', display:'flex', alignItems:'center',
                              justifyContent:'center', fontSize:'0.6rem', fontWeight:900, lineHeight:1,
                            }}>
                              {hecho ? '✓' : ''}
                            </span>
                            {c.texto}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}

            {COUNTRY_IDS.map(id => {
              const meta = COUNTRY_META[id];
              const reqs = allReqs[id];
              const ready = calcReadiness(reqs);
              const compliant = ready >= 80;
              return (
                <motion.div
                  key={id}
                  whileHover={{ x:6, borderColor:'var(--aura-gold)' }}
                  whileTap={{ scale:0.98 }}
                  className="aura-card"
                  onClick={() => setSelectedCountry(id)}
                  style={{
                    padding:'1.4rem 1.6rem', cursor:'pointer',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    borderLeft: compliant ? '3px solid var(--aura-neon-cyan)' : '3px solid var(--aura-gold)',
                    minWidth: 0,
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
                    <span style={{
                      fontSize:'0.68rem', fontWeight:800, letterSpacing:'1px',
                      padding:'0.4rem 0.55rem', borderRadius:'var(--radius-sm, 8px)',
                      background:'var(--bg-soft)', border:'1px solid var(--border)',
                      color:'var(--ink)', flexShrink:0,
                    }}>
                      {meta.code}
                    </span>
                    <div>
                      <h4 style={{ margin:'0 0 2px', fontSize:'0.95rem', fontWeight:600 }}>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            window.open(`/politicas.html?lang=${locale}`, '_blank', 'noopener,noreferrer');
                          }}
                          style={{ color:'var(--aura-text)', cursor:'pointer', transition:'color 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#D9A441'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--aura-text)'; }}
                        >
                          {es ? meta.name : meta.nameEn}
                        </span>
                      </h4>
                      {meta.note && <p style={{ margin:0, fontSize:'0.68rem', color:'var(--aura-gold)' }}>⚠ {(typeof meta.note === 'string' ? meta.note : meta.note[es ? 'es' : 'en']).split('.')[0]}.</p>}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:700, color:compliant?'var(--aura-neon-cyan)':'var(--aura-gold)' }}>
                      {ready}%
                    </span>
                    {compliant
                      ? <CheckCircle2 size={18} color="var(--aura-neon-cyan)" />
                      : <AlertCircle  size={18} color="var(--aura-gold)" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Export bar */}
        <div className="aura-card" style={{ marginTop:'2rem', marginBottom:'4rem', padding:'1.6rem 2rem',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
            <FileText size={22} color="var(--aura-gold)" />
            <p style={{ margin:0, fontSize:'0.88rem' }}>
              {es?'Exportar datos oficiales IATA para cumplimiento normativo':'Export official IATA data for regulatory compliance'}
            </p>
          </div>
          <button className="btn-aura" onClick={handleExportAll}>
            {es?'DESCARGAR PDF':'DOWNLOAD PDF'}
          </button>
        </div>
      </div>

      {selectedCountry && (
        <CountryModal
          countryId={selectedCountry}
          origen={origen}
          pet={pet}
          locale={locale}
          marcas={pet?.travelChecks?.[selectedCountry] || {}}
          onMarcar={marcarTramite}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </>
  );
};

export default GlobalPassport;
