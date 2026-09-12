import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, MapPin, AlertCircle, X, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

/* ── Emergency number by ISO country code ── */
const EMERGENCY = {
  ES: '112', PT: '112', DE: '112', FR: '15', IT: '118',
  GB: '999', IE: '999',
  US: '911', CA: '911', MX: '911',
  AU: '000', NZ: '111',
};
const getEmergencyNumber = (countryCode) =>
  EMERGENCY[countryCode?.toUpperCase()] ?? '112';

/* ── Resolución de país 100 % local ──────────────────────────────────────────
   Antes esto consultaba a Nominatim, lo que enviaba la ubicación exacta del
   usuario a un tercero justo en el momento de una emergencia. Ahora se resuelve
   con cajas delimitadoras en el propio dispositivo: no sale ni un byte.
   Solo cubrimos los países con número de emergencia propio; para el resto se
   cae al idioma del navegador y, en último término, al 112.               */
const COUNTRY_BOXES = [
  // [ISO, latMin, latMax, lonMin, lonMax]  — orden: de más específico a más amplio
  ['PT', 36.9, 42.2, -9.6, -6.2],
  ['ES', 35.9, 43.9, -9.4, 4.4],
  ['IE', 51.4, 55.5, -10.6, -5.9],
  ['GB', 49.8, 60.9, -8.2, 1.8],
  // IT y DE van antes que FR: la caja francesa es ancha y solapa el norte de
  // Italia y la frontera alemana. Sin este orden, Milán marcaría el 15 francés
  // en lugar del 118 italiano.
  ['IT', 35.4, 47.1, 6.6, 18.6],
  ['DE', 47.2, 55.1, 5.8, 15.1],
  ['FR', 41.3, 51.2, -5.2, 9.6],
  ['MX', 14.5, 32.8, -118.5, -86.7],
  ['US', 18.9, 22.3, -160.3, -154.8], // Hawái
  ['NZ', -47.4, -34.3, 166.4, 178.6],
  ['AU', -43.7, -10.6, 112.9, 153.7],
];

/* La frontera EE.UU. / Canadá no es un rectángulo: sube al paralelo 49 en el
   oeste y baja bruscamente en los Grandes Lagos. Con cajas simples, Toronto
   caía en Estados Unidos. Se resuelve por tramos de longitud.               */
const usOrCanada = (lat, lon) => {
  if (lon < -141.0) return lat >= 51.2 ? 'US' : null;   // Alaska
  if (lon > -67.0) return 'CA';                          // Provincias marítimas
  let borderLat;
  if (lon <= -84.0) borderLat = 49.0;                    // Oeste y praderas
  else if (lon <= -74.0) borderLat = 43.5;               // Grandes Lagos
  else borderLat = 45.0;                                 // Quebec / Nueva Inglaterra
  return lat >= borderLat ? 'CA' : 'US';
};

const countryFromCoords = (lat, lon) => {
  // Norteamérica continental primero, por el tramo de frontera irregular
  if (lat >= 24.4 && lat <= 83.2 && lon >= -168.2 && lon <= -52.6) {
    const mx = COUNTRY_BOXES.find(([iso]) => iso === 'MX');
    if (lat >= mx[1] && lat <= mx[2] && lon >= mx[3] && lon <= mx[4]) return 'MX';
    const na = usOrCanada(lat, lon);
    if (na) return na;
  }
  for (const [iso, latMin, latMax, lonMin, lonMax] of COUNTRY_BOXES) {
    if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax) return iso;
  }
  return null;
};

/* Último recurso: la región declarada en el idioma del navegador (es-ES → ES) */
const countryFromLocale = () => {
  const tag = navigator.language || '';
  const region = tag.split('-')[1];
  return region ? region.toUpperCase() : null;
};

/* ── Build QR text from pet data ── */
const buildQRText = (pet) => {
  const lines = [
    '🚨 EMERGENCIA VETERINARIA — AURA Pets',
    pet?.name ? `Mascota: ${pet.name}` : null,
    (pet?.speciesLabel || pet?.species) ? `Especie: ${pet.speciesLabel || pet.species}` : null,
    pet?.breed ? `Raza: ${pet.breed}` : null,
    pet?.microchip ? `Microchip: ${pet.microchip}` : null,
    pet?.age ? `Edad: ${pet.age}` : null,
    pet?.weight ? `Peso: ${pet.weight} kg` : null,
    '---',
    pet?.emergencyConfig?.medicalAlerts ? `Alertas Médicas: ${pet.emergencyConfig.medicalAlerts}` : null,
    ...(pet?.emergencyConfig?.contacts ?? []).map(c => `Contacto: ${c.name} ${c.phone}`),
  ];
  return lines.filter(Boolean).join('\n');
};

