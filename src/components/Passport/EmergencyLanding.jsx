import React from 'react';
import { ShieldAlert, Phone, MapPin, Heart, AlertCircle, ExternalLink, Lock } from 'lucide-react';

const EmergencyLanding = ({ pet }) => {
  if (!pet || !pet.emergencyConfig?.active) {
    return (
      <div className="fade-in" style={{ 
        textAlign: 'center', padding: '10rem 2rem', background: '#000', color: '#fff', minHeight: '100vh' 
      }}>
        <ShieldAlert size={80} color="#D4AF37" style={{ marginBottom: '2rem', opacity: 0.5 }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem' }}>ACCESO RESTRINGIDO</h2>
        <p style={{ letterSpacing: '2px', opacity: 0.6, fontSize: '0.8rem' }}>ESTE PERFIL DE EMERGENCIA NO SE ENCUENTRA ACTIVO EN LA RED AURA.</p>
      </div>
    );
  }

  const { medicalAlerts, contacts } = pet.emergencyConfig;

  return (
    <div className="emergency-landing fade-in" style={{ 
      background: '#000', color: '#fff', minHeight: '100vh', paddingBottom: '5rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <header style={{ 
        background: '#FF007A', color: 'white', padding: '2.5rem 1.5rem', 
        textAlign: 'center', boxShadow: '0 10px 40px rgba(255, 0, 122, 0.3)'
      }}>
        <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-1px' }}>PROTOCOLO SOS ACTIVO</h1>
        <p style={{ margin: '0.5rem 0 0', opacity: 0.9, letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 600 }}>MIEMBRO EN SITUACIÓN DE RIESGO</p>
      </header>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Profile Card */}
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.2)', 
          padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem', backdropFilter: 'blur(20px)' 
        }}>
          <div style={{ 
            width: '140px', height: '140px', borderRadius: '50%', margin: '0 auto 2rem',
            border: '2px solid #D4AF37', pading: '5px', overflow: 'hidden',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)'
          }}>
             {pet.customImage ? (
                <img src={pet.customImage} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: '5rem', lineHeight: '130px', background: '#111' }}>{pet.avatar || '🐾'}</div>
              )}
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', fontFamily: "'Playfair Display', serif", color: '#D4AF37' }}>{pet.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '2px' }}>
            {pet.breed?.toUpperCase()} • {pet.gender?.toUpperCase()} • {pet.age} AÑOS
          </p>
        </div>

        {/* Medical Info */}
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255, 0, 122, 0.2)', 
          padding: '2rem', marginBottom: '2rem'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 0 1.5rem', color: '#FF007A', fontSize: '0.9rem', letterSpacing: '2px' }}>
            <Heart size={20} /> ESPECIFICACIONES MÉDICAS CRÍTICAS
          </h3>
          <div style={{ padding: '1.5rem', background: 'rgba(255, 0, 122, 0.05)', border: '1px solid rgba(255, 0, 122, 0.1)' }}>
            {medicalAlerts ? (
              <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>{medicalAlerts}</p>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Sin condiciones críticas reportadas en la Bóveda.</p>
            )}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
           <h3 style={{ fontSize: '0.9rem', letterSpacing: '2px', opacity: 0.5, marginBottom: '0.5rem' }}>ENLACE CON PROPIETARIOS</h3>
           {contacts?.map((c, i) => (
              <a 
                key={i}
                href={`tel:${c.phone}`} 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                  background: '#D4AF37', color: '#000', padding: '1.2rem', 
                  fontSize: '1rem', fontWeight: 800, textDecoration: 'none', letterSpacing: '1px'
                }}
              >
                <Phone size={20} /> CONTACTAR CON {c.name?.toUpperCase() || 'RESPONSABLE'}
              </a>
            ))}
            <a 
              href={`https://wa.me/${contacts?.[0]?.phone}`}
              target="_blank"
              rel="noreferrer"
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '1.2rem', 
                border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '1px'
              }}
            >
              ENVIAR MENSAJE VÍA WHATSAPP
            </a>
        </div>

        {/* Vault Security Footer */}
        <footer style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.3 }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '4px' }}>ESTE PERFIL ES PARTE DEL PASAPORTE GLOBAL AURA PETS</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '1.5rem' }}>
            <Lock size={14} /> SISTEMA BIO-ENCRIPTADO VAULT™ PROTEGIDO
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EmergencyLanding;
