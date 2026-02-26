import { rpc } from '@/utils/rpc';

let cachedPublicKey: string | null = null;

/**
 * 从服务端获取 RSA 公钥（带内存缓存）
 */
export async function getPublicKey(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey;

  const res = await rpc.get<{ publicKey: string }>('/auth/public-key', {}, { skipAuth: true });
  cachedPublicKey = res.publicKey;
  return cachedPublicKey;
}

/**
 * 解析 PEM 格式公钥为 ArrayBuffer
 */
function pemToBinary(pem: string): ArrayBuffer {
  const lines = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(lines);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 使用 Web Crypto API + RSA-OAEP 加密密码
 * @param plainPassword 明文密码
 * @returns Base64 编码的密文
 */
export async function encryptPassword(plainPassword: string): Promise<string> {
  const pem = await getPublicKey();
  const binaryKey = pemToBinary(pem);

  const publicKey = await crypto.subtle.importKey(
    'spki',
    binaryKey,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(plainPassword);

  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, data);

  // 转为 Base64
  const bytes = new Uint8Array(encrypted);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
