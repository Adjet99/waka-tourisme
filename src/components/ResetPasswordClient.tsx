'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function ResetPasswordClient(){
  const [password,setPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [message,setMessage]=useState('');
  const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(false);
  const client=createClient();

  if(!isSupabaseConfigured()||!client)return <div className="notice">La réinitialisation de mot de passe nécessite Supabase. Le mode démo ne crée pas de compte.</div>;

  const save=async()=>{
    if(password.length<8)return setMessage('Le nouveau mot de passe doit contenir au moins 8 caractères.');
    if(password!==confirmPassword)return setMessage('Les deux mots de passe ne correspondent pas.');
    setLoading(true);setMessage('');
    const {error}=await client.auth.updateUser({password});
    setLoading(false);
    if(error)return setMessage(error.message);
    setDone(true);setMessage('Votre mot de passe a été modifié.');
  };

  return <div className="panel auth-panel"><div className="stack"><div><label className="label" htmlFor="new-password">Nouveau mot de passe</label><input id="new-password" className="field" type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="8 caractères minimum"/></div><div><label className="label" htmlFor="confirm-password">Confirmer</label><input id="confirm-password" className="field" type="password" autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></div><button className="btn green" onClick={save} disabled={loading||done}>{loading?'Enregistrement…':'Modifier mon mot de passe'}</button>{message&&<div className="notice" aria-live="polite">{message}</div>}{done&&<Link className="btn ghost" href="/auth">Retour à la connexion</Link>}</div></div>;
}
