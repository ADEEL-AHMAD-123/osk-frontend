import type { ApiSuccess } from '@contracts';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';

/**
 * Server-side fetch for React Server Components. Uses Next's data cache via
 * `revalidate`. Returns `null` on any failure so callers render a fallback
 * instead of throwing — keeps pages resilient while the backend is a shell.
 */
export async function serverFetch<T>(
  path: string,
  revalidate = 60,
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate },
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiSuccess<T>;
    return body.success ? body.data : null;
  } catch {
    return null;
  }
}
