import { NextResponse } from 'next/server'
import { destroySession, destroyPending2FA } from '@/lib/session'

export async function POST() {
  await destroySession()
  await destroyPending2FA()
  return NextResponse.json({ ok: true })
}
