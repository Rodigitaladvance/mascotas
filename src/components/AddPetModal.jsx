import React, { useState } from 'react';

const AVATARS = ['🐕', '🐈', '🦜', '🐇', '🐢', '🐈‍⬛', '🐩', '🐹'];

const AddPetModal = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Perro',
    breed: '',
    gender: 'Macho',
    birthDate: '',
    avatar: '🐕',
    customImage: null
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, customImage: reader.result, avatar: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="glass-card fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Añadir Nueva Mascota</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Nombre</label>
              <input type="text" required className="btn" style={{ width: '100%', background: 'white' }} 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label>Especie</label>
              <select className="btn" style={{ width: '100%', background: 'white' }}
                value={formData.species} onChange={e => setFormData({...formData, species: e.target.value})}>
                <option>Perro</option>
                <option>Gato</option>
                <option>Ave</option>
                <option>Roedor</option>
                <option>Exótico</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Raza</label>
              <input type="text" className="btn" style={{ width: '100%', background: 'white' }}
                value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} />
            </div>
            <div>
              <label>Sexo</label>
              <select className="btn" style={{ width: '100%', background: 'white' }}
                value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option>Macho</option>
                <option>Hembra</option>
              </select>
            </div>
          </div>

          <div>
            <label>Fecha de Nacimiento</label>
            <input type="date" required className="btn" style={{ width: '100%', background: 'white' }}
              value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '1rem' }}>Selecciona un Avatar o Sube una Foto</label>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {AVATARS.map(av => (
                <button 
                  key={av} 
                  type="button"
                  className="btn"
                  style={{ 
                    fontSize: '1.5rem', padding: '0.5rem',
                    border: formData.avatar === av ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                    background: formData.avatar === av ? 'rgba(74, 124, 89, 0.1)' : 'white'
                  }}
                  onClick={() => setFormData({ ...formData, avatar: av, customImage: null })}
                >
                  {av}
                </button>
              ))}
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '0.8rem' }} />
            {formData.customImage && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <img src={formData.customImage} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar Mascota</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPetModal;
