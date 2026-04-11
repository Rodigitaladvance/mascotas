import React from 'react';
import { Globe, PlaneTakeoff, ShieldCheck, CheckCircle2, AlertCircle, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const countries = [
  { id: 'ES', name: 'España', code: 'ESP', status: 'Compliant' },
  { id: 'AU', name: 'Australia', code: 'AUS', status: 'Notice', warning: 'Requires Rabies Neutralization Test' },
  { id: 'UK', name: 'United Kingdom', code: 'GBR', status: 'Compliant' },
  { id: 'US', name: 'USA', code: 'USA', status: 'Compliant' },
  { id: 'CA', name: 'Canada', code: 'CAN', status: 'Notice', warning: 'Recent Tick Policy Update' }
];

const GlobalPassport = ({ pet }) => {
  return (
    <div className="fade-in">
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
           <span style={{ 
            fontSize: '0.8rem', letterSpacing: '4px', color: 'var(--aura-gold)', 
            textTransform: 'uppercase', display: 'block', marginBottom: '1rem' 
          }}>
            Cross-Border Logistics
          </span>
          <h1 style={{ fontSize: '3.5rem', margin: 0 }}>Global Sanitary Passport</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
           <p style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem' }}>{pet?.name || 'AURA Member'}</p>
           <p style={{ margin: 0, color: 'var(--aura-text-muted)', fontSize: '0.8rem' }}>Tier: First Class Traveler</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Compliance Status */}
        <div className="aura-card" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--aura-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlaneTakeoff color="var(--aura-black)" size={32} />
             </div>
             <div>
                <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Readiness: 94%</h2>
                <p style={{ margin: 0, color: 'var(--aura-text-muted)', fontSize: '0.9rem' }}>Optimal alignment with international bio-security protocols.</p>
             </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
             <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--aura-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--aura-text-muted)' }}>Microchip Registry</span>
                <span style={{ fontWeight: 600, color: 'var(--aura-neon-cyan)' }}>ISO 11784 VERIFIED</span>
             </div>
             <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--aura-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--aura-text-muted)' }}>Rabies Serology (Titer)</span>
                <span style={{ fontWeight: 600, color: 'var(--aura-neon-cyan)' }}>VALID UNTIL 2026</span>
             </div>
             <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--aura-text-muted)' }}>Health Certificate (ES)</span>
                <span style={{ fontWeight: 600 }}>PENDING SIGNATURE</span>
             </div>
          </div>
        </div>

        {/* Destination Advisor */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', opacity: 0.8 }}>Priority Destinations</h3>
          {countries.map(country => (
            <motion.div 
               key={country.id}
               whileHover={{ x: 10 }}
               className="aura-card" 
               style={{ 
                 padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                 borderLeft: country.status === 'Compliant' ? '2px solid var(--aura-neon-cyan)' : '2px solid var(--aura-gold)'
               }}
            >
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--aura-gold)', opacity: 0.4 }}>{country.code}</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{country.name}</h4>
                    {country.warning && <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: 'var(--aura-gold)' }}>⚠️ {country.warning}</p>}
                  </div>
               </div>
               {country.status === 'Compliant' ? <CheckCircle2 size={18} color="var(--aura-neon-cyan)" /> : <AlertCircle size={18} color="var(--aura-gold)" />}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="aura-card" style={{ marginTop: '3rem', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <FileText size={24} color="var(--aura-gold)" />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Export Official Passport Data for IATA Compliance</p>
         </div>
         <button className="btn-aura">DOWNLOAD PDF</button>
      </div>
    </div>
  );
};

export default GlobalPassport;
