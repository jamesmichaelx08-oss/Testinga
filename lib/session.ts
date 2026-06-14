import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'session'
const PENDING_2FA_COOKIE = 'pending-2fa'
const PENDING_PLAN_COOKIE = 'pending-plan'

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is required in production')
  }
  return new TextEncoder().encode(secret || 'dev-secret-change-me')
}

export type SessionPayload = {
  userId: string
}

export type Pending2FAPayload = {
  userId: string
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function createPending2FA(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('10m')
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })
}

export async function getPending2FA(): Promise<Pending2FAPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(PENDING_2FA_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}

export async function destroyPending2FA() {
  const cookieStore = await cookies()
  cookieStore.delete(PENDING_2FA_COOKIE)
}

export async function setPendingPlan(planSlug: string) {
  const cookieStore = await cookies()
  cookieStore.set(PENDING_PLAN_COOKIE, planSlug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
}

export async function getPendingPlan(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(PENDING_PLAN_COOKIE)?.value ?? null
}

export async function clearPendingPlan() {
  const cookieStore = await cookies()
  cookieStore.delete(PENDING_PLAN_COOKIE)
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}
