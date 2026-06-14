import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { plan: true },
  })

  if (items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  await db.cartItem.deleteMany({ where: { userId: user.id } })

  return NextResponse.json({
    success: true,
    orderId: `ORD-${Date.now()}`,
    items: items.map((i) => ({
      planName: i.plan.name,
      price: i.plan.price,
    })),
  })
}
