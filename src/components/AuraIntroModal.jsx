import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Player } from '@remotion/player';
import { PetVideo } from '../video/PetVideo';
import { X, ChevronRight, Shield } from 'lucide-react';

export const AuraIntroModal = ({ onContinue, onSkip }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    // Delay para que la animación de entrada termine antes de reproducir
    const timer = setTimeout(() => {
      playerRef.current?.play?.();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 backdrop-blur-lg"
    >
      {/* Fondo decorativo radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Botón cerrar (skip) */}
      <button
        onClick={onSkip}
        className="absolute top-5 right-5 p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all z-10"
        aria-label="Omitir introducción"
      >
        <X size={22} />
      </button>

      <div className="relative w-full max-w-5xl mx-auto px-4 md:px-8 flex flex-col items-center">

        {/* Cabecera */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-center mb-7"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-tr from-[#D4AF37] to-[#AA8439] rounded-lg flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Shield size={14} className="text-black" />
            </div>
            <span className="text-[10px] font-bold tracking-[4px] text-[#D4AF37] uppercase">
              Sistema AURA
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Registra tu primer{' '}
            <span className="text-[#D4AF37]">Pasaporte Digital</span>
          </h2>
          <p className="text-white/40 text-sm mt-2">
            Tu mascota merece protección de élite
          </p>
        </motion.div>

        {/* Contenedor de video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
          className="w-full relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10"
        >
          {/* línea dorada superior */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent z-10" />

          {/* Padding-top trick para 16:9 responsivo */}
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
            <Player
              ref={playerRef}
              component={PetVideo}
              durationInFrames={150}
              compositionWidth={1920}
              compositionHeight={1080}
              fps={30}
              controls={false}
              clickToPlay={false}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              inputProps={{ petName: 'AURA Pets' }}
              onEnded={onContinue}
            />
          </div>

          {/* línea dorada inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent z-10" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#D4AF37] text-black rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-[#D4AF37]/40 transition-all"
          >
            Registrar Mascota <ChevronRight size={17} />
          </button>
          <p className="text-white/25 text-[11px]">
            El formulario se abre automáticamente al finalizar el video
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
