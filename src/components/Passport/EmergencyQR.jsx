import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck, ShieldOff, Share2, Download, AlertCircle } from 'lucide-react';

const EmergencyQR = ({ pet, onUpdate }) => {
  const [active, setActive] = useState(pet.emergencyConfig?.active || false);
  const [medicalAlerts, setMedicalAlerts] = useState(pet.emergencyConfig?.medicalAlerts || '');
  
  const emergencyUrl = `${window.location.origin}${window.location.pathname}?emergency=${pet.id}`;

  const handleToggle = () => {
    const newState = !active;
    setActive(newState);
    onUpdate({
      ...pet.emergencyConfig,
      active: newState,
      medicalAlerts
    });
  };

  const handleSaveAlerts = () => {
    onUpdate({
      ...pet.emergencyConfig,
      active,
      medicalAlerts
    });
    alert('Información médica actualizada en la bóveda.');
  };

  return (
    <div className="emergency-qr-panel fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ 
          width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(230, 75, 75, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-urgent)'
        }}>
          <QrCode size={28} />
        </div>
        <div>
          <h3 style={{ margin: 0 }}>ID de Emergencia & QR</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Configura el acceso público para el collar</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: active ? 'white' : 'rgba(0,0,0,0.05)' }}>
            <div style={{ filter: active ? 'none' : 'blur(4px) grayscale(1)', transition: 'all 0.3s' }}>
              <QRCodeSVG 
                value={emergencyUrl} 
                size={180}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/favicon.svg",
                  x: undefined,
                  y: undefined,
                  height: 30,
                  width: 30,
                  excavate: true,
                }}
              />
            </div>
            {!active && (
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '1rem'
              }}>
                <ShieldOff size={40} color="var(--text-muted)" />
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>QR Desactivado</p>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ flex: 1, justifyContent: 'center' }} disabled={!active}>
              <Download size={18} /> PNG
            </button>
            <button className="btn" style={{ flex: 1, justifyContent: 'center' }} disabled={!active}>
              <Share2 size={18} /> Compartir
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="status-toggle-card" style={{ 
            padding: '1.5rem', borderRadius: '20px', 
            background: active ? 'rgba(74, 124, 89, 0.1)' : 'rgba(230, 75, 75, 0.05)',
            border: `1px solid ${active ? 'var(--primary)' : 'var(--status-urgent)'}`,
            transition: 'all 0.4s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, color: active ? 'var(--primary)' : 'var(--status-urgent)' }}>
                {active ? 'ACTIVO (Público)' : 'DESACTIVADO (Privado)'}
              </span>
              <button 
                onClick={handleToggle}
                style={{ 
                  width: '60px', height: '30px', borderRadius: '15px', border: 'none',
                  background: active ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
                }}
              >
                <div style={{ 
                  width: '24px', height: '24px', background: 'white', borderRadius: '50%',
                  position: 'absolute', top: '3px', left: active ? '33px' : '3px',
                  transition: 'all 0.3s'
                }} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {active 
                ? 'Cualquier persona que escanee el QR podrá ver la ficha de emergencia.' 
                : 'El enlace del QR mostrará una página de error 404 de seguridad.'}
            </p>
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem', fontWeight: 600 }}>
              <AlertCircle size={18} color="var(--status-urgent)" /> Alertas Médicas para el QR
            </label>
            <textarea 
              placeholder="Ej: Alérgico a la penicilina, requiere medicación cada 12h para el corazón..."
              style={{ 
                width: '100%', height: '100px', borderRadius: '15px', padding: '1rem',
                border: '1px solid var(--glass-border)', background: 'white', fontSize: '0.9rem',
                resize: 'none'
              }}
              value={medicalAlerts}
              onChange={(e) => setMedicalAlerts(e.target.value)}
            />
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
              onClick={handleSaveAlerts}
            >
              Guardar Cambios Vitales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyQR;
