/**
 * AURA Vault — cifrado local AES-256-GCM con clave derivada de la contraseña.
 *
 * Modelo de seguridad
 * -------------------
 * La clave de cifrado NO se guarda en ninguna parte: se deriva de la contraseña
 * del usuario con PBKDF2-SHA256 (210.000 iteraciones, sal aleatoria por usuario)
 * cada vez que inicia sesión. De los 512 bits derivados, los primeros 256 son la
 * clave AES y los últimos 256 el verificador que permite comprobar la contraseña
 * sin poder descifrar nada con él.
 *
 * Mientras dura la sesión la clave vive en sessionStorage, que es por pestaña y
 * se destruye al cerrarla. Eso permite recargar la página sin volver a escribir
 * la contraseña, y mantiene los datos ilegibles en reposo: quien acceda al
 * dispositivo, a una copia de seguridad del navegador o a un perfil sincronizado
 * encontrará solo texto cifrado.
 *
 * Consecuencia inevitable: sin la contraseña no hay forma de recuperar los datos.
 * No existe puerta trasera, ni para el usuario ni para nosotros.
 *
 * Rendimiento
 * -----------
 * Descifrar en cada lectura haría lenta la interfaz, así que al abrir sesión se
 * descifra todo una vez a un caché en memoria. Las lecturas son síncronas contra
 * ese caché; las escrituras actualizan el caché y devuelven una promesa que se
 * resuelve cuando el dato ya está cifrado en disco.
 */

const ITERATIONS = 210_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const CIPHER_PREFIX = 'v1';
const SESSION_KEY_PREFIX = 'aura_sk_';
const LEGACY_SALT = 'mascota_salt_2024';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/* ── Estado de sesión (solo en memoria) ── */
let activeKey = null;
let activeUserId = null;
const cache = new Map();

/* ── Base64 ── */
const toB64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  // Recorrido manual: String.fromCharCode(...bytes) desborda la pila con
  // entradas grandes como una foto en base64.
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};
const fromB64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

/* ── Derivación de clave ── */
const deriveBits = async (password, salt) => {
  const base = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    base,
    512,
  );
  return new Uint8Array(bits);
};

const importAesKey = (rawKey) =>
  crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);

/* ── Cifrado de cadenas ── */
const encryptString = async (plaintext) => {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, activeKey, encoder.encode(plaintext));
  return `${CIPHER_PREFIX}.${toB64(iv)}.${toB64(cipher)}`;
};

const decryptString = async (payload) => {
  if (typeof payload !== 'string') return null;
  const parts = payload.split('.');
  // Los datos de versiones anteriores están en claro: se devuelven tal cual
  // para poder migrarlos al primer guardado.
  if (parts.length !== 3 || parts[0] !== CIPHER_PREFIX) return payload;
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(parts[1]) },
    activeKey,
    fromB64(parts[2]),
  );
  return decoder.decode(plain);
};

/* ── Persistencia ── */
const storageKeyFor = (userId, key) => `vault_${userId}_${key}`;

const persist = async (userId, key, data) => {
  const payload = await encryptString(JSON.stringify(data));
  try {
    localStorage.setItem(storageKeyFor(userId, key), payload);
  } catch (err) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22;

    console.error('[AURA Vault] Error al guardar datos:', err);

    const friendly = new Error(
      isQuota
        ? 'No hay espacio suficiente en este dispositivo para guardar el expediente. Elimina alguna foto o mascota antigua e inténtalo de nuevo.'
        : 'No se ha podido guardar el expediente en este dispositivo.',
    );
    friendly.name = isQuota ? 'StorageQuotaError' : 'StorageWriteError';
    friendly.cause = err;
    throw friendly;
  }
};

/** Descifra todo el espacio del usuario al caché en memoria. */
const hydrate = async (userId) => {
  cache.clear();
  const prefix = `vault_${userId}_`;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(prefix)) keys.push(k);
  }
  for (const fullKey of keys) {
    try {
      const plain = await decryptString(localStorage.getItem(fullKey));
      cache.set(fullKey.slice(prefix.length), JSON.parse(plain));
    } catch {
      // Un registro ilegible no debe tumbar la sesión entera: se omite y el
      // resto del expediente sigue accesible.
      console.warn('[AURA Vault] Registro ilegible, se omite:', fullKey);
    }
  }
};

