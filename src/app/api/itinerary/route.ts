import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAttractionsByCitySlug, getCityBySlug } from '@/lib/server/catalog';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';
import { haversineKm } from '@/lib/geo';

const schema=z.object({destination:z.string().max(80),days:z.number().int().min(1).max(7).default(2),pace:z.enum(['tranquille','equilibre','intense']).default('equilibre'),interests:z.array(z.string().max(40)).max(12).optional().default([]),children:z.boolean().optional().default(false)});
export async function POST(req:Request){
  if (!rateLimit(requestKey(req, 'itinerary'), 30, 60_000).ok) return NextResponse.json({error:'Trop de demandes.'},{status:429});
  const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Paramètres invalides'},{status:400});
  const city=await getCityBySlug(parsed.data.destination);if(!city)return NextResponse.json({error:'Destination inconnue'},{status:404});
  const attractions=await getAttractionsByCitySlug(city.slug);const interests=parsed.data.interests.map(x=>x.toLowerCase());
  const eligible=attractions.filter(a=>!parsed.data.children||a.childFriendly!==false);
  // Simple nearest-neighbour ordering from the city centre to reduce needless backtracking.
  // Interest matches get a small preference while geography remains the main constraint.
  const remaining=[...eligible];const structured:typeof eligible=[];let cursorPoint={latitude:city.latitude,longitude:city.longitude};
  while(remaining.length){
    remaining.sort((a,b)=>{
      const da=haversineKm(cursorPoint,a)-(interests.includes(a.category)?8:0);
      const db=haversineKm(cursorPoint,b)-(interests.includes(b.category)?8:0);
      return da-db;
    });
    const next=remaining.shift()!;structured.push(next);cursorPoint={latitude:next.latitude,longitude:next.longitude};
  }
  const candidates=[...structured.map(a=>({id:a.id,title:a.name,type:'visite'})),...city.highlights.map((title,i)=>({id:`highlight-${i}`,title,type:'visite'}))];
  if(!candidates.length)candidates.push({id:'discovery',title:`Découverte libre de ${city.name}`,type:'visite'});
  const unique=[...new Map(candidates.map(x=>[x.title.toLowerCase(),x])).values()];const visitCount=parsed.data.pace==='tranquille'?1:parsed.data.pace==='intense'?3:2;let cursor=0;
  const days=Array.from({length:parsed.data.days},(_,i)=>{const visits=Array.from({length:visitCount},()=>unique[cursor++%unique.length]).filter(Boolean);const items:any[]=[{time:'08:30',title:'Petit-déjeuner & préparation',type:'pause'}];if(visits[0])items.push({time:'09:30',title:visits[0].title,type:'visite',attractionId:visits[0].id.startsWith('highlight-')?undefined:visits[0].id});items.push({time:'12:30',title:'Déjeuner — cuisine locale à sélectionner sur place',type:'repas'});if(visits[1])items.push({time:'14:30',title:visits[1].title,type:'visite',attractionId:visits[1].id.startsWith('highlight-')?undefined:visits[1].id});if(visits[2])items.push({time:'17:00',title:visits[2].title,type:'visite',attractionId:visits[2].id.startsWith('highlight-')?undefined:visits[2].id});items.push({time:'19:00',title:'Retour / temps libre',type:'pause'},{time:'20:00',title:'Dîner',type:'repas'});return{day:i+1,items};});
  return NextResponse.json({destination:city.name,days,note:'Programme indicatif : vérifiez horaires d’ouverture, météo, transport local et disponibilité avant le départ. Waka ne présente pas les éléments non vérifiés comme des réservations confirmées.'});
}
