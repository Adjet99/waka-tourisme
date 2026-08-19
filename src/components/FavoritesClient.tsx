'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCatalogCities } from '@/hooks/useCatalogCities';
import { DestinationCard } from './DestinationCard';
import { listFavoriteSlugs } from '@/lib/user-data';
export function FavoritesClient(){
  const cities=useCatalogCities();
  const [slugs,setSlugs]=useState<string[]|null>(null);
  useEffect(()=>{listFavoriteSlugs().then(setSlugs);},[]);
  if(slugs===null)return <div className="panel">Chargement de vos favoris…</div>;
  const items=cities.filter(c=>slugs.includes(c.slug));
  return items.length?<div className="grid">{items.map(c=><DestinationCard city={c} key={c.slug}/>)}</div>:<div className="empty-state"><div className="empty-icon">♡</div><h2>Votre liste est vide</h2><p>Enregistrez les destinations qui vous donnent envie pour les retrouver ici.</p><Link className="btn green" href="/surprise">🎲 Trouver une destination</Link></div>;
}
