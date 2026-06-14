import Link from 'next/link'
import { Boxes } from 'lucide-react'

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className}>
      <span className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Boxes className="size-5" aria-hidden="true" />
        </span>
        <span className="text-base font-semibold tracking-tight text-foreground">
          Minecraft Hosting
        </span>
      </span>
    </Link>
  )
}
