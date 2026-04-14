# FICHA TÉCNICA DE CERTIFICACIÓN
# OFFICIAL CERTIFICATION TECHNICAL SHEET

---

<div align="center">

**AURA Pets — Global Health Passport**

| | |
|---|---|
| **Versión / Version** | 1.0.0 |
| **Fecha de emisión / Issue date** | 2026-04-14 |
| **Empresa / Company** | Rodigital Advance |
| **Clasificación / Classification** | Documento Oficial de Certificación / Official Certification Document |
| **Producción / Production** | https://rociogf-aura-pets-final.static.hf.space |
| **Repositorio / Repository** | https://github.com/Rodigitaladvance/mascotas |

</div>

---

## 1. Identificación / Identification

**ES:** AURA Pets — Global Health Passport es una aplicación web de expediente médico premium para mascotas, diseñada para propietarios que requieren documentación veterinaria de nivel profesional con soporte para viajes internacionales, emergencias y cumplimiento normativo.

**EN:** AURA Pets — Global Health Passport is a premium pet medical records web application, designed for owners who require professional-grade veterinary documentation with support for international travel, emergencies, and regulatory compliance.

---

## 2. Arquitectura / Architecture

**ES:** Aplicación web estática de página única (_Static Single-Page Application / SPA_) desarrollada en **React 19** y compilada con **Vite 6**. No existe backend propio ni base de datos remota. Toda la lógica de negocio, el cifrado y el almacenamiento de datos se ejecutan exclusivamente en el dispositivo del usuario (_client-side only_). El enrutamiento opera mediante _HashRouter_ para compatibilidad total con alojamiento estático.

**EN:** Static Single-Page Application (SPA) built with **React 19** and compiled with **Vite 6**. There is no proprietary backend or remote database. All business logic, encryption, and data storage run exclusively on the user's device (client-side only). Routing uses _HashRouter_ for full compatibility with static hosting.

```
┌──────────────────────────────────────────────────────────────┐
│                    NAVEGADOR / BROWSER                        │
│                                                              │
│   React 19 (SPA)  →  Web Crypto API  →  localStorage        │
│   Framer Motion       SHA-256 hash       Vault scoped        │
│   React Router        AES-256 data       per-user keys       │
│                                                              │
│          ❌  NINGÚN DATO SALE DEL DISPOSITIVO                │
│          ❌  NO DATA LEAVES THE DEVICE                       │
└──────────────────────────────────────────────────────────────┘
                │ Static files only
                ▼
     HuggingFace Spaces (CDN estático / static CDN)
```

### Stack Tecnológico / Technology Stack

| Tecnología / Technology | Versión | Función / Role |
|---|---|---|
| React | 19.2.4 | Framework UI principal / Core UI framework |
| Vite | 8.0.4 | Bundler y compilación / Bundler & build |
| React Router DOM | 7.14.0 | Enrutamiento cliente / Client-side routing |
| Framer Motion | 12.38.0 | Animaciones / Animations |
| Recharts | 3.8.1 | Gráficas de vitales / Vitals charts |
| qrcode.react | 4.2.0 | QR de emergencia / Emergency QR |
| jsPDF | 4.2.1 | Generación PDF / PDF generation |
| Lucide React | 1.8.0 | Iconografía / Icons |
| Web Crypto API | Nativa / Native | Cifrado SHA-256 y AES-256 / Encryption |
| Google Fonts | CDN | Playfair Display + Inter |
| HuggingFace Spaces | Static | Hosting y CDN / Hosting & CDN |

---

## 3. Seguridad / Security

### 3.1 Arquitectura Zero-Knowledge

**ES:** AURA Pets implementa una política de **conocimiento cero** (_Zero-Knowledge Architecture_): los datos personales y sanitarios **nunca se transmiten a ningún servidor externo**. Una vez cargada la aplicación, no se produce ninguna comunicación de red con los datos del usuario. No existen cookies de rastreo, telemetría ni análisis de comportamiento.

**EN:** AURA Pets implements a **Zero-Knowledge Architecture**: personal and health data **is never transmitted to any external server**. Once the application is loaded, no network communication involving user data occurs. There are no tracking cookies, telemetry, or behavioral analytics.

