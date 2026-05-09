import React, { useState } from 'react';
import { 
  LayoutDashboard, Heart, Calendar, ShieldCheck, Plus, 
  ChevronRight, Activity, Bell, FileText, QrCode, Shield, Menu, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import AddPetModal from './AddPetModal';
import { intelligence } from '../utils/intelligence';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraVideoPlayer } from '../video/AuraVideoPlayer';
import { IntroVideoModal } from './IntroVideoPlayer';

const Dashboard = ({ pets, onSelectPet, onAddPet }) => {
  const [showModal, setShowModal] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openRegistration = () => setShowIntro(true);
  const handleIntroContinue = () => { setShowIntro(false); setShowModal(true); };
  const handleIntroSkip = () => { setShowIntro(false); setShowModal(true); };

  // Validar array de mascotas
  const safePets = Array.isArray(pets) ? pets : [];

  // Estadísticas globales para los gráficos
  const petStats = safePets.map(p => ({
    name: p.name || 'Mascota',
    protection: intelligence.calculateProtection(p)
  }));

  const globalProtection = safePets.length > 0 
    ? Math.round(petStats.reduce((acc, curr) => acc + curr.protection, 0) / safePets.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* ========== HEADER CON LOGO Y NAVEGACIÓN ========== */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo y Marca */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#D4AF37] to-[#AA8439] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                <Shield size={28} className="text-black font-bold" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter leading-none">
                  AURA <span className="text-[#D4AF37]">Pets</span>
                </h1>
                <p className="text-[9px] text-white/40 uppercase tracking-[3px] font-bold">Excelencia Sanitaria</p>
              </div>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
              <button className="text-[#D4AF37] flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button className="text-white/60 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                <FileText size={16} /> Pasaporte
              </button>
              <button className="text-white/60 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                <ShieldCheck size={16} /> Bóveda Segura
              </button>
              <button className="text-white/60 hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                <Calendar size={16} /> Calendario
              </button>
            </nav>

            {/* Botón Menú Mobile */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Menú Mobile Colapsible */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-2 border-t border-white/5 pt-4">
              <button className="text-[#D4AF37] flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 w-full text-left">
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button className="text-white/60 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 w-full text-left">
                <FileText size={16} /> Pasaporte
              </button>
              <button className="text-white/60 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 w-full text-left">
                <ShieldCheck size={16} /> Bóveda Segura
              </button>
              <button className="text-white/60 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 w-full text-left">
                <Calendar size={16} /> Calendario
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* ========== SECCIÓN DE VIDEO PREMIUM ========== */}
      <section className="w-full bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/5 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Encabezado del Video */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
              <span className="text-[11px] font-bold tracking-[3px] text-[#D4AF37] uppercase">Aura Intelligence Video</span>
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent"></div>
          </div>

          {/* Contenedor de Video con Borde Dorado y Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-4xl"
          >
            {/* Glow Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 blur-2xl rounded-2xl opacity-60"></div>
            
            {/* Video Container con Borde */}
            <div className="relative bg-black rounded-2xl border border-[#D4AF37]/40 overflow-hidden shadow-2xl shadow-[#D4AF37]/20">
              {/* Línea dorada superior */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent z-10"></div>
              
              {/* Componente Video */}
              <div className="w-full">
                <AuraVideoPlayer petName={safePets[0]?.name || 'Miembro Aura'} />
              </div>

              {/* Línea dorada inferior */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent z-10"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 md:py-12"
      >

        {/* SECCIÓN 2: ESTADÍSTICAS Y GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Widget de Protección Global */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-[24px] p-8 flex flex-col items-center justify-center backdrop-blur-sm hover:border-[#D4AF37]/30 transition-all"
          >
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-6">Protección Global</h3>
            <div className="relative w-44 h-44 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: globalProtection }, { value: 100 - globalProtection }]}
                    innerRadius={60}
                    outerRadius={85}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill="#D4AF37" />
                    <Cell fill="rgba(255,255,255,0.03)" stroke="none" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-[#D4AF37]">{globalProtection}%</span>
                <span className="text-[10px] text-white/40 font-bold mt-1">BIOMETRÍA OK</span>
              </div>
            </div>
            <p className="text-xs text-white/40 text-center mt-4">
              {safePets.length} mascota{safePets.length !== 1 ? 's' : ''} bajo vigilancia
            </p>
          </motion.div>

          {/* Gráfico de Blindaje por Mascota */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="lg:col-span-2 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-[24px] p-8 backdrop-blur-sm hover:border-[#D4AF37]/30 transition-all"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Distribución de Blindaje</h3>
                <p className="text-xs text-white/30 mt-1">Nivel de protección por mascota</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={openRegistration}
                className="p-3 bg-[#D4AF37] text-black rounded-full hover:shadow-lg hover:shadow-[#D4AF37]/40 transition-all font-bold"
              >
                <Plus size={20} />
              </motion.button>
            </div>
            {safePets.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={petStats} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" />
                    <Tooltip 
                      cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
                      contentStyle={{
                        backgroundColor: '#111', 
                        border: '1px solid #D4AF37', 
                        borderRadius: '12px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
                      }}
                      labelStyle={{ color: '#D4AF37' }}
                    />
                    <Bar dataKey="protection" radius={[10, 10, 0, 0]} barSize={50}>
                      {petStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.protection > 80 ? '#D4AF37' : entry.protection > 50 ? '#ffaa00' : '#ff6b6b'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-white/40">
                <p className="text-center">No hay mascotas registradas aún</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* SECCIÓN 3: LISTADO DE MASCOTAS */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight">
                Expedientes <span className="text-white/40">Activos</span>
              </h2>
              <p className="text-xs text-white/40 mt-2">Mascotas bajo protección AURA</p>
            </div>
            <div className="text-xs text-white/40 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              {safePets.length} registro{safePets.length !== 1 ? 's' : ''} encriptado{safePets.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Grid de Mascotas */}
        {safePets.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {safePets.map((pet, index) => (
              <motion.div 
                key={pet.id || index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.1)' }}
                onClick={() => onSelectPet(pet.id)}
                className="group cursor-pointer bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-[20px] p-6 hover:border-[#D4AF37]/40 transition-all backdrop-blur-sm"
              >
                <div className="flex gap-4 items-start mb-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#AA8439]/10 border border-white/20 overflow-hidden flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
                    {pet.avatar || (pet.species === 'Perro' || pet.species === 'Dog' ? '🐕' : '🐈')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg leading-none">{pet.name}</h4>
                    <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">{pet.breed || 'Sin raza'}</p>
                  </div>
                </div>

                {/* Barra de Protección */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/40 font-semibold">Estado de blindaje</span>
                    <span className="text-xs font-bold text-[#D4AF37]">{intelligence.calculateProtection(pet)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${intelligence.calculateProtection(pet)}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#ffaa00] rounded-full"
                    ></motion.div>
                  </div>
                </div>

                {/* Info adicional */}
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-white/40">ID: {pet.id?.slice(0, 8) || 'N/A'}...</span>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-[24px] p-12 text-center backdrop-blur-sm"
          >
            <Shield size={48} className="mx-auto mb-4 text-white/20" />
            <h3 className="text-xl font-bold text-white/60 mb-2">Sin mascotas registradas</h3>
            <p className="text-white/40 mb-6">Añade tu primer miembro a la familia AURA</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openRegistration}
              className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-bold hover:shadow-lg hover:shadow-[#D4AF37]/40 transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} /> Agregar Mascota
            </motion.button>
          </motion.div>
        )}
      </motion.main>

      {/* Modal intro de introducción (aparece antes del formulario) */}
      <IntroVideoModal
        isOpen={showIntro}
        onContinue={handleIntroContinue}
      />

      {/* Modal de Agregar Mascota */}
      {showModal && (
        <AddPetModal
          onAdd={(newPet) => {
            onAddPet(newPet);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;