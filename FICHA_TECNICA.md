# FICHA TÉCNICA — AURA Pets / TECHNICAL SPECIFICATION — AURA Pets

<div align="center">
  <strong>Versión / Version:</strong> 1.0.0 &nbsp;·&nbsp;
  <strong>Fecha / Date:</strong> Abril 2026 &nbsp;·&nbsp;
  <strong>Autor / Author:</strong> Rodigital Advance
</div>

---

## ESPAÑOL

### 1. Descripción General

**AURA Pets** es una aplicación web de página única (SPA) para la gestión premium del expediente médico y sanitario de mascotas. Su principio fundamental es la **soberanía del dato**: toda la información se almacena localmente en el dispositivo del usuario mediante LocalStorage cifrado, sin transmisión a servidores externos.

La aplicación está orientada a propietarios de mascotas que requieren un nivel de organización y documentación equivalente al de un expediente médico humano, con soporte para viajes internacionales, situaciones de emergencia y cumplimiento normativo GDPR/LOPD.

---

### 2. Stack Tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 19.2.4 | Framework principal SPA |
| Vite | 8.0.4 | Bundler y servidor de desarrollo |
| React Router DOM | 7.14.0 | Navegación cliente (HashRouter) |
| Framer Motion | 12.38.0 | Animaciones y transiciones |
| Lucide React | 1.8.0 | Sistema de iconografía |
| jsPDF | 4.2.1 | Generación de documentos PDF |
| QRCode React | 4.2.0 | Códigos QR de emergencia |
| Recharts | 3.8.1 | Gráficas de vitales y rendimiento |
| LocalStorage API | nativa | Persistencia de datos local |
| HuggingFace Spaces | static | Despliegue y hosting público |

---

### 3. Arquitectura

```
┌─────────────────────────────────────────────┐
│                  AURA Pets SPA               │
│                                             │
│  ┌──────────┐   ┌──────────┐   ┌─────────┐ │
│  │   Auth   │──▶│   App    │──▶│ Routes  │ │
│  │ Context  │   │ Content  │   │         │ │
│  └──────────┘   └──────────┘   └─────────┘ │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │          LocalStorage Layer          │   │
│  │  aura_{userId}_pets · aura_users     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Flujo de estado principal:**
- `activePetId` en App.jsx como única fuente de verdad para la mascota activa
- Contexto `AuthContext` gestiona sesión, expiración automática y renovación
- Contexto `LocalizationContext` gestiona idioma (ES/EN) y divisa de referencia

---

### 4. Módulos Funcionales

#### 4.1 Dashboard
- Carrusel de medallones (64px, glow dorado) para cambio instantáneo entre mascotas
- Bio-ring con foto, especie, edad, peso y microchip
- Historial de vitales con gráfica de líneas (Recharts)
- Indicador de estado BUSCANDO animado (pulso) para mascotas extraviadas
- Acceso directo al editor de perfil y protocolo de baja

#### 4.2 Pasaporte Sanitario Global
- Requisitos de entrada para 5 destinos: España, Reino Unido, EE.UU., Canadá, Australia
- Cálculo de disponibilidad en % basado en datos reales de la mascota
- Formulario editable: microchip ISO, vacuna antirrábica, certificado sanitario
- Subida del pasaporte físico (PDF/JPG) con custodia local
- El pasaporte físico subido actualiza automáticamente el estado a OK y lleva la disponibilidad al 100%
- Exportación PDF de requisitos por destino (ventana de impresión del navegador)
- Enlace a política de privacidad desde cada nombre de destino, con idioma sincronizado

#### 4.3 Modo SOS
- Geolocalización en tiempo real (Geolocation API del navegador)
- Código QR con ficha de emergencia completa de la mascota activa
- Panel de cambio de miembro activo sin re-montar el componente (mantiene GPS activo)
- Visualización de alertas médicas y contactos de emergencia configurables

#### 4.4 Registro de Mascota
- Selección de especie con tarjetas circulares animadas (perro, gato, ave, reptil, conejo, otra)
- Formulario en 2 columnas: foto circular + campos de datos
- Campos específicos por especie (aves: tipo de canto)
- Foto de perfil mediante subida de archivo con previsualización

#### 4.5 Editor de Perfil y Protocolo de Baja
- Edición completa del perfil: foto, datos básicos, alertas médicas, contactos de emergencia
- **Protocolo de baja tripartito:**
  - *Extravío:* marca estado `BUSCANDO`, no elimina datos
  - *Fallecimiento:* genera PDF Memorial → confirmación `BAJA` → eliminación
  - *Baja del Servicio:* confirmación `BAJA` → eliminación permanente

#### 4.6 Privacy Vault
- Exportación del expediente completo en JSON (portabilidad GDPR Art. 20)
- Exportación del expediente en PDF premium con diseño jsPDF
- Destrucción permanente de datos con doble confirmación por palabra clave
- Estado de cifrado AES-256 en tiempo real
- Enlace a política de privacidad completa (ES/EN)

#### 4.7 Onboarding
- Flujo de bienvenida en 3 pasos para nuevos usuarios
- Se ejecuta una única vez por cuenta (marcado en LocalStorage)

#### 4.8 Recuperación de Acceso
- Flujo de recuperación de contraseña con verificación por nombre de mascota registrada
- Ruta pública `/recuperar-acceso` accesible sin sesión activa

---

### 5. Sistema de Diseño

El design system **AURA** está definido en `src/index.css` mediante variables CSS:

| Variable | Valor | Uso |
|----------|-------|-----|
| `--aura-black` | `#080808` | Fondo principal |
| `--aura-card` | `#111117` | Fondo de tarjetas |
| `--aura-gold` | `#d4af37` | Color de acento primario |
| `--aura-neon-cyan` | `#00f5ff` | Estado OK / activo |
| `--aura-neon-pink` | `#ff0050` | Estado alerta / SOS |
| `--aura-border` | `rgba(255,255,255,0.07)` | Bordes sutiles |

