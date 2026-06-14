'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { PlanIcon } from '@/components/plan-icon'
import { FeedbackBanner } from '@/components/feedback-banner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice, isFreePlan } from '@/lib/plans'
import { cn } from '@/lib/utils'

type CartItem = {
  plan: {
    name: string
    price: number
    icon: string
    slug: string
    ram: string
    cpu: string
    storage: string
  }
}

type Step = 'review' | 'billing' | 'confirmation'

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('review')
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    fetch('/api/cart')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => {
        setItems(d.items ?? [])
        setLoading(false)
        if ((d.items ?? []).length === 0) router.push('/cart')
      })
  }, [router])

  const total = items.reduce((sum, i) => sum + i.plan.price, 0)
  const allFree = items.every((i) => isFreePlan(i.plan))
  const steps: Step[] = ['review', 'billing', 'confirmation']

  async function handleComplete() {
    setError('')
    setSubmitting(true)
    const res = await fetch('/api/checkout', { method: 'POST' })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.error || 'Checkout failed')
      return
    }

    setOrderId(data.orderId)
    setStep('confirmation')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center text-muted-foreground">
          Loading…
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Checkout
          </h1>

          {step !== 'confirmation' && (
            <div className="mt-8 flex gap-2">
              {steps.slice(0, 2).map((s, i) => (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      step === s || steps.indexOf(step) > i
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="hidden text-sm capitalize text-muted-foreground sm:inline">
                    {s}
                  </span>
                </div>
              ))}
            </div>
          )}

          <FeedbackBanner type="error" message={error} className="mt-6" />

          {step === 'review' && (
            <div className="mt-8 space-y-6">
              <ul className="space-y-3">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <PlanIcon icon={item.plan.icon} size="sm" />
                    <div className="flex-1">
                      <p className="font-semibold">{item.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.plan.ram} · {item.plan.cpu}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.plan.price)}/mo</p>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-border pt-4 text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}/mo</span>
              </div>
              <Button
                size="lg"
                className="h-12 w-full"
                onClick={() => setStep('billing')}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 'billing' && (
            <div className="mt-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Steve Craft" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input id="checkout-email" type="email" placeholder="you@example.com" required />
                </div>
                {!allFree && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="card">Card number</Label>
                      <Input id="card" placeholder="4242 4242 4242 4242" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="exp">Expiry</Label>
                        <Input id="exp" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mock payment — no real charges will be made.
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => setStep('review')}>
                  Back
                </Button>
                <Button
                  size="lg"
                  className="h-12 flex-1"
                  onClick={handleComplete}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Processing…'
                    : allFree
                      ? 'Confirm Order'
                      : 'Complete Payment'}
                </Button>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="mt-12 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/20">
                <Check className="size-8 text-primary" />
              </div>
              <h2 className="mt-6 text-xl font-bold text-foreground">
                Order confirmed!
              </h2>
              <p className="mt-2 text-muted-foreground">
                Your order {orderId} has been placed successfully.
              </p>
              <Button
                className="mt-8"
                nativeButton={false}
                render={<Link href="/dashboard">Go to Dashboard</Link>}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
