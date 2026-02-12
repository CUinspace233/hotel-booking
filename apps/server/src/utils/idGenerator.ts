/**
 * ID 生成器工具
 * 用于生成酒店、房型等业务唯一ID
 */

/**
 * 生成随机字符串
 * @param length 长度
 * @param charset 字符集
 */
function randomString(length: number, charset: string): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * 生成酒店唯一业务ID
 * 格式：HTL + 时间戳后8位 + 随机4位字母数字
 * 示例：HTL12345678ABCD
 */
export function generateHotelId(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = randomString(4, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  return `HTL${timestamp}${random}`;
}

/**
 * 生成房型唯一业务ID
 * 格式：ROM + 时间戳后8位 + 随机4位字母数字
 * 示例：ROM12345678WXYZ
 */
export function generateRoomId(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = randomString(4, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  return `ROM${timestamp}${random}`;
}

/**
 * 生成设施唯一编码
 * 格式：FAC + 随机6位字母数字
 */
export function generateFacilityCode(): string {
  const random = randomString(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  return `FAC${random}`;
}

/**
 * 生成通用唯一ID
 * @param prefix 前缀
 */
export function generateUniqueId(prefix = 'ID'): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = randomString(4, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  return `${prefix}${timestamp}${random}`;
}
