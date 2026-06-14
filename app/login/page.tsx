'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { AuthShell } from '@/components/auth-shell'
import { TwoFactorForm } from '@/components/two-factor-form'
import { FeedbackBanner } from '@/components/feedback-banner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'login' | '2fa'>('login')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: form.get('identifier'),
        password: form.get('password'),
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Login failed')
      return
    }

    if (data.requires2FA) {
      setStep('2fa')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <AuthShell
      title={step === '2fa' ? 'Verify your identity' : 'Welcome back'}
      subtitle={
        step === '2fa'
          ? 'We sent a 6-digit code to your email. Enter it below to continue.'
          : 'Log in to manage your servers and keep your worlds online.'
      }
      aside={{
        heading: 'Your servers, always online and ready to play.',
        points: [
          '99.9% guaranteed uptime',
          'Instant server access',
          '24/7 expert support',
        ],
      }}
    >
      {step === '2fa' ? (
        <TwoFactorForm
          onSuccess={() => {
            router.push('/dashboard')
            router.refresh()
          }}
          onCancel={() => setStep('login')}
        />
      ) : (
        <>
          <FeedbackBanner type="error" message={error} className="mb-5" />

          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or username</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-xs font-medium text-muted-foreground">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account yet? You can still test the site with any email/username
            and password.
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Need an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}
