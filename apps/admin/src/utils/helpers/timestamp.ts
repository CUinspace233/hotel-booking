/**
 * 秒级时间戳工具
 */

/**
 * 获取当前秒级时间戳
 * @returns 当前时间的秒级时间戳（10 位）
 */
export function getSecondTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * 将毫秒时间戳转为秒级时间戳
 * @param ms 毫秒时间戳
 * @returns 秒级时间戳
 */
export function toSecondTimestamp(ms: number): number {
  return Math.floor(ms / 1000);
}