const SOSMode = ({ pet, pets = [], onActivePetChange, onExit }) => {
  /* local active pet — starts with prop, can be switched without leaving SOS */
  const [activeSosPetId, setActiveSosPetId] = useState(() => pet?.id ?? null);
  const [showSwitcher, setShowSwitcher]     = useState(false);
  const activePet = pets.find(p => p.id === activeSosPetId) || pet;

  const switchTo = (id) => {
    setActiveSosPetId(id);
    onActivePetChange?.(id);
    setShowSwitcher(false);
  };

  const [location, setLocation]     = useState(null);
  const [country, setCountry]       = useState(null);
  const [geoStatus, setGeoStatus]   = useState('idle'); // idle | loading | ok | error
  const [showQR, setShowQR]         = useState(false);

  /* ── Geolocation + reverse geocode ── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });
        setGeoStatus('ok');
        /* Resolución local: las coordenadas nunca abandonan el dispositivo */
        setCountry(countryFromCoords(lat, lon) ?? countryFromLocale());
      },
      () => {
        setGeoStatus('error');
        setCountry(countryFromLocale());
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const emergencyNumber = getEmergencyNumber(country);

  const handleCall = () => window.open(`tel:${emergencyNumber}`);

  const handleMap = () => {
    if (location) {
      window.open(
        `https://www.google.com/maps/search/Hospital+Veterinario+24h/@${location.lat},${location.lon},14z`,
        '_blank',
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/Hospital+Veterinario+24h`,
        '_blank',
      );
    }
  };

  const qrText = buildQRText(activePet);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--aura-black)', position: 'fixed', inset: 0, zIndex: 1000,
      overflowY: 'auto', color: 'var(--ink)',
    }}>
      {/* ── Pulsing SOS banner ── */}
      <motion.div
        animate={{ backgroundColor: ['#EC5C8D', '#F6839F', '#EC5C8D'] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        style={{
          background: 'var(--pink)', color: 'var(--ink-strong)', padding: '0.9rem',
          textAlign: 'center', letterSpacing: '6px', fontWeight: 900, fontSize: '1rem',
        }}
      >
        🚨 MODO SOS ACTIVO
      </motion.div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem 2rem 6rem' }}>
        {/* ── Header ── */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', margin: '0 0 4px', fontFamily: 'var(--font-serif)' }}>
              Emergencia Sanitaria
            </h1>
            {/* Geo status pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {geoStatus === 'ok'
                ? <><Wifi size={14} color="var(--cyan-ink)" />
                    <span style={{ fontSize: '0.74rem', color: 'var(--cyan-ink)', letterSpacing: '1px', fontWeight: 600 }}>
                      UBICACIÓN DETECTADA · {country || '…'}  —  Emergencias: {emergencyNumber}
                    </span></>
                : geoStatus === 'loading'
                  ? <span style={{ fontSize: '0.74rem', color: 'var(--gold-ink)', letterSpacing: '1px', fontWeight: 600 }}>Detectando ubicación…</span>
                  : <><WifiOff size={14} color="var(--gold-ink)" />
                      <span style={{ fontSize: '0.74rem', color: 'var(--gold-ink)', letterSpacing: '1px', fontWeight: 600 }}>
                        UBICACIÓN NO DISPONIBLE · Nº por defecto: {emergencyNumber}
                      </span></>}
            </div>
          </div>
          <button onClick={onExit} className="btn-aura btn-ghost">
            SALIR DEL MODO SOS
          </button>
        </header>

        {/* ── Member switcher bar (shown when >1 pet) ── */}
        {pets.length > 1 && (
          <div style={{ marginBottom: '1.8rem' }}>
            <AnimatePresence>
              {showSwitcher && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
                    background: '#FFFFFF', border: '1px solid rgba(236, 92, 141, 0.3)',
                    borderRadius: 4, padding: '1rem 1.4rem', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '0.7rem', letterSpacing: '1.5px', color: 'var(--pink-ink)', fontWeight: 700, flexShrink: 0 }}>
                    SELECCIONAR MIEMBRO:
                  </span>
                  {pets.map(p => {
                    const sel = p.id === activeSosPetId;
                    return (
                      <button key={p.id} onClick={() => switchTo(p.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: 0 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
                          border: sel ? '2px solid var(--aura-neon-pink)' : '2px solid #FAF7FE',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.3rem', background: '#FFFFFF',
                          boxShadow: sel ? '0 0 14px rgba(236, 92, 141, 0.6)' : 'none',
                        }}>
                          {p.customImage
                            ? <img src={p.customImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : p.avatar || '🐾'}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: sel ? 'var(--pink-ink)' : 'var(--ink-body)',
                          letterSpacing: '0.5px', fontWeight: sel ? 700 : 500 }}>
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => setShowSwitcher(v => !v)} className="btn-aura btn-ghost"
              style={{ fontSize: '0.7rem', '--btn-accent': 'var(--pink-ink)',
                display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚡ CAMBIAR MIEMBRO ({pets.length})
            </button>
          </div>
        )}

        <div className="sos-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* ── Pet card ── */}
          <div className="aura-card" style={{ background: 'rgba(255,0,80,0.07)', borderColor: 'var(--aura-neon-pink)', padding: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: 130, height: 130, borderRadius: '50%', margin: '0 auto 1.5rem',
              background: '#FFFFFF', border: '2px solid var(--aura-neon-pink)', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activePet?.customImage
                ? <img src={activePet.customImage} alt={activePet?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '3.5rem' }}>{activePet?.avatar || '🐾'}</span>}
            </div>
            <h2 style={{ fontSize: '2rem', margin: '0 0 4px', color: 'var(--ink)' }}>{activePet?.name || 'Sin nombre'}</h2>
            <p style={{ margin: '0 0 0.4rem', opacity: 0.7 }}>{activePet?.speciesLabel || activePet?.breed || '—'}</p>
            {activePet?.microchip && (
              <p style={{ margin: 0, fontSize: '0.78rem', letterSpacing: '1px', color: 'var(--gold-ink)', fontWeight: 600 }}>
                CHIP: {activePet.microchip}
              </p>
            )}
          </div>

          {/* ── Actions ── */}
          <div style={{ display: 'grid', gap: '1.2rem', alignContent: 'start' }}>
            {/* Call emergency */}
            <div className="aura-card" style={{ padding: '1.6rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <Phone size={28} color="var(--aura-neon-pink)" />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '1rem' }}>Emergencias Veterinarias</h3>
                <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>
                  Llamar al {emergencyNumber}
                  {country ? ` (${country})` : ''}
                </p>
              </div>
              <button
                className="btn-aura"
                style={{ whiteSpace: 'nowrap' }}
                onClick={handleCall}
              >
                LLAMAR {emergencyNumber}
              </button>
            </div>

            {/* Map */}
            <div className="aura-card" style={{ padding: '1.6rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <MapPin size={28} color="var(--aura-neon-pink)" />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '1rem' }}>Hospital Veterinario 24h</h3>
                <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>
                  {geoStatus === 'ok' ? 'Buscar cerca de tu posición' : 'Buscar en Google Maps'}
                </p>
              </div>
              <button
                className="btn-aura btn-ghost"
                style={{ '--btn-accent': 'var(--pink-ink)' }}
                onClick={handleMap}
              >
                MAPA
              </button>
            </div>

            {/* Emergency contacts */}
            {activePet?.emergencyConfig?.contacts?.map((c, i) => c.phone ? (
              <div key={i} className="aura-card" style={{ padding: '1.4rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <Phone size={22} color="var(--aura-gold)" />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 2px', fontSize: '0.9rem' }}>{c.name}</h3>
                  <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>{c.phone}</p>
                </div>
                <button
                  className="btn-aura btn-ghost"
                  style={{ '--btn-accent': 'var(--gold-ink)', fontSize: '0.7rem' }}
                  onClick={() => window.open(`tel:${c.phone}`)}
                >
                  LLAMAR
                </button>
              </div>
            ) : null)}

            {/* QR toggle */}
            <button
              className="btn-aura btn-ghost"
              style={{ '--btn-accent': 'var(--cyan-ink)', padding: '1rem' }}
              onClick={() => setShowQR(v => !v)}
            >
              {showQR ? 'OCULTAR CÓDIGO QR' : 'MOSTRAR CÓDIGO QR DE EMERGENCIA'}
            </button>
          </div>
        </div>

        {/* ── QR Code panel ── */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="aura-card"
              style={{ marginTop: '2rem', padding: '2.5rem', display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <div style={{ background: 'white', padding: '1rem', borderRadius: 4 }}>
                <QRCodeSVG
                  value={qrText}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#0A0A0F"
                  level="M"
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.72rem', letterSpacing: '2px', color: 'var(--cyan-ink)', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.8rem' }}>
                  QR de Emergencia
                </p>
                <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--ink-body)', lineHeight: 1.7 }}>
                  Cualquier veterinario puede escanear este código para acceder a los datos críticos
                  de {activePet?.name || 'la mascota'} sin necesidad de la app.
                </p>
                <pre style={{
                  margin: 0, fontSize: '0.72rem', color: 'var(--ink-body)',
                  background: '#FFFFFF', border: '1px solid var(--aura-border)',
                  borderRadius: 4, padding: '0.8rem', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                }}>
                  {qrText}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Medical alerts ── */}
        {activePet?.emergencyConfig?.medicalAlerts && (
          <div className="aura-card" style={{ marginTop: '2rem', background: 'white', color: 'black', padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--pink-ink)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <AlertCircle size={24} /> ALERTAS MÉDICAS CRÍTICAS
            </h3>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, lineHeight: 1.7 }}>
              {activePet.emergencyConfig.medicalAlerts}
            </p>
          </div>
        )}

        <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.68, fontSize: '0.7rem', letterSpacing: '2px' }}>
          AURA Pets · {new Date().toLocaleDateString('es-ES')}
        </div>
      </div>
    </div>
  );
};

export default SOSMode;
