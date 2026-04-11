import React from 'react';

const HistoryPrint = ({ pet }) => {
  if (!pet) return <p>Preparando expediente AURA...</p>;

  return (
    <div className="print-view" style={{ 
      padding: '60px', background: 'white', color: 'black', minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif" 
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600;700&display=swap');
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 0; }
          }
          .carnet-header { 
            border-bottom: 2px solid #D4AF37; 
            padding-bottom: 30px; 
            margin-bottom: 40px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
          }
          .pet-info { display: grid; grid-template-columns: 180px 1fr; gap: 40px; margin-bottom: 60px; }
          .history-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .history-table th, .history-table td { border-bottom: 1px solid #eee; padding: 15px; text-align: left; font-size: 0.9rem; }
          .history-table th { color: #888; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; font-size: 0.7rem; }
          h1, h2, h3 { font-family: 'Playfair Display', serif; }
        `}
      </style>
      
      <div className="no-print" style={{ marginBottom: '40px', textAlign: 'right' }}>
        <button 
          style={{ 
            background: 'black', color: 'white', border: 'none', padding: '12px 24px', 
            borderRadius: '4px', cursor: 'pointer', fontWeight: 600, letterSpacing: '1px' 
          }} 
          onClick={() => window.print()}
        >
          IMPRIMIR EXPEDIENTE ELITE
        </button>
      </div>

      <div className="carnet-header">
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>EXPEDIENTE BIOMÉTRICO</h1>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ letterSpacing: '2px', color: '#D4AF37' }}>AURA PETS ELITE</strong>
          <br />
          <span style={{ fontSize: '0.8rem', color: '#888' }}>VAULT ID: {pet.id}</span>
        </div>
      </div>

      <div className="pet-info">
        <div style={{ width: '180px', height: '180px', background: '#f9f9f9', border: '1px solid #D4AF37', pading: '2px' }}>
          {pet.customImage ? (
            <img src={pet.customImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ fontSize: '6rem', textAlign: 'center', lineHeight: '180px' }}>{pet.avatar || '🐾'}</div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>{pet.name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.9rem' }}>
            <p><strong>LINAGE:</strong> {pet.breed || 'Sin especificar'}</p>
            <p><strong>ESPECIE:</strong> {pet.species}</p>
            <p><strong>CICLO VITAL:</strong> {pet.age} Años</p>
            <p><strong>REGISTRO:</strong> {new Date(pet.birthDate || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.5rem', borderLeft: '4px solid #D4AF37', paddingLeft: '15px', marginBottom: '30px' }}>HISTORIAL CLÍNICO - VAULT™ CERTIFIED</h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>PROTOCOLO</th>
            <th>TRATAMIENTO / ACCIÓN</th>
            <th>DETALLES TÉCNICOS</th>
          </tr>
        </thead>
        <tbody>
          {pet.history && pet.history.sort((a,b) => new Date(b.date) - new Date(a.date)).map(item => (
            <tr key={item.id}>
              <td style={{ fontWeight: 600 }}>{new Date(item.date).toLocaleDateString()}</td>
              <td style={{ color: '#D4AF37', fontWeight: 700 }}>{item.type.toUpperCase()}</td>
              <td>{item.name}</td>
              <td style={{ color: '#666' }}>{item.details || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={{ marginTop: '100px', paddingTop: '30px', borderTop: '1px solid #eee', fontSize: '0.7rem', textAlign: 'center', color: '#888', letterSpacing: '4px' }}>
        DOCUMENTO OFICIAL GENERADO BAJO EL PROTOCOLO DE SEGURIDAD AURA PETS EXCELLENCE.
      </footer>
    </div>
  );
};

export default HistoryPrint;
