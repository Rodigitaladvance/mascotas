import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Queries Pexels — mascotas domésticas ────────────────────────────────────
const QUERIES = [
  'cute puppy dog home',
  'cute kitten cat playing',
  'parrot colorful bird pet',
  'bunny rabbit cute pet',
  'hamster guinea pig cute',
];

// ─── Hook: obtiene un video HD por cada query en paralelo ─────────────────────
const usePexelsVideos = () => {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    Promise.all(
      QUERIES.map((q) =>
        fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=1`,
          { headers: { Authorization: import.meta.env.VITE_PEXELS_KEY } }
        )
          .then((r) => r.json())
          .then((data) => {
            const files = data.videos?.[0]?.video_files;
            return (files?.find((f) => f.quality === 'hd') || files?.[0])?.link ?? null;
          })
          .catch(() => null)
      )
    ).then((results) => setUrls(results.filter(Boolean)));
  }, []);

  return urls;
};

// ─── Portal Modal ─────────────────────────────────────────────────────────────
export const IntroVideoModal = ({ isOpen, onContinue }) => {
  const [idx, setIdx] = useState(0);
  const [btnHovered, setBtnHovered] = useState(false);
  const videos = usePexelsVideos();

  // Rota entre los 5 videos cada 5 segundos
  useEffect(() => {
    if (videos.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % videos.length), 5000);
    return () => clearInterval(id);
  }, [videos.length]);

  if (!isOpen) return null;

  const modal = (
    <AnimatePresence>
      <motion.div
        key="aura-intro-portal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#000',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400&display=swap');
        `}</style>

        {/* ── Videos cycling — todos montados, solo el activo visible ── */}
        {videos.map((url, i) => (
          <video
            key={url}
            autoPlay
            muted
            loop
            playsInline
            src={url}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#000',
              zIndex: 0,
              opacity: i === idx ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}
          />
        ))}

        {/* ── Overlay oscuro suave ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* ── Tinte azul para unificar con la webapp ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,15,30,0.25)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* ── Gradient inferior para legibilidad del botón ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* ── Layout: texto arriba | espacio central libre | botón abajo ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingTop: '8vh',
            paddingBottom: '8vh',
            paddingLeft: '2rem',
            paddingRight: '2rem',
          }}
        >
          {/* ── Bloque de texto — parte superior con fade-in ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ textAlign: 'center' }}
          >
            {/* AURA */}
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '52px',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: -2,
                lineHeight: 1,
                textShadow: '0 2px 32px rgba(0,0,0,0.9)',
              }}
            >
              AURA
            </div>

            {/* PETS */}
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '38px',
                fontWeight: 400,
                color: '#B5D4F4',
                letterSpacing: 14,
                lineHeight: 1,
                marginTop: 6,
                textShadow: '0 2px 16px rgba(0,0,0,0.9)',
              }}
            >
              PETS
            </div>

            {/* Línea decorativa plateada */}
            <div
              style={{
                width: 60,
                height: 1,
                background: '#B5D4F4',
                margin: '20px auto 16px',
                opacity: 0.7,
              }}
            />

            {/* Subtítulo premium */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 300,
                color: '#B5D4F4',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                opacity: 0.85,
              }}
            >
              Premium Veterinary Health
            </div>
          </motion.div>

          {/* ── Espacio central vacío — el animal ocupa este área ── */}
          <div style={{ flex: 1 }} />

          {/* ── Botón ENTRAR — parte inferior ── */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onContinue}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                padding: '14px 60px',
                background: btnHovered ? '#B5D4F4' : 'transparent',
                border: '1px solid #B5D4F4',
                borderRadius: 50,
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: btnHovered ? '#0A0F1E' : '#B5D4F4',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.25s ease, color 0.25s ease',
                whiteSpace: 'nowrap',
              }}
            >
              Entrar
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
};
