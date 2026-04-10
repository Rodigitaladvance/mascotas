import React from 'react';
import { ShieldAlert, Phone, MapPin, Heart, AlertCircle, ExternalLink } from 'lucide-react';

const EmergencyLanding = ({ pet }) => {
  if (!pet || !pet.emergencyConfig?.active) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <ShieldAlert size={64} color="var(--status-urgent)" style={{ marginBottom: '1.5rem' }} />
        <h2>Información no disponible</h2>
        <p>Este perfil de emergencia no está activo en este momento.</p>
      </div>
    );
  }

  const { medicalAlerts, contacts } = pet.emergencyConfig;

  return (
    <div className="emergency-landing fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ 
        background: 'var(--status-urgent)', color: 'white', padding: '1.5rem', 
        textAlign: 'center', borderRadius: '0 0 30px 30px', marginBottom: '2rem',
        boxShadow: '0 10px 20px rgba(230, 75, 75, 0.2)'
      }}>
        <AlertCircle size={32} style={{ marginBottom: '0.5rem' }} />
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>ALERTA DE EMERGENCIA</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Mascota encontrada o en peligro</p>
      </div>

      <div style={{ padding: '0 1.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '30px', margin: '0 auto 1.5rem',
            background: 'var(--secondary)', overflow: 'hidden', border: '5px solid white',
            boxShadow: 'var(--card-shadow)'
          }}>
             {pet.customImage ? (
                <img src={pet.customImage} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '4rem' }}>{pet.avatar || (pet.species === 'Perro' ? '🐕' : '🐈')}</span>
              )}
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{pet.name}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{pet.breed} • {pet.gender} • {pet.age} años</p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '5px solid var(--status-urgent)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem', color: 'var(--status-urgent)' }}>
            <Heart size={20} /> Información Médica Vital
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {medicalAlerts ? (
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>{medicalAlerts}</p>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Sin alergias o condiciones críticas reportadas.</p>
            )}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem' }}>
            <Phone size={20} /> Contactar con el Dueño
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {contacts?.map((c, i) => (
              <a 
                key={i}
                href={`tel:${c.phone}`} 
                className="btn btn-primary" 
                style={{ justifyContent: 'center', padding: '1.2rem', fontSize: '1.1rem', textDecoration: 'none' }}
              >
                <Phone size={20} /> Llamar a {c.name || 'Dueño'}
              </a>
            ))}
            <a 
              href={`https://wa.me/${contacts?.[0]?.phone}`}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ justifyContent: 'center', padding: '1.2rem', background: '#25D366', color: 'white', border: 'none' }}
            >
              Enviar WhatsApp
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>Esta página es parte del Pasaporte Universal MascotaHealth</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <ShieldAlert size={14} /> Sistema de Seguridad Bóveda Activado
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyLanding;
