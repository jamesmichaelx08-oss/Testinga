import Link from 'next/link'
import { ArrowRight, Server, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-24 md:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="flex size-2 rounded-full bg-primary" />
          99.9% uptime · NVMe SSD · DDoS protected
        </span>

        <h1 className="mt-6 max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Launch your{' '}
          <span className="text-primary">Minecraft server</span> in seconds
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          Blazing-fast, lag-free game hosting for Minecraft, FiveM, Rust, Hytale
          and more. Powerful hardware, instant setup, and 24/7 support — all in
          one clean dashboard.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="h-12 px-6 text-base"
            nativeButton={false}
            render={
              <Link href="/signup">
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            }
          />
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base"
            nativeButton={false}
            render={<Link href="/plans">View Plans</Link>}
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Server className="size-4 text-primary" /> Instant deployment
          </span>
          <span className="inline-flex items-center gap-2">
            <Zap className="size-4 text-primary" /> No setup fees
          </span>
        </div>
      </div>
    </section>
  )
}
