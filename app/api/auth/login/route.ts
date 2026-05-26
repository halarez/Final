import { NextResponse, type NextRequest } from 'next/server'
import { comparePasswords } from '@/src/lib/hash'
import { createOtp, saveOtp } from '@/src/lib/otpStore'
import { verifyTurnstileToken } from '@/src/lib/turnstile'
import { findUserByEmail, normalizeEmail } from '@/src/lib/users'
import { sendOtpEmail } from '@/src/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, turnstileToken } = await request.json()

    if (!email || !password || !turnstileToken) {
      return NextResponse.json({ error: 'Email, password, and verification are required.' }, { status: 400 })
    }

    const remoteIp = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')
    const isHuman = await verifyTurnstileToken(turnstileToken, remoteIp)

    if (!isHuman) {
      return NextResponse.json({ error: 'Human verification failed. Please try again.' }, { status: 403 })
    }

    const normalizedEmail = normalizeEmail(email)
    const user = findUserByEmail(normalizedEmail)

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const passwordMatches = await comparePasswords(password, user.passwordHash)

    if (!passwordMatches) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const otp = createOtp()
    saveOtp(normalizedEmail, otp)
    const emailResult = await sendOtpEmail({ to: normalizedEmail, code: otp })

    if (!emailResult.sent) {
      console.error('OTP email failed', emailResult)

      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          message: `Development OTP for ${normalizedEmail}: ${otp}`,
          email: normalizedEmail,
          devOtp: otp,
        })
      }

      let error = 'OTP email could not be sent. Check EMAIL_USER and the Gmail App Password.'

      if (emailResult.reason === 'missing-email-config') {
        error = 'OTP email is not configured. Replace EMAIL_APP_PASSWORD in .env.local with a real Gmail App Password, then restart the server.'
      }

      if (emailResult.reason === 'invalid-email-config') {
        error = 'EMAIL_APP_PASSWORD must be the 16-character Gmail App Password. Remove spaces, then restart the server.'
      }

      if (emailResult.reason === 'smtp-failed') {
        error = 'OTP email could not be sent by Gmail SMTP. Check that EMAIL_USER is a Gmail account and EMAIL_APP_PASSWORD is a valid 16-character Gmail App Password.'
      }

      return NextResponse.json(
        { error },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: `OTP sent to ${normalizedEmail}.`,
      email: normalizedEmail,
    })
  } catch {
    return NextResponse.json({ error: 'Unable to process login request.' }, { status: 500 })
  }
}
