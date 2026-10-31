import { useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import type { Dictionary, Locale } from '../../i18n'
import { format, splitAround } from '../../i18n'
import { cn } from '../../lib/cn'
import { Icon } from '../ui/Icon'
import { alert, button, complianceTint, formField, input, menuGrid, spinner } from '../mockups/appUi'
import { submitDemoRequest, type SubmitResult } from './submit'
import {
  API_FIELD_MAP,
  API_FIELD_MESSAGE,
  CLIENT_VOLUMES,
  EMPTY_VALUES,
  FIELD_ORDER,
  LIMITS,
  ROLES,
  buildPayload,
  validateAll,
  validateField,
  type FieldName,
  type FormValues,
  type ValidationKey,
} from './validation'

export interface DemoFormCopy {
  form: Dictionary['demo']['form']
  validation: Dictionary['demo']['validation']
  success: Dictionary['demo']['success']
  errors: Dictionary['demo']['errors']
  status: Dictionary['mockup']['menu']['status']
  externalLink: string
}

type Phase = 'idle' | 'submitting' | 'success'
type Banner = { variant: 'error' | 'accent'; text: string; retry: boolean } | null

const COUNTER_FROM = 800

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string
  children: ReactNode
  optional?: string
}) {
  return (
    <label htmlFor={htmlFor} className={formField.label}>
      {children}
      {optional ? <span className="ml-1 font-normal text-text-muted">{optional}</span> : null}
    </label>
  )
}

function FieldError({ id, text }: { id: string; text: string | null }) {
  if (!text) return null
  return (
    <p id={id} className={cn(formField.error, 'flex items-center gap-1 text-sm')}>
      <Icon name="alert-circle" size={14} />
      {text}
    </p>
  )
}

function ValidMark({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span
      className="field-check pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-brand-600"
      data-testid="valid-mark"
    >
      <Icon name="check" size={16} />
    </span>
  )
}

