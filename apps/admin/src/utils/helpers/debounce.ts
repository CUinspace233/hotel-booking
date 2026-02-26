/**
 * 防抖工具函数
 * 在最后一次调用后的指定时间才执行
 */

type DebounceFn<T extends (...args: unknown[]) => unknown> = (...args: Parameters<T>) => void;

/**
 * 防抖函数
 * @param fn 需要防抖的函数
 * @param delay 防抖延迟（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): DebounceFn<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}
