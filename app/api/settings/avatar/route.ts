import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser, verifyPassword } from '@/lib/auth'

const avatarSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = avatarSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }

    const match = parsed.data.image.match(/^data:(image\/\w+);base64,/)
    if (!match || !ALLOWED_TYPES.includes(match[1])) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WebP, and GIF images are allowed' },
        { status: 400 },
      )
    }

    const base64Data = parsed.data.image.split(',')[1]
    const sizeBytes = (base64Data.length * 3) / 4
    if (sizeBytes > MAX_SIZE) {
      return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { profileImage: parsed.data.image },
      select: {
        id: true,
        profileImage: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await db.user.update({
    where: { id: user.id },
    data: { profileImage: null },
  })

  return NextResponse.json({ ok: true })
}
