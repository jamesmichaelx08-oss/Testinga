import { cn } from '@/lib/utils'

type BrandIconProps = {
  slug?: string
  label: string
  className?: string
}

export function BrandIcon({ slug, label, className }: BrandIconProps) {
  const initials = label
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground shadow-sm',
        className,
      )}
      aria-label={label}
    >
      {initials}
    </span>
  )
}
