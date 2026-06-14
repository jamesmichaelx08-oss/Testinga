'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanIcon } from '@/components/plan-icon'
import { cn } from '@/lib/utils'
import {
  formatPrice,
  isFreePlan,
  PLAN_FEATURES,
  PLAN_TAGLINES,
  type PlanData,
} from '@/lib/plans'

type PlanCardProps = {
  plan: PlanData
  ctaLabel?: string
  ctaHref?: string
  onChoose?: (slug: string) => void
  loading?: boolean
  compact?: boolean
}

export function PlanCard({
  plan,
  ctaLabel,
  ctaHref,
  onChoose,
  loading,
  compact,
}: PlanCardProps) {
  const free = isFreePlan(plan)
  const features = PLAN_FEATURES[plan.slug] ?? []
  const tagline = PLAN_TAGLINES[plan.slug] ?? ''

  const button = (
    <Button
      size="lg"
      variant={plan.featured ? 'default' : free ? 'default' : 'outline'}
      className={cn(
        'h-11 w-full',
        free && 'bg-primary text-primary-foreground hover:bg-primary/90',
      )}
      disabled={loading}
      onClick={onChoose ? () => onChoose(plan.slug) : undefined}
      nativeButton={!ctaHref}
      render={ctaHref ? <Link href={ctaHref}>{ctaLabel ?? 'Choose Plan'}</Link> : undefined}
    >
      {loading ? 'Adding…' : (ctaLabel ?? 'Choose Plan')}
    </Button>
  )

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border bg-card p-5 sm:p-6',
        plan.featured
          ? 'border-primary ring-1 ring-primary/40'
          : free
            ? 'border-primary/50'
            : 'border-border',
        compact && 'p-4',
      )}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Most Popular
        </span>
      )}

      <div className="flex items-center gap-3">
        <PlanIcon icon={plan.icon} />
        <h3 className="text-lg font-semibold text-card-foreground">{plan.name}</h3>
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight sm:text-4xl">
          {formatPrice(plan.price)}
        </span>
        <span className="text-sm text-muted-foreground">/mo</span>
      </div>

      {!compact && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-background/40 p-3 text-center">
            <Spec value={plan.ram} unit="RAM" />
            <Spec value={plan.cpu} unit="CPU" />
            <Spec value={plan.storage} unit="Storage" />
          </div>

          <ul className="mt-5 flex-1 space-y-2.5">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={cn(compact ? 'mt-4' : 'mt-6')}>{button}</div>
    </div>
  )
}

function Spec({ value, unit }: { value: string; unit: string }) {
  const [amount, ...rest] = value.split(' ')
  return (
    <div>
      <p className="text-sm font-semibold text-card-foreground">{amount}</p>
      <p className="text-[0.65rem] leading-tight text-muted-foreground">
        {rest.join(' ') || unit}
      </p>
    </div>
  )
}
