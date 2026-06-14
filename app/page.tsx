import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { PlanCard } from '@/components/plan-card'
import { db } from '@/lib/db'

export default async function Page() {
  const plans = await db.plan.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />

        <section id="plans" className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Plans & pricing
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Hosting plans that grow with your community.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                Start with a free server, then upgrade to more power and storage when you need it.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  ctaLabel={plan.price === 0 ? 'Start Free' : `Choose ${plan.name}`}
                  ctaHref={`/signup?plan=${plan.slug}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                  Features
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Everything you need to launch, manage, and scale servers.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  A modern dashboard, powerful automation, and built-in protection keep your community online.
                </p>
              </div>

              <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="rounded-3xl bg-primary/10 p-5">
                  <h3 className="text-xl font-semibold text-foreground">Fast launcher</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    One click to spin up a server, install mods, and invite players.
                  </p>
                </div>
                <div className="rounded-3xl bg-secondary/10 p-5">
                  <h3 className="text-xl font-semibold text-foreground">Clear dashboards</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Manage servers, billing, and settings from one responsive control panel.
                  </p>
                </div>
                <div className="rounded-3xl bg-accent/10 p-5">
                  <h3 className="text-xl font-semibold text-foreground">Built for mobile</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Designed to work smoothly on phones and tablets as well as desktop.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: '24/7 uptime',
                  description: 'Keep servers online with reliable infrastructure and automatic restarts.',
                },
                {
                  title: 'DDoS protection',
                  description: 'Shield your community from attacks with built-in network defenses.',
                },
                {
                  title: 'Automatic backups',
                  description: 'Restore fast with scheduled backups and snapshot recovery.',
                },
              ].map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Need a quick test server? Login with any credentials and try the site without a full database.
              </p>
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={
                  <Link href="/login">
                    Try test login
                    <ArrowRight className="size-4" />
                  </Link>
                }
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
