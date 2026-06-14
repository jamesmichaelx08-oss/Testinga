export type PlanData = {
  id: string
  slug: string
  name: string
  price: number
  ram: string
  cpu: string
  storage: string
  icon: string
  featured: boolean
}

export function formatPrice(cents: number) {
  if (cents === 0) return '$0'
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

export function isFreePlan(plan: { slug: string; price: number }) {
  return plan.slug === 'free' || plan.price === 0
}

export const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    'Up to 10 players',
    'Modpack support',
    'DDoS protection',
    'Community support',
  ],
  zombie: [
    'Up to 40 players',
    'One-click modpacks',
    'Daily backups',
    'Priority support',
  ],
  wither: [
    'Up to 60 players',
    'Custom JAR support',
    'Daily backups',
    'Priority support',
  ],
  'ender-dragon': [
    'Unlimited players',
    'Dedicated IP address',
    'Hourly backups',
    '24/7 priority support',
  ],
  diamond: [
    'Multi-server network',
    'Dedicated IP & ports',
    'Real-time backups',
    'Dedicated account manager',
  ],
}

export const PLAN_TAGLINES: Record<string, string> = {
  free: 'Start a server for free and test your setup.',
  zombie: 'Scale up for a small team with extra power.',
  wither: 'Reliable performance for growing communities.',
  'ender-dragon': 'High-performance hosting for serious groups.',
  diamond: 'Top-tier capacity for large networks and teams.',
}
