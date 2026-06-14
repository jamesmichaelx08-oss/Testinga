import Link from 'next/link'
import {
  Clock,
  ShieldCheck,
  Cpu,
  HardDrive,
  Globe,
  Headphones,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BrandIcon } from '@/components/brand-icon'

const features = [
  {
    icon: Clock,
    title: '24/7 Hosting',
    description:
      'Your server stays online around the clock with 99.9% guaranteed uptime and automatic restarts.',
  },
  {
    icon: ShieldCheck,
    title: 'DDoS Protection',
    description:
      'Enterprise-grade mitigation keeps your community safe from attacks at no extra cost.',
  },
  {
    icon: Cpu,
    title: 'High-Performance vCPU',
    description:
      'Latest-gen Ryzen processors deliver lag-free gameplay even on packed servers.',
  },
  {
    icon: HardDrive,
    title: 'NVMe SSD Storage',
    description:
      'Lightning-fast disk storage means quicker world loading and instant backups.',
  },
  {
    icon: Globe,
    title: 'Global Locations',
    description:
      'Deploy close to your players with data centers across multiple regions.',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description:
      'Real humans ready to help you 24/7 through live chat and tickets.',
  },
]

const software = [
  { slug: 'minecraft', label: 'Minecraft' },
  { slug: 'rust', label: 'Rust' },
  { slug: 'hytale', label: 'Hytale' },
  { slug: 'fivem', label: 'FiveM' },
  { slug: 'curseforge', label: 'CurseForge' },
  { slug: 'nodedotjs', label: 'Node.js' },
]

export const metadata = {
  title: 'Features — Minecraft Hosting',
  description: '24/7 hosting, DDoS protection, and support for all your favorite game software.',
}

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 text-center sm:px-6">
            <span className="text-sm font-semibold text-primary">Features</span>
            <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Everything you need to run a great server
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              Powerful hardware and thoughtful tooling, built for gamers and
              communities of every size.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16 rounded-2xl border border-border bg-card p-6 sm:p-12">
              <div className="mx-auto max-w-xl text-center">
                <h2 className="text-2xl font-bold tracking-tight text-card-foreground">
                  Supports all your favorite software
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  One-click installs for Minecraft, Rust, Hytale, FiveM,
                  CurseForge modpacks, Node.js, and more.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {software.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-6 transition-colors hover:border-primary/50"
                  >
                    <BrandIcon
                      slug={item.slug}
                      src={item.src}
                      label={item.label}
                      className="h-9 w-9"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/plans"
                className="text-sm font-medium text-primary hover:underline"
              >
                View hosting plans →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
