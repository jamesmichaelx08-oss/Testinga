import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'

type AuthShellProps = {
  title: string
  subtitle: string
  children: ReactNode
  aside: { heading: string; points: string[] }
}

export function AuthShell({ title, subtitle, children, aside }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden border-l border-border/60 bg-card lg:block">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative flex h-full flex-col justify-center px-14">
          <div className="size-12 rounded-xl bg-primary" />
          <h2 className="mt-8 max-w-md text-3xl font-bold leading-tight tracking-tight text-card-foreground">
            {aside.heading}
          </h2>
          <ul className="mt-8 space-y-4">
            {aside.points.map((point) => (
              <li
                key={point}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="size-3"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
