export type UserRole = 'admin' | 'user'

export type AppUser = {
  email: string
  name: string
  role: UserRole
  passwordHash: string
}

const talaPasswordHash =
  '$2b$12$rQHZH6QCxBlyNUvW8xAEWOaz7QZjePjjgfHH9G.OgNoAzhR7pO5w6'
const userPasswordHash =
  '$2b$12$VxKYDbittVxTnyD4Y9XrTePVVynZ6Vq/e6C8RIdmGNEK60/u.CAX.'

export const users: AppUser[] = [
  {
    email: 'halarez123@gmail.com',
    name: 'Hala Rez',
    role: 'admin',
    passwordHash: talaPasswordHash,
  },
  {
    email: 'hhalarez@gmail.com',
    name: 'Tala Rez',
    role: 'admin',
    passwordHash: userPasswordHash,
  },
]

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email)
  return users.find((user) => user.email === normalizedEmail) ?? null
}
