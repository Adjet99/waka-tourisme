'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { track } from '@/lib/user-data';

export function AuthClient(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [terms,setTerms]=useState(false);
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const client=createClient();

  if(!isSupabaseConfigured() || !client) return <div className="notice">Mode démo actif : l’application reste entièrement navigable. Configurez Supabase pour activer les comptes persistants et la synchronisation multi-appareils.</div>;

  const signup=async()=>{
    if(!terms)return setMessage('Vous devez accepter les CGU et la politique de confidentialité pour créer un compte.');
    if(password.length<8)return setMessage('Utilisez un mot de passe d’au moins 8 caractères.');
    setLoading(true);setMessage('');
    const redirectTo=`${location.origin}/auth/callback?next=/profil`;
    const {error}=await client.auth.signUp({email,password,options:{emailRedirectTo:redirectTo,data:{terms_accepted_at:new Date().toISOString()}}});
    setLoading(false);setMessage(error?.message||'Compte créé. Vérifiez votre e-mail si la confirmation est activée.');
    if(!error)track('sign_up',{method:'email'});
  };
  const signin=async()=>{
    setLoading(true);setMessage('');
    const {error}=await client.auth.signInWithPassword({email,password});
    setLoading(false);setMessage(error?.message||'Connexion réussie. Redirection vers votre profil…');
    if(!error){track('sign_in',{method:'email'});location.href='/profil';}
  };
  const forgot=async()=>{
    if(!email)return setMessage('Saisissez votre adresse e-mail pour recevoir le lien de réinitialisation.');
    setLoading(true);setMessage('');
    const redirectTo=`${location.origin}/auth/callback?next=/auth/nouveau-mot-de-passe`;
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo});
    setLoading(false);setMessage(error?.message||'Si cette adresse existe, un e-mail de réinitialisation vient d’être envoyé.');
  };
  const google=async()=>{
    if(!terms)return setMessage('Acceptez les CGU et la politique de confidentialité avant de continuer avec Google.');
    localStorage.setItem('waka:pending-oauth-terms',new Date().toISOString());
    const redirectTo=`${location.origin}/auth/callback?next=/profil`;
    const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo}});
    if(error)setMessage(error.message);
  };

  return <div className="panel auth-panel">
    <div className="stack">
      <div><label className="label" htmlFor="auth-email">Email</label><input id="auth-email" className="field" value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" placeholder="vous@exemple.com"/></div>
      <div><label className="label" htmlFor="auth-password">Mot de passe</label><input id="auth-password" className="field" value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="8 caractères minimum"/></div>
      <label className="check-row"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/><span>Pour créer un compte, j’accepte les <Link href="/cgu">CGU</Link> et la <Link href="/confidentialite">politique de confidentialité</Link>.</span></label>
      <div className="filters"><button className="btn green" onClick={signin} disabled={loading||!email||!password}>Se connecter</button><button className="btn ghost" onClick={signup} disabled={loading||!email||!password}>Créer un compte</button><button className="btn text-btn" onClick={forgot} disabled={loading||!email}>Mot de passe oublié ?</button></div>
      <div className="auth-separator"><span>ou</span></div>
      <button className="btn ghost" onClick={google}>Continuer avec Google</button>
      {message&&<div className="notice" aria-live="polite">{message}</div>}
    </div>
  </div>;
}
