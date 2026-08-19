import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cities as fallbackCities } from '@/data/cities';
import { getAttractionsByCitySlug, getCityBySlug } from '@/lib/server/catalog';
import { FavoriteButton } from '@/components/FavoriteButton';
import { branding } from '@/config/branding';
import { DestinationTools } from '@/components/DestinationTools';

export function generateStaticParams(){return fallbackCities.map(c=>({slug:c.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const city=await getCityBySlug(slug);
  return city?{title:`Que faire à ${city.name} ? Week-end & activités | ${branding.name}`,description:city.shortDescription,openGraph:{title:`Découvrir ${city.name} avec ${branding.name}`,description:city.shortDescription,images:[city.heroImage]}}:{title:'Destination'};
}
export default async function DestinationPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const city=await getCityBySlug(slug);if(!city)notFound();
  const attractions=await getAttractionsByCitySlug(city.slug);
  const appUrl=process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000';
  const jsonLd={"@context":"https://schema.org","@type":"TouristDestination",name:city.name,description:city.shortDescription,url:`${appUrl}/destinations/${city.slug}`,geo:{"@type":"GeoCoordinates",latitude:city.latitude,longitude:city.longitude}};
  return <main className="container">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,'\\u003c')}}/>
    <header className="page-title destination-header"><div><span className="eyebrow">🧭 {city.region}</span><h1>{city.name}</h1><p>{city.shortDescription}</p></div><FavoriteButton slug={city.slug}/></header>
    <div className="hero-media"><Image className="hero-image" src={city.heroImage} width={1600} height={900} priority alt={`Visuel d’ambiance pour ${city.name}`}/><span>Visuel d’ambiance de démonstration — à remplacer par une photo éditoriale licenciée de la destination avant lancement public.</span></div>
    <div className="detail-grid section">
      <div className="stack">
        <section className="panel"><span className="eyebrow">L’essentiel</span><h2>Pourquoi partir à {city.name} ?</h2><p className="lead-copy">{city.longDescription}</p><div className="filters">{city.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div></section>
        <section className="panel"><div className="section-head"><div><span className="eyebrow">À ne pas manquer</span><h2>Que voir et que faire ?</h2></div>{attractions.length>0&&<Link className="btn ghost" href="/activites">Toutes les activités</Link>}</div>{city.highlights.map((x,i)=><div className="timeline-item highlight-row" key={x}><b>{String(i+1).padStart(2,'0')}</b><span>{x}</span></div>)}{attractions.length>0&&<div className="activity-list"><h3>Fiches structurées disponibles</h3>{attractions.map(a=><Link href={`/activites/${a.id}`} className="poi-card linked" key={a.id}><div><div className="meta"><span className="tag">{a.category}</span><span>⏱ {Math.round(a.visitDurationMinutes/60*10)/10} h</span>{a.childFriendly&&<span>👨‍👩‍👧 famille</span>}</div><h3>{a.name}</h3><p>{a.description}</p></div><span className="arrow">→</span></Link>)}</div>}</section>
        <section className="panel"><span className="eyebrow">Cadre de séjour</span><h2>Combien de temps et quel budget ?</h2><div className="result-grid"><div className="stat"><span>Minimum conseillé</span><b>{city.minDays} jour{city.minDays>1?'s':''}</b></div><div className="stat"><span>Séjour confortable</span><b>{city.maxDays} jours</b></div><div className="stat"><span>Budget de référence</span><b style={{fontSize:20}}>~{city.averageBudgetXof.toLocaleString('fr-FR')} FCFA</b></div><div className="stat"><span>Devise</span><b>XOF</b></div></div><div className="notice" style={{marginTop:14}}>Le budget est un ordre de grandeur de démonstration, pas un devis ni un prix temps réel. Hébergement, transport et saison peuvent le modifier fortement.</div></section>
        <section className="panel data-quality"><span className="eyebrow">Transparence</span><h2>Qualité des données</h2><p><b>Source éditoriale :</b> {city.source}</p>{city.sourceUrl&&<p><a className="source-link" href={city.sourceUrl} target="_blank" rel="noreferrer">Consulter la source ↗</a></p>}<p><b>Statut :</b> {city.verified?'✓ Vérifiée par l’équipe éditoriale':'À revalider avant publication commerciale'}.</p><p><b>Dernière vérification :</b> {city.verifiedAt||'non renseignée'}.</p><p>Les horaires, prix, transports, état des routes, formalités et disponibilités doivent être confirmés avant déplacement. Waka évite de remplir artificiellement les champs inconnus.</p></section>
      </div>
      <DestinationTools city={city}/>
    </div>
  </main>;
}
