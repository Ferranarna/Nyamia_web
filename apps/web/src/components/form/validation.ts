/**
 * Client-side validation mirroring the API contract (spec.md § Demo-request contract).
 * UX only: the API (Pydantic) and the domain entity validate again.
 */
import type { Locale } from '../../i18n'
import { PRIVACY_VERSION } from '../../lib/privacy'

export const ROLES = ['dietitian_private', 'dietitian_clinical', 'clinic', 'coach', 'other'] as const
export const CLIENT_VOLUMES = ['1-15', '16-40', '41-80', '80+'] as const
export type Role = (typeof ROLES)[number]
export type ClientVolume = (typeof CLIENT_VOLUMES)[number]

export const LIMITS = { nameMin: 2, nameMax: 100, emailMax: 254, practiceMax: 120, messageMax: 1000 } as const

export interface FormValues {
  name: string
  email: string
  role: string
  practiceName: string
  clientVolume: string
  message: string
  consent: boolean
  website: string
}

export type FieldName = 'name' | 'email' | 'role' | 'practiceName' | 'message' | 'consent'
export const FIELD_ORDER: readonly FieldName[] = [
  'name',
  'email',
  'role',
  'practiceName',
  'message',
  'consent',
]

/** Keys of `demo.validation` in the i18n files. */
export type ValidationKey =
  | 'nameRequired'
  | 'nameLength'
  | 'emailRequired'
  | 'emailInvalid'
  | 'emailTooLong'
  | 'roleRequired'
  | 'practiceNameTooLong'
  | 'messageTooLong'
  | 'consentRequired'

export const EMPTY_VALUES: FormValues = {
  name: '',
  email: '',
  role: '',
  practiceName: '',
  clientVolume: '',
  message: '',
  consent: false,
  website: '',
}

// Pragmatic shape check (the API applies full RFC validation).
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

export function validateField(field: FieldName, v: FormValues): ValidationKey | null {
  switch (field) {
    case 'name': {
      const n = v.name.trim()
      if (!n) return 'nameRequired'
      if (n.length < LIMITS.nameMin || n.length > LIMITS.nameMax) return 'nameLength'
      return null
    }
    case 'email': {
      const e = v.email.trim()
      if (!e) return 'emailRequired'
      if (e.length > LIMITS.emailMax) return 'emailTooLong'
      if (!EMAIL_RE.test(e)) return 'emailInvalid'
      return null
    }
    case 'role':
      return (ROLES as readonly string[]).includes(v.role) ? null : 'roleRequired'
    case 'practiceName':
      return v.practiceName.trim().length > LIMITS.practiceMax ? 'practiceNameTooLong' : null
    case 'message':
      return v.message.trim().length > LIMITS.messageMax ? 'messageTooLong' : null
    case 'consent':
      return v.consent ? null : 'consentRequired'
  }
}

export function validateAll(v: FormValues): Partial<Record<FieldName, ValidationKey>> {
  const errors: Partial<Record<FieldName, ValidationKey>> = {}
  for (const f of FIELD_ORDER) {
    const e = validateField(f, v)
    if (e) errors[f] = e
  }
  return errors
}

export interface DemoRequestPayload {
  name: string
  email: string
  role: Role
  practice_name: string | null
  client_volume: ClientVolume | null
  message: string | null
  locale: Locale
  consent: true
  privacy_version: string
  website: string
}

export function buildPayload(v: FormValues, locale: Locale): DemoRequestPayload {
  const opt = (s: string) => (s.trim() ? s.trim() : null)
  return {
    name: v.name.trim(),
    email: v.email.trim().toLowerCase(),
    role: v.role as Role,
    practice_name: opt(v.practiceName),
    client_volume: (CLIENT_VOLUMES as readonly string[]).includes(v.clientVolume)
      ? (v.clientVolume as ClientVolume)
      : null,
    message: opt(v.message),
    locale,
    consent: true,
    privacy_version: PRIVACY_VERSION,
    website: v.website,
  }
}

/** API field names (422 `fields[]`) → form fields. Unknown ones fall back to the generic error. */
export const API_FIELD_MAP: Record<string, FieldName> = {
  name: 'name',
  email: 'email',
  role: 'role',
  practice_name: 'practiceName',
  message: 'message',
  consent: 'consent',
}

/** Generic per-field message used when the API rejects a field. */
export const API_FIELD_MESSAGE: Record<FieldName, ValidationKey> = {
  name: 'nameLength',
  email: 'emailInvalid',
  role: 'roleRequired',
  practiceName: 'practiceNameTooLong',
  message: 'messageTooLong',
  consent: 'consentRequired',
}
