import { cn } from '@/lib/utils'

type PlanIconProps = {
  icon: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-14 w-14 text-lg',
}

const colorMap: Record<string, string> = {
  free: 'bg-primary/10 text-primary',
  zombie: 'bg-accent/10 text-accent',
  wither: 'bg-secondary/10 text-secondary',
  'ender-dragon': 'bg-foreground/10 text-foreground',
  diamond: 'bg-destructive/10 text-destructive',
}

export function PlanIcon({ icon, className, size = 'md' }: PlanIconProps) {
  const label = icon.charAt(0).toUpperCase()
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-2xl border border-border/60 font-semibold shadow-sm',
        sizeMap[size],
        colorMap[icon] ?? 'bg-secondary/10 text-foreground',
        className,
      )}
    >
      {label}
    </span>
  )
}

export function DirtBlockIcon({ className }: { className?: string }) {
  return (
    <PlanIcon icon="free" className={cn('rounded-xl', className)} size="lg" />
  )
}
