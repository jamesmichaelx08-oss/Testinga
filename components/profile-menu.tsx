'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings, LogOut } from 'lucide-react'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

type ProfileMenuProps = {
  firstName?: string | null
  username: string
  profileImage?: string | null
}

export function ProfileMenu({ firstName, username, profileImage }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full transition-transform active:scale-95"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <UserAvatar
          firstName={firstName}
          username={username}
          profileImage={profileImage}
          size="md"
        />
      </button>

      <div
        className={cn(
          'absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl border border-border bg-card py-1 shadow-lg transition-all duration-200',
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        )}
      >
        <div className="border-b border-border/60 px-4 py-3">
          <p className="truncate text-sm font-medium text-foreground">
            {firstName || username}
          </p>
          <p className="truncate text-xs text-muted-foreground">@{username}</p>
        </div>
        <Link
          href="/settings"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="size-4" />
          Settings
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
