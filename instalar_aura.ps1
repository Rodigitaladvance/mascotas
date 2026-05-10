# ============================================================
#  AURA Pets Global - Script de instalacion y arranque
#  Ejecutar desde PowerShell:
#    .\instalar_aura.ps1
# ============================================================

$ErrorActionPreference = "Stop"

function Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  +==========================================+" -ForegroundColor Yellow
    Write-Host "  |        AURA  Pets  Global  v1.0          |" -ForegroundColor Yellow
    Write-Host "  |     Instalador automatico Windows        |" -ForegroundColor DarkGray
    Write-Host "  +==========================================+" -ForegroundColor Yellow
    Write-Host ""
}

function Step($n, $msg) {
    Write-Host "  [$n] " -ForegroundColor Cyan -NoNewline
    Write-Host $msg -ForegroundColor White
}

function OK($msg)   { Write-Host "      OK  $msg" -ForegroundColor Green }
function WARN($msg) { Write-Host "      !!  $msg" -ForegroundColor Yellow }
function ERR($msg)  { Write-Host "      X   $msg" -ForegroundColor Red; exit 1 }

# ── 1. Node.js ────────────────────────────────────────────
Banner
Step 1 "Verificando Node.js..."

$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    WARN "Node.js no encontrado. Descargando instalador..."
    $installer = "$env:TEMP\node_installer.msi"
    $nodeUrl = "https://nodejs.org/dist/v22.13.1/node-v22.13.1-x64.msi"
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installer -UseBasicParsing
        Start-Process msiexec.exe -ArgumentList "/i `"$installer`" /quiet /norestart ADDLOCAL=ALL" -Wait
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        OK "Node.js instalado correctamente."
    } catch {
        ERR "No se pudo instalar Node.js. Instala Node.js 22+ desde https://nodejs.org y vuelve a ejecutar."
    }
} else {
    $nodeVer = node --version
    OK "Node.js $nodeVer detectado."
}

# ── 2. npm ────────────────────────────────────────────────
Step 2 "Verificando npm..."
$npmPath = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmPath) { ERR "npm no encontrado. Reinstala Node.js." }
$npmVer = npm --version
OK "npm $npmVer detectado."

# ── 3. Git ────────────────────────────────────────────────
Step 3 "Verificando Git..."
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    WARN "Git no encontrado. Solo necesario para clonar el repositorio."
} else {
    $gitVer = git --version
    OK "$gitVer detectado."
}

# ── 4. Directorio del proyecto ────────────────────────────
Step 4 "Localizando proyecto AURA..."

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$pkgJson   = Join-Path $scriptDir "package.json"

if (-not (Test-Path $pkgJson)) {
    ERR "No se encontro package.json en '$scriptDir'. Ejecuta el script desde la carpeta raiz del proyecto."
}
OK "Proyecto encontrado en: $scriptDir"
Set-Location $scriptDir

# ── 5. Variables de entorno ───────────────────────────────
Step 5 "Configurando variables de entorno..."

$envFile    = Join-Path $scriptDir ".env.local"
$envExample = Join-Path $scriptDir ".env.local.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        WARN ".env.local creado desde .env.local.example - edita las claves API antes de usar la app."
    } else {
        $envContent = "VITE_PEXELS_KEY=your_pexels_key_here`nVITE_ANTHROPIC_KEY=your_anthropic_key_here"
        Set-Content -Path $envFile -Value $envContent -Encoding utf8
        WARN ".env.local creado con valores de ejemplo. Edita el archivo con tus claves API reales."
    }
} else {
    OK ".env.local ya existe."
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "your_.*_key_here") {
        WARN "Algunas claves en .env.local son placeholders. El chatbot IA requiere VITE_ANTHROPIC_KEY real."
    }
}

# ── 6. Dependencias npm ───────────────────────────────────
Step 6 "Instalando dependencias npm..."

$nodeModules = Join-Path $scriptDir "node_modules"
if (Test-Path $nodeModules) {
    WARN "node_modules ya existe. Sincronizando con npm install..."
}

npm install --prefer-offline 2>&1 | ForEach-Object {
    $line = $_.ToString()
    if ($line -match "^npm warn" -or $line -match "^npm notice") {
        # silenciar warnings menores
    } elseif ($line -match "^npm error") {
        Write-Host "      $line" -ForegroundColor Red
    } else {
        Write-Host "      $line" -ForegroundColor DarkGray
    }
}

if ($LASTEXITCODE -ne 0) { ERR "npm install fallo. Revisa los errores anteriores." }
OK "Dependencias instaladas."

# ── 7. Verificacion de build ──────────────────────────────
Step 7 "Verificando build de produccion..."

Write-Host "      Ejecutando npm run build..." -ForegroundColor DarkGray
npm run build
$buildOk = $LASTEXITCODE -eq 0

if ($buildOk) {
    OK "Build de produccion completado sin errores."
} else {
    WARN "Build fallo con errores. Revisa la salida anterior."
}

# ── 8. Resumen ────────────────────────────────────────────
Write-Host ""
Write-Host "  +==========================================+" -ForegroundColor Yellow
Write-Host "  |         Instalacion completada           |" -ForegroundColor Green
Write-Host "  +==========================================+" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Comandos disponibles:" -ForegroundColor White
Write-Host "    npm run dev      -> Servidor dev   http://localhost:5173" -ForegroundColor Cyan
Write-Host "    npm run build    -> Build produccion  carpeta dist/" -ForegroundColor Cyan
Write-Host "    npm run preview  -> Previsualizar build de produccion" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Archivos importantes:" -ForegroundColor White
Write-Host "    .env.local        -> Claves API" -ForegroundColor DarkGray
Write-Host "    src/index.css     -> Sistema de diseno Aura Crystal Premium Pro" -ForegroundColor DarkGray
Write-Host "    src/components/   -> Componentes React" -ForegroundColor DarkGray
Write-Host ""

# ── 9. Arrancar servidor dev ──────────────────────────────
$launch = Read-Host "  Iniciar servidor de desarrollo ahora? S/n"
if ($launch -eq "" -or $launch -match "^[sS]") {
    Write-Host ""
    Write-Host "  Iniciando AURA Pets Global..." -ForegroundColor Yellow
    Write-Host "  Navega a: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "  Ctrl+C para detener el servidor" -ForegroundColor DarkGray
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "  Listo. Ejecuta npm run dev cuando quieras arrancar." -ForegroundColor DarkGray
    Write-Host ""
}
