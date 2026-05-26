import bcrypt from 'bcryptjs'

export function comparePasswords(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}
