# Secure Next.js Authentication System

Full-stack Next.js App Router authentication system with JWT sessions, bcrypt password checks, OTP email verification, Cloudflare Turnstile, and role-based access to grades pages.

## Features

- Single login page for admin and user accounts
- Email normalization and account lookup in `src/lib/users.ts`
- bcrypt password comparison
- OTP generation, server-side storage, and five-minute expiration
- Gmail SMTP delivery with Nodemailer
- Cloudflare Turnstile frontend widget and backend token verification
- JWT auth cookie after OTP verification
- Protected admin and user grades routes
- Middleware authorization for role-based access
- Responsive Tailwind CSS UI

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000/login`.

Default admin account:

- Email: `halarez123@gmail.com`
- Password: `Tala@890`

Second admin account:

- Email: `hhalarez@gmail.com`
- Password: `Rezt06200`
- Access: `/admin/grades`

When Turnstile environment variables are not configured in local development, the app shows a checkbox-style local verification button.

OTP codes are never shown on screen. Real OTP email delivery requires Gmail SMTP credentials in `.env.local` or Vercel environment variables.

## Environment Variables

Create `.env.local` for real local email/CAPTCHA testing or configure the same values in Vercel:

```env
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
TURNSTILE_SECRET_KEY=your-cloudflare-turnstile-secret-key
EMAIL_USER=your-gmail-address
EMAIL_APP_PASSWORD=your-gmail-app-password
```

After changing Vercel environment variables, redeploy the project.

## Routes

- `GET /login`
- `GET /grades`
- `GET /admin/grades`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/logout`

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
