/** Allow only same-origin relative paths (no protocol / open redirects). */
export function sanitizeNextPath(
  next: string | null | undefined,
  fallback = '/app'
): string {
  if (!next || typeof next !== 'string') return fallback;
  const t = next.trim();
  if (!t.startsWith('/') || t.startsWith('//')) return fallback;
  return t;
}
