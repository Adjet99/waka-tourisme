import { NextRequest, NextResponse } from 'next/server';
import { haversineKm } from '@/lib/geo';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';

export async function GET(req:NextRequest){
  if (!rateLimit(requestKey(req, 'route'), 60, 60_000).ok) return NextResponse.json({error:'Trop de demandes.'},{status:429});
  const p=req.nextUrl.searchParams;
  const fromLat=Number(p.get('fromLat')),fromLng=Number(p.get('fromLng')),toLat=Number(p.get('toLat')),toLng=Number(p.get('toLng'));
  if([fromLat,fromLng,toLat,toLng].some(v=>!Number.isFinite(v))||Math.abs(fromLat)>90||Math.abs(toLat)>90||Math.abs(fromLng)>180||Math.abs(toLng)>180) return NextResponse.json({error:'Coordonnées invalides'},{status:400});
  try{
    const url=`https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false&steps=false`;
    const r=await fetch(url,{headers:{'user-agent':'WakaTourisme/1.0'},next:{revalidate:1800}});
    if(!r.ok) throw new Error('routing unavailable');
    const data=await r.json();
    const route=data.routes?.[0];
    if(!route) throw new Error('no route');
    return NextResponse.json({distanceKm:route.distance/1000,durationMinutes:route.duration/60,provider:'OSRM / OpenStreetMap',estimated:false});
  }catch{
    const distanceKm=haversineKm({latitude:fromLat,longitude:fromLng},{latitude:toLat,longitude:toLng});
    return NextResponse.json({distanceKm,provider:'Fallback géodésique',estimated:true,warning:'Service routier indisponible : seule la distance à vol d’oiseau est affichée. Aucun temps de trajet n’est inventé.'});
  }
}
