import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';

export async function GET(request:Request){
  if(!rateLimit(requestKey(request,'account-export'),5,10*60_000).ok)return NextResponse.json({error:'Trop de demandes.'},{status:429});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return NextResponse.json({error:'Export non disponible tant que la base de production n’est pas configurée.'},{status:503});
  const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token)return NextResponse.json({error:'Authentification requise.'},{status:401});
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {data:{user},error:userError}=await admin.auth.getUser(token);if(userError||!user)return NextResponse.json({error:'Session invalide.'},{status:401});
  const [profile,favorites,visited,itineraries,reviews]=await Promise.all([
    admin.from('profiles').select('*').eq('id',user.id).maybeSingle(),
    admin.from('favorites').select('created_at,city:cities(slug,name),attraction:attractions(slug,name)').eq('user_id',user.id),
    admin.from('visited_cities').select('visited_at,city:cities(slug,name)').eq('user_id',user.id),
    admin.from('itineraries').select('*,city:cities(slug,name),items:itinerary_items(*)').eq('user_id',user.id),
    admin.from('reviews').select('*').eq('user_id',user.id)
  ]);
  const payload={exportedAt:new Date().toISOString(),account:{id:user.id,email:user.email,createdAt:user.created_at},profile:profile.data,favorites:favorites.data||[],visitedCities:visited.data||[],itineraries:itineraries.data||[],reviews:reviews.data||[]};
  return new NextResponse(JSON.stringify(payload,null,2),{status:200,headers:{'content-type':'application/json; charset=utf-8','content-disposition':'attachment; filename="waka-mes-donnees.json"','cache-control':'no-store'}});
}
