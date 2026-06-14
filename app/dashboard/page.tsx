import Link from 'next/link'
import { Plus, ShoppingCart, Server } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { PlanIcon } from '@/components/plan-icon'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard — Minecraft Hosting',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const servers = await db.server.findMany({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Welcome back, {user.firstName}
              </h1>
              <p className="mt-2 text-base leading-7 text-muted-foreground sm:text-lg">
                Manage servers and hosting from one fast, mobile-friendly dashboard.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-card p-5 text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  Servers
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {servers.length}
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5 text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  Active plan
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {servers[0]?.plan?.name ?? 'Starter'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Button
              size="lg"
              className="h-full min-h-[90px] justify-start gap-3 px-5 py-5"
              nativeButton={false}
              render={
                <Link href="/create-server?plan=free">
                  <Plus className="size-5 shrink-0" />
                  <span className="text-left">
                    <span className="block font-semibold">Create Free Server</span>
                    <span className="block text-xs font-normal opacity-80">
                      Deploy instantly and start testing.
                    </span>
                  </span>
                </Link>
              }
            />
            <Button
              variant="outline"
              size="lg"
              className="h-full min-h-[90px] justify-start gap-3 px-5 py-5"
              nativeButton={false}
              render={
                <Link href="/plans">
                  <ShoppingCart className="size-5 shrink-0" />
                  <span className="text-left">
                    <span className="block font-semibold">Browse Plans</span>
                    <span className="block text-xs font-normal opacity-80">
                      Upgrade or compare anytime.
                    </span>
                  </span>
                </Link>
              }
            />
          </div>

          <section className="mt-12">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your servers</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quick access to your live server list and details.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={
                  <Link href="/create-server">
                    <Plus className="size-4" />
                    New server
                  </Link>
                }
              />
            </div>

            {servers.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
                <Server className="size-10 text-muted-foreground" />
                <p className="mt-4 text-xl font-semibold text-foreground">No servers yet</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Start your first server on the Starter plan and explore the dashboard.
                </p>
                <Button
                  className="mt-6"
                  nativeButton={false}
                  render={<Link href="/create-server">Create Server</Link>}
                />
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {servers.map((server) => (
                  <li
                    key={server.id}
                    className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <PlanIcon icon={server.plan.icon} size="sm" />
                        <div>
                          <p className="text-lg font-semibold text-foreground">
                            {server.serverName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {server.plan.name} plan ·{' '}
                            <span className="capitalize text-primary">{server.status}</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created{' '}
                        {new Date(server.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
