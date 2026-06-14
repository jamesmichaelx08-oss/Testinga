import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  createSession,
  getPending2FA,
  destroyPending2FA,
} from '@/lib/session'

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

export async function POST(request: Request) {
  try {
    const pending = await getPending2FA()
    if (!pending) {
      return NextResponse.json(
        { error: 'No pending verification. Please log in again.' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const parsed = verifySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid code' },
        { status: 400 },
      )
    }

    const record = await db.twoFactorCode.findFirst({
      where: {
        userId: pending.userId,
        code: parsed.data.code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired code. Please try again.' },
        { status: 401 },
      )
    }

    await db.twoFactorCode.update({
      where: { id: record.id },
      data: { used: true },
    })

    await destroyPending2FA()
    await createSession(record.userId)

    return NextResponse.json({
      user: {
        id: record.user.id,
        email: record.user.email,
        username: record.user.username,
        firstName: record.user.firstName,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
