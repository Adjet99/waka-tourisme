import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';

const allowed = new Set([
  'city_selected','nearby_search','destination_spin_started','destination_generated','destination_rejected',
  'destination_liked','destination_saved','itinerary_generated','itinerary_saved','attraction_viewed',
  'trip_started','trip_completed','partner_lead_submitted','sign_in','sign_up'
]);
const schema = z.object({
  eventName: z.string().min(1).max(80),
  anonymousSessionId: z.string().max(100).optional(),
  properties: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function POST(request: Request) {
  const rl = rateLimit(requestKey(request, 'analytics'), 120, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 });
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !allowed.has(parsed.data.eventName)) return NextResponse.json({ ok: false }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ ok: true, persisted: false }, { status: 202 });

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const authHeader = request.headers.get('authorization');
  let userId: string | null = null;
  if (authHeader?.startsWith('Bearer ')) {
    const { data } = await supabase.auth.getUser(authHeader.slice(7));
    userId = data.user?.id || null;
  }
  const { error } = await supabase.from('analytics_events').insert({
    user_id: userId,
    anonymous_session_id: parsed.data.anonymousSessionId || null,
    event_name: parsed.data.eventName,
    properties: parsed.data.properties,
  });
  return NextResponse.json({ ok: !error, persisted: !error }, { status: error ? 500 : 200 });
}
