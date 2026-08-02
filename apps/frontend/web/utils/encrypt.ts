export type EncryptPayload = {
  encryptedKey: string;
  iv: string;
  ciphertext: string;
};

function assertBrowserCrypto() {
  if (
    typeof window === 'undefined' ||
    !window.crypto?.subtle ||
    typeof btoa !== 'function' ||
    typeof atob !== 'function'
  ) {
    throw new Error('encryptData 只能在浏览器环境调用');
  }
}

function toBase64(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

export async function encryptData(
  data: string | Record<string, unknown>,
  publicKeyPem: string
): Promise<EncryptPayload> {
  assertBrowserCrypto();

  const serializedData = typeof data === 'string' ? data : JSON.stringify(data);

  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const plaintext = new TextEncoder().encode(serializedData);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    plaintext
  );

  const publicKey = await crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(publicKeyPem),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );

  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);

  const encryptedKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAesKey
  );

  return {
    encryptedKey: toBase64(encryptedKey),
    iv: toBase64(iv.buffer),
    ciphertext: toBase64(ciphertext),
  };
}

export const encrypt = encryptData;
