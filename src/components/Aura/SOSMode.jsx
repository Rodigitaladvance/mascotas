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

/* ── Build QR text from pet data ── */
const buildQRText = (pet) => {
  const lines = [
    '🚨 EMERGENCIA VETERINARIA — AURA Pets',
    `Mascota: ${pet?.name || 'N/A'}`,
    `Especie: ${pet?.speciesLabel || pet?.species || 'N/A'}`,
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
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });
        setGeoStatus('ok');
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'Accept-Language': 'en' } },
          );
          const data = await res.json();
          setCountry(data?.address?.country_code?.toUpperCase() ?? null);
        } catch {
          /* fall back to language-based detection */
          const lang = navigator.language?.split('-')[1]?.toUpperCase();
          setCountry(lang || null);
        }
      },
      () => {
        setGeoStatus('error');
        const lang = navigator.language?.split('-')[1]?.toUpperCase();
        setCountry(lang || null);
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
      overflowY: 'auto', color: 'white',
    }}>
      {/* ── Pulsing SOS banner ── */}
      <motion.div
        animate={{ opacity: [1, 0.55, 1] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        style={{
          background: 'var(--aura-neon-pink)', color: 'white', padding: '0.9rem',
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
                ? <><Wifi size={13} color="var(--aura-neon-cyan)" />
                    <span style={{ fontSize: '0.65rem', color: 'var(--aura-neon-cyan)', letterSpacing: '1.5px' }}>
                      UBICACIÓN DETECTADA · {country || '…'}  —  Emergencias: {emergencyNumber}
                    </span></>
                : geoStatus === 'loading'
                  ? <span style={{ fontSize: '0.65rem', color: 'var(--aura-gold)', letterSpacing: '1.5px' }}>Detectando ubicación…</span>
                  : <><WifiOff size={13} color="var(--aura-gold)" />
                      <span style={{ fontSize: '0.65rem', color: 'var(--aura-gold)', letterSpacing: '1.5px' }}>
                        UBICACIÓN NO DISPONIBLE · Nº por defecto: {emergencyNumber}
                      </span></>}
            </div>
          </div>
          <button onClick={onExit} className="btn-aura" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
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
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,0,122,0.3)',
                    borderRadius: 4, padding: '1rem 1.4rem', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '0.62rem', letterSpacing: '2px', color: 'var(--aura-neon-pink)', fontWeight: 700, flexShrink: 0 }}>
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
                          border: sel ? '2px solid var(--aura-neon-pink)' : '2px solid rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.3rem', background: 'rgba(255,255,255,0.04)',
                          boxShadow: sel ? '0 0 14px rgba(255,0,122,0.6)' : 'none',
                        }}>
                          {p.customImage
                            ? <img src={p.customImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : p.avatar || '🐾'}
                        </div>
                        <span style={{ fontSize: '0.55rem', color: sel ? 'var(--aura-neon-pink)' : 'var(--aura-text-muted)',
                          letterSpacing: '1px', fontWeight: sel ? 700 : 400 }}>
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => setShowSwitcher(v => !v)} className="btn-aura"
              style={{ fontSize: '0.7rem', borderColor: 'rgba(255,0,122,0.5)', color: 'var(--aura-neon-pink)',
                display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚡ CAMBIAR MIEMBRO ({pets.length})
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* ── Pet card ── */}
          <div className="aura-card" style={{ background: 'rgba(255,0,80,0.07)', borderColor: 'var(--aura-neon-pink)', padding: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: 130, height: 130, borderRadius: '50%', margin: '0 auto 1.5rem',
              background: 'rgba(255,255,255,0.05)', border: '2px solid var(--aura-neon-pink)', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activePet?.customImage
                ? <img src={activePet.customImage} alt={activePet?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '3.5rem' }}>{activePet?.avatar || '🐾'}</span>}
            </div>
            <h2 style={{ fontSize: '2rem', margin: '0 0 4px', color: 'white' }}>{activePet?.name || 'AURA Member'}</h2>
            <p style={{ margin: '0 0 0.4rem', opacity: 0.7 }}>{activePet?.speciesLabel || activePet?.breed || '—'}</p>
            {activePet?.microchip && (
              <p style={{ margin: 0, fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--aura-gold)' }}>
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
                style={{ borderColor: 'var(--aura-neon-pink)', color: 'var(--aura-neon-pink)', whiteSpace: 'nowrap' }}
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
                className="btn-aura"
                style={{ borderColor: 'var(--aura-neon-pink)', color: 'var(--aura-neon-pink)' }}
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
                  className="btn-aura"
                  style={{ borderColor: 'var(--aura-gold)', color: 'var(--aura-gold)', fontSize: '0.7rem' }}
                  onClick={() => window.open(`tel:${c.phone}`)}
                >
                  LLAMAR
                </button>
              </div>
            ) : null)}

            {/* QR toggle */}
            <button
              className="btn-aura"
              style={{ borderColor: 'var(--aura-neon-cyan)', color: 'var(--aura-neon-cyan)', padding: '1rem' }}
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
                <p style={{ fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--aura-neon-cyan)', textTransform: 'uppercase', margin: '0 0 0.8rem' }}>
                  QR de Emergencia
                </p>
                <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--aura-text-muted)', lineHeight: 1.7 }}>
                  Cualquier veterinario puede escanear este código para acceder a los datos críticos
                  de {activePet?.name || 'la mascota'} sin necesidad de la app.
                </p>
                <pre style={{
                  margin: 0, fontSize: '0.68rem', color: 'var(--aura-text-muted)',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--aura-border)',
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--aura-neon-pink)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <AlertCircle size={24} /> ALERTAS MÉDICAS CRÍTICAS
            </h3>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, lineHeight: 1.7 }}>
              {activePet.emergencyConfig.medicalAlerts}
            </p>
          </div>
        )}

        <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.4, fontSize: '0.7rem', letterSpacing: '2px' }}>
          PROTOCOLO DE SEGURIDAD AURA Pets v3.0 · {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default SOSMode;
