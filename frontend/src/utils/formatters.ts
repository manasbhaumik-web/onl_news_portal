import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string | null | undefined, formatStr = 'MMM d, yyyy'): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    return format(date, formatStr);
  } catch {
    return '';
  }
}

/**
 * Format a date string to relative time (e.g., "3 hours ago")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Format a number to abbreviated form (e.g., 1234 → "1.2k")
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return num.toString();
}

/**
 * Format reading time in minutes
 */
export function formatReadingTime(minutes: number | null | undefined): string {
  if (!minutes) return '1 min read';
  if (minutes < 1) return '< 1 min read';
  if (minutes === 1) return '1 min read';
  return `${Math.round(minutes)} min read`;
}

/**
 * Truncate text to a given length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format article format label
 */
export function formatArticleFormat(format: string): string {
  const labels: Record<string, string> = {
    news: 'News',
    feature: 'Feature',
    opinion: 'Opinion',
    breaking: 'Breaking',
    analysis: 'Analysis',
    interview: 'Interview',
    review: 'Review',
    listicle: 'Listicle',
  };
  return labels[format] ?? capitalize(format);
}
