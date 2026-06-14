'use client'

import { cn } from '@/lib/utils'

type FeedbackBannerProps = {
  type: 'success' | 'error'
  message: string
  className?: string
}

export function FeedbackBanner({ type, message, className }: FeedbackBannerProps) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border px-4 py-3 text-sm',
        type === 'success'
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-destructive/40 bg-destructive/10 text-destructive',
        className,
      )}
    >
      {message}
    </div>
  )
}
