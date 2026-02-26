/**
 * 使用 Web Crypto API 进行 RSA 公钥加密（无额外依赖）
 */

/**
 * PEM 公钥转 ArrayBuffer
 */
function pemToBinary(pem: string): ArrayBuffer {
  const pemContents = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 使用 RSA 公钥加密密码
 * @param password 明文密码
 * @param pemPublicKey PEM 格式公钥
 * @returns Base64 密文
 */
export async function encryptPassword(password: string, pemPublicKey: string): Promise<string> {
  const keyData = pemToBinary(pemPublicKey);

  const publicKey = await crypto.subtle.importKey(
    'spki',
    keyData,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );

  const encoded = new TextEncoder().encode(password);
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded);

  const bytes = new Uint8Array(encrypted);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
