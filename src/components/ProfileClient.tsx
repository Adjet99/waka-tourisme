'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CitySelect } from '@/components/CitySelect';
import { useCatalogCities } from '@/hooks/useCatalogCities';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { listFavoriteSlugs, listTrips, listVisitedCitySlugs, markCityVisited, updateProfile, type SavedTrip } from '@/lib/user-data';

export function ProfileClient(){
  const cities=useCatalogCities();
  const [favorites,setFavorites]=useState<string[]>([]);
  const [visited,setVisited]=useState<string[]>([]);
  const [trips,setTrips]=useState<SavedTrip[]>([]);
  const [userEmail,setUserEmail]=useState<string|null>(null);
  const [firstName,setFirstName]=useState('');
  const [residence,setResidence]=useState('abidjan');
  const [visitCity,setVisitCity]=useState('grand-bassam');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(true);

  const load=async()=>{
    setLoading(true);
    const [fav,vis,trip]=await Promise.all([listFavoriteSlugs(),listVisitedCitySlugs(),listTrips()]);
    setFavorites(fav);setVisited(vis);setTrips(trip);
    const localResidence=localStorage.getItem('waka:residence');if(localResidence)setResidence(localResidence);
    setFirstName(localStorage.getItem('waka:first-name')||'');
    const client=createClient();
    if(client){
      const {data:{user}}=await client.auth.getUser();
      if(user){
        setUserEmail(user.email||null);
        const pendingTerms=localStorage.getItem('waka:pending-oauth-terms');
        if(pendingTerms){await client.from('profiles').update({terms_accepted_at:pendingTerms}).eq('id',user.id);localStorage.removeItem('waka:pending-oauth-terms');}
        const {data:profile}=await client.from('profiles').select('first_name,residence:cities(slug)').eq('id',user.id).maybeSingle();
        if(profile?.first_name){setFirstName(profile.first_name);localStorage.setItem('waka:first-name',profile.first_name);}
        const slug=(profile as any)?.residence?.slug;if(slug){setResidence(slug);localStorage.setItem('waka:residence',slug);}
      }
    }
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const badges=useMemo(()=>[
    {icon:'🗺️',name:'Explorateur ivoirien',earned:visited.length>=5,progress:`${Math.min(visited.length,5)}/5 villes`},
    {icon:'🇨🇮',name:'Grand explorateur',earned:visited.length>=10,progress:`${Math.min(visited.length,10)}/10 villes`},
    {icon:'🎒',name:'Voyageur organisé',earned:trips.length>=1,progress:`${Math.min(trips.length,1)}/1 itinéraire`},
  ],[visited,trips]);

  const save=async()=>{setMessage('Enregistrement…');const result=await updateProfile({firstName,residenceCitySlug:residence});setMessage(result.mode==='cloud'?'Profil synchronisé avec votre compte.':'Préférences enregistrées sur cet appareil (mode démo).');};
  const addVisited=async()=>{await markCityVisited(visitCity);setVisited(await listVisitedCitySlugs());setMessage(`${cities.find(c=>c.slug===visitCity)?.name||'Ville'} ajoutée à votre passeport.`);};
  const logout=async()=>{const client=createClient();if(client)await client.auth.signOut();location.href='/';};
  const exportData=async()=>{const client=createClient();if(!client)return;const {data}=await client.auth.getSession();const token=data.session?.access_token;if(!token)return setMessage('Reconnectez-vous pour exporter vos données.');const res=await fetch('/api/account/export',{headers:{authorization:`Bearer ${token}`}});if(!res.ok){const body=await res.json().catch(()=>({}));return setMessage(body.error||'Export indisponible.');}const blob=await res.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='waka-mes-donnees.json';a.click();URL.revokeObjectURL(url);setMessage('Export de vos données généré.');};
  const deleteAccount=async()=>{if(!confirm('Supprimer définitivement votre compte Waka et ses données ?'))return;const typed=prompt('Tapez SUPPRIMER pour confirmer.');if(typed!=='SUPPRIMER')return;const client=createClient();if(!client)return;const {data}=await client.auth.getSession();const token=data.session?.access_token;if(!token)return setMessage('Reconnectez-vous pour supprimer le compte.');const res=await fetch('/api/account/delete',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify({confirmation:'SUPPRIMER'})});const body=await res.json().catch(()=>({}));if(!res.ok)return setMessage(body.error||'Suppression impossible.');localStorage.removeItem('waka:favorites');localStorage.removeItem('waka:visited-cities');localStorage.removeItem('waka:trips');await client.auth.signOut();location.href='/';};

  if(loading)return <div className="panel">Chargement de votre espace explorateur…</div>;
  return <div className="profile-layout">
    <section className="panel profile-identity">
      <div className="avatar">{(firstName||userEmail||'W').slice(0,1).toUpperCase()}</div>
      <div><span className="eyebrow">Mon espace</span><h2>{firstName||'Explorateur Waka'}</h2><p>{userEmail||'Mode démo — données stockées sur cet appareil'}</p></div>
      {userEmail?<button className="btn ghost" onClick={logout}>Se déconnecter</button>:<Link className="btn green" href="/auth">Créer un compte</Link>}
    </section>

    <div className="stats-grid">
      <div className="stat"><span>Favoris</span><b>{favorites.length}</b></div>
      <div className="stat"><span>Villes visitées</span><b>{visited.length}</b></div>
      <div className="stat"><span>Voyages sauvegardés</span><b>{trips.length}</b></div>
      <div className="stat"><span>Badges débloqués</span><b>{badges.filter(x=>x.earned).length}</b></div>
    </div>

    <div className="two-col section-tight">
      <section className="panel"><h2>Mes préférences</h2><div className="stack"><div><label className="label">Prénom</label><input className="field" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Votre prénom"/></div><div><label className="label">Ville de résidence</label><CitySelect value={residence} onChange={setResidence}/></div><button className="btn green" onClick={save}>Enregistrer</button>{message&&<div className="notice">{message}</div>}</div></section>
      <section className="panel"><h2>Mon passeport ivoirien</h2><p className="muted">Ajoutez les villes réellement visitées. Votre progression reste privée dans votre compte.</p><div className="filters"><CitySelect value={visitCity} onChange={setVisitCity}/><button className="btn green" onClick={addVisited}>✓ J’y suis allé</button></div><div className="passport-list">{visited.length?visited.map(slug=><span className="passport-stamp" key={slug}>🇨🇮 {cities.find(c=>c.slug===slug)?.name||slug}</span>):<span className="muted">Aucune ville enregistrée.</span>}</div></section>
    </div>

    <section className="panel"><div className="section-head"><div><span className="eyebrow">Progression</span><h2>Mes badges</h2></div></div><div className="badge-grid">{badges.map(b=><div className={`badge-card ${b.earned?'earned':''}`} key={b.name}><span>{b.icon}</span><div><b>{b.name}</b><small>{b.earned?'Débloqué':b.progress}</small></div></div>)}</div></section>

    <section className="panel"><div className="section-head"><div><span className="eyebrow">Planification</span><h2>Mes derniers voyages</h2></div><Link className="btn ghost" href="/voyages">Voir tout</Link></div>{trips.length?<div className="stack">{trips.slice(0,3).map(t=><Link href={`/destinations/${t.citySlug}`} className="trip-row" key={t.localId}><div><b>{t.title}</b><small>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</small></div><span>→</span></Link>)}</div>:<p className="muted">Générez un programme depuis une fiche destination pour commencer.</p>}</section>

    {userEmail&&<section className="panel privacy-actions"><span className="eyebrow">Vie privée</span><h2>Mes données</h2><p className="muted">Téléchargez une copie JSON de vos données Waka ou supprimez définitivement votre compte.</p><div className="filters"><button className="btn ghost" onClick={exportData}>Exporter mes données</button><button className="btn danger" onClick={deleteAccount}>Supprimer mon compte</button></div></section>}
    {!isSupabaseConfigured()&&<div className="notice">Vous testez le mode démo. Une fois Supabase configuré, favoris, profil et itinéraires se synchronisent entre appareils.</div>}
  </div>;
}
