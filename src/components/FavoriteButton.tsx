'use client';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listFavoriteSlugs, setFavorite, track } from '@/lib/user-data';

export function FavoriteButton({ slug }: { slug: string }) {
  const [active, setActive] = useState(false);
  const [busy,setBusy]=useState(false);
  useEffect(() => { listFavoriteSlugs().then(items=>setActive(items.includes(slug))); }, [slug]);
  const toggle = async () => {
    if(busy)return;setBusy(true);
    try{
      const next=!active;await setFavorite(slug,next);setActive(next);
      track(next?'destination_saved':'destination_liked',{slug,active:next});
    }finally{setBusy(false);}
  };
  return <button className="btn ghost" onClick={toggle} disabled={busy} aria-pressed={active} aria-label={active?'Retirer des favoris':'Ajouter aux favoris'}><Heart size={18} fill={active ? 'currentColor' : 'none'}/>{active ? 'Enregistré' : 'Favori'}</button>;
}
