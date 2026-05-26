import { randomInt } from 'crypto'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type OtpRecord = {
  code: string
  expiresAt: number
}

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000
const localStorePath = join(process.cwd(), '.otp-store.json')

export const otpStore = new Map<string, OtpRecord>()

function shouldPersistLocally() {
  return process.env.NODE_ENV !== 'production'
}

function loadLocalStore() {
  if (!shouldPersistLocally() || otpStore.size > 0 || !existsSync(localStorePath)) {
    return
  }

  try {
    const records = JSON.parse(readFileSync(localStorePath, 'utf8')) as Record<string, OtpRecord>
    Object.entries(records).forEach(([email, record]) => {
      if (record.expiresAt > Date.now()) {
        otpStore.set(email, record)
      }
    })
  } catch {
    otpStore.clear()
  }
}

function saveLocalStore() {
  if (!shouldPersistLocally()) {
    return
  }

  const records = Object.fromEntries(otpStore.entries())
  writeFileSync(localStorePath, JSON.stringify(records, null, 2))
}

export function createOtp() {
  return randomInt(100000, 999999).toString()
}

export function saveOtp(email: string, code: string) {
  loadLocalStore()
  otpStore.set(email, {
    code,
    expiresAt: Date.now() + FIVE_MINUTES_IN_MS,
  })
  saveLocalStore()
}

export function validateOtp(email: string, code: string) {
  loadLocalStore()
  const record = otpStore.get(email)

  if (!record) {
    return false
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email)
    saveLocalStore()
    return false
  }

  const normalizedCode = code.replace(/\D/g, '')
  const isValid = record.code === normalizedCode

  if (isValid) {
    otpStore.delete(email)
    saveLocalStore()
  }

  return isValid
}
