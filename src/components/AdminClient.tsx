'use client';

import { useEffect, useState } from 'react';
import { cities as fallbackCities } from '@/data/cities';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

type Row={id?:string;name:string;slug:string;region?:string;active?:boolean;average_budget?:number;verified?:boolean;latitude?:number;longitude?:number;description_short?:string;description_long?:string;hero_image?:string;recommended_days_min?:number;recommended_days_max?:number;tags?:string[]};
type AttractionRow={id:string;city_id?:string;category_id?:string;name:string;slug:string;description?:string;latitude?:number;longitude?:number;average_visit_duration?:number;child_friendly?:boolean;active:boolean;verified:boolean;city?:{name?:string}|null;category?:{name?:string}|null};
type Metrics={users:number;favorites:number;itineraries:number;partnerLeads:number;spins30d:number;conversion30d:number};
type Lead={id:string;name:string;organization?:string;email:string;partner_type:string;status:string;created_at:string};
type Feedback={id:string;rating:number;message:string;page_path?:string;created_at:string};

const slugify=(value:string)=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

export function AdminClient(){
  const client=createClient();
  const [authorized,setAuthorized]=useState<boolean|null>(null);
  const [role,setRole]=useState('');
  const [rows,setRows]=useState<Row[]>(fallbackCities.map(c=>({name:c.name,slug:c.slug,region:c.region,active:c.active,average_budget:c.averageBudgetXof,verified:false,latitude:c.latitude,longitude:c.longitude,description_short:c.shortDescription,description_long:c.longDescription,recommended_days_min:c.minDays,recommended_days_max:c.maxDays,tags:c.tags,hero_image:c.heroImage})));
  const [attractions,setAttractions]=useState<AttractionRow[]>([]);
  const [metrics,setMetrics]=useState<Metrics|null>(null);
  const [leads,setLeads]=useState<Lead[]>([]);
  const [feedback,setFeedback]=useState<Feedback[]>([]);
  const [categories,setCategories]=useState<{id:string;name:string;slug:string}[]>([]);
  const [message,setMessage]=useState('');

  const [editCityId,setEditCityId]=useState<string|null>(null);
  const [name,setName]=useState(''); const [slug,setSlug]=useState(''); const [region,setRegion]=useState(''); const [lat,setLat]=useState(''); const [lng,setLng]=useState('');
  const [shortDescription,setShortDescription]=useState(''); const [longDescription,setLongDescription]=useState(''); const [budget,setBudget]=useState(''); const [minDays,setMinDays]=useState('1'); const [maxDays,setMaxDays]=useState('2'); const [tags,setTags]=useState(''); const [heroImage,setHeroImage]=useState('');

  const [editAttrId,setEditAttrId]=useState<string|null>(null);
  const [attrName,setAttrName]=useState(''); const [attrCity,setAttrCity]=useState(''); const [attrCategory,setAttrCategory]=useState(''); const [attrLat,setAttrLat]=useState(''); const [attrLng,setAttrLng]=useState(''); const [attrDescription,setAttrDescription]=useState(''); const [attrDuration,setAttrDuration]=useState('90'); const [attrChildFriendly,setAttrChildFriendly]=useState(false);

  const load=async()=>{
    if(!client)return;
    const {data:{user}}=await client.auth.getUser();
    if(!user){setAuthorized(false);return;}
    const {data:profile}=await client.from('profiles').select('role').eq('id',user.id).maybeSingle();
    const ok=profile?.role==='admin'||profile?.role==='editor'; setRole(profile?.role||'user'); setAuthorized(ok); if(!ok)return;
    const [cityRes,catRes,attrRes,metricRes,leadRes,feedbackRes]=await Promise.all([
      client.from('cities').select('id,name,slug,region,active,average_budget,verified,latitude,longitude,description_short,description_long,hero_image,recommended_days_min,recommended_days_max,tags').order('name'),
      client.from('categories').select('id,name,slug').order('name'),
      client.from('attractions').select('id,city_id,category_id,name,slug,description,latitude,longitude,average_visit_duration,child_friendly,active,verified,city:cities(name),category:categories(name)').order('name').limit(200),
      client.rpc('admin_dashboard_metrics'),
      client.from('partner_leads').select('id,name,organization,email,partner_type,status,created_at').order('created_at',{ascending:false}).limit(50),
      client.from('beta_feedback').select('id,rating,message,page_path,created_at').order('created_at',{ascending:false}).limit(50),
    ]);
    if(cityRes.data)setRows(cityRes.data as Row[]); if(catRes.data)setCategories(catRes.data); if(attrRes.data)setAttractions(attrRes.data as any); if(metricRes.data)setMetrics(metricRes.data as Metrics); if(leadRes.data)setLeads(leadRes.data); if(feedbackRes.data)setFeedback(feedbackRes.data as Feedback[]);
    const err=cityRes.error||catRes.error||attrRes.error||metricRes.error||leadRes.error||feedbackRes.error; if(err)setMessage(err.message);
  };
  useEffect(()=>{load();},[]);

  if(!isSupabaseConfigured()||!client)return <div className="notice">Mode démo : le back-office est volontairement en lecture seule. Configurez Supabase et appliquez les migrations pour tester l’administration réelle.</div>;
  if(authorized===null)return <div className="panel">Vérification de vos droits…</div>;
  if(!authorized)return <div className="empty-state"><div className="empty-icon">🔒</div><h2>Accès administrateur requis</h2><p>Connectez-vous avec un profil dont le rôle est <b>admin</b> ou <b>editor</b>. Rôle détecté : {role||'aucun'}.</p></div>;

  const clearCity=()=>{setEditCityId(null);setName('');setSlug('');setRegion('');setLat('');setLng('');setShortDescription('');setLongDescription('');setBudget('');setMinDays('1');setMaxDays('2');setTags('');setHeroImage('');};
  const editCity=(row:Row)=>{setEditCityId(row.id||null);setName(row.name);setSlug(row.slug);setRegion(row.region||'');setLat(String(row.latitude??''));setLng(String(row.longitude??''));setShortDescription(row.description_short||'');setLongDescription(row.description_long||'');setBudget(String(row.average_budget??''));setMinDays(String(row.recommended_days_min??1));setMaxDays(String(row.recommended_days_max??2));setTags((row.tags||[]).join(', '));setHeroImage(row.hero_image||'');window.scrollTo({top:0,behavior:'smooth'});};
  const saveCity=async()=>{
    if(!name.trim()||!slug.trim()||!Number.isFinite(Number(lat))||!Number.isFinite(Number(lng)))return setMessage('Nom, slug, latitude et longitude sont obligatoires.');
    const payload={name:name.trim(),slug:slugify(slug),region:region.trim()||'À renseigner',latitude:Number(lat),longitude:Number(lng),description_short:shortDescription.trim()||null,description_long:longDescription.trim()||null,hero_image:heroImage.trim()||null,recommended_days_min:Math.max(1,Number(minDays)||1),recommended_days_max:Math.max(Number(minDays)||1,Number(maxDays)||2),average_budget:budget?Number(budget):null,tags:tags.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean),source:'Back-office Waka'};
    const result=editCityId?await client.from('cities').update(payload).eq('id',editCityId):await client.from('cities').insert({...payload,active:false,verified:false});
    if(result.error)return setMessage(result.error.message); setMessage(editCityId?'Destination modifiée.':'Destination créée en brouillon.'); clearCity(); load();
  };
  const toggle=async(row:Row)=>{if(!row.id)return;const {error}=await client.from('cities').update({active:!row.active}).eq('id',row.id);if(error)return setMessage(error.message);load();};
  const verify=async(row:Row)=>{if(!row.id)return;const {error}=await client.from('cities').update({verified:!row.verified,last_verified_at:!row.verified?new Date().toISOString():null}).eq('id',row.id);if(error)return setMessage(error.message);load();};
  const remove=async(row:Row)=>{if(!row.id||!confirm(`Supprimer ${row.name} et les données associées ?`))return;const {error}=await client.from('cities').delete().eq('id',row.id);if(error)return setMessage(error.message);load();};

  const clearAttr=()=>{setEditAttrId(null);setAttrName('');setAttrCity('');setAttrCategory('');setAttrLat('');setAttrLng('');setAttrDescription('');setAttrDuration('90');setAttrChildFriendly(false);};
  const editAttraction=(a:AttractionRow)=>{setEditAttrId(a.id);setAttrName(a.name);setAttrCity(a.city_id||'');setAttrCategory(a.category_id||'');setAttrLat(String(a.latitude??''));setAttrLng(String(a.longitude??''));setAttrDescription(a.description||'');setAttrDuration(String(a.average_visit_duration??90));setAttrChildFriendly(Boolean(a.child_friendly));};
  const saveAttraction=async()=>{
    if(!attrCity||!attrName.trim()||!Number.isFinite(Number(attrLat))||!Number.isFinite(Number(attrLng)))return setMessage('Complétez la ville, le nom et les coordonnées.');
    const payload={city_id:attrCity,category_id:attrCategory||null,name:attrName.trim(),slug:slugify(attrName),description:attrDescription.trim()||null,latitude:Number(attrLat),longitude:Number(attrLng),average_visit_duration:Math.max(15,Number(attrDuration)||90),child_friendly:attrChildFriendly,source:'Back-office Waka'};
    const result=editAttrId?await client.from('attractions').update(payload).eq('id',editAttrId):await client.from('attractions').insert({...payload,verified:false,active:false});
    if(result.error)return setMessage(result.error.message);setMessage(editAttrId?'Attraction modifiée.':'Attraction créée en brouillon.');clearAttr();load();
  };
  const toggleAttraction=async(a:AttractionRow)=>{const {error}=await client.from('attractions').update({active:!a.active}).eq('id',a.id);if(error)return setMessage(error.message);load();};
  const verifyAttraction=async(a:AttractionRow)=>{const {error}=await client.from('attractions').update({verified:!a.verified,last_verified_at:!a.verified?new Date().toISOString():null}).eq('id',a.id);if(error)return setMessage(error.message);load();};
  const removeAttraction=async(a:AttractionRow)=>{if(!confirm(`Supprimer l’attraction ${a.name} ?`))return;const {error}=await client.from('attractions').delete().eq('id',a.id);if(error)return setMessage(error.message);load();};
  const updateLead=async(id:string,status:string)=>{const {error}=await client.from('partner_leads').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)setMessage(error.message);else load();};

  return <div className="stack admin-stack">
    {metrics&&<div className="stats-grid admin-metrics"><div className="stat"><span>Utilisateurs</span><b>{metrics.users}</b></div><div className="stat"><span>Favoris</span><b>{metrics.favorites}</b></div><div className="stat"><span>Itinéraires</span><b>{metrics.itineraries}</b></div><div className="stat"><span>Leads à traiter</span><b>{metrics.partnerLeads}</b></div><div className="stat"><span>Roulette · 30 j</span><b>{metrics.spins30d}</b></div><div className="stat"><span>Spin → voyage</span><b>{metrics.conversion30d}%</b></div></div>}

    <div className="panel"><span className="eyebrow">Catalogue</span><h2>{editCityId?'Modifier la destination':'Créer une destination'}</h2><div className="form-grid three"><input className="field" placeholder="Nom" value={name} onChange={e=>{setName(e.target.value);if(!editCityId)setSlug(slugify(e.target.value));}}/><input className="field" placeholder="slug" value={slug} onChange={e=>setSlug(e.target.value)}/><input className="field" placeholder="Région" value={region} onChange={e=>setRegion(e.target.value)}/><input className="field" placeholder="Latitude" inputMode="decimal" value={lat} onChange={e=>setLat(e.target.value)}/><input className="field" placeholder="Longitude" inputMode="decimal" value={lng} onChange={e=>setLng(e.target.value)}/><input className="field" placeholder="Budget indicatif FCFA" inputMode="numeric" value={budget} onChange={e=>setBudget(e.target.value.replace(/\D/g,''))}/><input className="field" placeholder="Jours min." inputMode="numeric" value={minDays} onChange={e=>setMinDays(e.target.value)}/><input className="field" placeholder="Jours max." inputMode="numeric" value={maxDays} onChange={e=>setMaxDays(e.target.value)}/><input className="field" placeholder="Tags : nature, plage…" value={tags} onChange={e=>setTags(e.target.value)}/><input className="field" placeholder="URL image hero" value={heroImage} onChange={e=>setHeroImage(e.target.value)}/></div><textarea className="field" style={{marginTop:12}} rows={2} placeholder="Description courte" value={shortDescription} onChange={e=>setShortDescription(e.target.value)}/><textarea className="field" style={{marginTop:12}} rows={4} placeholder="Description longue" value={longDescription} onChange={e=>setLongDescription(e.target.value)}/><div className="filters" style={{marginTop:12}}><button className="btn green" onClick={saveCity}>{editCityId?'Enregistrer les modifications':'Créer en brouillon'}</button>{editCityId&&<button className="btn ghost" onClick={clearCity}>Annuler</button>}</div></div>

    <div className="panel table-panel"><div className="section-head"><div><span className="eyebrow">Destinations</span><h2>Contrôle éditorial</h2></div></div><table className="admin-table"><thead><tr><th>Ville</th><th>Région</th><th>Budget</th><th>État</th><th>Vérification</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r.slug}><td>{r.name}</td><td>{r.region}</td><td>{r.average_budget?.toLocaleString('fr-FR')||'—'}</td><td>{r.active?'Active':'Brouillon'}</td><td>{r.verified?'✓ Vérifiée':'À vérifier'}</td><td><div className="filters"><button className="btn mini ghost" onClick={()=>editCity(r)}>Modifier</button><button className="btn mini ghost" onClick={()=>toggle(r)}>{r.active?'Désactiver':'Activer'}</button><button className="btn mini ghost" onClick={()=>verify(r)}>{r.verified?'Invalider':'Vérifier'}</button><button className="btn mini danger" onClick={()=>remove(r)}>Supprimer</button></div></td></tr>)}</tbody></table></div>

    <div className="panel"><span className="eyebrow">Points d’intérêt</span><h2>{editAttrId?'Modifier l’attraction':'Ajouter une attraction'}</h2><div className="form-grid three"><select className="field" value={attrCity} onChange={e=>setAttrCity(e.target.value)}><option value="">Ville…</option>{rows.filter(r=>r.id).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select><input className="field" placeholder="Nom de l’attraction" value={attrName} onChange={e=>setAttrName(e.target.value)}/><select className="field" value={attrCategory} onChange={e=>setAttrCategory(e.target.value)}><option value="">Catégorie…</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><input className="field" placeholder="Latitude" value={attrLat} onChange={e=>setAttrLat(e.target.value)}/><input className="field" placeholder="Longitude" value={attrLng} onChange={e=>setAttrLng(e.target.value)}/><input className="field" placeholder="Durée min." inputMode="numeric" value={attrDuration} onChange={e=>setAttrDuration(e.target.value)}/></div><textarea className="field" style={{marginTop:12}} rows={3} placeholder="Description" value={attrDescription} onChange={e=>setAttrDescription(e.target.value)}/><label className="check-row" style={{marginTop:12}}><input type="checkbox" checked={attrChildFriendly} onChange={e=>setAttrChildFriendly(e.target.checked)}/><span>Adapté aux enfants</span></label><div className="filters" style={{marginTop:12}}><button className="btn green" onClick={saveAttraction}>{editAttrId?'Enregistrer les modifications':'Créer en brouillon'}</button>{editAttrId&&<button className="btn ghost" onClick={clearAttr}>Annuler</button>}</div><div className="admin-list" style={{marginTop:18}}>{attractions.slice(0,60).map(a=><div className="lead-row" key={a.id}><div><b>{a.name}</b><small>{a.city?.name||'—'} · {a.category?.name||'sans catégorie'} · {a.verified?'vérifiée':'à vérifier'} · {a.active?'active':'brouillon'}</small></div><div className="filters"><button className="btn mini ghost" onClick={()=>editAttraction(a)}>Modifier</button><button className="btn mini ghost" onClick={()=>toggleAttraction(a)}>{a.active?'Désactiver':'Activer'}</button><button className="btn mini ghost" onClick={()=>verifyAttraction(a)}>{a.verified?'Invalider':'Vérifier'}</button><button className="btn mini danger" onClick={()=>removeAttraction(a)}>Supprimer</button></div></div>)}</div></div>

    <div className="panel"><span className="eyebrow">Business</span><h2>Demandes partenaires</h2>{leads.length?<div className="admin-list">{leads.map(l=><div className="lead-row" key={l.id}><div><b>{l.organization||l.name}</b><small>{l.name} · {l.email} · {l.partner_type}</small></div><select className="field compact-field" value={l.status} onChange={e=>updateLead(l.id,e.target.value)}><option value="new">Nouveau</option><option value="contacted">Contacté</option><option value="qualified">Qualifié</option><option value="won">Gagné</option><option value="lost">Perdu</option><option value="spam">Spam</option></select></div>)}</div>:<p className="muted">Aucune demande partenaire.</p>}</div>

    <div className="panel"><span className="eyebrow">Bêta</span><h2>Retours utilisateurs</h2>{feedback.length?<div className="admin-list">{feedback.map(f=><div className="trip-row" key={f.id}><div><b>{'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}</b><small>{f.message} · {f.page_path||'page inconnue'} · {new Date(f.created_at).toLocaleDateString('fr-FR')}</small></div></div>)}</div>:<p className="muted">Aucun feedback enregistré.</p>}</div>
    {message&&<div className="notice">{message}</div>}
  </div>;
}
