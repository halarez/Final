type TurnstileResponse = {
  success: boolean
  'error-codes'?: string[]
}

export async function verifyTurnstileToken(token: string, remoteIp?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (process.env.NODE_ENV !== 'production' && token === 'local') {
    return true
  }

  if (!secret || !token) {
    return false
  }

  const formData = new FormData()
  formData.append('secret', secret)
  formData.append('response', token)

  if (remoteIp) {
    formData.append('remoteip', remoteIp)
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    return false
  }

  const result = (await response.json()) as TurnstileResponse
  return result.success
}
