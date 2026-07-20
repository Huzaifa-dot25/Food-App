import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Currency formatter — e.g. 12.5 → "$12.50"
 */
export function formatPrice(amount: number, currency = '$'): string {
  return `${currency}${amount.toFixed(2)}`;
}

/**
 * Format ISO date string to readable date.
 */
export function formatDate(iso: string, pattern = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

/**
 * Format ISO date to "2 hours ago" style.
 */
export function formatTimeAgo(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

/**
 * Format delivery time — "25–35 min"
 */
export function formatDeliveryTime(minutes: number): string {
  const buffer = Math.round(minutes * 0.2); // +/- 20% buffer
  return `${minutes - buffer}–${minutes + buffer} min`;
}

/**
 * Format distance — "1.2 km" or "800 m"
 */
export function formatDistance(km: number | null): string {
  if (km === null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format rating — 4.5 → "4.5"
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Format order number for display — ORD-20261717-0001
 */
export function formatOrderNumber(orderNumber: string): string {
  return orderNumber;
}