export default function DemoForm({
  copy,
  locale,
  privacyHref,
}: {
  copy: DemoFormCopy
  locale: Locale
  privacyHref: string
}) {
  const uid = useId()
  const id = (f: string) => `${uid}-${f}`
  const f = copy.form
  const [ready, setReady] = useState(false)
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<Partial<Record<FieldName, ValidationKey>>>({})
  const [checked, setChecked] = useState<Partial<Record<FieldName, boolean>>>({})
  const [phase, setPhase] = useState<Phase>('idle')
  const [banner, setBanner] = useState<Banner>(null)
  const [summary, setSummary] = useState('')
  const inFlight = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  const dirty = useRef<Partial<Record<FieldName, boolean>>>({})

  useEffect(() => setReady(true), [])
  useEffect(() => {
    if (phase === 'success') successRef.current?.focus()
  }, [phase])

  const busy = phase === 'submitting'

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    const next = { ...values, [key]: value }
    setValues(next)
    const field = key as FieldName
    if ((FIELD_ORDER as readonly string[]).includes(field)) {
      dirty.current[field] = true
      // Errors clear (or update) while typing once a field is in error.
      if (errors[field] || field === 'role' || field === 'consent') {
        const e = validateField(field, next)
        setErrors((prev) => ({ ...prev, [field]: e ?? undefined }))
        setChecked((prev) => ({ ...prev, [field]: !e }))
      }
    }
  }

  function onBlur(field: FieldName) {
    // Validate on blur once changed, or when tabbing through a required text field.
    const required = field === 'name' || field === 'email'
    if (!dirty.current[field] && !required) return
    const e = validateField(field, values)
    setErrors((prev) => ({ ...prev, [field]: e ?? undefined }))
    setChecked((prev) => ({ ...prev, [field]: !e && String(values[field]).trim() !== '' }))
  }

  function focusField(field: FieldName) {
    const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`)
    el?.focus()
  }

  function text(field: FieldName): string | null {
    const k = errors[field]
    return k ? copy.validation[k] : null
  }

  function describedBy(field: FieldName, help?: string): string | undefined {
    const ids = [help ? id(`${field}-help`) : null, errors[field] ? id(`${field}-error`) : null].filter(
      Boolean,
    )
    return ids.length ? ids.join(' ') : undefined
  }

  async function send() {
    if (inFlight.current) return
    inFlight.current = true
    setPhase('submitting')
    setBanner(null)
    let result: SubmitResult
    try {
      result = await submitDemoRequest(buildPayload(values, locale))
    } finally {
      inFlight.current = false
    }
    switch (result.kind) {
      case 'success':
        setPhase('success')
        return
      case 'invalid': {
        const mapped: Partial<Record<FieldName, ValidationKey>> = {}
        for (const apiField of result.fields) {
          const field = API_FIELD_MAP[apiField]
          if (field) mapped[field] = API_FIELD_MESSAGE[field]
        }
        const first = FIELD_ORDER.find((fl) => mapped[fl])
        setErrors(mapped)
        setChecked({})
        setBanner({
          variant: 'error',
          text: first ? copy.validation.summary : copy.errors.invalid,
          retry: false,
        })
        setSummary(first ? copy.validation.summary : copy.errors.invalid)
        setPhase('idle')
        if (first) requestAnimationFrame(() => focusField(first))
        return
      }
      case 'tooLarge':
        setBanner({ variant: 'error', text: copy.errors.tooLarge, retry: false })
        break
      case 'rateLimited':
        setBanner({
          variant: 'accent',
          text:
            result.minutes !== null
              ? format(copy.errors.tooManyRequestsRetry, { minutes: result.minutes })
              : copy.errors.tooManyRequests,
          retry: false,
        })
        break
      case 'server':
        setBanner({ variant: 'error', text: copy.errors.server, retry: true })
        break
      case 'network':
        setBanner({ variant: 'error', text: copy.errors.network, retry: true })
        break
    }
    setPhase('idle')
  }

  function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (busy || inFlight.current) return
    const all = validateAll(values)
    setErrors(all)
    const first = FIELD_ORDER.find((fl) => all[fl])
    if (first) {
      setSummary(copy.validation.summary)
      focusField(first)
      return
    }
    setSummary('')
    void send()
  }

  function reset() {
    setValues(EMPTY_VALUES)
    setErrors({})
    setChecked({})
    setBanner(null)
    setSummary('')
    dirty.current = {}
    setPhase('idle')
  }

  if (phase === 'success') {
    const today = new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-5 py-6 text-center"
        data-testid="form-success"
      >
        <div
          className={cn(menuGrid.day, complianceTint.green, 'success-day w-40 items-center p-3')}
          aria-hidden="true"
        >
          <span className={menuGrid.dayTitle}>{today}</span>
          <span className="relative text-xs">
            <span className="success-status-final text-brand-700">{copy.status.green}</span>
            <span className="success-status-initial absolute inset-0 text-text-muted">
              {copy.status.none}
            </span>
          </span>
          <svg viewBox="0 0 40 40" width="40" height="40" className="mt-1 text-brand-600">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path
              className="success-check"
              d="M12 20.5l5.5 5.5L28 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 ref={successRef} tabIndex={-1} className="text-title text-text outline-none">
          {copy.success.title}
        </h3>
        <p className="max-w-[40ch] text-text-muted">{copy.success.body}</p>
        <button
          type="button"
          onClick={reset}
          className={cn(button.base, button.variants.ghost, button.sizes.sm)}
        >
          {copy.success.again}
        </button>
      </div>
    )
  }

  const [consentBefore, consentAfter] = splitAround(f.consent.label, 'privacyLink')
  const msgLen = values.message.length

  return (
    <form
      ref={formRef}
      method="post"
      noValidate
      onSubmit={onSubmit}
      aria-describedby={id('legend')}
      aria-busy={busy}
      className="flex flex-col gap-6"
      data-testid="demo-form"
      data-ready={ready ? 'true' : 'false'}
    >
      <p id={id('legend')} className="text-sm text-text-muted">
        {f.requiredLegend}
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {summary}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className={formField.wrapper}>
          <Label htmlFor={id('name')}>
            {f.name.label} <span aria-hidden="true">{f.requiredMark}</span>
          </Label>
          <div className="relative">
            <input
              id={id('name')}
              data-field="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={LIMITS.nameMax + 20}
              placeholder={f.name.placeholder}
              value={values.name}
              readOnly={busy}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy('name')}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update('name', e.target.value)}
              onBlur={() => onBlur('name')}
              className={cn(
                input.base,
                errors.name ? input.state.error : input.state.default,
                'h-11 pr-9 text-base',
              )}
            />
            <ValidMark show={Boolean(checked.name)} />
          </div>
          <FieldError id={id('name-error')} text={text('name')} />
        </div>

        <div className={formField.wrapper}>
          <Label htmlFor={id('email')}>
            {f.email.label} <span aria-hidden="true">{f.requiredMark}</span>
          </Label>
          <div className="relative">
            <input
              id={id('email')}
              data-field="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder={f.email.placeholder}
              value={values.email}
              readOnly={busy}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy('email', f.email.help)}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => onBlur('email')}
              className={cn(
                input.base,
                errors.email ? input.state.error : input.state.default,
                'h-11 pr-9 text-base',
              )}
            />
            <ValidMark show={Boolean(checked.email)} />
          </div>
          {f.email.help ? (
            <p id={id('email-help')} className={formField.hint}>
              {f.email.help}
            </p>
          ) : null}
          <FieldError id={id('email-error')} text={text('email')} />
        </div>
      </div>

      <fieldset
        className="flex flex-col gap-2"
        aria-invalid={errors.role ? true : undefined}
        aria-describedby={describedBy('role')}
      >
        <legend className={cn(formField.label, 'mb-2', errors.role && 'text-danger-600')}>
          {f.role.label} <span aria-hidden="true">{f.requiredMark}</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROLES.map((r, i) => (
            <label
              key={r}
              className={cn(
                'relative flex min-h-12 cursor-pointer items-center gap-3 rounded-control border bg-surface px-3 py-2.5 text-sm text-text transition-colors duration-150',
                'border-border hover:border-brand-300 has-checked:border-brand-500 has-checked:bg-brand-50 has-focus-visible:ring-2 has-focus-visible:ring-brand-500',
              )}
            >
              <input
                type="radio"
                name="role"
                value={r}
                data-field={i === 0 ? 'role' : undefined}
                checked={values.role === r}
                disabled={busy}
                required
                onChange={() => update('role', r)}
                className="peer sr-only"
              />
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border-strong bg-surface peer-checked:border-brand-600">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    values.role === r ? 'bg-brand-600' : 'bg-transparent',
                  )}
                />
              </span>
              {f.role.options[r]}
            </label>
          ))}
        </div>
        <FieldError id={id('role-error')} text={text('role')} />
      </fieldset>

      <div className={formField.wrapper}>
        <Label htmlFor={id('practice')} optional={f.optionalMark}>
          {f.practiceName.label}
        </Label>
        <input
          id={id('practice')}
          data-field="practiceName"
          name="practice_name"
          type="text"
          autoComplete="organization"
          placeholder={f.practiceName.placeholder}
          value={values.practiceName}
          readOnly={busy}
          aria-invalid={errors.practiceName ? true : undefined}
          aria-describedby={describedBy('practiceName')}
          onChange={(e) => update('practiceName', e.target.value)}
          onBlur={() => onBlur('practiceName')}
          className={cn(
            input.base,
            errors.practiceName ? input.state.error : input.state.default,
            'h-11 text-base',
          )}
        />
        <FieldError id={id('practiceName-error')} text={text('practiceName')} />
      </div>

      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={f.clientVolume.help ? id('volume-help') : undefined}
      >
        <legend className={cn(formField.label, 'mb-2')}>
          {f.clientVolume.label}
          <span className="ml-1 font-normal text-text-muted">{f.optionalMark}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {(['', ...CLIENT_VOLUMES] as const).map((v) => (
            <label
              key={v || 'none'}
              className={cn(
                'inline-flex min-h-11 cursor-pointer items-center rounded-pill border border-border bg-surface px-4 text-sm text-text tabular-nums transition-colors duration-150',
                'hover:border-brand-300 has-focus-visible:ring-2 has-focus-visible:ring-brand-500',
                // The explicit null choice stays neutral when checked (UX P3-4).
                v === ''
                  ? 'has-checked:border-border has-checked:bg-surface-muted has-checked:text-text'
                  : 'has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:text-brand-700',
              )}
            >
              <input
                type="radio"
                name="client_volume"
                value={v}
                checked={values.clientVolume === v}
                disabled={busy}
                onChange={() => update('clientVolume', v)}
                className="sr-only"
              />
              {v === '' ? f.clientVolume.placeholder : f.clientVolume.options[v]}
            </label>
          ))}
        </div>
        {f.clientVolume.help ? (
          <p id={id('volume-help')} className={formField.hint}>
            {f.clientVolume.help}
          </p>
        ) : null}
      </fieldset>

      <div className={formField.wrapper}>
        <Label htmlFor={id('message')} optional={f.optionalMark}>
          {f.message.label}
        </Label>
        <textarea
          id={id('message')}
          data-field="message"
          name="message"
          rows={3}
          placeholder={f.message.placeholder}
          value={values.message}
          readOnly={busy}
          enterKeyHint="send"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy('message', f.message.help)}
          onChange={(e) => update('message', e.target.value)}
          onBlur={() => onBlur('message')}
          className={cn(
            input.base,
            errors.message ? input.state.error : input.state.default,
            'resize-y text-base',
          )}
        />
        <div className="flex justify-between gap-3">
          <p id={id('message-help')} className={formField.hint}>
            {format(f.message.help, { max: LIMITS.messageMax })}
          </p>
          {msgLen >= COUNTER_FROM ? (
            <p
              className={cn(formField.hint, 'tabular-nums', msgLen > LIMITS.messageMax && 'text-danger-600')}
              aria-live="polite"
            >
              {format(f.message.counter, { count: msgLen, max: LIMITS.messageMax })}
            </p>
          ) : null}
        </div>
        <FieldError id={id('message-error')} text={text('message')} />
      </div>

      {/* Honeypot: hidden from humans and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id('website')}>{f.honeypot.label}</label>
        <input
          id={id('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => update('website', e.target.value)}
        />
      </div>

      <div className={formField.wrapper}>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-text">
          <input
            type="checkbox"
            data-field="consent"
            name="consent"
            required
            checked={values.consent}
            disabled={busy}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={describedBy('consent')}
            onChange={(e) => update('consent', e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand-600"
          />
          <span>
            {consentBefore}
            <a
              href={privacyHref}
              target="_blank"
              rel="noopener"
              className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
            >
              {f.consent.linkLabel}
              <span className="sr-only"> {copy.externalLink}</span>
            </a>
            {consentAfter} <span aria-hidden="true">{f.requiredMark}</span>
          </span>
        </label>
        <FieldError id={id('consent-error')} text={text('consent')} />
      </div>

      {banner ? (
        <div
          role={banner.variant === 'error' ? 'alert' : 'status'}
          className={cn(
            alert.base,
            alert.variants[banner.variant],
            banner.variant === 'accent' && 'text-accent-700',
          )}
          data-testid="form-banner"
        >
          <Icon name="alert-circle" size={18} className="mt-0.5 shrink-0" />
          <div className="flex flex-1 flex-col items-start gap-2">
            <p>{banner.text}</p>
            {banner.retry ? (
              <button
                type="button"
                onClick={() => void send()}
                className={cn(button.base, button.variants.secondary, button.sizes.sm)}
              >
                {copy.errors.retry}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!ready || busy}
        aria-disabled={!ready || busy}
        className={cn(button.base, button.variants.primary, button.sizes.lg, 'w-full')}
        data-testid="submit"
      >
        {busy ? (
          <span
            className={cn(spinner.base, spinner.sizes.sm, 'border-brand-300 border-t-on-solid')}
            aria-hidden="true"
          />
        ) : null}
        {busy ? f.submitting : f.submit}
      </button>
    </form>
  )
}
