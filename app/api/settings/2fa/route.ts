import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser, verifyPassword } from '@/lib/auth'

const twoFactorSchema = z.object({
  enabled: z.boolean(),
  currentPassword: z.string().min(1, 'Current password is required'),
})

export async function PUT(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = twoFactorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      )
    }

    const fullUser = await db.user.findUnique({ where: { id: user.id } })
    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const valid = await verifyPassword(
      parsed.data.currentPassword,
      fullUser.passwordHash,
    )
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const secret = parsed.data.enabled
      ? `email-2fa-${user.id}-${Date.now()}`
      : null

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: parsed.data.enabled,
        twoFactorSecret: secret,
      },
      select: {
        twoFactorEnabled: true,
      },
    })

    return NextResponse.json({
      twoFactorEnabled: updated.twoFactorEnabled,
      message: parsed.data.enabled
        ? 'Two-factor authentication enabled. Codes will be sent to your email on login.'
        : 'Two-factor authentication disabled.',
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
