/**
 * Performance Utilities
 * أدوات تحسين الأداء
 */

/**
 * Debounce Function
 * تأخير تنفيذ دالة لحتى يتوقف مستخدم عن استدعائها
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle Function
 * تحديد عدد مرات تنفيذ دالة لا يتجاوز فترة زمنية
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun;

    if (timeSinceLastRun >= delay) {
      fn(...args);
      lastRun = now;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
        lastRun = Date.now();
      }, delay - timeSinceLastRun);
    }
  };
}

/**
 * Memoize Async Function
 * تخزين نتائج دوال async لعدم إعادة الاستدعاء
 */
export function memoizeAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  ttl = 60000 // مدة الاحتفاظ بالأربع مليبًا (60 ثانية افتراضا)
): (...args: Parameters<T>) => Promise<unknown> {
  const cache = new Map<string, { value: unknown; timestamp: number }>();

  return async (...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value;
    }

    const result = await fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  };
}

/**
 * Batch Function Calls
 * جمع عدة استدعاءات وتنفيذها مرة واحدة
 */
export function batch<T>(
  fn: (items: T[]) => Promise<unknown>,
  delay = 16 // افتراضا frame-rate optimized
) {
  let queue: T[] = [];
  let timeoutId: NodeJS.Timeout;

  return (item: T) => {
    queue.push(item);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (queue.length > 0) {
        fn(queue);
        queue = [];
      }
    }, delay);
  };
}
