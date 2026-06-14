'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { LoadingScreen } from '@/components/loading-screen'
import { DirtBlockIcon } from '@/components/plan-icon'
import { FeedbackBanner } from '@/components/feedback-banner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { PlanData } from '@/lib/plans'

const locations = ['North America', 'Europe', 'Asia Pacific']
const softwareOptions = [
  'Minecraft Java',
  'Minecraft Bedrock',
  'Paper',
  'Spigot',
  'Forge',
  'Fabric',
  'CurseForge Modpack',
  'Vanilla',
  'Purpur',
  'Mohist',
]

function CreateServerForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')

  const [plans, setPlans] = useState<PlanData[]>([])
  const [serverName, setServerName] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [provisioning, setProvisioning] = useState(false)

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then((d) => {
        const list: PlanData[] = d.plans ?? []
        setPlans(list)
        const target = planParam
          ? list.find((p) => p.slug === planParam)
          : list.find((p) => p.slug === 'free')
        if (target) setSelectedPlanId(target.id)
      })
  }, [planParam])

  const freePlan = plans.find((p) => p.slug === 'free')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedPlanId) {
      setError('Please select a plan')
      return
    }

    setProvisioning(true)

    await new Promise((r) => setTimeout(r, 2500 + Math.random() * 1500))

    const res = await fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverName, planId: selectedPlanId }),
    })

    const data = await res.json()
    setProvisioning(false)

    if (!res.ok) {
      setError(data.error || 'Failed to create server')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      {provisioning && <LoadingScreen />}

      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create Server
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure your new game server and deploy in seconds.
        </p>

        <FeedbackBanner type="error" message={error} className="mt-6" />

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div className="space-y-2">
            <Label htmlFor="serverName">Server Name</Label>
            <Input
              id="serverName"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="My Survival World"
              required
              minLength={3}
              maxLength={32}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <select
              id="location"
              disabled
              className="h-10 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground"
            >
              {locations.map((loc) => (
                <option key={loc}>{loc} — Coming Soon</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="software">Game / Software</Label>
            <select
              id="software"
              disabled
              className="h-10 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground"
            >
              {softwareOptions.map((opt) => (
                <option key={opt}>{opt} — Coming Soon</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <Label>Plan</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              {freePlan && (
                <button
                  type="button"
                  onClick={() => setSelectedPlanId(freePlan.id)}
                  className={cn(
                    'flex flex-1 items-center gap-4 rounded-xl border p-4 text-left transition-colors',
                    selectedPlanId === freePlan.id
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                      : 'border-border bg-card hover:border-primary/50',
                  )}
                >
                  <DirtBlockIcon className="size-12 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Free Plan</p>
                    <p className="text-sm text-muted-foreground">
                      6 GB RAM · 4 vCPU · 30 GB storage
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary">$0/mo</p>
                  </div>
                </button>
              )}

              <Button
                type="button"
                variant="outline"
                className="h-auto min-h-[5.5rem] flex-col gap-1 px-4 py-4 sm:w-40"
                nativeButton
                onClick={() => router.push('/plans')}
              >
                <Plus className="size-5" />
                <span className="text-sm font-semibold">Order Plan</span>
                <span className="text-xs text-muted-foreground">Paid tiers</span>
              </Button>
            </div>

            {selectedPlanId && freePlan && selectedPlanId !== freePlan.id && (
              <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  Selected: {plans.find((p) => p.id === selectedPlanId)?.name} plan
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Paid plan will be applied to this server. Complete checkout from your cart
                  after creation if needed.
                </p>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" className="h-12 w-full text-base">
            Create Server
          </Button>
        </form>
      </div>
    </>
  )
}

export default function CreateServerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <Suspense>
          <CreateServerForm />
        </Suspense>
      </main>
    </div>
  )
}
