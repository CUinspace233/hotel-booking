import crypto from 'crypto';

let keyPair: { publicKey: string; privateKey: string } | null = null;

/**
 * 获取 RSA 密钥对（2048 位，用于密码传输加密）
 * 进程内缓存，重启后重新生成（不影响已登录用户，且每次新密钥更安全）
 */
function getKeyPair(): { publicKey: string; privateKey: string } {
  if (!keyPair) {
    keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
  }
  return keyPair;
}

/**
 * 获取公钥（供前端加密密码）
 */
export function getPublicKey(): string {
  return getKeyPair().publicKey;
}

/**
 * 使用私钥解密前端传来的密码（RSA-OAEP + SHA-256）
 */
export function decryptPassword(encryptedPassword: string): string {
  const { privateKey } = getKeyPair();
  const buffer = Buffer.from(encryptedPassword, 'base64');
  return crypto
    .privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buffer
    )
    .toString('utf8');
}
