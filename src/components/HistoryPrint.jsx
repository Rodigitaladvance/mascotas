import React from 'react';

const HistoryPrint = ({ pet }) => {
  if (!pet) return <p>Cargando carnet...</p>;

  return (
    <div className="print-view" style={{ 
      padding: '40px', background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'sans-serif' 
    }}>
      <style>
        {`
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 0; }
          }
          .carnet-header { border-bottom: 3px solid #4a7c59; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .pet-info { display: grid; grid-template-columns: 150px 1fr; gap: 30px; margin-bottom: 40px; }
          .history-table { width: 100%; border-collapse: collapse; }
          .history-table th, .history-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .history-table th { background-color: #f8f9fa; }
        `}
      </style>
      
      <div className="no-print" style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Imprimir Carnet</button>
      </div>

      <div className="carnet-header">
        <h1>CARNET DE SALUD ANIMAL</h1>
        <div style={{ textAlign: 'right' }}>
          <strong>MascotaHealth Professional</strong>
          <br />ID: {pet.id}
        </div>
      </div>

      <div className="pet-info">
        <div style={{ width: '150px', height: '150px', borderRadius: '15px', overflow: 'hidden', border: '2px solid #4a7c59' }}>
          {pet.customImage ? (
            <img src={pet.customImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ fontSize: '5rem', textAlign: 'center', lineHeight: '150px' }}>{pet.avatar || '🐾'}</div>
          )}
        </div>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginTop: 0 }}>{pet.name}</h2>
          <p><strong>Especie:</strong> {pet.species} | <strong>Raza:</strong> {pet.breed}</p>
          <p><strong>Sexo:</strong> {pet.gender} | <strong>F. Nacimiento:</strong> {new Date(pet.birthDate).toLocaleDateString()}</p>
        </div>
      </div>

      <h3>Historial Clínico</h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Tratamiento</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {pet.history.sort((a,b) => new Date(b.date) - new Date(a.date)).map(item => (
            <tr key={item.id}>
              <td>{new Date(item.date).toLocaleDateString()}</td>
              <td>{item.type}</td>
              <td>{item.name}</td>
              <td>{item.details || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #ddd', fontSize: '0.8rem', textAlign: 'center' }}>
        Este documento es un registro oficial generado por MascotaHealth App.
      </footer>
    </div>
  );
};

export default HistoryPrint;
