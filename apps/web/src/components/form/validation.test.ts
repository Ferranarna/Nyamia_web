import { describe, expect, it } from 'vitest'
import { buildPayload, EMPTY_VALUES, validateAll, validateField, type FormValues } from './validation'
import { retryAfterMinutes, submitDemoRequest } from './submit'

const valid: FormValues = {
  ...EMPTY_VALUES,
  name: '  Ana Pérez ',
  email: ' Ana@Example.COM ',
  role: 'dietitian_private',
  consent: true,
}

describe('validation mirrors the API contract', () => {
  it('accepts a minimal valid request', () => {
    expect(validateAll(valid)).toEqual({})
  })

  it.each([
    ['name', { name: '' }, 'nameRequired'],
    ['name', { name: ' a ' }, 'nameLength'],
    ['name', { name: 'x'.repeat(101) }, 'nameLength'],
    ['email', { email: '' }, 'emailRequired'],
    ['email', { email: 'nope' }, 'emailInvalid'],
    ['email', { email: 'a@b' }, 'emailInvalid'],
    ['email', { email: `${'a'.repeat(250)}@x.es` }, 'emailTooLong'],
    ['role', { role: 'doctor' }, 'roleRequired'],
    ['practiceName', { practiceName: 'x'.repeat(121) }, 'practiceNameTooLong'],
    ['message', { message: 'x'.repeat(1001) }, 'messageTooLong'],
    ['consent', { consent: false }, 'consentRequired'],
  ] as const)('%s %j → %s', (field, patch, key) => {
    expect(validateField(field, { ...valid, ...patch })).toBe(key)
  })

  it('accepts boundary lengths', () => {
    expect(validateField('name', { ...valid, name: 'Al' })).toBeNull()
    expect(validateField('name', { ...valid, name: 'x'.repeat(100) })).toBeNull()
    expect(validateField('practiceName', { ...valid, practiceName: 'x'.repeat(120) })).toBeNull()
    expect(validateField('message', { ...valid, message: 'x'.repeat(1000) })).toBeNull()
  })

  it('builds the contract payload (trimmed, lowercase email, nulls, constants)', () => {
    expect(buildPayload({ ...valid, clientVolume: '16-40', message: '  ' }, 'en')).toEqual({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      role: 'dietitian_private',
      practice_name: null,
      client_volume: '16-40',
      message: null,
      locale: 'en',
      consent: true,
      privacy_version: '2026-10-30',
      website: '',
    })
  })

  it('passes the honeypot through untouched (server decides)', () => {
    expect(buildPayload({ ...valid, website: 'spam' }, 'es').website).toBe('spam')
  })
})

describe('submit', () => {
  it('rounds Retry-After seconds up to minutes', () => {
    expect(retryAfterMinutes('3600')).toBe(60)
    expect(retryAfterMinutes('61')).toBe(2)
    expect(retryAfterMinutes('5')).toBe(1)
    expect(retryAfterMinutes(null)).toBeNull()
    expect(retryAfterMinutes('garbage')).toBeNull()
    const now = Date.parse('2026-10-30T10:00:00Z')
    expect(retryAfterMinutes('Fri, 30 Oct 2026 10:10:00 GMT', now)).toBe(10)
  })

  it.each([
    [202, {}, { kind: 'success' }],
    [422, { fields: ['email', 'name'] }, { kind: 'invalid', fields: ['email', 'name'] }],
    [413, {}, { kind: 'tooLarge' }],
    [500, {}, { kind: 'server' }],
    [503, {}, { kind: 'server' }],
  ] as const)('maps HTTP %i', async (status, body, expected) => {
    const fetchMock = async () => new Response(JSON.stringify(body), { status })
    expect(await submitDemoRequest(buildPayload(valid, 'es'), fetchMock as typeof fetch)).toEqual(expected)
  })

  it('maps 429 with Retry-After', async () => {
    const fetchMock = async () => new Response('{}', { status: 429, headers: { 'Retry-After': '900' } })
    expect(await submitDemoRequest(buildPayload(valid, 'es'), fetchMock as typeof fetch)).toEqual({
      kind: 'rateLimited',
      minutes: 15,
    })
  })

  it('maps network failures', async () => {
    const fetchMock = async () => {
      throw new TypeError('Failed to fetch')
    }
    expect(await submitDemoRequest(buildPayload(valid, 'es'), fetchMock as typeof fetch)).toEqual({
      kind: 'network',
    })
  })

  it('POSTs JSON to the same-origin endpoint', async () => {
    let call: [string, RequestInit] | null = null
    const fetchMock = async (url: string, init: RequestInit) => {
      call = [url, init]
      return new Response('{"status":"received"}', { status: 202 })
    }
    await submitDemoRequest(buildPayload(valid, 'es'), fetchMock as unknown as typeof fetch)
    expect(call![0]).toBe('/api/v1/demo-requests')
    expect(call![1].method).toBe('POST')
    expect((call![1].headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(JSON.parse(call![1].body as string).privacy_version).toBe('2026-10-30')
  })
})
