import Link from 'next/link';
import { DestinationCard } from '@/components/DestinationCard';
import { getPublicCities } from '@/lib/server/catalog';
import { ResidencePicker } from '@/components/ResidencePicker';

export default async function Home() {
  const cities=await getPublicCities();
  const weekend=cities.filter(c=>c.minDays<=2).slice(0,3);
  const nature=cities.filter(c=>c.tags.includes('nature')).slice(0,3);
  return <main className="container">
    <section className="hero"><span className="eyebrow">🇨🇮 Côte d’Ivoire · Explorer autrement</span><h1>Ne cherchez plus où aller.<br/><em>Partez.</em></h1><p>Waka transforme la question “on fait quoi ce week-end ?” en une destination, un trajet et un programme concret.</p><div className="hero-grid"><Link href="/explorer" className="action-card primary"><span className="icon">📍</span><h2>Explorer autour de moi</h2><p>Choisissez un rayon et trouvez des lieux proches, avec carte et temps de trajet lorsque disponible.</p><span className="action-arrow">→</span></Link><Link href="/surprise" className="action-card secondary"><span className="icon">🎲</span><h2>Surprends-moi</h2><p>Donnez votre temps, budget et envies. Waka choisit une escapade pertinente sans supprimer la surprise.</p><span className="action-arrow">→</span></Link></div><ResidencePicker/><div className="trust-row"><span>✓ Géolocalisation facultative</span><span>✓ Données incertaines signalées</span><span>✓ Utilisable sans compte</span></div></section>

    <section className="section"><div className="section-head"><div><span className="eyebrow">Pour ce week-end</span><h2>Des idées sans passer 2 heures à chercher</h2></div><Link href="/destinations" className="btn ghost">Toutes les destinations</Link></div><div className="grid">{weekend.map(city=><DestinationCard key={city.slug} city={city}/>)}</div></section>

    <section className="decision-section"><div><span className="eyebrow">La différence Waka</span><h2>Une recommandation doit déboucher sur un départ.</h2></div><div className="decision-steps"><div><span>01</span><b>Dites d’où vous partez</b><p>Ville ou position ponctuelle, sans obligation de créer un compte.</p></div><div><span>02</span><b>Laissez Waka décider</b><p>Distance, durée, budget, intérêts, famille et nouveauté alimentent le scoring.</p></div><div><span>03</span><b>Organisez le séjour</b><p>Trajet, météo, points forts et programme deviennent immédiatement actionnables.</p></div></div></section>

    <section className="section"><div className="section-head"><div><span className="eyebrow">Nature & aventure</span><h2>Changer complètement d’air</h2></div><Link href="/explorer" className="btn ghost">Explorer sur la carte</Link></div><div className="grid">{nature.map(city=><DestinationCard key={city.slug} city={city}/>)}</div></section>

    <section className="partner-cta"><div><span className="eyebrow">Vous êtes un acteur du tourisme ?</span><h2>Faites partie des expériences proposées au bon moment.</h2><p>Hébergement, restaurant, activité, guide, transporteur ou territoire : la V1 intègre déjà le parcours de qualification partenaire.</p></div><Link className="btn white big" href="/partenaires">Devenir partenaire</Link></section>
  </main>;
}
