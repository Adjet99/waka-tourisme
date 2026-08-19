import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';

function category(tags:Record<string,string>){
  if(tags.natural==='beach') return 'plage';
  if(tags.waterway==='waterfall') return 'cascade';
  if(tags.natural || tags.leisure==='nature_reserve' || tags.leisure==='park') return 'nature';
  if(tags.tourism==='museum' || tags.historic) return 'culture';
  if(tags.tourism==='attraction' || tags.tourism==='viewpoint' || tags.tourism==='artwork') return 'insolite';
  if(tags.amenity==='restaurant' || tags.amenity==='marketplace') return 'gastronomie';
  return 'decouverte';
}

export async function GET(req:NextRequest){
  if (!rateLimit(requestKey(req, 'nearby'), 24, 60_000).ok) return NextResponse.json({error:'Trop de recherches. Réessayez dans quelques instants.'},{status:429});
  const lat=Number(req.nextUrl.searchParams.get('lat'));
  const lng=Number(req.nextUrl.searchParams.get('lng'));
  const radius=Math.min(200000,Math.max(1000,Number(req.nextUrl.searchParams.get('radius')||25000)));
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180) return NextResponse.json({error:'Coordonnées invalides'},{status:400});
  const food = radius <= 50000 ? `nwr(around:${radius},${lat},${lng})[amenity=marketplace];nwr(around:${radius},${lat},${lng})[amenity=restaurant][name];` : '';
  const q=`[out:json][timeout:20];(nwr(around:${radius},${lat},${lng})[tourism~"attraction|museum|viewpoint|artwork|gallery|zoo|theme_park"][name];nwr(around:${radius},${lat},${lng})[historic][name];nwr(around:${radius},${lat},${lng})[leisure~"park|nature_reserve"][name];nwr(around:${radius},${lat},${lng})[waterway=waterfall][name];nwr(around:${radius},${lat},${lng})[natural=beach][name];${food});out center 100;`;
  try{
    const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:new URLSearchParams({data:q}),headers:{'user-agent':'WakaTourisme/1.0 (tourism discovery app)'},next:{revalidate:3600}});
    if(!r.ok) throw new Error('Overpass unavailable');
    const data=await r.json();
    const seen=new Set<string>();
    const items=(data.elements||[]).map((el:any)=>({
      id:`osm-${el.type}-${el.id}`,
      name:el.tags?.['name:fr'] || el.tags?.name,
      category:category(el.tags||{}),
      latitude:el.lat ?? el.center?.lat,
      longitude:el.lon ?? el.center?.lon,
      source:'OpenStreetMap / Overpass',
      sourceUrl:`https://www.openstreetmap.org/${el.type}/${el.id}`
    })).filter((x:any)=>{
      if(!x.name||!Number.isFinite(x.latitude)||!Number.isFinite(x.longitude))return false;
      const key=`${x.name.toLowerCase()}-${x.latitude.toFixed(4)}-${x.longitude.toFixed(4)}`;
      if(seen.has(key))return false;seen.add(key);return true;
    }).slice(0,100);
    return NextResponse.json({items,provider:'OpenStreetMap / Overpass',notice:'Les points d’intérêt proviennent de données contributives et doivent être vérifiés avant déplacement.'});
  }catch{
    return NextResponse.json({items:[],warning:'Source OpenStreetMap temporairement indisponible'},{status:200});
  }
}
