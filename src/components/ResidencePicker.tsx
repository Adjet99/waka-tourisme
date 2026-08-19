'use client';
import { useEffect, useState } from 'react';
import { useCatalogCities } from '@/hooks/useCatalogCities';
import { haversineKm } from '@/lib/geo';
import { track, updateProfile } from '@/lib/user-data';

export function ResidencePicker(){
  const cities=useCatalogCities();
  const [name,setName]=useState('Abidjan');const [message,setMessage]=useState('');
  useEffect(()=>{const slug=localStorage.getItem('waka:residence');const city=cities.find(c=>c.slug===slug);if(city)setName(city.name);},[cities]);
  const save=async()=>{const city=cities.find(c=>c.name.toLowerCase()===name.trim().toLowerCase());if(!city)return setMessage('Choisissez une ville disponible dans la liste.');const result=await updateProfile({residenceCitySlug:city.slug});track('city_selected',{city:city.slug});setMessage(result.mode==='cloud'?`${city.name} est synchronisée comme ville de résidence.`:`${city.name} est maintenant votre ville de référence sur cet appareil.`);};
  const locate=()=>{if(!navigator.geolocation)return setMessage('Géolocalisation indisponible.');setMessage('Recherche de votre position…');navigator.geolocation.getCurrentPosition(async pos=>{const p={latitude:pos.coords.latitude,longitude:pos.coords.longitude};const city=[...cities].sort((a,b)=>haversineKm(p,a)-haversineKm(p,b))[0];setName(city.name);await updateProfile({residenceCitySlug:city.slug});track('city_selected',{city:city.slug,source:'geolocation'});setMessage(`Ville de référence la plus proche du catalogue : ${city.name}. Votre position GPS précise n’est pas enregistrée.`);},()=>setMessage('Localisation refusée : vous pouvez saisir votre ville manuellement.'));};
  return <div className="origin-card"><div><label className="label">Où habitez-vous ?</label><input list="waka-cities" value={name} onChange={e=>setName(e.target.value)} placeholder="Ville de résidence"/><datalist id="waka-cities">{cities.map(c=><option value={c.name} key={c.slug}/>)}</datalist>{message&&<small className="muted block-note">{message}</small>}</div><div className="filters origin-actions"><button className="btn green" onClick={save}>Enregistrer</button><button className="btn ghost" onClick={locate}>📍 Ma position</button></div></div>;
}
