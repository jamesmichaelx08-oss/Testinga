import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, generate2FACode } from '@/lib/auth'
import { send2FACode } from '@/lib/email'
import {
  createSession,
  createPending2FA,
  destroyPending2FA,
} from '@/lib/session'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      )
    }

    const { identifier, password } = parsed.data

    const normalizedId = identifier.includes('@')
      ? identifier.toLowerCase()
      : identifier

    const user = await db.user.findFirst({
      where: {
        OR: [{ email: normalizedId }, { username: normalizedId }],
      },
    })

    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        const username = identifier.includes('@')
          ? identifier.split('@')[0]
          : normalizedId
        const email = identifier.includes('@')
          ? normalizedId
          : `${normalizedId}@example.com`
        const firstName = username
          ? `${username.charAt(0).toUpperCase()}${username.slice(1)}`
          : 'Tester'

        const newUser = await db.user.create({
          data: {
            email,
            username,
            passwordHash: await hashPassword(password),
            firstName,
            middleName: null,
            profileImage: null,
            twoFactorEnabled: false,
            twoFactorSecret: null,
          },
        })

        await destroyPending2FA()
        await createSession(newUser.id)

        return NextResponse.json({
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            firstName: newUser.firstName,
          },
          testLogin: true,
        })
      }

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (user.twoFactorEnabled) {
      await db.twoFactorCode.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      })

      const code = generate2FACode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      await db.twoFactorCode.create({
        data: { userId: user.id, code, expiresAt },
      })

      await send2FACode(user.email, code)
      await createPending2FA(user.id)

      return NextResponse.json({
        requires2FA: true,
        message: 'Verification code sent to your email',
      })
    }

    await destroyPending2FA()
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
