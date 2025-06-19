const CRYPTO_CONFIG = {
  SECRET_KEY: 'UJBM-RememberMe-2025', // Secreto principal (mejor usar variables de entorno)
  SALT: 'F7g3LpQ9zX1vB5sT', // Salt para derivación de claves
  ITERATIONS: 100000, // Número de iteraciones para PBKDF2 (más alto = más seguro pero más lento)
  KEY_LENGTH: 256, // Longitud de clave en bits
  IV_LENGTH: 12, // Longitud del vector de inicialización (IV)
  ENCODING_PREFIX: 'UJBM_ENC_' // Prefijo para verificar formato válido
};

// Convertir string a ArrayBuffer
function str2ab(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer;
}

// Convertir ArrayBuffer a string base64
function ab2b64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Convertir base64 a ArrayBuffer
function b642ab(b64: string): ArrayBuffer {
  try {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
  } catch (e) {
    throw new Error('Invalid base64 encoding');
  }
}

// Deriva una clave criptográfica segura usando PBKDF2
async function deriveKey(secret: string = CRYPTO_CONFIG.SECRET_KEY): Promise<CryptoKey> {
  try {
    // Importar la clave secreta inicial
    const baseKey = await crypto.subtle.importKey(
      'raw',
      str2ab(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derivar la clave con PBKDF2
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: str2ab(CRYPTO_CONFIG.SALT),
        iterations: CRYPTO_CONFIG.ITERATIONS,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: CRYPTO_CONFIG.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (e) {
    console.error('Error al derivar la clave:', e);
    throw new Error('Error al derivar la clave criptográfica');
  }
}

/**
 * Encripta un texto usando AES-GCM
 * @param text Texto a encriptar
 * @returns Texto encriptado en formato especial (prefijo:iv:datos)
 */
export async function encrypt(text: string): Promise<string> {
  try {
    if (!text) return '';

    // Generar IV aleatorio
    const iv = crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.IV_LENGTH));
    
    // Obtener clave derivada
    const key = await deriveKey();
    
    // Encriptar
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      str2ab(text)
    );
    
    // Formatear como prefijo:iv:datos (en base64)
    return CRYPTO_CONFIG.ENCODING_PREFIX + ab2b64(iv.buffer) + ':' + ab2b64(encryptedBuffer);
  } catch (e) {
    console.error('Error durante la encriptación:', e);
    return '';
  }
}

/**
 * Desencripta un texto previamente encriptado
 * @param data Texto encriptado en formato prefijo:iv:datos
 * @returns Texto desencriptado original
 */
export async function decrypt(data: string): Promise<string> {
  try {
    if (!data) return '';
    
    // Verificar que el formato es correcto
    if (!data.startsWith(CRYPTO_CONFIG.ENCODING_PREFIX)) {
      throw new Error('Formato de datos encriptados inválido');
    }
    
    // Extraer componentes (eliminar prefijo primero)
    const encryptedData = data.substring(CRYPTO_CONFIG.ENCODING_PREFIX.length);
    const [ivB64, encryptedB64] = encryptedData.split(':');
    
    if (!ivB64 || !encryptedB64) {
      throw new Error('Formato de datos encriptados incompleto');
    }
    
    // Convertir de base64
    const iv = new Uint8Array(b642ab(ivB64));
    const encryptedBuffer = b642ab(encryptedB64);
    
    // Obtener clave derivada
    const key = await deriveKey();
    
    // Desencriptar
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedBuffer
    );
    
    // Convertir a texto
    return new TextDecoder().decode(decryptedBuffer);
  } catch (e) {
    console.error('Error durante la desencriptación:', e, 'Data:', data);
    throw new Error('No se pudo desencriptar los datos');
  }
}

