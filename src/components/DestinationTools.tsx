'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Share2 } from 'lucide-react';
import { cities as fallbackCities } from '@/data/cities';
import { useCatalogCities } from '@/hooks/useCatalogCities';
import type { City, GeneratedItinerary } from '@/types';
import { CitySelect } from './CitySelect';
import { markCityVisited, saveTrip, track } from '@/lib/user-data';

type RouteData={distanceKm:number;durationMinutes?:number;provider:string;estimated:boolean;warning?:string};
type Weather={current?:{temperature_2m:number;precipitation:number;weather_code?:number;wind_speed_10m?:number};daily?:{time:string[];temperature_2m_max:number[];temperature_2m_min:number[];precipitation_probability_max:number[]};error?:string};

function weatherAdvice(weather:Weather|null){
  if(!weather?.daily)return null;
  const rain=weather.daily.precipitation_probability_max?.[0]??0;
  if(rain>=70)return '🌧️ Risque de pluie élevé aujourd’hui : privilégiez les activités couvertes ou vérifiez demain.';
  if(rain>=40)return '🌦️ Quelques averses sont possibles : prévoyez une option de repli.';
  return '☀️ Les conditions annoncées sont plutôt favorables aux activités extérieures.';
}

export function DestinationTools({city}:{city:City}){
  const catalog=useCatalogCities();
  const [originSlug,setOriginSlug]=useState('abidjan');
  const [route,setRoute]=useState<RouteData|null>(null);
  const [weather,setWeather]=useState<Weather|null>(null);
  const [itinerary,setItinerary]=useState<GeneratedItinerary|null>(null);
  const [days,setDays]=useState(Math.min(3,Math.max(1,city.minDays)));
  const [pace,setPace]=useState<'tranquille'|'equilibre'|'intense'>('equilibre');
  const [children,setChildren]=useState(false);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const origin=catalog.find(c=>c.slug===originSlug)||catalog[0]||fallbackCities[0];

  useEffect(()=>{const saved=localStorage.getItem('waka:residence');if(saved)setOriginSlug(saved);},[]);
  useEffect(()=>{fetch(`/api/weather?lat=${city.latitude}&lng=${city.longitude}`).then(r=>r.json()).then(setWeather).catch(()=>setWeather({error:'indisponible'}));},[city]);
  useEffect(()=>{setRoute(null);fetch(`/api/route?fromLat=${origin.latitude}&fromLng=${origin.longitude}&toLat=${city.latitude}&toLng=${city.longitude}`).then(r=>r.json()).then(setRoute).catch(()=>setRoute(null));},[origin,city]);

  const generate=async()=>{
    setMessage('');
    const res=await fetch('/api/itinerary',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({destination:city.slug,days,pace,children})});
    const data=await res.json();
    if(!res.ok)return setMessage(data.error||'Impossible de générer le programme.');
    setItinerary(data);track('itinerary_generated',{destination:city.slug,days,pace,children});
  };
  const persist=async()=>{
    if(!itinerary)return;setSaving(true);setMessage('');
    await saveTrip(city.slug,city.name,itinerary);track('itinerary_saved',{destination:city.slug,days:itinerary.days.length});
    setSaving(false);setMessage('Programme sauvegardé dans “Mes voyages”.');
  };
  const visited=async()=>{await markCityVisited(city.slug);track('trip_completed',{destination:city.slug});setMessage(`${city.name} a été ajoutée à votre passeport.`);};
  const share=async()=>{
    const data={title:`Découvrir ${city.name} avec Waka`,text:city.shortDescription,url:location.href};
    if(navigator.share)await navigator.share(data).catch(()=>{});else{await navigator.clipboard.writeText(location.href);setMessage('Lien copié.');}
  };

  return <div className="stack destination-tools">
    <div className="panel"><h3 style={{marginTop:0}}>Comment s’y rendre ?</h3><label className="label">Départ</label><CitySelect value={originSlug} onChange={setOriginSlug}/>{route?<div className="result-grid compact"><div className="stat"><span>{route.estimated?'Distance indicative':'Distance routière'}</span><b>{Math.round(route.distanceKm)} km</b></div><div className="stat"><span>Temps estimé</span><b>{route.durationMinutes?`${Math.floor(route.durationMinutes/60)} h ${Math.round(route.durationMinutes%60)} min`:'À confirmer'}</b></div></div>:<p className="muted">Calcul du trajet…</p>}{route?.warning&&<div className="notice" style={{marginTop:12}}>{route.warning}</div>}<small className="source-note">Source trajet : {route?.provider||'chargement'}.</small></div>

    <div className="panel"><h3 style={{marginTop:0}}>Météo à {city.name}</h3>{weather?.current?<><div className="weather-current"><b>{Math.round(weather.current.temperature_2m)}°C</b><span>Précipitations {weather.current.precipitation} mm</span></div>{weather.daily&&<div className="forecast-row">{weather.daily.time.slice(0,4).map((d,i)=><span className="forecast-chip" key={d}><b>{new Date(`${d}T12:00:00`).toLocaleDateString('fr-FR',{weekday:'short'})}</b>{Math.round(weather.daily!.temperature_2m_max[i])}°<small>pluie {weather.daily!.precipitation_probability_max[i]}%</small></span>)}</div>}<div className="notice" style={{marginTop:12}}>{weatherAdvice(weather)}</div></>:<p>Météo indisponible pour le moment.</p>}</div>

    <div className="panel"><h3 style={{marginTop:0}}>Préparer mon séjour</h3><div className="planner-controls"><div><label className="label">Durée</label><select className="field" value={days} onChange={e=>setDays(Number(e.target.value))}>{[1,2,3,4,5,6,7].map(d=><option key={d} value={d}>{d} jour{d>1?'s':''}</option>)}</select></div><div><label className="label">Rythme</label><select className="field" value={pace} onChange={e=>setPace(e.target.value as any)}><option value="tranquille">Tranquille</option><option value="equilibre">Équilibré</option><option value="intense">Actif</option></select></div></div><label className="check-row"><input type="checkbox" checked={children} onChange={e=>setChildren(e.target.checked)}/><span>Adapter pour un séjour avec des enfants</span></label><button className="btn green full" onClick={generate}>Générer mon programme</button>
      {itinerary&&<div className="timeline" style={{marginTop:16}}>{itinerary.days.map(day=><div className="itinerary-day" key={day.day}><h4>Jour {day.day}</h4>{day.items.map((item,i)=><div className="timeline-item" key={`${day.day}-${i}`}><b>{item.time}</b><span>{item.title}</span></div>)}</div>)}<div className="notice">{itinerary.note}</div><button className="btn orange full" onClick={persist} disabled={saving}>{saving?'Sauvegarde…':'🧳 Sauvegarder ce voyage'}</button></div>}
    </div>

    <div className="panel"><h3 style={{marginTop:0}}>Après votre visite</h3><p className="muted">Enregistrez cette destination dans votre passeport ou partagez-la.</p><div className="filters"><button className="btn ghost" onClick={visited}><CheckCircle2 size={17}/> J’y suis allé</button><button className="btn ghost" onClick={share}><Share2 size={17}/> Partager</button></div>{message&&<div className="notice" style={{marginTop:12}}>{message}</div>}</div>
  </div>;
}
