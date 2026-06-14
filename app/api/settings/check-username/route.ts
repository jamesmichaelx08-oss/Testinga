import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const checkSchema = z.object({
  username: z.string().min(3).max(20),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = checkSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ available: false }, { status: 400 })
    }

    const existing = await db.user.findUnique({
      where: { username: parsed.data.username },
    })

    return NextResponse.json({ available: !existing })
  } catch {
    return NextResponse.json({ available: false }, { status: 500 })
  }
}
