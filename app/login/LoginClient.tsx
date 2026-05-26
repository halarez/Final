'use client'

import Script from 'next/script'
import { useMemo, useRef, useState } from 'react'

type Step = 'credentials' | 'otp'

declare global {
  interface Window {
    turnstile?: {
      render: (
        selector: string,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback': () => void
          'error-callback': () => void
        },
      ) => void
      reset: () => void
    }
  }
}

export default function LoginClient() {
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('halarez123@gmail.com')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [turnstileReady, setTurnstileReady] = useState(false)
  const [localVerified, setLocalVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const turnstileRendered = useRef(false)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  function renderTurnstile() {
    if (!siteKey || turnstileRendered.current || !window.turnstile) {
      return
    }

    window.turnstile.render('#turnstile-widget', {
      sitekey: siteKey,
      callback: (token) => {
        setTurnstileToken(token)
        setTurnstileReady(true)
      },
      'expired-callback': () => {
        setTurnstileToken('')
        setTurnstileReady(false)
      },
      'error-callback': () => {
        setTurnstileToken('')
        setTurnstileReady(false)
        setError('Human verification could not load. Check the Turnstile site key and allowed hostname.')
      },
    })
    turnstileRendered.current = true
  }

  const buttonText = useMemo(() => {
    if (isLoading) {
      return step === 'credentials' ? 'Sending OTP...' : 'Verifying...'
    }

    return step === 'credentials' ? 'Send OTP' : 'Verify OTP'
  }, [isLoading, step])

  async function submitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        turnstileToken,
      }),
    })

    const data = await response.json()
    setIsLoading(false)

    if (!response.ok) {
      setError(data.error ?? 'Login failed.')
      window.turnstile?.reset()
      setTurnstileToken('')
      setLocalVerified(false)
      return
    }

    setStep('otp')
    setMessage(data.message ?? 'OTP sent to your email.')
  }

  function verifyLocally() {
    const nextVerified = !localVerified
    setLocalVerified(nextVerified)
    setTurnstileToken(nextVerified ? 'local' : '')
  }

  async function submitOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })

    const data = await response.json()
    setIsLoading(false)

    if (!response.ok) {
      setError(data.error ?? 'OTP verification failed.')
      return
    }

    window.location.href = data.redirectTo
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            Secure Grades Portal
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-gray-950 sm:text-5xl">
            Protected access for admin and student grades.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-gray-700">
            Sign in with password, human verification, and a five-minute OTP before reaching the right grades page for your role.
          </p>
        </div>

        <div className="rounded-lg border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/80 backdrop-blur">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-950">
              {step === 'credentials' ? 'Login' : 'Verify OTP'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'credentials'
                ? 'Use your registered account to continue.'
                : `Enter the code sent to ${email}.`}
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          {step === 'credentials' ? (
            <form className="space-y-4" onSubmit={submitCredentials}>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Email</span>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none ring-teal-600 transition focus:ring-2"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-800">Password</span>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none ring-teal-600 transition focus:ring-2"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              <div className="rounded-md border border-gray-200 bg-slate-50 p-3">
                <p className="mb-3 text-sm font-medium text-gray-800">Human verification</p>
                {siteKey ? (
                  <>
                    <Script
                      src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                      async
                      defer
                      onLoad={renderTurnstile}
                    />
                    <div id="turnstile-widget" className="min-h-[65px]" />
                    {!turnstileReady ? (
                      <p className="mt-2 text-xs text-gray-500">
                        Complete the Cloudflare verification before sending the OTP.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div>
                    <label
                      className="flex w-full max-w-[304px] items-center justify-between rounded-[3px] border border-gray-300 bg-[#f9f9f9] p-3 text-left shadow-sm transition hover:border-gray-400"
                    >
                      <input
                        checked={localVerified}
                        className="h-8 w-8 cursor-pointer accent-blue-600"
                        type="checkbox"
                        onChange={verifyLocally}
                      />
                      <span className="flex items-center gap-3">
                        <span className="text-[18px] text-gray-900">I&apos;m not a robot</span>
                      </span>
                      <span className="text-center text-[10px] leading-tight text-gray-600">
                        <span className="mx-auto mb-1 block h-8 w-8 rounded-sm bg-[conic-gradient(#2563eb,#2563eb_25%,#d1d5db_25%,#d1d5db_50%,#1d4ed8_50%,#1d4ed8_75%,#d1d5db_75%)]" />
                        reCAPTCHA
                        <span className="block text-[9px]">Privacy - Terms</span>
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <button
                className="w-full rounded-md bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                type="submit"
                disabled={isLoading || !turnstileToken}
              >
                {buttonText}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={submitOtp}>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">OTP Code</span>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none ring-teal-600 transition focus:ring-2"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                  required
                />
              </label>

              <button
                className="w-full rounded-md bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                type="submit"
                disabled={isLoading}
              >
                {buttonText}
              </button>

              <button
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50"
                type="button"
                onClick={() => setStep('credentials')}
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