**Estética:** lujo oscuro tipo "expediente confidencial premium" con tipografía sans-serif monoespaciada para datos clínicos.

---

### 6. Seguridad y Privacidad

- **Almacenamiento exclusivamente local** — sin API externa ni base de datos propia
- **Sin cookies de rastreo** — solo LocalStorage técnico necesario
- **Destrucción certificada** — eliminación por clave de confirmación `BAJA` / `ELIMINAR`
- **Sesión con expiración automática** — modal de aviso con opción de renovación
- **Política de privacidad** bilingüe accesible en `/politicas.html`
- **Cumplimiento:** GDPR (Reglamento UE 2016/679) y LOPD-GDD (Ley Orgánica 3/2018)

---

### 7. Internacionalización

- Idiomas: **Español** (por defecto) y **English**
- Detección automática por idioma del navegador
- Toggle manual visible en navegación desktop y barra móvil
- Divisas de referencia seleccionables: EUR, USD, GBP, AUD
- Configuración persistida en LocalStorage

---

### 8. Despliegue

| Entorno | Plataforma | URL |
|---------|-----------|-----|
| Producción | HuggingFace Spaces (static) | https://rociogf-aura-pets-final.static.hf.space |
| Código fuente | GitHub | https://github.com/Rodigitaladvance/mascotas |

---

### 9. Comandos de Desarrollo

```bash
npm run dev       # Servidor local en http://localhost:5173
npm run build     # Build de producción en /dist
npm run preview   # Vista previa del build
npm run lint      # Análisis estático ESLint
```

---

---

## ENGLISH

### 1. Overview

**AURA Pets** is a premium single-page web application (SPA) for managing pet medical and health records. Its core principle is **data sovereignty**: all information is stored locally on the user's device via encrypted LocalStorage, with no transmission to external servers.

The application targets pet owners who require a level of organization and documentation equivalent to a human medical record, with support for international travel, emergency situations, and GDPR/LOPD regulatory compliance.

---

### 2. Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.4 | Core SPA framework |
| Vite | 8.0.4 | Bundler and dev server |
| React Router DOM | 7.14.0 | Client-side navigation (HashRouter) |
| Framer Motion | 12.38.0 | Animations and transitions |
| Lucide React | 1.8.0 | Iconography system |
| jsPDF | 4.2.1 | PDF document generation |
| QRCode React | 4.2.0 | Emergency QR codes |
| Recharts | 3.8.1 | Vitals and performance charts |
| LocalStorage API | native | Local data persistence |
| HuggingFace Spaces | static | Public deployment and hosting |

---

### 3. Architecture

