import crypto from 'crypto';

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
