import crypto from 'crypto';

// ============ RSA 密码传输加密（前端加密、后端解密）============

const RSA_KEY_SIZE = 2048;
let cachedRsaKeyPair: { publicKey: string; privateKey: string } | null = null;

/**
 * 获取 RSA 密钥对（服务端启动时生成，内存缓存）
 */
export function getRsaKeyPair(): { publicKey: string; privateKey: string } {
  if (cachedRsaKeyPair) return cachedRsaKeyPair;

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: RSA_KEY_SIZE,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  cachedRsaKeyPair = { publicKey, privateKey };
  return cachedRsaKeyPair;
}

/**
 * 解密前端 RSA-OAEP 加密的密码
 * @param encryptedBase64 前端加密后的 Base64 字符串
 * @returns 解密后的明文密码，失败返回 null
 */
export function decryptPassword(encryptedBase64: string): string | null {
  try {
    const { privateKey } = getRsaKeyPair();
    const buf = Buffer.from(encryptedBase64, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buf
    );
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Password decryption failed:', error);
    return null;
  }
}

// ============ AES Cookie Token 加密 ============

// 加密算法
const ALGORITHM = 'aes-256-gcm';
// IV 长度
const IV_LENGTH = 16;
// Auth Tag 长度
const AUTH_TAG_LENGTH = 16;

/**
 * 获取加密密钥
 * 从环境变量获取，如果不存在则使用默认值（生产环境必须配置）
 */
const getEncryptionKey = (): Buffer => {
  const key = process.env.COOKIE_ENCRYPTION_KEY || 'default-32-char-encryption-key!!';
  // 确保密钥长度为 32 字节（256 位）
  return Buffer.from(key.padEnd(32, '0').slice(0, 32));
};

/**
 * AES-256-GCM 加密
 * @param plainText 明文
 * @returns 加密后的字符串（格式：iv:authTag:cipherText，Base64 编码）
 */
export const encrypt = (plainText: string): string => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // 将 iv、authTag 和密文拼接，然后 Base64 编码
  const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);

  return combined.toString('base64');
};

/**
 * AES-256-GCM 解密
 * @param encryptedText 加密的字符串
 * @returns 解密后的明文，解密失败返回 null
 */
export const decrypt = (encryptedText: string): string | null => {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedText, 'base64');

    // 提取 iv、authTag 和密文
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const cipherText = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherText.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};
