import { createPortal } from 'react-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Portal Modal ─────────────────────────────────────────────────────────────
export const IntroVideoModal = ({ isOpen, onContinue }) => {
  const [btnHovered, setBtnHovered] = useState(false);

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
          background: '#04000a',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400&display=swap');
          @keyframes aura-nebula {
            0%   { opacity: 0.70; transform: scale(1)    translate(0, 0)         rotate(0deg); }
            50%  { opacity: 1.00; transform: scale(1.14) translate(4vw, 2.5vw)   rotate(6deg); }
            100% { opacity: 0.70; transform: scale(1)    translate(0, 0)         rotate(0deg); }
          }
          @keyframes aura-nebula2 {
            0%   { opacity: 0.55; transform: scale(1.08) translate(0, 0)         rotate(0deg);  }
            50%  { opacity: 0.90; transform: scale(1)    translate(-3vw, -2vw)   rotate(-7deg); }
            100% { opacity: 0.55; transform: scale(1.08) translate(0, 0)         rotate(0deg);  }
          }
          @media (prefers-reduced-motion: reduce) {
            .aura-nebula-layer { animation: none !important; }
          }
        `}</style>

        {/* ── Fondo AURA generado en el dispositivo — sin red, sin terceros ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          {/* Nebulosa púrpura, esquina superior izquierda */}
          <div
            className="aura-nebula-layer"
            style={{
              position: 'absolute',
              width: '80vw', height: '80vw',
              top: '-20vw', left: '-20vw',
              background: 'radial-gradient(circle, rgba(138,43,226,0.85) 0%, rgba(88,20,170,0.45) 40%, rgba(50,10,110,0.15) 65%, transparent 78%)',
              borderRadius: '50%',
              animation: 'aura-nebula 9s ease-in-out infinite',
            }}
          />
          {/* Aurora cyan, esquina inferior derecha */}
          <div
            className="aura-nebula-layer"
            style={{
              position: 'absolute',
              width: '75vw', height: '75vw',
              bottom: '-22vw', right: '-18vw',
              background: 'radial-gradient(circle, rgba(0,200,240,0.55) 0%, rgba(0,130,200,0.28) 42%, rgba(0,70,150,0.10) 66%, transparent 80%)',
              borderRadius: '50%',
              animation: 'aura-nebula2 12s ease-in-out infinite',
            }}
          />
          {/* Viñeta: oscurece los BORDES, no el centro. La versión anterior
              pintaba un óvalo opaco justo encima de las nebulosas y las
              ocultaba por completo. */}
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 85% 75% at 50% 45%, transparent 20%, rgba(4,0,10,0.45) 70%, rgba(4,0,10,0.8) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

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
