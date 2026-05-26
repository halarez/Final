import nodemailer from 'nodemailer'

type OtpEmailParams = {
  to: string
  code: string
}

type OtpEmailResult =
  | { sent: true }
  | { sent: false; reason: 'missing-email-config' }
  | { sent: false; reason: 'invalid-email-config' }
  | { sent: false; reason: 'smtp-failed'; error: string }

export function createTransporter() {
  const user = process.env.EMAIL_USER?.trim()
  const pass = process.env.EMAIL_APP_PASSWORD?.replace(/\s/g, '')

  if (!user || !pass || pass === 'replace-with-your-gmail-app-password') {
    return null
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

export async function sendOtpEmail({ to, code }: OtpEmailParams): Promise<OtpEmailResult> {
  const appPassword = process.env.EMAIL_APP_PASSWORD?.replace(/\s/g, '')

  if (appPassword && appPassword !== 'replace-with-your-gmail-app-password' && appPassword.length !== 16) {
    return { sent: false, reason: 'invalid-email-config' }
  }

  const transporter = createTransporter()

  if (!transporter) {
    return { sent: false, reason: 'missing-email-config' }
  }

  try {
    await transporter.verify()
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Your grades portal verification code',
      text: `Your OTP code is ${code}. It expires in 5 minutes.`,
    })
  } catch (error) {
    return {
      sent: false,
      reason: 'smtp-failed',
      error: error instanceof Error ? error.message : 'Unknown SMTP error',
    }
  }

  return { sent: true }
}
