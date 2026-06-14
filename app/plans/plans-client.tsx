'use client'

import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { AppHeader } from '@/components/app-header'
import { SiteFooter } from '@/components/site-footer'
import { PlanCard } from '@/components/plan-card'
import { useEffect, useState } from 'react'
import type { PlanData } from '@/lib/plans'

export default function PlansPageClient() {
  const router = useRouter()
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then((d) => setPlans(d.plans ?? []))

    fetch('/api/auth/me')
      .then((r) => setIsLoggedIn(r.ok))
  }, [])

  async function handleChoose(slug: string) {
    setLoadingSlug(slug)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planSlug: slug }),
    })
    const data = await res.json()
    setLoadingSlug(null)

    if (data.requiresAuth) {
      router.push(`/signup?plan=${slug}`)
      return
    }

    if (res.ok) {
      router.push('/cart')
    }
  }

  const Header = isLoggedIn ? AppHeader : SiteHeader

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border/60 py-14 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Plans
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Choose a plan that fits your server.
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                Try the Starter plan free, then upgrade later for more RAM, CPU, and storage.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  ctaLabel={plan.price === 0 ? 'Start Free' : `Choose ${plan.name}`}
                  onChoose={handleChoose}
                  loading={loadingSlug === plan.slug}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
