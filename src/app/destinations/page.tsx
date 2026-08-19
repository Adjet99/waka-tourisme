import type { Metadata } from 'next';
import { DestinationCard } from '@/components/DestinationCard';
import { getPublicCities } from '@/lib/server/catalog';
export const metadata:Metadata={title:'Destinations en Côte d’Ivoire | Waka Tourisme',description:'Explorez les destinations ivoiriennes proposées par Waka Tourisme.'};
export default async function Page(){const cities=await getPublicCities();return <main className="container"><header className="page-title"><span className="eyebrow">🇨🇮 Catalogue</span><h1>Destinations</h1><p>Des escapades proches d’Abidjan aux montagnes de l’ouest, découvrez le catalogue Waka. Les informations sensibles au temps restent signalées comme indicatives.</p></header><div className="grid">{cities.filter(c=>c.active).map(city=><DestinationCard key={city.slug} city={city}/>)}</div></main>}
