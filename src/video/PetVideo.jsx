import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const PetVideo = ({ petName = "AURA Pet" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Animación de escala sutil para el fondo (Efecto Ken Burns)
  const scale = interpolate(frame, [0, 150], [1, 1.05]);
  
  // Opacidad del texto
  const opacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#0F1115', // Slate profundo (más moderno que el negro puro)
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Círculo decorativo de fondo para dar profundidad */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, rgba(0,0,0,0) 70%)',
        transform: `scale(${scale})`,
      }} />

      <div style={{ 
        textAlign: 'center',
        zIndex: 1,
        opacity 
      }}>
        <p style={{ 
          color: '#D4AF37', // Champagne Gold
          letterSpacing: '4px',
          fontSize: '24px',
          marginBottom: '10px',
          fontWeight: '300',
          textTransform: 'uppercase'
        }}>
          Health Passport
        </p>
        
        <h1 style={{ 
          color: '#F4F4F9', // Blanco roto/Hielo (Premium)
          fontSize: '90px',
          margin: 0,
          fontWeight: '600',
          letterSpacing: '-2px'
        }}>
          {petName}
        </h1>

        <div style={{
          marginTop: '40px',
          height: '1px',
          width: '100px',
          backgroundColor: '#D4AF37',
          display: 'inline-block'
        }} />
      </div>

      {/* Indicador de Status Neón Minimalista */}
      <div style={{ 
        position: 'absolute', 
        bottom: 60, 
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'rgba(244, 244, 249, 0.6)', 
        fontSize: '18px',
        letterSpacing: '1px'
      }}>
        <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: '#00F5FF', // Cyan para "Verificado"
          boxShadow: '0 0 10px #00F5FF'
        }} />
        SISTEMA AURA • CERTIFICADO BIO-MÉDRICO
      </div>
    </AbsoluteFill>
  );
};