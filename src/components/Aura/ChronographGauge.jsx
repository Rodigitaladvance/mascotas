import React from 'react';
import { motion } from 'framer-motion';

const ChronographGauge = ({ value, min = 0, max = 100, label, unit, color = 'var(--aura-gold)' }) => {
  // Normalize value to a rotation (e.g. -120 to +120 degrees)
  const rotation = ((value - min) / (max - min)) * 240 - 120;

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="gauge-container">
        <div className="gauge-labels">
          <span style={{ position: 'absolute', top: '20px', left: '20px' }}>{min}</span>
          <span style={{ position: 'absolute', top: '20px', right: '20px' }}>{max}</span>
          <span style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)' }}>{label}</span>
        </div>
        
        {/* Needle with smooth movement */}
        <motion.div 
          className="gauge-needle"
          initial={{ rotate: -120 }}
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 30, damping: 10 }}
          style={{ background: color, boxShadow: `0 0 15px ${color}` }}
        />
        
        <div className="gauge-cap"></div>
        
        {/* Glow effect */}
        <div style={{ 
          position: 'absolute', width: '80%', height: '80%', 
          background: `radial-gradient(circle, ${color}11 0%, transparent 70%)`,
          borderRadius: '50%'
        }}></div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 600, color }}>{value}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '4px', letterSpacing: '1px' }}>{unit}</span>
      </div>
    </div>
  );
};

export default ChronographGauge;
