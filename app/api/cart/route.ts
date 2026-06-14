import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { setPendingPlan } from '@/lib/session'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ items })
}

const addSchema = z.object({
  planSlug: z.string().min(1),
})

export async function POST(request: Request) {
  const user = await getCurrentUser()

  try {
    const body = await request.json()
    const parsed = addSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = await db.plan.findUnique({
      where: { slug: parsed.data.planSlug },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (!user) {
      await setPendingPlan(parsed.data.planSlug)
      return NextResponse.json({ requiresAuth: true })
    }

    const item = await db.cartItem.upsert({
      where: { userId_planId: { userId: user.id, planId: plan.id } },
      update: { quantity: 1 },
      create: { userId: user.id, planId: plan.id, quantity: 1 },
      include: { plan: true },
    })

    return NextResponse.json({ item })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
