import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { cities as fallbackCities, curatedAttractions, cityBySlug as fallbackCityBySlug } from '@/data/cities';
import type { Attraction, City } from '@/types';

const defaultHero='https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80';

function mapCity(row:any):City{
  const fallback=fallbackCityBySlug(row.slug);
  return {
    id:row.id||fallback?.id||row.slug,
    name:row.name,
    slug:row.slug,
    region:row.region||fallback?.region||'Côte d’Ivoire',
    latitude:Number(row.latitude),longitude:Number(row.longitude),
    shortDescription:row.description_short||fallback?.shortDescription||`Découvrez ${row.name} avec Waka Tourisme.`,
    longDescription:row.description_long||fallback?.longDescription||row.description_short||`Une destination du catalogue Waka à enrichir par l’équipe éditoriale.`,
    heroImage:row.hero_image||fallback?.heroImage||defaultHero,
    minDays:Number(row.recommended_days_min||fallback?.minDays||1),maxDays:Number(row.recommended_days_max||fallback?.maxDays||2),
    averageBudgetXof:Number(row.average_budget||fallback?.averageBudgetXof||50000),
    tags:Array.isArray(row.tags)?row.tags:(fallback?.tags||[]),
    highlights:fallback?.highlights||[],
    active:row.active!==false,
    source:row.source||fallback?.source||'Catalogue administré Waka',
    sourceUrl:row.source_url||fallback?.sourceUrl||undefined,
    confidence:row.confidence!=null?Number(row.confidence):fallback?.confidence,
    verified:Boolean(row.verified),
    verifiedAt:row.last_verified_at?String(row.last_verified_at).slice(0,10):(fallback?.verifiedAt||'')
  };
}

export async function getPublicCities():Promise<City[]>{
  const supabase=await createClient();if(!supabase)return fallbackCities.filter(c=>c.active);
  const {data,error}=await supabase.from('cities').select('id,name,slug,region,latitude,longitude,description_short,description_long,hero_image,recommended_days_min,recommended_days_max,average_budget,tags,active,source,source_url,confidence,verified,last_verified_at').eq('active',true).order('name');
  if(error||!data?.length)return fallbackCities.filter(c=>c.active);
  return data.map(mapCity);
}

export async function getCityBySlug(slug:string):Promise<City|undefined>{
  const supabase=await createClient();
  if(supabase){const {data}=await supabase.from('cities').select('id,name,slug,region,latitude,longitude,description_short,description_long,hero_image,recommended_days_min,recommended_days_max,average_budget,tags,active,source,source_url,confidence,verified,last_verified_at').eq('slug',slug).eq('active',true).maybeSingle();if(data)return mapCity(data);}
  return fallbackCityBySlug(slug);
}

function priceLevel(min:any,max:any):Attraction['priceLevel']{
  if(min==null&&max==null)return 'inconnu';const value=Number(max??min??0);if(value===0)return 'gratuit';if(value<=5000)return 'faible';if(value<=20000)return 'modere';return 'eleve';
}
function mapAttraction(row:any):Attraction{
  return {id:row.id,citySlug:row.city?.slug||row.city_slug||'',name:row.name,category:row.category?.slug||row.category_slug||'decouverte',latitude:Number(row.latitude),longitude:Number(row.longitude),description:row.description||'Informations éditoriales à compléter.',visitDurationMinutes:Number(row.average_visit_duration||90),priceLevel:priceLevel(row.price_min,row.price_max),childFriendly:row.child_friendly??undefined,source:row.source||'Catalogue administré Waka',sourceUrl:row.source_url||undefined,verified:Boolean(row.verified)};
}

export async function getAttractionsByCitySlug(slug:string):Promise<Attraction[]> {
  const supabase=await createClient();
  if(supabase){
    const {data:cityRow}=await supabase.from('cities').select('id,slug').eq('slug',slug).eq('active',true).maybeSingle();
    if(cityRow){
      const {data,error}=await supabase
        .from('attractions')
        .select('id,name,slug,description,latitude,longitude,average_visit_duration,price_min,price_max,child_friendly,source,source_url,verified,city:cities(slug),category:categories(slug)')
        .eq('city_id',cityRow.id)
        .eq('active',true)
        .order('name');
      if(!error&&data?.length)return data.map(mapAttraction);
    }
  }
  return curatedAttractions.filter(a=>a.citySlug===slug);
}

export async function getPublicAttractions():Promise<Attraction[]>{
  const supabase=await createClient();
  if(supabase){const {data,error}=await supabase.from('attractions').select('id,name,slug,description,latitude,longitude,average_visit_duration,price_min,price_max,child_friendly,source,source_url,verified,city:cities!inner(slug),category:categories(slug)').eq('active',true).limit(200);if(!error&&data?.length)return data.map(mapAttraction);}
  return curatedAttractions;
}

export async function getAttractionById(id:string):Promise<Attraction|undefined>{
  const fallback=curatedAttractions.find(a=>a.id===id);if(fallback)return fallback;
  const supabase=await createClient();if(!supabase)return undefined;
  const {data}=await supabase.from('attractions').select('id,name,slug,description,latitude,longitude,average_visit_duration,price_min,price_max,child_friendly,source,source_url,verified,city:cities!inner(slug),category:categories(slug)').eq('id',id).eq('active',true).maybeSingle();return data?mapAttraction(data):undefined;
}
