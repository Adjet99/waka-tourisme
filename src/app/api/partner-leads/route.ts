import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';

const schema = z.object({
  name: z.string().min(2).max(120),
  organization: z.string().max(160).optional().default(''),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional().default(''),
  partnerType: z.enum(['hebergement','restaurant','activite','transport','office-tourisme','autre']),
  message: z.string().min(10).max(3000),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(request: Request) {
  const rl = rateLimit(requestKey(request, 'partner-lead'), 8, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Trop de demandes. Réessayez plus tard.' }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Formulaire incomplet ou invalide.' }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ ok: true, persisted: false, demo: true }, { status: 202 });
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await supabase.from('partner_leads').insert({
    name: parsed.data.name,
    organization: parsed.data.organization || null,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    partner_type: parsed.data.partnerType,
    message: parsed.data.message,
    status: 'new',
  });
  if (error) return NextResponse.json({ error: 'Impossible d’enregistrer la demande.' }, { status: 500 });
  return NextResponse.json({ ok: true, persisted: true });
}
