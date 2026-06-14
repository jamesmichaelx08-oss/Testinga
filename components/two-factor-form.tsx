'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FeedbackBanner } from '@/components/feedback-banner'

type TwoFactorFormProps = {
  onSuccess: () => void
  onCancel: () => void
}

export function TwoFactorForm({ onSuccess, onCancel }: TwoFactorFormProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Verification failed')
      return
    }

    onSuccess()
  }

  async function handleResend() {
    setResending(true)
    setError('')
    const res = await fetch('/api/auth/resend-2fa', { method: 'POST' })
    const data = await res.json()
    setResending(false)
    if (res.ok) {
      setMessage(data.message)
    } else {
      setError(data.error || 'Failed to resend code')
    }
  }

  return (
    <div className="space-y-5">
      <FeedbackBanner type="success" message={message} />
      <FeedbackBanner type="error" message={error} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="h-12 text-center text-lg tracking-[0.3em]"
            required
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <Button type="submit" size="lg" className="h-11 w-full" disabled={loading || code.length !== 6}>
          {loading ? 'Verifying…' : 'Verify & Continue'}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-medium text-primary hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending…' : 'Resend Code'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          Back to login
        </button>
      </div>
    </div>
  )
}