### 3.2 Cifrado de Contraseñas / Password Hashing

Las contraseñas se hashean con **SHA-256** mediante la **Web Crypto API** nativa del navegador (`crypto.subtle.digest`), con sal estática. El hash resultante se persiste en `localStorage`; la contraseña en texto plano **nunca se almacena**.

Passwords are hashed with **SHA-256** via the browser's native **Web Crypto API** (`crypto.subtle.digest`), with a static salt. The resulting hash is persisted in `localStorage`; the plain-text password **is never stored**.

```javascript
// src/utils/vault.js
const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
```

### 3.3 Cifrado de Datos AES-256 / AES-256 Data Encryption

Los expedientes médicos, documentos sanitarios y datos de mascotas se protegen bajo el estándar **AES-256** con aislamiento multi-tenant. Cada usuario dispone de un espacio de bóveda independiente identificado por clave compuesta:

Medical records, health documents, and pet data are protected under the **AES-256** standard with multi-tenant isolation. Each user has an independent vault identified by a composite key:

```
vault_[userId]_pets          →  Expedientes de mascotas / Pet records
vault_[userId]_docs_[petId]  →  Documentos adjuntos / Attached documents
mascota_health_users         →  Hashes de contraseña / Password hashes
```

Sin credenciales válidas y sesión activa, los datos cifrados son computacionalmente ilegibles.  
Without valid credentials and an active session, the encrypted data is computationally unreadable.

### 3.4 Gestión de Sesiones / Session Management

| Parámetro / Parameter | Valor / Value |
|---|---|
| Duración máxima / Max duration | 2 horas / 2 hours |
| Alerta de expiración / Expiry alert | Modal con renovación opcional / Modal with optional renewal |
| Cierre automático / Auto logout | Al expirar / On timeout |
| Persistencia de sesión / Session persistence | No — login por sesión / No — per-session login required |

### 3.5 Destrucción Certificada de Datos / Certified Data Destruction

La eliminación permanente requiere doble confirmación por palabra clave (`BAJA` / `ELIMINAR`), cumpliendo el protocolo técnico del derecho al olvido GDPR Art. 17.

Permanent deletion requires double keyword confirmation (`BAJA` / `ELIMINAR`), fulfilling the technical protocol for the GDPR Art. 17 right to erasure.

---

## 4. Privacidad y Cumplimiento Normativo / Privacy & Regulatory Compliance

La política de privacidad completa, bilingüe (ES/EN), está disponible en:  
The full bilingual (ES/EN) privacy policy is available at:

> **`[base_url]/politicas.html`**

### 4.1 GDPR — Reglamento General de Protección de Datos (UE 2016/679)

| Artículo / Article | Derecho / Right | Implementación / Implementation |
|---|---|---|
| Art. 17 | Derecho al olvido / Right to erasure | Eliminación permanente con doble confirmación en PrivacyVault |
| Art. 20 | Portabilidad / Data portability | Exportación completa en JSON desde PrivacyVault |
| Art. 25 | Privacidad por diseño / Privacy by design | Arquitectura Zero-Knowledge sin datos en servidores |
| Art. 32 | Seguridad del tratamiento / Security of processing | AES-256 + SHA-256 hash; sesión con TTL |

### 4.2 CCPA — California Consumer Privacy Act (Cal. Civ. Code § 1798.100)

| Derecho / Right | Estado / Status |
|---|---|
| Derecho a saber / Right to know | ✅ Exportación JSON disponible en todo momento / JSON export always available |
| Derecho a eliminar / Right to delete | ✅ Eliminación permanente con doble confirmación / Permanent deletion with double confirmation |
| Derecho a no vender / Right to opt-out of sale | ✅ No se venden ni transfieren datos — arquitectura sin servidor / No data sold or transferred — serverless architecture |
| No discriminación / Non-discrimination | ✅ Servicio idéntico independientemente del ejercicio de derechos / Identical service regardless of rights exercise |

### 4.3 LOPD-GDD — Ley Orgánica 3/2018 (España)

Cumplimiento alineado con GDPR. El tratamiento de datos de salud animal se realiza exclusivamente en el dispositivo del titular, sin cesión a terceros.

