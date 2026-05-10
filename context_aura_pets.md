# Contexto del Proyecto: AURA Pets — Global Health Passport

## 1. Descripción General
**AURA Pets** es una aplicación web premium (SPA) de gestión de expedientes médicos para mascotas. Su propuesta de valor principal es la **soberanía del dato** (Zero-Knowledge Architecture): toda la información médica y personal se almacena localmente en el dispositivo del usuario, cifrada con AES-256 y sin depender de servidores externos ni bases de datos en la nube.

## 2. Arquitectura y Stack Tecnológico
- **Frontend Core:** React 19 (SPA) + Vite 8.
- **Enrutamiento:** React Router DOM 7 (usando `HashRouter` para compatibilidad con hosting estático).
- **Animaciones y UI:** Framer Motion 12, Lucide React (iconografía).
- **Gráficos y Utilidades:** Recharts 3 (vitales), qrcode.react (QR SOS), jsPDF 4 (exportación de pasaportes y reportes).
- **Almacenamiento y Seguridad:**
  - `localStorage` exclusivo.
  - Web Crypto API nativa: Hash SHA-256 para contraseñas (con sal estática) y cifrado AES-256 para expedientes médicos y documentos de mascotas.
- **Hosting:** HuggingFace Spaces (CDN estático).

## 3. Funcionalidades Principales (Módulos)
1. **Dashboard:** Panel principal con un carrusel horizontal multi-mascota. Muestra métricas vitales en tiempo real y el historial de peso mediante gráficos.
2. **Pasaporte Global:** Motor de reglas que compara el expediente de la mascota con requisitos oficiales de viaje (España, Reino Unido, USA, Canadá, Australia). Genera un % de preparación y permite exportar el reporte a PDF.
3. **Modo SOS (Emergencias):** Botón central de emergencia que activa la geolocalización, muestra un código QR médico, permite marcación rápida a emergencias según país, y habilita un estado "Buscando" (pulsante) en caso de extravío.
4. **Privacy Vault (Bóveda de Privacidad):** Cumplimiento GDPR / CCPA. Permite exportar los datos a formato JSON y realizar una "Destrucción Certificada" de los datos (doble confirmación por palabra clave).
5. **Selector de Especies (Onboarding/Registro):** Formularios dinámicos adaptados a perros, gatos, caballos, animales exóticos y aves.
6. **Protocolos de Baja:** Flujos manejados para mascotas (estado "buscando", memorial por fallecimiento en PDF o baja del servicio).

## 4. Diseño y UX/UI (AURA Design System)
Estética *Premium / Quiet Luxury / Tech* basada en modo oscuro con efecto *Glassmorphism*.
- **Colores Principales:**
  - Fondo Base: Negro Obsidian (`#000000`).
  - Acento Primario: Oro (`#D4AF37`).
  - Estados/Alertas: Neón Cyan (`#00F5FF` - activo/ok) y Neón Pink (`#FF007A` - alerta/SOS).
  - Cristales (Glass): Fondos traslúcidos `rgba(10,10,15,0.88)`.
- **Tipografía:** Playfair Display (titulares premium) + Inter (datos e interfaz).
- **Responsividad:** *Mobile-first* absoluto (bottom navigation bar en móvil, con layouts adaptables hasta versión desktop de dos columnas).

## 5. Internacionalización (i18n)
- **Idiomas:** Español (ES) e Inglés (EN), autodetectado y con *toggle* manual.
- **Divisas:** Soporte para EUR, USD, GBP, AUD.

## 6. Estado Actual y Futuro Desarrollo
La app ya se encuentra construida, compilada en `/dist` y lista para producción (alojada como sitio estático). Cualquier nueva funcionalidad o componente debe:
- Respetar la regla estricta de **no usar backend ni APIs externas** que expongan datos.
- Utilizar los métodos del `Vault` para leer/escribir datos encriptados.
- Mantener la línea visual premium (cristales oscuros y toques dorados/neón).
- Garantizar que las nuevas rutas o vistas se registren en el `HashRouter` y sean accesibles desde la barra de navegación (desktop o bottom tab en móvil).
