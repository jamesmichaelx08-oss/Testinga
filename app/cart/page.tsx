'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { PlanIcon } from '@/components/plan-icon'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/plans'

type CartItem = {
  id: string
  planId: string
  plan: {
    id: string
    name: string
    price: number
    icon: string
    ram: string
    cpu: string
    storage: string
  }
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  async function loadCart() {
    const res = await fetch('/api/cart')
    if (res.ok) {
      const data = await res.json()
      setItems(data.items ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadCart()
  }, [])

  async function removeItem(planId: string) {
    await fetch(`/api/cart/${planId}`, { method: 'DELETE' })
    loadCart()
  }

  const total = items.reduce((sum, i) => sum + i.plan.price, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Cart
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review your selected hosting plans before checkout.
          </p>

          {loading ? (
            <p className="mt-12 text-center text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Button
                className="mt-6"
                nativeButton={false}
                render={<Link href="/plans">Browse Plans</Link>}
              />
            </div>
          ) : (
            <>
              <ul className="mt-8 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <PlanIcon icon={item.plan.icon} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{item.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.plan.ram} · {item.plan.cpu} · {item.plan.storage}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      {formatPrice(item.plan.price)}/mo
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.planId)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${item.plan.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly total</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatPrice(total)}/mo
                  </p>
                </div>
                <Button
                  size="lg"
                  className="h-12 w-full sm:w-auto"
                  nativeButton={false}
                  render={<Link href="/checkout">Proceed to Checkout</Link>}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
