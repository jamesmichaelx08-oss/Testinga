import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generate2FACode } from '@/lib/auth'
import { send2FACode } from '@/lib/email'
import { getPending2FA } from '@/lib/session'

export async function POST() {
  try {
    const pending = await getPending2FA()
    if (!pending) {
      return NextResponse.json(
        { error: 'No pending verification. Please log in again.' },
        { status: 401 },
      )
    }

    const user = await db.user.findUnique({ where: { id: pending.userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

    return NextResponse.json({ message: 'New code sent to your email' })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
