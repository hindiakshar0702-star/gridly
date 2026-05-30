/**
 * Trailing-edge debounce.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait = 100
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  };
}

/**
 * requestAnimationFrame-throttled wrapper.
 */
export function rafThrottle<T extends (...args: unknown[]) => void>(
  fn: T
): (...args: Parameters<T>) => void {
  let scheduled = false;
  let lastArgs: Parameters<T> | null = null;
  return (...args: Parameters<T>) => {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (lastArgs) fn(...lastArgs);
    });
  };
}
