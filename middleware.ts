import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const authCookieName = 'auth_token'
const defaultJwtSecret = 'local-development-secret-change-before-production'

const publicPaths = ['/login', '/api/auth/login', '/api/auth/verify-otp']

async function verifyMiddlewareToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || defaultJwtSecret)
    const { payload } = await jwtVerify(token, secret)
    return payload as { role?: string }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(authCookieName)?.value
  const user = token ? await verifyMiddlewareToken(token) : null

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/grades', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
