import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';
export async function GET(req:NextRequest){
  if (!rateLimit(requestKey(req, 'weather'), 80, 60_000).ok) return NextResponse.json({error:'Trop de demandes.'},{status:429});
  const lat=Number(req.nextUrl.searchParams.get('lat')),lng=Number(req.nextUrl.searchParams.get('lng'));
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180) return NextResponse.json({error:'Coordonnées invalides'},{status:400});
  try{
    const url=new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude',String(lat));url.searchParams.set('longitude',String(lng));
    url.searchParams.set('current','temperature_2m,precipitation,weather_code,wind_speed_10m');
    url.searchParams.set('daily','temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code');
    url.searchParams.set('timezone','Africa/Abidjan');url.searchParams.set('forecast_days','7');
    const r=await fetch(url,{next:{revalidate:900}});if(!r.ok) throw new Error();
    const data=await r.json();
    return NextResponse.json({provider:'Open-Meteo',current:data.current,daily:data.daily});
  }catch{return NextResponse.json({error:'Météo temporairement indisponible'},{status:503});}
}
