import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, requestKey } from '@/lib/server/rate-limit';
const schema=z.object({rating:z.number().int().min(1).max(5),message:z.string().min(3).max(1500),pagePath:z.string().max(300).optional(),anonymousSessionId:z.string().max(100).optional(),website:z.string().max(0).optional()});
export async function POST(request:Request){
  if(!rateLimit(requestKey(request,'feedback'),10,10*60_000).ok)return NextResponse.json({error:'Trop de retours envoyés.'},{status:429});
  const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Retour invalide.'},{status:400});if(parsed.data.website)return NextResponse.json({ok:true});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)return NextResponse.json({ok:true,persisted:false},{status:202});
  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error}=await supabase.from('beta_feedback').insert({anonymous_session_id:parsed.data.anonymousSessionId||null,page_path:parsed.data.pagePath||null,rating:parsed.data.rating,message:parsed.data.message});
  return NextResponse.json({ok:!error,persisted:!error},{status:error?500:200});
}
