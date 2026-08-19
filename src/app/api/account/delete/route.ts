import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';
const schema=z.object({confirmation:z.literal('SUPPRIMER')});
export async function POST(request:Request){
  if(!rateLimit(requestKey(request,'account-delete'),3,60*60_000).ok)return NextResponse.json({error:'Trop de tentatives.'},{status:429});
  const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Confirmation invalide.'},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return NextResponse.json({error:'Suppression serveur non configurée.'},{status:503});
  const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token)return NextResponse.json({error:'Authentification requise.'},{status:401});
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {data:{user},error}=await admin.auth.getUser(token);if(error||!user)return NextResponse.json({error:'Session invalide.'},{status:401});
  const {error:deleteError}=await admin.auth.admin.deleteUser(user.id);if(deleteError)return NextResponse.json({error:'Suppression impossible.'},{status:500});
  return NextResponse.json({ok:true});
}
