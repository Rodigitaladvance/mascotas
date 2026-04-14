---
title: Aura Pets Final
emoji: 🐾
colorFrom: yellow
colorTo: gray
sdk: static
app_file: index.html
---

<div align="center">
  <h1>🐾 AURA Pets</h1>
  <p><strong>Global Sanitary Passport & Premium Pet Health Record System</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite" />
    <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat" />
    <img src="https://img.shields.io/badge/License-Private-gold?style=flat" />
  </p>
  <p>
    <a href="https://rociogf-aura-pets-final.static.hf.space"><strong>🚀 Live Demo</strong></a>
    &nbsp;·&nbsp;
    <a href="./FICHA_TECNICA.md"><strong>📋 Ficha Técnica / Technical Spec</strong></a>
  </p>
</div>

---

## ¿Qué es AURA Pets?

AURA Pets es una aplicación web premium de gestión de expedientes médicos para mascotas. Diseñada con el principio de **soberanía del dato**: toda la información se almacena localmente en el dispositivo del usuario, cifrada con AES-256, sin servidores externos.

> *"Tu mascota merece el mismo nivel de excelencia médica que cualquier miembro de la familia."*

---

## ✨ Funcionalidades Principales

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Carrusel multi-mascota con medallones dorados, vitales en tiempo real, historial de peso |
| **Pasaporte Global** | Requisitos de viaje por destino (ES/UK/US/CA/AU), disponibilidad en % y exportación PDF |
| **Modo SOS** | Geolocalización, QR de emergencia, ficha médica instantánea, cambio de miembro activo |
| **Protocolo de Baja** | 3 flujos: Extravío (estado BUSCANDO), Fallecimiento (Memorial PDF), Baja del Servicio |
| **Privacy Vault** | Exportación GDPR (JSON/PDF), destrucción certificada de datos, política de privacidad |
| **Onboarding** | Flujo de bienvenida guiado con selección de especie animada |

---

## 🛠️ Stack Tecnológico

```
React 19 + Vite 8          →  SPA framework
React Router 7 (Hash)      →  Navegación client-side
Framer Motion 12           →  Animaciones y transiciones
Lucide React               →  Sistema de iconografía
jsPDF 4                    →  Generación de PDFs
QRCode React               →  QR de emergencia
Recharts 3                 →  Gráficas de vitales
LocalStorage               →  Persistencia local cifrada
```

---

## 🗂️ Estructura del Proyecto

```
src/
├── components/
│   └── Aura/
│       ├── Dashboard.jsx          # Panel principal + carrusel
│       ├── GlobalPassport.jsx     # Pasaporte sanitario global
│       ├── SOSMode.jsx            # Modo emergencia
│       ├── PetRegistration.jsx    # Registro de mascota
│       ├── PetEditModal.jsx       # Edición + protocolo de baja
│       ├── PrivacyVault.jsx       # Seguridad y GDPR
│       ├── Onboarding.jsx         # Flujo de bienvenida
│       └── RecuperarAcceso.jsx    # Recuperación de contraseña
├── context/
│   ├── AuthContext.jsx            # Sesión y autenticación local
│   └── LocalizationContext.jsx   # i18n ES/EN + divisa
├── utils/
│   ├── storage.js                 # CRUD LocalStorage
│   ├── translations.js            # Textos ES/EN
│   └── vault.js                  # Utilidades de cifrado
└── index.css                      # Design system AURA
```

---

## 🚀 Instalación y Desarrollo

```bash
git clone https://github.com/Rodigitaladvance/mascotas.git
cd mascotas
npm install
npm run dev
```

```bash
npm run build    # Compilar para producción
npm run preview  # Vista previa del build
```

---

## 🔐 Privacidad y Seguridad

- **0 servidores propios** — los datos nunca salen del dispositivo
- **Cifrado AES-256** en datos sensibles
- **Cumplimiento GDPR / LOPD** — derecho al olvido, portabilidad y acceso
- **Destrucción certificada** con doble confirmación por palabra clave

---

## 📄 Licencia

© 2026 **Rodigital Advance** · Todos los derechos reservados  
Proyecto presentado para certificación de Vibe Coding.
