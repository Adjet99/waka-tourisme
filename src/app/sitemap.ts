import type { MetadataRoute } from 'next';
import { curatedAttractions } from '@/data/cities';
import { getPublicCities } from '@/lib/server/catalog';

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base=process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000';
  const now=new Date();
  const cities=await getPublicCities();
  return [
    {url:base,lastModified:now,changeFrequency:'weekly',priority:1},
    {url:`${base}/destinations`,lastModified:now,changeFrequency:'weekly',priority:.9},
    {url:`${base}/activites`,lastModified:now,changeFrequency:'weekly',priority:.8},
    {url:`${base}/surprise`,lastModified:now,changeFrequency:'weekly',priority:.8},
    {url:`${base}/explorer`,lastModified:now,changeFrequency:'weekly',priority:.8},
    ...cities.map(c=>({url:`${base}/destinations/${c.slug}`,lastModified:c.verifiedAt?new Date(c.verifiedAt):now,changeFrequency:'monthly' as const,priority:.8})),
    ...curatedAttractions.map(a=>({url:`${base}/activites/${a.id}`,lastModified:now,changeFrequency:'monthly' as const,priority:.6})),
  ];
}
