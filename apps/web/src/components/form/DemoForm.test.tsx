import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DemoForm, { type DemoFormCopy } from './DemoForm'
import { es } from '../../i18n/es'
import { en } from '../../i18n/en'

const copyFor = (d: typeof es): DemoFormCopy => ({
  form: d.demo.form,
  validation: d.demo.validation,
  success: d.demo.success,
  errors: d.demo.errors,
  status: d.mockup.menu.status,
  externalLink: d.a11y.externalLink,
})

function setup(locale: 'es' | 'en' = 'es') {
  const d = locale === 'es' ? es : en
  const user = userEvent.setup()
  render(
    <DemoForm
      copy={copyFor(d)}
      locale={locale}
      privacyHref={locale === 'es' ? '/privacidad/' : '/en/privacy/'}
    />,
  )
  return { user, d }
}

async function fillValid(user: ReturnType<typeof userEvent.setup>, d: typeof es) {
  await user.type(screen.getByLabelText(new RegExp(d.demo.form.name.label)), 'Ana Pérez')
  await user.type(screen.getByLabelText(new RegExp(d.demo.form.email.label)), 'ana@example.com')
  await user.click(screen.getByLabelText(d.demo.form.role.options.dietitian_private))
  await user.click(screen.getByRole('checkbox'))
}

const respond = (status: number, body: unknown = {}, headers: Record<string, string> = {}) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status, headers }))

describe('DemoForm', () => {
  let setItem: ReturnType<typeof vi.spyOn>
  let sessionSet: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    setItem = vi.spyOn(Storage.prototype, 'setItem')
    sessionSet = setItem
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('enables submit only after hydration and links the locale privacy page', () => {
    setup('en')
    expect(screen.getByTestId('submit')).toBeEnabled()
    expect(screen.getByRole('link', { name: /privacy information/i })).toHaveAttribute('href', '/en/privacy/')
  })

  it('validates on submit, focuses the first invalid field and does not call the API', async () => {
    const fetchMock = respond(202)
    vi.stubGlobal('fetch', fetchMock)
    const { user, d } = setup()
    await user.click(screen.getByTestId('submit'))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText(d.demo.validation.nameRequired)).toBeInTheDocument()
    expect(screen.getByText(d.demo.validation.emailRequired)).toBeInTheDocument()
    expect(screen.getByText(d.demo.validation.roleRequired)).toBeInTheDocument()
    expect(screen.getByText(d.demo.validation.consentRequired)).toBeInTheDocument()
    expect(screen.getByLabelText(new RegExp(d.demo.form.name.label))).toHaveFocus()
    expect(screen.getByLabelText(new RegExp(d.demo.form.name.label))).toHaveAttribute('aria-invalid', 'true')
  })

  it('validates on blur and clears the error while typing the fix', async () => {
    const { user, d } = setup()
    const email = screen.getByLabelText(new RegExp(d.demo.form.email.label))
    await user.type(email, 'ana@')
    await user.tab()
    expect(screen.getByText(d.demo.validation.emailInvalid)).toBeInTheDocument()
    await user.type(email, 'example.com')
    expect(screen.queryByText(d.demo.validation.emailInvalid)).not.toBeInTheDocument()
  })

  it('submits the contract payload once and shows the success state (202)', async () => {
    let resolve!: (r: Response) => void
    const fetchMock = vi.fn(() => new Promise<Response>((r) => (resolve = r)))
    vi.stubGlobal('fetch', fetchMock)
    const { user, d } = setup()
    await fillValid(user, d)
    await user.click(screen.getByTestId('submit'))
    // In flight: button disabled, second click ignored.
    expect(screen.getByTestId('submit')).toBeDisabled()
    expect(screen.getByTestId('submit')).toHaveTextContent(d.demo.form.submitting)
    await user.click(screen.getByTestId('submit'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(body).toMatchObject({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      role: 'dietitian_private',
      consent: true,
      locale: 'es',
      privacy_version: '2026-10-30',
      website: '',
      practice_name: null,
      client_volume: null,
      message: null,
    })
    await act(async () => resolve(new Response('{"status":"received"}', { status: 202 })))
    expect(await screen.findByTestId('form-success')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: d.demo.success.title })).toHaveFocus()
    expect(setItem).not.toHaveBeenCalled()
    expect(sessionSet).not.toHaveBeenCalled()
    expect(document.cookie).toBe('')
  })

  it('maps 422 fields[] to inline messages and keeps the data', async () => {
    vi.stubGlobal('fetch', respond(422, { detail: 'invalid_request', fields: ['email'] }))
    const { user, d } = setup()
    await fillValid(user, d)
    await user.click(screen.getByTestId('submit'))
    expect(await screen.findByText(d.demo.validation.emailInvalid)).toBeInTheDocument()
    expect(screen.getByTestId('form-banner')).toHaveTextContent(d.demo.validation.summary)
    expect(screen.getByLabelText(new RegExp(d.demo.form.name.label))).toHaveValue('Ana Pérez')
    await waitFor(() => expect(screen.getByLabelText(new RegExp(d.demo.form.email.label))).toHaveFocus())
  })

  it('shows the 429 message with minutes from Retry-After', async () => {
    vi.stubGlobal('fetch', respond(429, { detail: 'too_many_requests' }, { 'Retry-After': '1200' }))
    const { user, d } = setup()
    await fillValid(user, d)
    await user.click(screen.getByTestId('submit'))
    const banner = await screen.findByTestId('form-banner')
    expect(banner).toHaveTextContent(d.demo.errors.tooManyRequestsRetry.replace('{minutes}', '20'))
    expect(banner).toHaveAttribute('role', 'status')
  })

  it('shows 413 and 5xx errors, and retries on network failure', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(new Response('{}', { status: 202 }))
    vi.stubGlobal('fetch', fetchMock)
    const { user, d } = setup()
    await fillValid(user, d)
    await user.click(screen.getByTestId('submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent(d.demo.errors.network)
    await user.click(screen.getByRole('button', { name: d.demo.errors.retry }))
    expect(await screen.findByTestId('form-success')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each([
    [413, 'tooLarge'],
    [500, 'server'],
  ] as const)('HTTP %i → %s banner', async (status, key) => {
    vi.stubGlobal('fetch', respond(status))
    const { user, d } = setup()
    await fillValid(user, d)
    await user.click(screen.getByTestId('submit'))
    expect(await screen.findByRole('alert')).toHaveTextContent(d.demo.errors[key])
  })

  it('keeps the honeypot out of the accessibility tree and tab order', () => {
    setup()
    const hp = document.querySelector<HTMLInputElement>('input[name="website"]')!
    expect(hp).toHaveAttribute('tabindex', '-1')
    expect(hp.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(screen.queryByRole('textbox', { name: es.demo.form.honeypot.label })).toBeNull()
  })
})
