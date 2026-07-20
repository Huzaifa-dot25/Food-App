export * from './storage';
export * from './formatters';
export * from './validators';

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * Check if a string is a valid image URL.
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('http') || url.startsWith('/');
}

/**
 * Get initials from a full name — "John Doe" → "JD"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
