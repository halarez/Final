import { NextResponse } from 'next/server'
import { createAuthToken, authCookieName } from '@/src/lib/auth'
import { validateOtp } from '@/src/lib/otpStore'
import { findUserByEmail, normalizeEmail } from '@/src/lib/users'

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 })
    }

    const normalizedEmail = normalizeEmail(email)
    const user = findUserByEmail(normalizedEmail)

    if (!user || !validateOtp(normalizedEmail, otp)) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Use the newest code from your email, or go back and send a new OTP.' },
        { status: 401 },
      )
    }

    const token = createAuthToken({
      email: user.email,
      role: user.role,
      name: user.name,
    })

    const redirectTo = user.role === 'admin' ? '/admin/grades' : '/grades'
    const response = NextResponse.json({ redirectTo })

    response.cookies.set(authCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Unable to verify OTP.' }, { status: 500 })
  }
}
