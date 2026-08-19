'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function UserStatus(){
  const [label,setLabel]=useState(isSupabaseConfigured()?'Compte':'Mode démo');
  const [signedIn,setSignedIn]=useState(false);
  useEffect(()=>{
    const client=createClient();if(!client)return;
    client.auth.getUser().then(({data})=>{if(data.user){setSignedIn(true);setLabel(data.user.user_metadata?.first_name||data.user.email?.split('@')[0]||'Profil');}});
    const {data:sub}=client.auth.onAuthStateChange((_event,session)=>{setSignedIn(Boolean(session?.user));setLabel(session?.user?.user_metadata?.first_name||session?.user?.email?.split('@')[0]||'Compte');});
    return()=>sub.subscription.unsubscribe();
  },[]);
  return <Link className="pill user-pill" href={signedIn?'/profil':'/auth'}>{signedIn?'👤':'◌'} {label}</Link>;
}