Compliance aligned with GDPR. Animal health data is processed exclusively on the data subject's device, with no transfer to third parties.

---

## 5. Funcionalidades Principales / Core Features

### 5.1 Pasaporte Sanitario Global / Global Sanitary Passport

**ES:** Genera un pasaporte sanitario oficial personalizado por país de destino. Un motor de reglas evalúa el expediente médico del animal frente a los requisitos oficiales de cada país y devuelve un índice de preparación con lista de acciones pendientes. Exportación en PDF compatible con iOS Safari y Android Chrome.

**EN:** Generates an official health passport customised per destination country. A rules engine evaluates the animal's medical record against each country's official requirements and returns a readiness score with a list of pending actions. PDF export compatible with iOS Safari and Android Chrome.

| Destino / Destination | Requisitos clave / Key requirements |
|---|---|
| 🇪🇸 España / Spain | Microchip ISO, vacuna antirrábica, certificado TRACES |
| 🇬🇧 Reino Unido / UK | Microchip ISO 15 dígitos, antirrábica, tratamiento tapeworm |
| 🇺🇸 Estados Unidos / USA | Certificado sanitario USDA-endorsed, antirrábica |
| 🇨🇦 Canadá / Canada | Permiso de importación CFIA, microchip, historial vacunal |
| 🇦🇺 Australia | Permiso DAWR, cuarentena 6 meses, certificado libre de rabia |

### 5.2 Selector de Especies / Species Selector

**ES:** Carrusel horizontal con scroll táctil nativo, flechas de navegación doradas, degradados de opacidad en los extremos y puntos indicadores de posición. Seis categorías con campos específicos por especie y formularios dinámicos.

**EN:** Horizontal carousel with native touch scroll, golden navigation arrows, edge opacity fades, and position indicator dots. Six categories with species-specific fields and dynamic forms.

| Especie / Species | Campos específicos / Specific fields |
|---|---|
| 🐕 Perro / Dog | Datos básicos, vacunas, microchip |
| 🐈 Gato / Cat | Datos básicos, vacunas, microchip |
| 🐴 Caballo / Horse | Último herrador, competición deportiva, número REGA |
| 🦎 Exótico / Exotic | Temperatura de hábitat, humedad, estado de muda |
| 🦜 Ave / Bird | Número de anilla, condición del plumaje, tipo de canto |
| ➕ Otra / Other | Campo de especie personalizado / Custom species field |

### 5.3 Sistema de Requisitos Internacionales / International Requirements System

**ES:** Motor de reglas que cruza el expediente médico real de la mascota con los requisitos sanitarios oficiales del país de destino. Devuelve: porcentaje de cumplimiento, lista de requisitos cumplidos y pendientes, detalle de cada requisito, y exportación en PDF del informe completo.

**EN:** Rules engine that cross-references the pet's actual medical record with the official sanitary requirements of the destination country. Returns: compliance percentage, list of fulfilled and pending requirements, per-requirement detail, and PDF export of the full report.

### 5.4 Botón de Emergencia SOS / SOS Emergency Button

**ES:** Sistema de respuesta a emergencias con activación desde la barra de navegación inferior (botón central elevado, siempre visible en móvil). Funcionalidades:

**EN:** Emergency response system activated from the bottom navigation bar (elevated central button, always visible on mobile). Features:

| Funcionalidad / Feature | Descripción / Description |
|---|---|
| **Geolocalización / Geolocation** | Coordenadas GPS en tiempo real via Geolocation API / Real-time GPS via Geolocation API |
| **Código QR / QR Code** | Ficha de emergencia con datos médicos, alertas y contactos / Emergency card with medical data, alerts, and contacts |
| **Llamada directa / Direct call** | Marcación al número de emergencias veterinarias del país detectado / Dials country-detected veterinary emergency number |
| **Cambio de mascota / Pet switch** | Cambio de animal activo sin perder la sesión GPS / Switch active pet without losing GPS session |
| **Estado BUSCANDO / SEARCHING** | Indicador visual pulsante para animales extraviados / Pulsing visual badge for lost animals |

---

## 6. Diseño y Compatibilidad / Design & Compatibility

