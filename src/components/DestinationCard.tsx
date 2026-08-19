import Image from 'next/image';
import Link from 'next/link';
import type { City } from '@/types';

export function DestinationCard({ city }: { city: City }) {
  return (
    <article className="destination-card">
      <Image src={city.heroImage} width={900} height={560} alt={`Découvrir ${city.name}`} />
      <div className="content">
        <h3>{city.name}</h3>
        <div className="meta">
          <span>{city.region}</span><span>·</span><span>{city.minDays}-{city.maxDays} jours</span>
        </div>
        <div className="filters" style={{marginTop:12}}>
          {city.tags.slice(0,3).map(tag => <span className="tag" key={tag}>{tag}</span>)}
        </div>
        <Link className="btn ghost" style={{marginTop:14,width:'100%'}} href={`/destinations/${city.slug}`}>Découvrir</Link>
      </div>
    </article>
  );
}
