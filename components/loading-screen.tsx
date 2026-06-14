'use client'

import { Loader2 } from 'lucide-react'

export function LoadingScreen({ message = 'Please wait a few seconds' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <div className="relative">
          <div className="size-16 animate-pulse rounded-2xl bg-primary/20" />
          <Loader2 className="absolute inset-0 m-auto size-8 animate-spin text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Provisioning your server</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
