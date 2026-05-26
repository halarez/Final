import jwt from 'jsonwebtoken'
import type { UserRole } from './users'

export type AuthTokenPayload = {
  email: string
  role: UserRole
  name: string
}

const defaultJwtSecret = 'local-development-secret-change-before-production'

export const authCookieName = 'auth_token'

function getJwtSecret() {
  return process.env.JWT_SECRET || defaultJwtSecret
}

export function createAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' })
}

export function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload
  } catch {
    return null
  }
}
