const placeholderValues = new Set([
  'your-cloudflare-turnstile-site-key',
  'your-cloudflare-turnstile-secret-key',
  'replace-with-your-cloudflare-turnstile-site-key',
  'replace-with-your-cloudflare-turnstile-secret-key',
])

export function isConfiguredTurnstileValue(value?: string): value is string {
  const normalizedValue = value?.trim()
  return Boolean(normalizedValue && !placeholderValues.has(normalizedValue))
}

export function isTurnstileSiteKeyConfigured() {
  return isConfiguredTurnstileValue(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
}
