'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { cities as fallbackCities } from '@/data/cities';
import { useCatalogCities } from '@/hooks/useCatalogCities';
import { CitySelect } from '@/components/CitySelect';
import { FavoriteButton } from '@/components/FavoriteButton';
import { listRecentRejectedCitySlugs, listVisitedCitySlugs, recordDestinationRejection, track } from '@/lib/user-data';
import type { BudgetLevel, ScoredCity, TravelTime, TravellerProfile, TransportMode } from '@/types';

const interestOptions = ['nature','plage','gastronomie','aventure','culture','repos','famille','patrimoine'];
type RouteData={distanceKm:number;durationMinutes?:number;estimated:boolean;warning?:string};

export function SurpriseClient() {
  const catalog=useCatalogCities();
  const [originSlug,setOriginSlug]=useState('abidjan');
  const [availableTime,setAvailableTime]=useState<TravelTime>('weekend');
  const [budget,setBudget]=useState<BudgetLevel>('modere');
  const [budgetMax,setBudgetMax]=useState('');
  const [transport,setTransport]=useState<TransportMode>('peu-importe');
  const [travellers,setTravellers]=useState<TravellerProfile>('couple');
  const [interests,setInterests]=useState<string[]>([]);
  const [children,setChildren]=useState(false);
  const [rolling,setRolling]=useState(false);
  const [result,setResult]=useState<ScoredCity|null>(null);
  const [rejected,setRejected]=useState<string[]>([]);
  const [previous,setPrevious]=useState<string[]>([]);
  const [ticker,setTicker]=useState('Prêt ?');
  const [error,setError]=useState('');
  const [route,setRoute]=useState<RouteData|null>(null);
  const origin=useMemo(()=>catalog.find(c=>c.slug===originSlug)||catalog[0]||fallbackCities[0],[originSlug,catalog]);

  useEffect(()=>{const saved=localStorage.getItem('waka:residence');if(saved)setOriginSlug(saved);Promise.all([listVisitedCitySlugs(),listRecentRejectedCitySlugs()]).then(([visited,recentRejected])=>{setPrevious(visited);setRejected(recentRejected);});},[]);
  useEffect(()=>{if(!rolling)return;const id=setInterval(()=>setTicker(catalog[Math.floor(Math.random()*catalog.length)]?.name||'Côte d’Ivoire'),90);return()=>clearInterval(id);},[rolling,catalog]);
  useEffect(()=>{if(!result){setRoute(null);return;}fetch(`/api/route?fromLat=${origin.latitude}&fromLng=${origin.longitude}&toLat=${result.latitude}&toLng=${result.longitude}`).then(r=>r.json()).then(setRoute).catch(()=>setRoute(null));},[result,origin]);

  const spin=async(options?:{total?:boolean})=>{
    setRolling(true);setResult(null);setRoute(null);setError('');track('destination_spin_started',{origin:origin.slug,total:Boolean(options?.total)});
    await new Promise(r=>setTimeout(r,900));
    const payload=options?.total?{origin:{...origin,cityName:origin.name},rejectedDestinations:rejected,previousDestinations:previous}:{origin:{...origin,cityName:origin.name},availableTime,budget,budgetMaxXof:budgetMax?Number(budgetMax):undefined,transport,travellers,interests,children,rejectedDestinations:rejected,previousDestinations:previous};
    try{
      const res=await fetch('/api/recommend',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      const data=await res.json();
      if(!res.ok||!data.destination){setError(data.error||'Aucune destination ne correspond à ces critères.');setRolling(false);return;}
      setResult(data.destination);localStorage.setItem('waka:last-spin',JSON.stringify(data.destination));
      track('destination_generated',{destination:data.destination.slug,origin:origin.slug,availableTime:options?.total?'weekend':availableTime});
    }catch{setError('Le moteur de recommandation est momentanément indisponible.');}
    finally{setRolling(false);}
  };
  const reject=async()=>{if(!result)return;const next=[...new Set([...rejected,result.slug])];setRejected(next);await recordDestinationRejection(result.slug);track('destination_rejected',{destination:result.slug});setResult(null);setRoute(null);setTimeout(()=>spin(),0);};

  return <>
    <div className="panel" style={{marginBottom:18}}>
      <div className="surprise-mode-head"><div><span className="eyebrow">Surprise personnalisée</span><h2>Donnez quelques indices à Waka</h2></div><button className="btn ghost" onClick={()=>spin({total:true})} disabled={rolling}>🎲 Surprise totale</button></div>
      <div className="form-grid three">
        <div><label className="label">Je pars de</label><CitySelect value={originSlug} onChange={setOriginSlug}/></div>
        <div><label className="label">J’ai</label><select className="field" value={availableTime} onChange={e=>setAvailableTime(e.target.value as TravelTime)}><option value="heures">Quelques heures</option><option value="journee">Une journée</option><option value="weekend">Un week-end</option><option value="3jours">3 jours</option><option value="4-5jours">4-5 jours</option><option value="semaine">Une semaine</option></select></div>
        <div><label className="label">Je voyage</label><select className="field" value={travellers} onChange={e=>setTravellers(e.target.value as TravellerProfile)}><option value="seul">Seul</option><option value="couple">En couple</option><option value="amis">Avec des amis</option><option value="famille">En famille</option></select></div>
        <div><label className="label">Budget</label><select className="field" value={budget} onChange={e=>setBudget(e.target.value as BudgetLevel)}><option value="economique">Économique</option><option value="modere">Modéré</option><option value="confortable">Confortable</option><option value="premium">Premium</option></select></div>
        <div><label className="label">Budget maximum (optionnel)</label><input className="field" inputMode="numeric" value={budgetMax} onChange={e=>setBudgetMax(e.target.value.replace(/\D/g,''))} placeholder="ex. 75 000 FCFA"/></div>
        <div><label className="label">Transport</label><select className="field" value={transport} onChange={e=>setTransport(e.target.value as TransportMode)}><option value="peu-importe">Peu importe</option><option value="voiture">Voiture</option><option value="bus">Bus / car</option><option value="avion">Avion si disponible</option></select></div>
      </div>
      <label className="check-row" style={{marginTop:14}}><input type="checkbox" checked={children} onChange={e=>setChildren(e.target.checked)}/><span>Nous voyageons avec des enfants</span></label>
      <div style={{marginTop:16}}><label className="label">Mes envies (optionnel)</label><div className="filters">{interestOptions.map(x=><button className={`filter-chip ${interests.includes(x)?'active':''}`} key={x} onClick={()=>setInterests(v=>v.includes(x)?v.filter(i=>i!==x):[...v,x])}>{x}</button>)}</div></div>
    </div>

    <div className="roulette" aria-live="polite">
      {rolling ? <div><div className="eyebrow" style={{color:'white'}}>Waka analyse vos critères…</div><div className="rolling">{ticker}</div><p>Durée · budget · distance · affinités · nouveauté + une part de hasard</p></div> : result ? <div className="roulette-result"><div style={{fontSize:44}}>✨</div><div className="eyebrow" style={{color:'white'}}>Votre prochaine destination</div><h2>{result.name}</h2><p className="roulette-description">{result.shortDescription}</p><div className="filters roulette-reasons">{result.reasons.slice(0,4).map(r=><span className="pill light" key={r}>{r}</span>)}</div>{route&&<div className="roulette-stats"><span>📍 {Math.round(route.distanceKm)} km</span><span>🚗 {route.durationMinutes?`${Math.floor(route.durationMinutes/60)} h ${Math.round(route.durationMinutes%60)} min`:'temps à confirmer'}</span><span>🧳 {result.minDays}–{result.maxDays} j conseillé</span><span>💰 ~{result.averageBudgetXof.toLocaleString('fr-FR')} FCFA</span></div>}{route?.warning&&<small className="light-note">{route.warning}</small>}<div className="filters roulette-actions"><Link href={`/destinations/${result.slug}`} className="btn white">🧳 Préparer mon séjour</Link><FavoriteButton slug={result.slug}/><button onClick={reject} className="btn glass">🎲 Une autre destination</button></div></div> : <div><div style={{fontSize:48}}>🎲</div><h2 className="roulette-question">Où l’aventure va-t-elle vous emmener ?</h2><button onClick={()=>spin()} className="btn white big">Trouve ma prochaine destination</button>{error&&<div className="roulette-error">{error}</div>}</div>}
    </div>
    {rejected.length>0&&<div className="notice" style={{marginTop:14}}>{rejected.length} destination{rejected.length>1?'s':''} écartée{rejected.length>1?'s':''} pour cette session. Elles ne seront pas reproposées immédiatement.</div>}
  </>;
}
