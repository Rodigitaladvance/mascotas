import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, Upload, PlusCircle } from 'lucide-react';
import { useTranslation } from '../../context/LocalizationContext';
import { readImageAsDataURL } from '../../utils/imageUpload';
import PawPrint from './PawPrint';
import { Blob, Sparkle } from './Decorations';
import { accentFor } from '../../utils/species';
import fotoPerro   from '../../assets/especies/perro.jpg';
import fotoGato    from '../../assets/especies/gato.jpg';
import fotoCaballo from '../../assets/especies/caballo.jpg';
import fotoAve     from '../../assets/especies/ave.jpg';
import fotoConejo  from '../../assets/especies/conejo.jpg';
import fotoHuron   from '../../assets/especies/huron.jpg';
import fotoLagarto from '../../assets/especies/lagarto.jpg';

/* Huellas y manchas para las tarjetas del alta. Posiciones fijas para que
   no salten en cada render. */
const REG_PAWS = [
  { size: 40, top: '10%',   right: '3%',  color: '#C9BDF2', opacity: 0.45, rot: 24 },
  { size: 26, bottom: '14%', left: '3%',  color: '#A5E3DC', opacity: 0.50, rot: -18 },
  { size: 20, top: '46%',   left: '1%',   color: '#BFE0F5', opacity: 0.40, rot: 8 },
];

/* ── Especies ────────────────────────────────────────────────────────────────
   Las miniaturas eran fotografías servidas por Pexels: cinco peticiones a un
   tercero cada vez que alguien abría el alta. Eso contradecía la promesa de
   que la aplicación no habla con nadie, impedía usar la pantalla sin conexión
   y filtraba la IP del usuario. Ahora cada especie se dibuja en el propio
   navegador con su emoji sobre el color que le corresponde.
──────────────────────────────────────────────────────────────────────────── */
const SPECIES = [
  { id: 'dog',     label: 'Perro',            labelEn: 'Dog',              emoji: '🐕', img: fotoPerro   },
  { id: 'cat',     label: 'Gato',             labelEn: 'Cat',              emoji: '🐈', img: fotoGato    },
  { id: 'ferret',  label: 'Hurón',            labelEn: 'Ferret',           emoji: '🦡', img: fotoHuron   },
  { id: 'horse',   label: 'Caballo',          labelEn: 'Horse',            emoji: '🐴', img: fotoCaballo },
  { id: 'bird',    label: 'Ave',              labelEn: 'Bird',             emoji: '🦜', img: fotoAve     },
  { id: 'rabbit',  label: 'Conejo',           labelEn: 'Rabbit',           emoji: '🐇', img: fotoConejo  },
  { id: 'exotic',  label: 'Reptil / Exótico', labelEn: 'Reptile / Exotic', emoji: '🦎', img: fotoLagarto },
  { id: 'other',   label: 'OTRA MASCOTA',     labelEn: 'Other Pet',        emoji: '+',  img: null, isOther: true },
];

const COMPETITION_ES = ['Doma Clásica','Salto de Obstáculos','Endurance','Polo','Reining'];
const COMPETITION_EN = ['Dressage','Show Jumping','Endurance','Polo','Reining'];
const DIET_ES = ['Insectívora','Carnívora Estricta','Omnívora','Frugívora','Herbívora'];
const DIET_EN  = ['Insectivore','Strict Carnivore','Omnivore','Frugivore','Herbivore'];

/* Stored as English key; displayed in active locale */
const SONG_OPTIONS = [
  { value: 'Optimal',         es: 'Óptimo',           en: 'Optimal'        },
  { value: 'Reduced',         es: 'Reducido',          en: 'Reduced'        },
  { value: 'Breeding Season', es: 'Temporada de Cría', en: 'Breeding Season'},
];

/* ── Sub-tabs ── */
const SubTabs = ({ tabs, active, onChange }) => (
  <div className="aura-tabs">
    {tabs.map(tab => (
      <button key={tab.id} className={`aura-tab${active === tab.id ? ' active' : ''}`} onClick={() => onChange(tab.id)}>
        {tab.label}
      </button>
    ))}
  </div>
);

/* ── Campos equinos ──────────────────────────────────────────────────────────
   Los équidos NO viajan bajo el régimen de animales de compañía: se rigen por
   la normativa de identificación equina, que exige una ficha mucho más
   detallada. Estos son los datos que piden los documentos de identificación
   equina de la UE, Reino Unido, EE. UU., Canadá y Australia.
──────────────────────────────────────────────────────────────────────────── */
const SEXO_ES = ['Semental', 'Yegua', 'Castrado'];
const SEXO_EN = ['Stallion', 'Mare', 'Gelding'];

/* Dónde se implanta el transpondedor. La ubicación es un dato obligatorio del
   documento de identificación, no un detalle: el veterinario debe encontrarlo. */
const CHIP_LOC_ES = [
  'Ligamento nucal, lado izquierdo',
  'Ligamento nucal, lado derecho',
  'Otra ubicación (indicar en marcas)',
];
const CHIP_LOC_EN = [
  'Nuchal ligament, left side',
  'Nuchal ligament, right side',
  'Other location (note in markings)',
];

