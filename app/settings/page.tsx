'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { UserAvatar } from '@/components/user-avatar'
import { FeedbackBanner } from '@/components/feedback-banner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type User = {
  id: string
  email: string
  username: string
  firstName: string
  middleName: string | null
  profileImage: string | null
  twoFactorEnabled: boolean
}

type Tab = 'profile' | 'account' | 'password' | '2fa'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<Tab>('profile')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [twoFactorPassword, setTwoFactorPassword] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.user) {
          router.push('/login')
          return
        }
        setUser(d.user)
        setUsername(d.user.username)
        setFirstName(d.user.firstName)
        setMiddleName(d.user.middleName ?? '')
        setPreview(d.user.profileImage)
      })
  }, [router])

  function clearFeedback() {
    setMessage('')
    setError('')
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    clearFeedback()
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, WebP, and GIF images are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const image = reader.result as string
      setPreview(image)
      setLoading(true)
      const res = await fetch('/api/settings/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })
      const data = await res.json()
      setLoading(false)
      if (res.ok) {
        setMessage('Profile picture updated')
        setUser((u) => (u ? { ...u, profileImage: data.user.profileImage } : u))
      } else {
        setError(data.error || 'Failed to upload image')
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    clearFeedback()
    setLoading(true)

    const res = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, firstName, middleName: middleName || null }),
    })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setMessage('Account details saved')
      setUser(data.user)
    } else {
      setError(data.error || 'Failed to save')
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault()
    clearFeedback()
    setLoading(true)

    const res = await fetch('/api/settings/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setMessage(data.message)
      if (data.requiresReLogin) {
        setTimeout(() => router.push('/login'), 2000)
      }
    } else {
      setError(data.error || 'Failed to change password')
    }
  }

  async function handle2FAToggle(enabled: boolean) {
    clearFeedback()
    setLoading(true)

    const res = await fetch('/api/settings/2fa', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, currentPassword: twoFactorPassword }),
    })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setMessage(data.message)
      setUser((u) => (u ? { ...u, twoFactorEnabled: data.twoFactorEnabled } : u))
      setTwoFactorPassword('')
    } else {
      setError(data.error || 'Failed to update 2FA')
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile Picture' },
    { id: 'account', label: 'Account Details' },
    { id: 'password', label: 'Password' },
    { id: '2fa', label: 'Two-Factor Auth' },
  ]

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center text-muted-foreground">
          Loading…
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account, security, and profile.
          </p>

          <FeedbackBanner type="success" message={message} className="mt-6" />
          <FeedbackBanner type="error" message={error} className="mt-3" />

          <div className="mt-8 flex gap-2 overflow-x-auto border-b border-border pb-px">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id)
                  clearFeedback()
                }}
                className={cn(
                  'shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:px-4',
                  tab === t.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {tab === 'profile' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <UserAvatar
                    firstName={user.firstName}
                    username={user.username}
                    profileImage={preview}
                    size="lg"
                  />
                  <div className="text-center sm:text-left">
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <span className="inline-flex h-9 items-center rounded-lg border border-border bg-secondary px-4 text-sm font-medium hover:bg-muted">
                        Upload photo
                      </span>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={handleAvatarChange}
                        disabled={loading}
                      />
                    </Label>
                    <p className="mt-2 text-xs text-muted-foreground">
                      JPG, PNG, WebP, or GIF. Max 5 MB.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tab === 'account' && (
              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle name (optional)</Label>
                  <Input
                    id="middleName"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email} disabled className="opacity-60" />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving…' : 'Save changes'}
                </Button>
              </form>
            )}

            {tab === 'password' && (
              <form onSubmit={handlePasswordSave} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating…' : 'Change password'}
                </Button>
              </form>
            )}

            {tab === '2fa' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        Two-Factor Authentication
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {user.twoFactorEnabled
                          ? 'Enabled — a code is sent to your email on each login.'
                          : 'Disabled — only your password is required to log in.'}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold',
                        user.twoFactorEnabled
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="2faPassword">Confirm with current password</Label>
                  <Input
                    id="2faPassword"
                    type="password"
                    value={twoFactorPassword}
                    onChange={(e) => setTwoFactorPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {!user.twoFactorEnabled ? (
                    <Button
                      type="button"
                      onClick={() => handle2FAToggle(true)}
                      disabled={loading || !twoFactorPassword}
                    >
                      Enable 2FA
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handle2FAToggle(false)}
                      disabled={loading || !twoFactorPassword}
                    >
                      Disable 2FA
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
