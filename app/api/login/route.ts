// Staff login for the assessment — mobile number + 4-digit passcode, the same
// credentials as the orientation app and myteam.aroi.au, checked against
// staff_records.pin_hash.
//
// Kept as its own route rather than proxying services.aroi.au's
// /api/auth/staff-login because that server sends no CORS headers and refuses
// anyone whose resignDate isn't 'Active' — which would block Candidates, who
// are exactly the people sitting an induction assessment.

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

type StaffRow = {
  id: string
  name: string | null
  restaurant: string | null
  extra: Record<string, unknown> | null
  pin_hash: string | null
}

// staff_records stores phones inconsistently ("0401 007 968", "0401007968",
// "+61401007968"), so match on the last 9 digits only.
function phoneKey(raw: unknown): string {
  return String(raw ?? '').replace(/\D/g, '').slice(-9)
}

const ALLOWED = new Set(['Active', 'Candidate'])

// Best-effort brute-force brake. Serverless instances are ephemeral and not
// shared, so this slows an attacker rather than stopping one — a 4-digit PIN
// is 10,000 combinations. Durable lockout would need a table.
const attempts = new Map<string, { count: number; until: number }>()
const MAX_ATTEMPTS = 8
const LOCK_MS = 5 * 60 * 1000

export async function POST(req: NextRequest) {
  const { mobile, pin } = await req.json()
  const key = phoneKey(mobile)
  const now = Date.now()

  const rec = attempts.get(key)
  if (rec && rec.until > now) {
    const secs = Math.ceil((rec.until - now) / 1000)
    return NextResponse.json({ error: `Too many attempts. Try again in ${secs}s.` }, { status: 429 })
  }

  const fail = () => {
    const count = (attempts.get(key)?.count ?? 0) + 1
    attempts.set(key, { count, until: count >= MAX_ATTEMPTS ? now + LOCK_MS : 0 })
    // Same message for every failure — never reveal which numbers exist.
    return NextResponse.json({ error: 'Incorrect mobile number or passcode.' }, { status: 401 })
  }

  if (key.length < 9 || !/^\d{4}$/.test(String(pin ?? ''))) return fail()

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('staff_records')
    .select('id, name, restaurant, extra, pin_hash')
    .not('pin_hash', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let matched: StaffRow | null = null
  for (const row of (data ?? []) as StaffRow[]) {
    const extra = row.extra ?? {}
    if (phoneKey(extra.phone) !== key) continue
    if (row.pin_hash && (await bcrypt.compare(String(pin), row.pin_hash))) {
      matched = row
      break
    }
  }

  if (!matched) return fail()

  const extra = matched.extra ?? {}
  if (!ALLOWED.has(String(extra.resignDate ?? ''))) {
    // Distinct from a wrong passcode: identity proved, but not permitted.
    return NextResponse.json(
      { error: 'This account is not active. Please contact your manager.' },
      { status: 403 },
    )
  }

  attempts.delete(key)

  // The results sheet has separate first/last name columns, so split the stored
  // name on the first space. staff_records abbreviates many surnames ("Natkrita
  // P."), which is fine — the sheet is a record of who sat it, not an identity
  // document.
  const fullName = String(extra.fullName || matched.name || '').trim()
  const space = fullName.indexOf(' ')
  const firstName = space === -1 ? fullName : fullName.slice(0, space)
  const lastName = space === -1 ? '' : fullName.slice(space + 1)

  return NextResponse.json({
    staff: {
      id: matched.id,
      firstName,
      lastName,
      nickname: String(extra.nickname ?? ''),
      mobile: String(extra.phone ?? ''),
      restaurant: matched.restaurant || String(extra.shopName ?? ''),
    },
  })
}
