import { NextResponse } from 'next/server';
import { z } from 'zod';
import { pickWeightedRecommendation, recommendDestinations } from '@/lib/recommendation';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';
import { getPublicCities } from '@/lib/server/catalog';

const schema = z.object({
  origin: z.object({ latitude:z.number().min(-90).max(90), longitude:z.number().min(-180).max(180), name:z.string().optional(), cityName:z.string().optional() }).passthrough().optional(),
  availableTime: z.enum(['heures','journee','weekend','3jours','4-5jours','semaine']).optional(),
  budget: z.enum(['economique','modere','confortable','premium']).optional(),
  budgetMaxXof: z.number().positive().max(10_000_000).optional(),
  transport: z.enum(['voiture','bus','avion','peu-importe']).optional(),
  travellers: z.enum(['seul','couple','amis','famille']).optional(),
  interests: z.array(z.string().max(40)).max(12).optional(),
  children: z.boolean().optional(),
  rejectedDestinations: z.array(z.string().max(80)).max(30).optional(),
  previousDestinations: z.array(z.string().max(80)).max(50).optional()
}).passthrough();

export async function POST(req: Request){
  if (!rateLimit(requestKey(req, 'recommend'), 30, 60_000).ok) return NextResponse.json({error:'Trop de demandes. Réessayez dans quelques instants.'},{status:429});
  const parsed=schema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:'Paramètres invalides',details:parsed.error.flatten()},{status:400});
  const catalog=await getPublicCities();
  const destination=pickWeightedRecommendation(parsed.data,catalog);
  if(!destination) return NextResponse.json({error:'Aucune destination admissible'},{status:404});
  const alternatives=recommendDestinations(parsed.data,catalog).filter(x=>x.slug!==destination.slug).slice(0,3).map(x=>({slug:x.slug,name:x.name,score:x.recommendationScore}));
  return NextResponse.json({destination,alternatives});
}