```
┌─────────────────────────────────────────────┐
│                  AURA Pets SPA               │
│                                             │
│  ┌──────────┐   ┌──────────┐   ┌─────────┐ │
│  │   Auth   │──▶│   App    │──▶│ Routes  │ │
│  │ Context  │   │ Content  │   │         │ │
│  └──────────┘   └──────────┘   └─────────┘ │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │          LocalStorage Layer          │   │
│  │  aura_{userId}_pets · aura_users     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Core state flow:**
- `activePetId` in App.jsx as single source of truth for the active pet
- `AuthContext` manages session, automatic expiry, and renewal
- `LocalizationContext` manages language (ES/EN) and reference currency

---

### 4. Feature Modules

#### 4.1 Dashboard
- Medallion carousel (64px, gold glow) for instant switching between pets
- Bio-ring showing photo, species, age, weight, and microchip
- Vitals history with line chart (Recharts)
- Animated SEARCHING pulse badge for lost pets
- Direct access to profile editor and deregistration protocol

#### 4.2 Global Sanitary Passport
- Entry requirements for 5 destinations: Spain, UK, USA, Canada, Australia
- Readiness % calculated from real pet data
- Editable form: ISO microchip, rabies vaccine, health certificate
- Physical passport upload (PDF/JPG) with local custody
- Uploaded physical passport auto-updates status to OK and pushes readiness to 100%
- PDF export of requirements per destination (browser print window)
- Privacy policy link from each destination name, with synchronized language

#### 4.3 SOS Mode
- Real-time geolocation (browser Geolocation API)
- QR code with complete emergency record for the active pet
- Active member switcher panel without re-mounting (keeps GPS active)
- Configurable medical alerts and emergency contacts

#### 4.4 Pet Registration
- Species selection with animated circular cards (dog, cat, bird, reptile, rabbit, other)
- 2-column form layout: circular photo + data fields
- Species-specific fields (birds: song type)
- Profile photo via file upload with preview

#### 4.5 Profile Editor & Deregistration Protocol
- Full profile editing: photo, basic data, medical alerts, emergency contacts
- **Three-way deregistration protocol:**
  - *Lost:* marks status `BUSCANDO` (SEARCHING), data preserved
  - *Deceased:* generates Memorial PDF → `BAJA` keyword confirmation → deletion
  - *Service Cancellation:* `BAJA` keyword confirmation → permanent deletion

#### 4.6 Privacy Vault
- Full record export as JSON (GDPR Art. 20 portability)
- Premium PDF record export with jsPDF design
- Permanent data destruction with double keyword confirmation
- Real-time AES-256 encryption status display
- Full privacy policy link (ES/EN)

#### 4.7 Onboarding
- 3-step welcome flow for new users
- Runs once per account (flagged in LocalStorage)

#### 4.8 Password Recovery
- Password recovery flow with verification via registered pet name
- Public route `/recuperar-acceso` accessible without active session

---

### 5. Design System

The **AURA** design system is defined in `src/index.css` via CSS variables:

| Variable | Value | Use |
|----------|-------|-----|
| `--aura-black` | `#080808` | Main background |
| `--aura-card` | `#111117` | Card backgrounds |
| `--aura-gold` | `#d4af37` | Primary accent color |
| `--aura-neon-cyan` | `#00f5ff` | OK / active state |
| `--aura-neon-pink` | `#ff0050` | Alert / SOS state |
| `--aura-border` | `rgba(255,255,255,0.07)` | Subtle borders |

**Aesthetic:** dark luxury "premium confidential record" with monospaced sans-serif typography for clinical data.

---

### 6. Security & Privacy

- **Exclusively local storage** — no external API or proprietary database
- **No tracking cookies** — only necessary technical LocalStorage
- **Certified destruction** — deletion via confirmation keywords `BAJA` / `ELIMINAR`
- **Session with automatic expiry** — warning modal with renewal option
- **Privacy policy** bilingual, accessible at `/politicas.html`
- **Compliance:** GDPR (EU Regulation 2016/679) and LOPD-GDD (Organic Law 3/2018, Spain)

---

### 7. Internationalization

- Languages: **Spanish** (default) and **English**
- Automatic detection from browser language
- Manual toggle visible in desktop navigation and mobile tab bar
- Selectable reference currencies: EUR, USD, GBP, AUD
- Settings persisted in LocalStorage

---

### 8. Deployment

| Environment | Platform | URL |
|-------------|---------|-----|
| Production | HuggingFace Spaces (static) | https://rociogf-aura-pets-final.static.hf.space |
| Source code | GitHub | https://github.com/Rodigitaladvance/mascotas |

---

### 9. Development Commands

```bash
npm run dev       # Local server at http://localhost:5173
npm run build     # Production build output to /dist
npm run preview   # Preview the production build
npm run lint      # ESLint static analysis
```

---

<div align="center">
  <sub>© 2026 Rodigital Advance · AURA Pets · All rights reserved</sub>
</div>