/** Reescribe cifrado todo lo que siga en claro de versiones anteriores. */
const reencryptAll = async (userId) => {
  for (const [key, value] of cache.entries()) {
    await persist(userId, key, value);
  }
};

export const vault = {
  /* ── Hash heredado: solo para validar cuentas creadas antes del cifrado ── */
  hashPassword: async (password) => {
    const data = encoder.encode(password + LEGACY_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Comprueba la contraseña y abre la bóveda.
   * Devuelve el registro de usuario actualizado —con sal y verificador— para
   * que quien llame lo persista, o null si la contraseña no es correcta.
   */
  openSession: async (user, password) => {
    const isLegacy = !user.salt;

    if (isLegacy) {
      const legacyHash = await vault.hashPassword(password);
      if (legacyHash !== user.password) return null;
    }

    const salt = isLegacy ? crypto.getRandomValues(new Uint8Array(SALT_BYTES)) : fromB64(user.salt);
    const bits = await deriveBits(password, salt);
    const keyBytes = bits.slice(0, 32);
    const verifier = toB64(bits.slice(32));

    if (!isLegacy && verifier !== user.verifier) return null;

    activeKey = await importAesKey(keyBytes);
    activeUserId = user.id;
    sessionStorage.setItem(SESSION_KEY_PREFIX + user.id, toB64(keyBytes));

    await hydrate(user.id);
    if (isLegacy) await reencryptAll(user.id); // migra lo que estuviera en claro

    const upgraded = { ...user, salt: toB64(salt), verifier };
    delete upgraded.password; // el hash antiguo deja de ser necesario
    return upgraded;
  },

  /** Crea la bóveda de un usuario nuevo. Devuelve sal y verificador. */
  createSession: async (userId, password) => {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const bits = await deriveBits(password, salt);
    const keyBytes = bits.slice(0, 32);

    activeKey = await importAesKey(keyBytes);
    activeUserId = userId;
    sessionStorage.setItem(SESSION_KEY_PREFIX + userId, toB64(keyBytes));
    cache.clear();

    return { salt: toB64(salt), verifier: toB64(bits.slice(32)) };
  },

  /**
   * Reabre la bóveda tras recargar la página, con la clave que quedó en
   * sessionStorage. Devuelve false si no hay clave y hay que pedir contraseña.
   */
  restoreSession: async (userId) => {
    const raw = sessionStorage.getItem(SESSION_KEY_PREFIX + userId);
    if (!raw) return false;
    try {
      activeKey = await importAesKey(fromB64(raw));
      activeUserId = userId;
      await hydrate(userId);
      return true;
    } catch {
      vault.lock();
      return false;
    }
  },

  /** Cierra la bóveda y destruye la clave. */
  lock: () => {
    if (activeUserId) sessionStorage.removeItem(SESSION_KEY_PREFIX + activeUserId);
    activeKey = null;
    activeUserId = null;
    cache.clear();
  },

  isUnlocked: () => activeKey !== null,

  /* ── Datos ── */

  /** Lectura síncrona desde el caché descifrado. */
  getScopedData: (userId, key) => {
    if (activeUserId !== userId) return null;
    return cache.has(key) ? cache.get(key) : null;
  },

  /** Escritura: actualiza el caché y devuelve la promesa del guardado cifrado. */
  setScopedData: (userId, key, data) => {
    if (activeUserId !== userId || !activeKey) {
      const cerrada = new Error('La bóveda está cerrada. Vuelve a iniciar sesión.');
      cerrada.name = 'VaultLockedError';
      return Promise.reject(cerrada);
    }
    cache.set(key, data);
    return persist(userId, key, data);
  },

  removeScopedData: (userId, key) => {
    cache.delete(key);
    localStorage.removeItem(storageKeyFor(userId, key));
  },

  /** Espacio aproximado ocupado por este usuario, en bytes. */
  getUsedBytes: (userId) => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(`vault_${userId}_`)) total += k.length + (localStorage.getItem(k)?.length ?? 0);
    }
    return total * 2; // UTF-16: 2 bytes por carácter
  },

  /* ── Caducidad de sesión ── */
  sessionDuration: 2 * 60 * 60 * 1000, // 2 horas

  isSessionExpired: (startTime) => Date.now() - startTime > vault.sessionDuration,
};
