import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const profileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  firstName: z.string().min(1).max(50),
  middleName: z.string().max(50).optional().nullable(),
})

export async function PUT(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = profileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      )
    }

    if (parsed.data.username !== user.username) {
      const taken = await db.user.findUnique({
        where: { username: parsed.data.username },
      })
      if (taken) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        username: parsed.data.username,
        firstName: parsed.data.firstName,
        middleName: parsed.data.middleName || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        middleName: true,
        profileImage: true,
        twoFactorEnabled: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
