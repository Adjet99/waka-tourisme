'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { cities as fallbackCities, curatedAttractions } from '@/data/cities';
import { useCatalogCities } from '@/hooks/useCatalogCities';
import { haversineKm, formatDistance } from '@/lib/geo';
import { CitySelect } from '@/components/CitySelect';
import { track } from '@/lib/user-data';

type Poi = { id:string; name:string; category:string; latitude:number; longitude:number; distanceKm?:number; durationMinutes?:number; source?:string; sourceUrl?:string };
const DynamicMap = dynamic(() => import('@/components/MapView').then(m => m.MapView), { ssr:false, loading:()=> <div className="map-loading">Chargement de la carte…</div> });
const categories = ['nature','plage','culture','gastronomie','famille','aventure','insolite','cascade'];

export function ExplorerClient() {
  const catalog=useCatalogCities();
  const [citySlug, setCitySlug] = useState('abidjan');
  const [customOrigin,setCustomOrigin]=useState<{latitude:number;longitude:number;label:string}|null>(null);
  const [radius, setRadius] = useState(25);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [remotePois, setRemotePois] = useState<Poi[]|null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const city = catalog.find(c=>c.slug===citySlug) || catalog[0] || fallbackCities[0];
  const origin=customOrigin||{latitude:city.latitude,longitude:city.longitude,label:city.name};

  useEffect(()=>{const saved=localStorage.getItem('waka:residence');if(saved)setCitySlug(saved);},[]);
  const fallback = useMemo(() => curatedAttractions
    .map(a => ({...a, distanceKm:haversineKm(origin,a)}))
    .filter(a => a.distanceKm <= radius && (!selectedCategories.length || selectedCategories.includes(a.category))), [origin.latitude,origin.longitude,radius,selectedCategories]);
  const pois = remotePois?.length ? remotePois : fallback;

  const search = async () => {
    setLoading(true); setMessage(''); setRemotePois(null);
    try {
      const qs = new URLSearchParams({ lat:String(origin.latitude), lng:String(origin.longitude), radius:String(radius*1000) });
      const res = await fetch(`/api/nearby?${qs}`);const data=await res.json();
      if(!res.ok)throw new Error(data.error||'Recherche indisponible');
      let rows: Poi[] = (data.items || []).map((p:Poi)=>({...p,distanceKm:haversineKm(origin,p)}))
        .filter(p => !selectedCategories.length || selectedCategories.includes(p.category));
      if(rows.length){
        try{
          const matrix=await fetch('/api/matrix',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({origin,points:rows.slice(0,20)})}).then(r=>r.json());
          const byId=new Map((matrix.items||[]).map((x:any)=>[x.id,x]));
          rows=rows.map(p=>{const m:any=byId.get(p.id);return m?{...p,distanceKm:m.distanceKm??p.distanceKm,durationMinutes:m.durationMinutes??undefined}:p;});
        }catch{}
      }
      rows.sort((a,b)=>(a.distanceKm??9999)-(b.distanceKm??9999));setRemotePois(rows);
      setMessage(rows.length ? `${rows.length} lieu${rows.length>1?'x':''} trouvé${rows.length>1?'s':''} autour de ${origin.label}.` : 'Aucun résultat dynamique pour ces filtres. Les données de secours disponibles sont affichées.');
      track('nearby_search',{origin:origin.label,radius,categories:selectedCategories,count:rows.length});
    } catch {
      setRemotePois([]);setMessage('La source cartographique est temporairement indisponible : affichage des données de secours vérifiables disponibles.');
    } finally { setLoading(false); }
  };

  const useLocation = () => {
    if (!navigator.geolocation) return setMessage('La géolocalisation n’est pas disponible sur cet appareil.');
    setMessage('Demande de localisation…');
    navigator.geolocation.getCurrentPosition(pos => {
      const lat=pos.coords.latitude,lng=pos.coords.longitude;
      const nearest=[...catalog].sort((a,b)=>haversineKm({latitude:lat,longitude:lng},a)-haversineKm({latitude:lat,longitude:lng},b))[0];
      setCitySlug(nearest.slug);setCustomOrigin({latitude:lat,longitude:lng,label:'votre position'});
      setMessage(`Position utilisée uniquement pour cette recherche. Ville de référence la plus proche : ${nearest.name}.`);
    }, ()=>setMessage('Localisation refusée. Choisissez simplement votre ville de départ.'));
  };

  return <>
    <div className="panel" style={{marginBottom:18}}>
      <div className="form-grid"><div><label className="label">Ville de départ</label><CitySelect value={citySlug} onChange={slug=>{setCitySlug(slug);setCustomOrigin(null);}}/></div><div><label className="label">Rayon</label><select className="field" value={radius} onChange={e=>setRadius(Number(e.target.value))}>{[10,25,50,100,200].map(r=><option key={r} value={r}>{r} km</option>)}</select></div></div>
      <div style={{marginTop:16}}><label className="label">Type d’expérience</label><div className="filters">{categories.map(cat => <button key={cat} className={`filter-chip ${selectedCategories.includes(cat)?'active':''}`} onClick={()=>setSelectedCategories(v=>v.includes(cat)?v.filter(x=>x!==cat):[...v,cat])}>{cat}</button>)}</div></div>
      <div className="filters" style={{marginTop:18}}><button className="btn green" onClick={search} disabled={loading}>{loading?'Recherche…':'Rechercher autour de moi'}</button><button className="btn ghost" onClick={useLocation}>📍 Utiliser ma position</button>{customOrigin&&<button className="btn ghost" onClick={()=>setCustomOrigin(null)}>Revenir à {city.name}</button>}</div>
      {message && <div className="notice" style={{marginTop:14}}>{message}</div>}
    </div>
    <div className="results-layout">
      <div className="stack">
        {pois.length===0 && <div className="empty-state compact"><div className="empty-icon">🧭</div><h3>Aucun lieu trouvé</h3><p>Élargissez le rayon ou retirez un filtre.</p></div>}
        {pois.slice(0,30).map(p => <article className="poi-card" key={p.id}><div className="meta"><span className="tag">{p.category}</span>{typeof p.distanceKm==='number' && <span>📍 {formatDistance(p.distanceKm)}</span>}{typeof p.durationMinutes==='number' && <span>🚗 {Math.round(p.durationMinutes)} min</span>}</div><h3>{p.name}</h3><p className="muted">Source : {p.source || 'OpenStreetMap / Overpass'}. Vérifiez horaires, prix et accès avant déplacement.</p>{p.sourceUrl&&<a className="source-link" href={p.sourceUrl} target="_blank" rel="noreferrer">Voir la donnée source <ExternalLink size={14}/></a>}</article>)}
      </div>
      <div className="map-wrap"><DynamicMap center={[origin.latitude,origin.longitude]} points={pois.slice(0,50)}/></div>
    </div>
  </>;
}
