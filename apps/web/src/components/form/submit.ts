import type { DemoRequestPayload } from './validation'

export const ENDPOINT = '/api/v1/demo-requests'

export type SubmitResult =
  | { kind: 'success' }
  | { kind: 'invalid'; fields: string[] }
  | { kind: 'tooLarge' }
  | { kind: 'rateLimited'; minutes: number | null }
  | { kind: 'server' }
  | { kind: 'network' }

/** `Retry-After` (seconds or HTTP date) → whole minutes, rounded up; null if absent/unparseable. */
export function retryAfterMinutes(header: string | null, now: number = Date.now()): number | null {
  if (!header) return null
  const secs = /^\d+$/.test(header.trim()) ? Number(header.trim()) : (Date.parse(header) - now) / 1000
  if (!Number.isFinite(secs) || secs <= 0) return null
  return Math.max(1, Math.ceil(secs / 60))
}

/** Same-origin JSON POST. Never stores anything in the browser. */
export async function submitDemoRequest(
  payload: DemoRequestPayload,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  let res: Response
  try {
    res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
      cache: 'no-store',
    })
  } catch {
    return { kind: 'network' }
  }
  if (res.status === 202 || res.status === 200 || res.status === 201) return { kind: 'success' }
  if (res.status === 422) {
    let fields: string[] = []
    try {
      const body: unknown = await res.json()
      if (body && typeof body === 'object' && Array.isArray((body as { fields?: unknown }).fields)) {
        fields = (body as { fields: unknown[] }).fields.filter((f): f is string => typeof f === 'string')
      }
    } catch {
      /* body not JSON: generic error */
    }
    return { kind: 'invalid', fields }
  }
  if (res.status === 413) return { kind: 'tooLarge' }
  if (res.status === 429)
    return { kind: 'rateLimited', minutes: retryAfterMinutes(res.headers.get('Retry-After')) }
  return { kind: 'server' }
}
