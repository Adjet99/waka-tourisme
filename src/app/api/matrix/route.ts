import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';
const point=z.object({id:z.string().max(120),latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180)});
const schema=z.object({origin:z.object({latitude:z.number().min(-90).max(90),longitude:z.number().min(-180).max(180)}),points:z.array(point).max(20)});
export async function POST(req:Request){
  if (!rateLimit(requestKey(req, 'matrix'), 20, 60_000).ok) return NextResponse.json({error:'Trop de demandes.'},{status:429});
  const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Paramètres invalides'},{status:400});
  const {origin,points}=parsed.data;if(!points.length)return NextResponse.json({items:[]});
  const coords=[origin,...points].map(p=>`${p.longitude},${p.latitude}`).join(';');
  try{
    const url=`https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=duration,distance`;
    const r=await fetch(url,{headers:{'user-agent':'WakaTourisme/1.0'},next:{revalidate:1800}});if(!r.ok)throw new Error();
    const data=await r.json();
    const durations=data.durations?.[0]||[];const distances=data.distances?.[0]||[];
    const items=points.map((p,i)=>({id:p.id,durationMinutes:durations[i+1]!=null?durations[i+1]/60:null,distanceKm:distances[i+1]!=null?distances[i+1]/1000:null}));
    return NextResponse.json({items,provider:'OSRM / OpenStreetMap'});
  }catch{return NextResponse.json({items:[],warning:'Matrice routière indisponible'});}
}
