'use client';
import type { City } from '@/types';
import { useCatalogCities } from '@/hooks/useCatalogCities';
export function CitySelect({ value, onChange, options }: { value: string; onChange: (slug: string) => void; options?:City[] }) {
  const catalog=useCatalogCities();const cities=options||catalog;
  return <select className="field" value={cities.some(c=>c.slug===value)?value:(cities[0]?.slug||'')} onChange={(e)=>onChange(e.target.value)} aria-label="Ville"><option value="" disabled>Choisir une ville</option>{cities.map(city => <option key={city.slug} value={city.slug}>{city.name}</option>)}</select>;
}
