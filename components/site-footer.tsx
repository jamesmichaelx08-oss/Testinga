import { Logo } from '@/components/logo'
import Link from 'next/link'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Plans', href: '/plans' },
      { label: 'Features', href: '/features' },
    ],
  },
  {
    title: 'Games',
    links: [
      { label: 'Minecraft', href: '/features' },
      { label: 'FiveM', href: '/features' },
      { label: 'Rust', href: '/features' },
      { label: 'Hytale', href: '/features' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Sign Up', href: '/signup' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-14">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Premium game server hosting built for players. Fast, reliable, and
              always online.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-foreground">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Minecraft Hosting. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Not affiliated with Mojang or Microsoft.
          </p>
        </div>
      </div>
    </footer>
  )
}
