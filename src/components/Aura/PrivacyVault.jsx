import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, ChevronRight, Download, Trash2 } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';

const PrivacyVault = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="fade-in" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '4rem' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '4px', opacity: 0.5, textTransform: 'uppercase' }}>Protocolo de Seguridad</span>
        <h1 className="luxury-title" style={{ fontSize: '3rem', margin: '0.5rem 0' }}>Bóveda de Privacidad</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 300px', gap: '4rem' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
           <div className="aura-card" style={{ padding: '3rem' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'start' }}>
                 <div style={{ padding: '1.2rem', background: 'rgba(0, 245, 255, 0.05)', borderRadius: '50%' }}>
                    <ShieldCheck color="var(--aura-neon-cyan)" size={32} />
                 </div>
                 <div>
                    <h3 style={{ fontSize: '1.5rem', margin: '0 0 1rem' }}>El Escudo AURA™</h3>
                    <p style={{ color: 'var(--aura-text-muted)', lineHeight: '1.8' }}>
                       Utilizamos encriptación de grado militar **AES-256** para proteger cada dato registrado. 
                       La clave de cifrado se genera localmente en su dispositivo y nunca se transmite a nuestros servidores. 
                       Esto garantiza que solo usted tenga el control absoluto sobre la información sanitaria de sus miembros.
                    </p>
                 </div>
              </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="aura-card" style={{ padding: '2rem' }}>
                 <Lock size={24} color="var(--aura-gold)" style={{ marginBottom: '1.5rem' }} />
                 <h4 style={{ margin: '0 0 0.5rem' }}>Estándar HIPAA (USA)</h4>
                 <p style={{ fontSize: '0.8rem', color: 'var(--aura-text-muted)' }}>Cumplimiento estricto de portabilidad y responsabilidad de seguros de salud.</p>
              </div>
              <div className="aura-card" style={{ padding: '2rem' }}>
                 <EyeOff size={24} color="var(--aura-gold)" style={{ marginBottom: '1.5rem' }} />
                 <h4 style={{ margin: '0 0 0.5rem' }}>GDPR (Europa)</h4>
                 <p style={{ fontSize: '0.8rem', color: 'var(--aura-text-muted)' }}>Derecho al olvido, acceso y portabilidad de datos garantizado por diseño.</p>
              </div>
           </div>

           <div className="aura-card" style={{ padding: '2rem', borderStyle: 'dashed' }}>
              <h3 style={{ margin: '0 0 1.5rem' }}>Gestión de Datos</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                 <button className="btn-aura" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', border: 'none', background: 'rgba(255,255,255,0.03)' }}>
                    <span>Exportar Expediente Médico (JSON)</span> <Download size={18} />
                 </button>
                 <button className="btn-aura" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', border: 'none', background: 'rgba(255,255,255,0.03)' }}>
                    <span>Solicitar Portabilidad de Bóveda</span> <ChevronRight size={18} />
                 </button>
                 <button className="btn-aura" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', border: 'none', color: 'var(--aura-neon-pink)' }}>
                    <span>Destrucción Permanente de Datos</span> <Trash2 size={18} />
                 </button>
              </div>
           </div>
        </div>

        <aside>
           <div className="aura-card" style={{ textAlign: 'center', borderColor: 'var(--aura-neon-cyan)' }}>
              <div className="bio-ring" style={{ width: '120px', height: '120px', margin: '0 auto 2rem' }}>
                 <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--aura-neon-cyan)', borderRadius: '50%', opacity: 0.2 }}></div>
                 <div style={{ position: 'absolute', inset: '10px', border: '2px solid var(--aura-neon-cyan)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'rotate 3s linear infinite' }}></div>
                 <ShieldCheck size={40} color="var(--aura-neon-cyan)" />
              </div>
              <h4 style={{ color: 'var(--aura-neon-cyan)', letterSpacing: '2px', fontSize: '0.7rem' }}>ESTADO DE LA BÓVEDA</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0.5rem 0' }}>CIFRADO ACTIVO</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--aura-text-muted)' }}>Última Auditoría: 21:04 UTC</p>
           </div>
        </aside>
      </div>

      <style>{`
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PrivacyVault;
