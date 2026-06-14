import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      middleName: true,
      profileImage: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  })
}

export function generate2FACode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function validatePasswordStrength(password: string) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number'
  }
  return null
}
