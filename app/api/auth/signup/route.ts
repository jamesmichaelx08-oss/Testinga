import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  hashPassword,
  validatePasswordStrength,
  generate2FACode,
} from '@/lib/auth'
import { send2FACode } from '@/lib/email'
import {
  createSession,
  createPending2FA,
  getPendingPlan,
  clearPendingPlan,
} from '@/lib/session'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  middleName: z.string().max(50).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      )
    }

    const email = parsed.data.email.toLowerCase()
    const { username, password, firstName, middleName } = parsed.data

    const passwordError = validatePasswordStrength(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existing) {
      if (existing.email === email) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await db.user.create({
      data: {
        email,
        username,
        passwordHash,
        firstName,
        middleName: middleName || null,
      },
    })

    const pendingPlanSlug = await getPendingPlan()
    if (pendingPlanSlug) {
      const plan = await db.plan.findUnique({ where: { slug: pendingPlanSlug } })
      if (plan) {
        await db.cartItem.upsert({
          where: { userId_planId: { userId: user.id, planId: plan.id } },
          update: { quantity: 1 },
          create: { userId: user.id, planId: plan.id, quantity: 1 },
        })
      }
      await clearPendingPlan()
    }

    await createSession(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