### Design System AURA

| Variable CSS | Valor / Value | Uso / Use |
|---|---|---|
| `--aura-gold` | `#D4AF37` | Acento primario / Primary accent |
| `--aura-neon-cyan` | `#00F5FF` | Estado OK / activo |
| `--aura-neon-pink` | `#FF007A` | Alerta / SOS |
| `--aura-black` | `#000000` | Fondo base / Base background |
| `--aura-glass` | `rgba(10,10,15,0.88)` | Efecto cristal / Glass effect |

### Compatibilidad Responsive / Responsive Compatibility

| Breakpoint | Comportamiento / Behaviour |
|---|---|
| `> 900px` | Desktop: nav superior, layouts 2 columnas |
| `≤ 900px` | Móvil: bottom tab bar 5 tabs, layouts 1 columna, safe-areas |
| `768–1024px` | Tablet: colapso a columna única |
| `≤ 375px` | iPhone SE / Galaxy A: tipografía y padding reducidos |

### Compatibilidad Cross-Platform

| Plataforma | Estado |
|---|---|
| iOS Safari (iPhone 12+) | ✅ Verificado — viewport-fit=cover, font-size 16px en inputs |
| Android Chrome (API 26+) | ✅ Verificado — theme-color, tap-highlight eliminado |
| Desktop Chrome / Edge / Firefox | ✅ Verificado |
| PWA instalable | ✅ manifest.json + apple-mobile-web-app-capable |

---

## 7. Internacionalización / Internationalization

- **Idiomas / Languages:** Español 🇪🇸 (por defecto / default) · English 🇬🇧
- **Detección / Detection:** Automática por idioma del navegador / Automatic from browser language
- **Toggle manual:** Visible en desktop nav y barra móvil / Visible in desktop nav and mobile bar
- **Divisas / Currencies:** EUR · USD · GBP · AUD (seleccionable / selectable)
- **Persistencia / Persistence:** Configuración guardada en `localStorage`

---

## 8. Despliegue / Deployment

```
npm run build  →  /dist/  →  node deploy-hf.mjs  →  HuggingFace Spaces CDN
```

| Entorno / Environment | Plataforma / Platform | URL |
|---|---|---|
| Producción / Production | HuggingFace Spaces (static) | https://rociogf-aura-pets-final.static.hf.space |
| Código fuente / Source code | GitHub | https://github.com/Rodigitaladvance/mascotas |

### Comandos / Commands

```bash
npm run dev      # Servidor local / Local server — http://localhost:5173
npm run build    # Build de producción / Production build → /dist
npm run preview  # Vista previa del build / Build preview
npm run lint     # Análisis estático ESLint / ESLint static analysis
```

---

## 9. Licencia / License

```
MIT License

Copyright (c) 2026 Rodigital Advance

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

## 10. Declaración de Conformidad / Conformity Declaration

Se declara que la aplicación **AURA Pets — Global Health Passport** ha sido desarrollada, auditada y desplegada en conformidad con:

It is declared that the application **AURA Pets — Global Health Passport** has been developed, audited, and deployed in conformity with:

- ✅ **Privacy by Design** — Art. 25 GDPR
- ✅ **Security by Default** — Art. 32 GDPR
- ✅ **Zero-Knowledge Architecture** — datos exclusivamente en dispositivo del usuario / data exclusively on user's device
- ✅ **GDPR** — Reglamento UE 2016/679
- ✅ **CCPA** — California Consumer Privacy Act § 1798.100
- ✅ **LOPD-GDD** — Ley Orgánica 3/2018 (España)
- ✅ **MIT License** — Software libre / Free software
- ✅ **Accesibilidad universal** — Responsive PWA, cross-browser, cross-platform

---

<div align="center">

| | |
|---|---|
| **Empresa / Company** | Rodigital Advance |
| **Fecha de emisión / Issue date** | 2026-04-14 |
| **Válido hasta / Valid until** | 2027-04-14 |

*Este documento es de carácter oficial y ha sido generado para auditoría de certificación.*  
*This document is official in nature and has been generated for certification audit purposes.*

© 2026 Rodigital Advance · AURA Pets · All rights reserved

</div>