const HorseFields = ({ data, onChange, locale }) => {
  const es = locale === 'es';
  const competitions = es ? COMPETITION_ES : COMPETITION_EN;
  const sexos = es ? SEXO_ES : SEXO_EN;
  const ubicaciones = es ? CHIP_LOC_ES : CHIP_LOC_EN;
  const set = (campo) => (e) => onChange({ ...data, [campo]: e.target.value });

  return (
    <div>
      {/* ── Identificación oficial ── */}
      <p className="section-eyebrow" style={{ margin: '0 0 1rem', fontSize: '0.68rem', letterSpacing: '3px', color: 'var(--gold-deep)', fontWeight: 700, textTransform: 'uppercase' }}>
        {es ? 'Identificación oficial' : 'Official identification'}
      </p>

      <div className="form-group">
        <label className="input-label">{es ? 'Ubicación del microchip' : 'Microchip location'}</label>
        <select className="aura-input aura-select" value={data.chipLocation || ''} onChange={set('chipLocation')}>
          <option value="">{es ? 'Seleccionar…' : 'Select…'}</option>
          {ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="input-label">{es ? 'Nº de pasaporte equino' : 'Equine passport number'}</label>
        <input className="aura-input" placeholder={es ? 'Nº del documento de identificación' : 'Identification document no.'}
          value={data.passportNumber || ''} onChange={set('passportNumber')} />
      </div>

      <div className="form-group">
        <label className="input-label">
          {es ? 'UELN / Nº de registro de raza' : 'UELN / breed registry number'}
        </label>
        <input className="aura-input" placeholder="724-002-XXXXXXXXX"
          value={data.ueln || ''} onChange={set('ueln')} />
        <p style={{ margin: '0.45rem 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          {es
            ? 'Número único de por vida del équido, de 15 dígitos. Lo asigna el organismo emisor del pasaporte.'
            : 'The animal’s 15-digit Universal Equine Life Number, assigned by the passport-issuing body.'}
        </p>
      </div>

      <div className="form-group">
        <label className="input-label">{es ? 'Pasaporte REGA (España)' : 'REGA passport (Spain)'}</label>
        <input className="aura-input" placeholder="ES-XXX-XXXX" value={data.rega || ''} onChange={set('rega')} />
      </div>

      {/* ── Reseña ── */}
      <p className="section-eyebrow" style={{ margin: '2rem 0 1rem', fontSize: '0.68rem', letterSpacing: '3px', color: 'var(--gold-deep)', fontWeight: 700, textTransform: 'uppercase' }}>
        {es ? 'Reseña del animal' : 'Animal description'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div className="form-group">
          <label className="input-label">{es ? 'Sexo' : 'Sex'}</label>
          <select className="aura-input aura-select" value={data.sex || ''} onChange={set('sex')}>
            <option value="">{es ? 'Seleccionar…' : 'Select…'}</option>
            {sexos.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="input-label">{es ? 'Fecha de nacimiento' : 'Date of birth'}</label>
          <input type="date" className="aura-input" value={data.birthDate || ''} onChange={set('birthDate')} />
        </div>
        <div className="form-group">
          <label className="input-label">{es ? 'Capa / color' : 'Coat colour'}</label>
          <input className="aura-input" placeholder={es ? 'Ej: castaño, tordo, alazán' : 'e.g. bay, grey, chestnut'}
            value={data.coatColor || ''} onChange={set('coatColor')} />
        </div>
      </div>

      <div className="form-group">
        <label className="input-label">{es ? 'Marcas distintivas' : 'Distinctive markings'}</label>
        <textarea className="aura-input" rows={3}
          placeholder={es ? 'Lucero, calzados, remolinos, cicatrices…' : 'Star, socks, whorls, scars…'}
          value={data.markings || ''} onChange={set('markings')} />
        <p style={{ margin: '0.45rem 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          {es
            ? 'El diagrama de reseña del pasaporte se rellena con estos rasgos. Cuanto más precisos, menos problemas en frontera.'
            : 'The passport silhouette diagram is filled in from these features. The more precise, the fewer border problems.'}
        </p>
      </div>

      <div className="form-group">
        <label className="input-label">{es ? 'Tatuaje o hierro, si existe' : 'Tattoo or brand, if any'}</label>
        <input className="aura-input" placeholder={es ? 'Marca y ubicación' : 'Mark and location'}
          value={data.brand || ''} onChange={set('brand')} />
      </div>

      {/* ── Manejo ── */}
      <p className="section-eyebrow" style={{ margin: '2rem 0 1rem', fontSize: '0.68rem', letterSpacing: '3px', color: 'var(--gold-deep)', fontWeight: 700, textTransform: 'uppercase' }}>
        {es ? 'Manejo y deporte' : 'Care and sport'}
      </p>

      <div className="form-group">
        <label className="input-label">{es ? 'Fecha último herraje' : 'Last farrier date'}</label>
        <input type="date" className="aura-input" value={data.lastFarrier || ''} onChange={set('lastFarrier')} />
      </div>

      <div className="form-group">
        <label className="input-label">{es ? 'Rendimiento / competición' : 'Performance / competition'}</label>
        <select className="aura-input aura-select" value={data.competition || ''} onChange={set('competition')}>
          <option value="">{es ? 'Seleccionar…' : 'Select…'}</option>
          {competitions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};

/* ── Exotic fields ── */
const ExoticFields = ({ data, onChange, locale }) => {
  const [habitatOn, setHabitatOn] = useState(true);
  const diets = locale === 'es' ? DIET_ES : DIET_EN;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <span style={{ fontSize:'0.85rem', fontWeight:600 }}>
          {locale === 'es' ? 'Hábitat de Exóticos' : 'Exotic Habitat'}
        </span>
        <label className="aura-toggle">
          <input type="checkbox" checked={habitatOn} onChange={e => setHabitatOn(e.target.checked)} />
          <span className="aura-toggle-slider" />
        </label>
      </div>
      {habitatOn && (
        <>
          <div className="form-group">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem' }}>
              <label className="input-label" style={{ marginBottom:0 }}>{locale==='es'?'Temperatura':'Temperature'}</label>
              <span style={{ fontSize:'0.9rem', color: data.temp == null ? 'var(--aura-text-muted)' : 'var(--aura-neon-cyan)', fontWeight:600 }}>
                {data.temp == null ? (locale==='es'?'sin registrar':'not recorded') : `${data.temp}°C`}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <span style={{ fontSize:'0.65rem', color:'var(--aura-text-muted)' }}>0</span>
              <input type="range" className="aura-range" min="0" max="50" value={data.temp ?? 28}
                onChange={e => onChange({ ...data, temp: parseInt(e.target.value) })} />
              <span style={{ fontSize:'0.65rem', color:'var(--aura-text-muted)' }}>50</span>
            </div>
          </div>
          <div className="form-group">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem' }}>
              <label className="input-label" style={{ marginBottom:0 }}>{locale==='es'?'Humedad':'Humidity'}</label>
              <span style={{ fontSize:'0.9rem', color: data.humidity == null ? 'var(--aura-text-muted)' : 'var(--aura-gold)', fontWeight:600 }}>
                {data.humidity == null ? (locale==='es'?'sin registrar':'not recorded') : `${data.humidity}%`}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <span style={{ fontSize:'0.65rem', color:'var(--aura-text-muted)' }}>0</span>
              <input type="range" className="aura-range" min="0" max="100" value={data.humidity ?? 65}
                onChange={e => onChange({ ...data, humidity: parseInt(e.target.value) })} />
              <span style={{ fontSize:'0.65rem', color:'var(--aura-text-muted)' }}>100</span>
            </div>
          </div>
        </>
      )}
      <div className="form-group">
        <label className="input-label">{locale==='es'?'Ciclo de Muda':'Shedding Cycle'}</label>
        <input type="date" className="aura-input" value={data.lastShed || ''}
          onChange={e => onChange({ ...data, lastShed: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="input-label">{locale==='es'?'Dieta Especializada':'Specialized Diet'}</label>
        <select className="aura-input aura-select" value={data.diet || ''}
          onChange={e => onChange({ ...data, diet: e.target.value })}>
          <option value="">{locale==='es'?'Seleccionar...':'Select...'}</option>
          {diets.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </div>
  );
};

/* ── Campos de conejo ────────────────────────────────────────────────────────
   Los conejos NO entran en el reglamento europeo de animales de compañía, que
   solo cubre perros, gatos y hurones. Se rigen por las normas nacionales de
   cada país, y eso los hace más impredecibles que un perro: hay destinos que
   directamente no los admiten.
──────────────────────────────────────────────────────────────────────────── */
const RabbitFields = ({ data, onChange, locale }) => {
  const es = locale === 'es';
  const set = (campo) => (e) => onChange({ ...data, [campo]: e.target.value });

  return (
    <div>
      <p className="section-eyebrow" style={{ margin: '0 0 1rem', fontSize: '0.68rem', letterSpacing: '3px', color: 'var(--gold-deep)', fontWeight: 700, textTransform: 'uppercase' }}>
        {es ? 'Identificación' : 'Identification'}
      </p>

      <div className="form-group">
        <label className="input-label">{es ? 'Tatuaje auricular o microchip' : 'Ear tattoo or microchip'}</label>
        <input className="aura-input" placeholder={es ? 'Código de identificación' : 'Identification code'}
          value={data.rabbitId || ''} onChange={set('rabbitId')} />
        <p style={{ margin: '0.45rem 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          {es
            ? 'En conejos lo habitual es el tatuaje en la oreja; el microchip solo en algunos países.'
            : 'Rabbits are usually ear-tattooed; a microchip is only standard in some countries.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div className="form-group">
          <label className="input-label">{es ? 'Fecha de nacimiento' : 'Date of birth'}</label>
          <input type="date" className="aura-input" value={data.birthDate || ''} onChange={set('birthDate')} />
        </div>
        <div className="form-group">
          <label className="input-label">{es ? 'Criador o procedencia' : 'Breeder or provenance'}</label>
          <input className="aura-input" value={data.breeder || ''} onChange={set('breeder')} />
        </div>
      </div>

      <p className="section-eyebrow" style={{ margin: '2rem 0 1rem', fontSize: '0.68rem', letterSpacing: '3px', color: 'var(--gold-deep)', fontWeight: 700, textTransform: 'uppercase' }}>
        {es ? 'Vacunación' : 'Vaccination'}
      </p>

      <div className="form-group">
        <label className="input-label">{es ? 'Mixomatosis — última dosis' : 'Myxomatosis — last dose'}</label>
        <input type="date" className="aura-input" value={data.myxoDate || ''} onChange={set('myxoDate')} />
      </div>

      <div className="form-group">
        <label className="input-label">
          {es ? 'Enfermedad hemorrágica (RHD) — última dosis' : 'Rabbit haemorrhagic disease (RHD) — last dose'}
        </label>
        <input type="date" className="aura-input" value={data.rhdDate || ''} onChange={set('rhdDate')} />
        <p style={{ margin: '0.45rem 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          {es
            ? 'Incluye la variante RHDV2, que es la que exigen la mayoría de destinos.'
            : 'Including the RHDV2 variant, which is the one most destinations ask for.'}
        </p>
      </div>
    </div>
  );
};

/* ── Campos de ave ───────────────────────────────────────────────────────────
   Las aves no se identifican por microchip sino por anilla cerrada, y la
   mayoría de psitácidas —loros, guacamayos, cacatúas, agapornis— están en los
   apéndices de CITES. Eso significa permiso de exportación e importación para
   cruzar cualquier frontera, aunque el ave haya nacido en cautividad.
──────────────────────────────────────────────────────────────────────────── */
const CITES_ES = [
  { value: '',   label: 'No lo sé todavía' },
  { value: 'I',  label: 'Apéndice I — comercio prohibido salvo excepciones' },
  { value: 'II', label: 'Apéndice II — permiso obligatorio' },
  { value: 'III',label: 'Apéndice III — control por país' },
  { value: 'no', label: 'No está en CITES' },
];
const CITES_EN = [
  { value: '',   label: 'Not sure yet' },
  { value: 'I',  label: 'Appendix I — trade banned save exceptions' },
  { value: 'II', label: 'Appendix II — permit required' },
  { value: 'III',label: 'Appendix III — country-level control' },
  { value: 'no', label: 'Not CITES-listed' },
];

const ID_AVE_ES = ['Anilla cerrada', 'Anilla abierta', 'Microchip', 'Sin identificación'];
const ID_AVE_EN = ['Closed ring', 'Open ring', 'Microchip', 'No identification'];

const BirdFields = ({ data, onChange, locale }) => {
  const es = locale === 'es';
  const set = (campo) => (e) => onChange({ ...data, [campo]: e.target.value });
  const cites = es ? CITES_ES : CITES_EN;
  const tipos = es ? ID_AVE_ES : ID_AVE_EN;

  return (
    <div>
      {/* ── Identificación ── */}
      <p className="section-eyebrow" style={{ margin: '0 0 1rem', fontSize: '0.68rem', letterSpacing: '3px', color: 'var(--gold-deep)', fontWeight: 700, textTransform: 'uppercase' }}>
        {es ? 'Identificación' : 'Identification'}
      </p>

      <div className="form-group">
        <label className="input-label">{es ? 'Tipo de identificación' : 'Identification type'}</label>
        <select className="aura-input aura-select" value={data.idType || ''} onChange={set('idType')}>
          <option value="">{es ? 'Seleccionar…' : 'Select…'}</option>
          {tipos.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
        <p style={{ margin: '0.45rem 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          {es
            ? 'La anilla cerrada es la que se coloca en el nido y no puede quitarse sin cortarla: es la prueba de cría en cautividad.'
            : 'A closed ring is fitted in the nest and cannot be removed without cutting it: it is the proof of captive breeding.'}
        </p>
      </div>

      <div className="form-group">
        <label className="input-label">{es ? 'Número de anilla o microchip' : 'Ring or microchip number'}</label>
        <input className="aura-input" placeholder={es ? 'Código completo de la anilla' : 'Full ring code'}
          value={data.ringing || ''} onChange={set('ringing')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div className="form-group">
          <label className="input-label">{es ? 'Especie exacta' : 'Exact species'}</label>
          <input className="aura-input" placeholder={es ? 'Ej: Amazona aestiva' : 'e.g. Amazona aestiva'}
            value={data.scientificName || ''} onChange={set('scientificName')} />
        </div>
        <div className="form-group">
          <label className="input-label">{es ? 'Fecha de nacimiento' : 'Hatch date'}</label>
          <input type="date" className="aura-input" value={data.hatchDate || ''} onChange={set('hatchDate')} />
        </div>
      </div>

      {/* ── CITES ── */}
      <p className="section-eyebrow" style={{ margin: '2rem 0 1rem', fontSize: '0.68rem', letterSpacing: '3px', color: 'var(--gold-deep)', fontWeight: 700, textTransform: 'uppercase' }}>
        {es ? 'CITES y procedencia' : 'CITES and provenance'}
      </p>

      <div className="form-group">
        <label className="input-label">{es ? 'Apéndice CITES' : 'CITES appendix'}</label>
        <select className="aura-input aura-select" value={data.citesAppendix || ''} onChange={set('citesAppendix')}>
          {cites.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <p style={{ margin: '0.45rem 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          {es
            ? 'Casi todos los loros, guacamayos, cacatúas y agapornis están listados. Si dudas, consúltalo antes de comprar el billete.'
            : 'Nearly all parrots, macaws, cockatoos and lovebirds are listed. If unsure, check before booking the flight.'}
        </p>
      </div>

      <div className="form-group">
        <label className="input-label">{es ? 'Nº de certificado CITES' : 'CITES certificate number'}</label>
        <input className="aura-input" placeholder={es ? 'Certificado comunitario o permiso' : 'Community certificate or permit'}
          value={data.citesNumber || ''} onChange={set('citesNumber')} />
      </div>

      <div className="form-group">
        <label className="input-label">{es ? 'Criador o procedencia' : 'Breeder or provenance'}</label>
        <input className="aura-input" placeholder={es ? 'Nombre y nº de registro del criador' : 'Breeder name and registration no.'}
          value={data.breeder || ''} onChange={set('breeder')} />
      </div>

      {/* ── Salud y manejo ── */}
      <p className="section-eyebrow" style={{ margin: '2rem 0 1rem', fontSize: '0.68rem', letterSpacing: '3px', color: 'var(--gold-deep)', fontWeight: 700, textTransform: 'uppercase' }}>
        {es ? 'Salud y manejo' : 'Health and care'}
      </p>

      <div className="form-group">
        <label className="input-label">{es ? 'Inicio del ciclo de muda' : 'Moult cycle start'}</label>
        <input type="date" className="aura-input" value={data.featherCycle || ''} onChange={set('featherCycle')} />
      </div>

      <div className="form-group">
        <label className="input-label">{es ? 'Ciclo de canto' : 'Song cycle'}</label>
        <select className="aura-input aura-select" value={data.songCycle || ''} onChange={set('songCycle')}>
          <option value="">{es ? 'Seleccionar…' : 'Select…'}</option>
          {SONG_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{es ? o.es : o.en}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

/* ── Other/Special fields ── */
const OtherFields = ({ data, onChange, locale }) => {
  const handlePhoto = (e) =>
    readImageAsDataURL(e.target.files?.[0], (src) => onChange({ ...data, customPhoto: src }));

  return (
    <div>
      <div className="form-group">
        <label className="input-label">{locale==='es'?'Especie Personalizada':'Custom Species'}</label>
        <input className="aura-input"
          placeholder={locale==='es'?'Ej: Hurón, Erizo, Araña...':'E.g: Ferret, Hedgehog, Tarantula...'}
          value={data.customSpecies || ''}
          onChange={e => onChange({ ...data, customSpecies: e.target.value })} />
      </div>

      <div className="form-group">
        <label className="input-label">{locale==='es'?'Fotografía de Perfil':'Profile Photo'}</label>
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
          border: '1px dashed var(--aura-border-strong)', borderRadius: 4,
          padding: '2rem', cursor: 'pointer', transition: 'border-color 0.3s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor='var(--aura-gold)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='var(--aura-border-strong)'}
        >
          {data.customPhoto ? (
            <img src={data.customPhoto} alt="preview"
              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--aura-gold)' }} />
          ) : (
            <Upload size={28} color="var(--aura-gold)" />
          )}
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gold-ink)', fontWeight: 600 }}>
              {locale==='es'?'Subir Fotografía':'Upload Photo'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: 'var(--aura-text-muted)' }}>
              JPG, PNG — {locale==='es'?'máx 5MB':'max 5MB'}
            </p>
          </div>
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
        </label>
      </div>

      <div className="form-group">
        <label className="input-label">{locale==='es'?'Notas Especiales':'Special Notes'}</label>
        <textarea className="aura-input" rows={3}
          placeholder={locale==='es'?'Hábitat, dieta, cuidados especiales...':'Habitat, diet, special care...'}
          value={data.notes || ''}
          onChange={e => onChange({ ...data, notes: e.target.value })}
          style={{ resize: 'vertical', minHeight: 80 }} />
      </div>
    </div>
  );
};

/* ── Campo con ✓ cuando está relleno ── */
const FieldWrap = ({ filled, children }) => (
  <div style={{ position: 'relative' }}>
    {children}
    {filled && (
      <span style={{
        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
        color: '#2E9C7A', fontSize: '0.85rem', fontWeight: 700, pointerEvents: 'none',
        lineHeight: 1,
      }}>✓</span>
    )}
  </div>
);

/* ════════ Main Component ════════ */
const PetRegistration = ({ onSave, onCancel }) => {
  const { t, locale } = useTranslation();
  const [subTab, setSubTab] = useState('info');
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [basicData, setBasicData] = useState({ name: '', age: '', birthDate: '', weight: '', microchip: '', customPhoto: null });
  const [specificData, setSpecificData] = useState({});
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = carouselRef.current;
    if (!el) return;
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [checkScroll]);

  const scrollCarousel = (dir) => {
    carouselRef.current?.scrollBy({ left: dir * 110, behavior: 'smooth' });
  };

  const handleBasicPhoto = (e) =>
    readImageAsDataURL(e.target.files?.[0], (src) => setBasicData(prev => ({ ...prev, customPhoto: src })));
  const [saved, setSaved] = useState(false);
  const [falta, setFalta] = useState('');

  const speciesLabel = (sp) => locale === 'es' ? sp.label : sp.labelEn;

  /* Años cumplidos a partir de la fecha de nacimiento. Varias pantallas
     muestran la edad como número, así que se deriva en vez de pedirla dos veces. */
  const edadDesde = (fecha) => {
    if (!fecha) return '';
    const n = new Date(fecha);
    if (Number.isNaN(n.getTime())) return '';
    const hoy = new Date();
    let años = hoy.getFullYear() - n.getFullYear();
    const m = hoy.getMonth() - n.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) años -= 1;
    return años >= 0 ? String(años) : '';
  };

  const handleSave = () => {
    if (!selectedSpecies) {
      setFalta(locale === 'es'
        ? 'Elige primero la especie, en el carrusel de arriba.'
        : 'Choose the species first, in the carousel above.');
      return;
    }
    if (!basicData.name?.trim()) {
      setSubTab('info');
      setFalta(locale === 'es'
        ? 'Falta el nombre del animal. Está en la pestaña «Info General», el primer campo.'
        : 'The animal’s name is missing. It is in the “General Info” tab, the first field.');
      return;
    }
    setFalta('');
    const newPet = {
      species: selectedSpecies.id,
      speciesLabel: speciesLabel(selectedSpecies),
      avatar: selectedSpecies.emoji,
      customImage: basicData.customPhoto || specificData.customPhoto || null,
      ...basicData,
      age: edadDesde(basicData.birthDate) || basicData.age,
      specific: specificData,
    };
    setSaved(true);
    onSave(newPet); // save immediately — don't wait for animation
  };

  const specificTabLabel = () => {
    if (selectedSpecies?.id === 'horse') return locale==='es'?'Equino':'Equine';
    if (selectedSpecies?.id === 'exotic') return locale==='es'?'Hábitat':'Habitat';
    if (selectedSpecies?.id === 'bird')  return locale==='es'?'Ave':'Bird';
    if (selectedSpecies?.id === 'rabbit') return locale==='es'?'Conejo':'Rabbit';
    if (selectedSpecies?.id === 'ferret') return locale==='es'?'Hurón':'Ferret';
    if (selectedSpecies?.id === 'other') return locale==='es'?'Especial':'Special';
    return locale==='es'?'Específico':'Specific';
  };

  /* Success screen */
  if (saved) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1.5rem' }}>
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200 }}>
        <CheckCircle2 size={72} color="var(--aura-neon-cyan)" style={{ filter:'drop-shadow(0 0 20px rgba(67, 191, 199, 0.5))' }} />
      </motion.div>
      <h2 style={{ color:'var(--cyan-ink)' }}>{locale==='es'?'Miembro Registrado':'Member Registered'}</h2>
      <p style={{ color:'var(--aura-text-muted)', textAlign:'center' }}>
        {locale==='es'?'Añadido a tu Expediente Médico AURA con encriptación AES-256.':'Added to your AURA Medical Record with AES-256 encryption.'}
      </p>
    </div>
  );

  return (
    <motion.div className="fade-in" style={{ maxWidth:580, margin:'0 auto', padding:'2rem 0 8rem' }}>
      <h1 className="luxury-title" style={{ fontSize:'2.4rem', textAlign:'center', marginBottom:'0.5rem' }}>
        {locale==='es'?'Registro de Mascota':'Pet Registration'}
      </h1>
      <p style={{ textAlign:'center', color:'var(--aura-text-muted)', fontSize:'0.75rem', letterSpacing:'3px', marginBottom:'2.5rem' }}>
        EXPEDIENTE MÉDICO DIGITAL
      </p>

      {/* ── Species selector ── */}
      <div className="aura-card aura-card--bloom" style={{ marginBottom:'1.5rem', position:'relative' }}>
        {REG_PAWS.map((h, i) => (
          <PawPrint key={`p${i}`} size={h.size}
            style={{
              position:'absolute', top:h.top, left:h.left, right:h.right, bottom:h.bottom,
              color:h.color, opacity:h.opacity, transform:`rotate(${h.rot}deg)`,
              pointerEvents:'none', zIndex:0,
            }} />
        ))}
        <label className="input-label" style={{ textAlign:'center', display:'block', marginBottom:'1.2rem' }}>
          {locale==='es'?'Seleccionar Especie':'Select Species'}
        </label>

        {/* Carousel wrapper — relative so arrows can be positioned over it */}
        <div style={{ position:'relative' }}>

          {/* Left fade + arrow */}
          {canScrollLeft && (
            <>
              <div style={{
                position:'absolute', left:0, top:0, bottom:'1rem', width:48,
                background:'linear-gradient(to right, var(--aura-glass) 40%, transparent)',
                pointerEvents:'none', zIndex:2,
              }} />
              <button onClick={() => scrollCarousel(-1)} style={{
                position:'absolute', left:0, top:'50%', transform:'translateY(-60%)',
                zIndex:3, background:'transparent', border:'none', cursor:'pointer',
                color:'#B8862C', fontSize:'1.6rem', lineHeight:1, padding:'0 4px',
                textShadow:'0 0 10px rgba(184, 134, 44, 0.9)',
              }}>‹</button>
            </>
          )}

          {/* Right fade + arrow */}
          {canScrollRight && (
            <>
              <div style={{
                position:'absolute', right:0, top:0, bottom:'1rem', width:48,
                background:'linear-gradient(to left, var(--aura-glass) 40%, transparent)',
                pointerEvents:'none', zIndex:2,
              }} />
              <button onClick={() => scrollCarousel(1)} style={{
                position:'absolute', right:0, top:'50%', transform:'translateY(-60%)',
                zIndex:3, background:'transparent', border:'none', cursor:'pointer',
                color:'#B8862C', fontSize:'1.6rem', lineHeight:1, padding:'0 4px',
                textShadow:'0 0 10px rgba(184, 134, 44, 0.9)',
              }}>›</button>
            </>
          )}

          {/* Scrollable row */}
          <div className="species-selector" ref={carouselRef} onScroll={checkScroll}>
            {SPECIES.map(sp => {
              const isSelected = selectedSpecies?.id === sp.id;
              return sp.isOther ? (
                <div key={sp.id}
                  onClick={() => { setSelectedSpecies(sp); setSpecificData({}); setSubTab('specific'); }}
                  style={{
                    flexShrink: 0, width: 100, height: 100,
                    border: isSelected ? '2px solid var(--violet)' : '1px solid var(--border)',
                    borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 5, background: isSelected ? 'rgba(217, 164, 65, 0.1)' : 'var(--bg-card-solid)',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 12px rgba(217, 164, 65, 0.4)' : 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  <PlusCircle size={24} color="var(--aura-gold)" strokeWidth={1.5} />
                  <span style={{ fontSize:'0.48rem', letterSpacing:'1px', color:'#B8862C', textTransform:'uppercase', textAlign:'center', lineHeight:1.2, padding:'0 6px', fontWeight:700, textShadow:'0 0 8px rgba(184, 134, 44, 0.5)' }}>
                    {locale === 'es' ? 'OTRA' : 'OTHER'}
                  </span>
                </div>
              ) : (
                <div key={sp.id}
                  className={`species-card${isSelected ? ' selected' : ''}`}
                  onClick={() => {
                    setSelectedSpecies(sp);
                    setSpecificData({});
                    const hasSpecific = ['horse','bird','rabbit','exotic'].includes(sp.id);
                    setSubTab(hasSpecific ? 'specific' : 'info');
                  }}
                >
                  {sp.img ? (
                    <img
                      src={sp.img}
                      alt={locale === 'es' ? sp.label : sp.labelEn}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: sp.id === 'exotic' ? '58% 60%' : 'center', display: 'block' }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'clamp(2.4rem, 7vw, 3.4rem)', lineHeight: 1,
                        background: `linear-gradient(145deg, ${accentFor({ species: sp.id }).soft}, rgba(255,255,255,0.9))`,
                      }}
                    >
                      {sp.emoji}
                    </div>
                  )}
                  {isSelected && (
                    <div className="species-check">✓ {locale==='es'?'Seleccionado':'Selected'}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div style={{ display:'flex', justifyContent:'center', gap:'6px', marginTop:'0.8rem' }}>
            {SPECIES.map((_, i) => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(217, 164, 65, 0.3)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
        </div>

        {selectedSpecies && (
          <p style={{ margin:'0.8rem 0 0', fontSize:'0.72rem', letterSpacing:'2px', color:'#B8862C', textTransform:'uppercase', textAlign:'center', textShadow:'0 0 10px rgba(184, 134, 44, 0.5)' }}>
            {speciesLabel(selectedSpecies)} {locale==='es'?'seleccionado':'selected'}
          </p>
        )}
      </div>

      {/* ── Info / Specific tabs ── */}
      <div className="aura-card aura-card--bloom" style={{ marginBottom:'1.5rem', position:'relative' }}>
        {REG_PAWS.map((h, i) => (
          <PawPrint key={`p${i}`} size={h.size}
            style={{
              position:'absolute', top:h.top, left:h.left, right:h.right, bottom:h.bottom,
              color:h.color, opacity:h.opacity, transform:`rotate(${h.rot}deg)`,
              pointerEvents:'none', zIndex:0,
            }} />
        ))}
        <SubTabs
          tabs={[
            { id:'info',     label: locale==='es'?'Info General':'General Info' },
            { id:'specific', label: specificTabLabel() },
          ]}
          active={subTab}
          onChange={setSubTab}
        />

        <AnimatePresence mode="wait">
          {subTab === 'info' ? (
            <motion.div key="info" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}>
              {/* ── Photo + fields side by side ── */}
              <div style={{ display:'grid', gridTemplateColumns:'96px 1fr', gap:'1.4rem', alignItems:'start', marginBottom:'1rem' }}>
                {/* Photo circle */}
                <label style={{ cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
                  <div style={{
                    width:96, height:96, borderRadius:'18px', overflow:'hidden',
                    border: basicData.customPhoto ? '2px solid var(--violet)' : '2px dashed rgba(139, 92, 246, 0.35)',
                    background: basicData.customPhoto ? 'transparent' : 'linear-gradient(140deg, rgba(201,189,242,0.30), rgba(165,227,220,0.30))',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'border-color 0.3s, box-shadow 0.3s',
                    boxShadow: basicData.customPhoto ? '0 6px 18px -8px rgba(139, 92, 246, 0.45)' : 'none',
                  }}>
                    {basicData.customPhoto
                      ? <img src={basicData.customPhoto} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <Upload size={22} color="var(--violet)" />}
                  </div>
                  <span style={{ fontSize:'0.58rem', letterSpacing:'1px', color:'var(--aura-text-muted)', textTransform:'uppercase' }}>
                    {locale==='es'?'Foto':'Photo'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleBasicPhoto} style={{ display:'none' }} />
                </label>

                {/* Name + Breed/Notes stacked */}
                <div>
                  <div className="form-group">
                    <label className="input-label">{locale==='es'?'Nombre del Miembro':'Member Name'}</label>
                    <FieldWrap filled={!!basicData.name}>
                      <input className="aura-input"
                        placeholder={locale==='es'?'Nombre de tu mascota':"Your pet's name"}
                        value={basicData.name}
                        onChange={e => { setBasicData({...basicData, name:e.target.value}); if (falta) setFalta(''); }} />
                    </FieldWrap>
                  </div>
                  <div className="form-group">
                    <label className="input-label">{locale==='es'?'Raza / Variedad':'Breed / Variety'}</label>
                    <FieldWrap filled={!!basicData.breed}>
                      <input className="aura-input"
                        placeholder={locale==='es'?'Ej: Golden Retriever':'E.g: Golden Retriever'}
                        value={basicData.breed || ''}
                        onChange={e => setBasicData({...basicData, breed:e.target.value})} />
                    </FieldWrap>
                  </div>
                </div>
              </div>

              {/* ── Metrics row ── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.8rem' }}>
                <div className="form-group">
                  <label className="input-label">{locale==='es'?'Fecha de nacimiento':'Date of birth'}</label>
                  <FieldWrap filled={!!basicData.birthDate}>
                    <input type="date" className="aura-input" max={new Date().toISOString().slice(0,10)}
                      value={basicData.birthDate} onChange={e => setBasicData({...basicData, birthDate:e.target.value})} />
                  </FieldWrap>
                </div>
                <div className="form-group">
                  <label className="input-label">{locale==='es'?'Peso':'Weight'}</label>
                  <FieldWrap filled={!!basicData.weight}>
                    <input className="aura-input" placeholder="kg"
                      value={basicData.weight} onChange={e => setBasicData({...basicData, weight:e.target.value})} />
                  </FieldWrap>
                </div>
                <div className="form-group">
                  <label className="input-label">
                    {selectedSpecies?.id === 'bird'
                      ? (locale === 'es' ? 'Anilla / microchip' : 'Ring / microchip')
                      : 'Microchip'}
                  </label>
                  <FieldWrap filled={!!basicData.microchip}>
                    <input className="aura-input" placeholder="900XXXXXXXXX"
                      value={basicData.microchip} onChange={e => setBasicData({...basicData, microchip:e.target.value})} />
                  </FieldWrap>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="specific" initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }}>
              {selectedSpecies?.id === 'horse'  && <HorseFields  data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'exotic' && <ExoticFields data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'bird'   && <BirdFields   data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'rabbit' && <RabbitFields data={specificData} onChange={setSpecificData} locale={locale} />}
              {selectedSpecies?.id === 'other'  && <OtherFields  data={specificData} onChange={setSpecificData} locale={locale} />}
              {(!selectedSpecies || ['dog','cat','ferret'].includes(selectedSpecies?.id)) && (
                <p style={{ color:'var(--aura-text-muted)', textAlign:'center', padding:'2rem 0', fontSize:'0.85rem', lineHeight:1.6 }}>
                  {locale==='es'
                    ? 'Perros, gatos y hurones no necesitan campos adicionales: viajan bajo el mismo régimen europeo y su ficha general ya está completa.'
                    : 'Dogs, cats and ferrets need no extra fields: they travel under the same EU scheme and their general record is already complete.'}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Shield banner ── */}
      <div className="shield-banner" style={{ marginBottom:'1.5rem' }}>
        <div className="shield-icon"><Shield size={22} /></div>
        <div className="shield-text">
          <h4>Escudo AURA: {locale==='es'?'Encriptación AES-256 Activa':'AES-256 Encryption Active'}</h4>
          <p>{locale==='es'?'Tus datos están protegidos bajo HIPAA/GDPR':'Your data is protected under HIPAA/GDPR'}</p>
        </div>
      </div>

      {/* ── Footer de marca ── */}
      <p style={{ textAlign:'center', fontSize:'0.58rem', letterSpacing:'1.5px', color:'var(--aura-text-muted)', margin:'0 0 1rem', opacity: 0.68 }}>
        AURA PETS GLOBAL · EXPEDIENTE MÉDICO DIGITAL
      </p>

      {/* ── Actions ── */}
      <div style={{ display:'flex', gap:'1rem' }}>
        <button className="btn-aura btn-ghost" style={{ flex:1 }} onClick={onCancel}>{t('common.cancel')}</button>
        <button
          className="btn-aura"
          style={{
            flex:2,
            opacity: selectedSpecies && basicData.name ? 1 : 0.62,
          }}
          onClick={handleSave}
        >
          {locale==='es'?'CONFIRMAR REGISTRO':'CONFIRM REGISTRATION'}
        </button>
      </div>

      {falta && (
        <p role="alert" style={{
          margin:'0.9rem 0 0', padding:'0.7rem 0.9rem',
          borderLeft:'3px solid var(--warn)', background:'rgba(240, 167, 60, 0.10)',
          borderRadius:'0 8px 8px 0', fontSize:'0.78rem', lineHeight:1.6,
          color:'var(--ink-body)',
        }}>
          {falta}
        </p>
      )}
    </motion.div>
  );
};

export default PetRegistration;
