/**
 * 节流工具函数
 * 在指定时间内最多执行一次（首次立即执行，后续在间隔结束后可再次执行）
 */

type ThrottleFn<T extends (...args: unknown[]) => unknown> = (...args: Parameters<T>) => void;

/**
 * 节流函数
 * @param fn 需要节流的函数
 * @param delay 节流间隔（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ThrottleFn<T> {
  let lastTime = 0;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
