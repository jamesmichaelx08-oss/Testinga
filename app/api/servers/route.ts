import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const servers = await db.server.findMany({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ servers })
}

const createSchema = z.object({
  serverName: z
    .string()
    .min(3, 'Server name must be at least 3 characters')
    .max(32, 'Server name must be at most 32 characters')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Server name contains invalid characters'),
  planId: z.string().min(1, 'Plan is required'),
})

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      )
    }

    const plan = await db.plan.findUnique({ where: { id: parsed.data.planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const server = await db.server.create({
      data: {
        userId: user.id,
        planId: plan.id,
        serverName: parsed.data.serverName,
        status: 'active',
      },
      include: { plan: true },
    })

    return NextResponse.json({ server })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
