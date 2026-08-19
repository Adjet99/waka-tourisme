'use client';

import type { GeneratedItinerary } from '@/types';
import { createClient } from '@/lib/supabase/client';

const FAVORITES_KEY = 'waka:favorites';
const VISITED_KEY = 'waka:visited-cities';
const TRIPS_KEY = 'waka:trips';
const SESSION_KEY = 'waka:anonymous-session';

function readArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]') as T[]; } catch { return []; }
}
function writeArray<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAnonymousSessionId() {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function getCurrentUser() {
  const supabase = createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}

export async function listFavoriteSlugs() {
  const local = readArray<string>(FAVORITES_KEY);
  const supabase = createClient();
  if (!supabase) return local;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return local;
  const { data, error } = await supabase.from('favorites').select('city:cities(slug)').eq('user_id', user.id);
  if (error) return local;
  const remote = (data || []).map((row: any) => row.city?.slug).filter(Boolean) as string[];
  const merged = [...new Set([...remote, ...local])];
  writeArray(FAVORITES_KEY, merged);
  // Best-effort migration of local favorites after sign-in.
  for (const slug of local) await setFavorite(slug, true, { silent: true });
  return merged;
}

export async function setFavorite(slug: string, active: boolean, options?: { silent?: boolean }) {
  const local = readArray<string>(FAVORITES_KEY);
  const next = active ? [...new Set([...local, slug])] : local.filter(x => x !== slug);
  writeArray(FAVORITES_KEY, next);

  const supabase = createClient();
  if (!supabase) return { mode: 'local' as const };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { mode: 'local' as const };
  const { data: city } = await supabase.from('cities').select('id').eq('slug', slug).maybeSingle();
  if (!city?.id) return { mode: 'local' as const };
  if (active) {
    const { data: existing } = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('city_id', city.id).maybeSingle();
    if (!existing) {
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, city_id: city.id });
      if (error && !options?.silent) throw error;
    }
  } else {
    const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('city_id', city.id);
    if (error && !options?.silent) throw error;
  }
  return { mode: 'cloud' as const };
}

export async function listVisitedCitySlugs() {
  const local = readArray<string>(VISITED_KEY);
  const supabase = createClient();
  if (!supabase) return local;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return local;
  const { data } = await supabase.from('visited_cities').select('city:cities(slug)').eq('user_id', userData.user.id);
  const remote = (data || []).map((row: any) => row.city?.slug).filter(Boolean) as string[];
  const merged = [...new Set([...local, ...remote])];
  writeArray(VISITED_KEY, merged);
  return merged;
}

export async function markCityVisited(slug: string) {
  const local = readArray<string>(VISITED_KEY);
  writeArray(VISITED_KEY, [...new Set([...local, slug])]);
  const supabase = createClient();
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const { data: city } = await supabase.from('cities').select('id').eq('slug', slug).maybeSingle();
  if (city?.id) await supabase.from('visited_cities').upsert({ user_id: userData.user.id, city_id: city.id, source: 'user' }, { onConflict: 'user_id,city_id', ignoreDuplicates: true });
}


export async function listRecentRejectedCitySlugs(days = 7) {
  const supabase = createClient();
  if (!supabase) return [] as string[];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [] as string[];
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data } = await supabase
    .from('destination_rejections')
    .select('city:cities(slug),created_at')
    .eq('user_id', userData.user.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(20);
  return [...new Set((data || []).map((row: any) => row.city?.slug).filter(Boolean))] as string[];
}

export async function recordDestinationRejection(slug: string) {
  const supabase = createClient();
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const { data: city } = await supabase.from('cities').select('id').eq('slug', slug).maybeSingle();
  if (city?.id) await supabase.from('destination_rejections').insert({ user_id: userData.user.id, city_id: city.id });
}

export type SavedTrip = {
  localId: string;
  cloudId?: string;
  citySlug: string;
  cityName: string;
  title: string;
  createdAt: string;
  itinerary: GeneratedItinerary;
};

export async function saveTrip(citySlug: string, cityName: string, itinerary: GeneratedItinerary) {
  const trip: SavedTrip = {
    localId: crypto.randomUUID(),
    citySlug,
    cityName,
    title: `${itinerary.days.length} jour${itinerary.days.length > 1 ? 's' : ''} à ${cityName}`,
    createdAt: new Date().toISOString(),
    itinerary,
  };
  const current = readArray<SavedTrip>(TRIPS_KEY);
  writeArray(TRIPS_KEY, [trip, ...current].slice(0, 30));

  const supabase = createClient();
  if (!supabase) return trip;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return trip;
  const { data: city } = await supabase.from('cities').select('id').eq('slug', citySlug).maybeSingle();
  if (!city?.id) return trip;
  const { data: inserted, error } = await supabase.from('itineraries').insert({
    user_id: userData.user.id,
    city_id: city.id,
    title: trip.title,
    traveller_profile: { source: 'generator', note: itinerary.note },
    status: 'saved',
  }).select('id').single();
  if (error || !inserted) return trip;
  const items = itinerary.days.flatMap(day => day.items.map((item, position) => ({
    itinerary_id: inserted.id,
    day_number: day.day,
    starts_at: `${item.time}:00`,
    title: item.title,
    item_type: item.type,
    position,
    metadata: {},
  })));
  if (items.length) await supabase.from('itinerary_items').insert(items);
  trip.cloudId = inserted.id;
  writeArray(TRIPS_KEY, [trip, ...current].slice(0, 30));
  return trip;
}

export async function listTrips(): Promise<SavedTrip[]> {
  const local = readArray<SavedTrip>(TRIPS_KEY);
  const supabase = createClient();
  if (!supabase) return local;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return local;
  const { data, error } = await supabase
    .from('itineraries')
    .select('id,title,created_at,city:cities(slug,name),items:itinerary_items(day_number,starts_at,title,item_type,position)')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });
  if (error) return local;
  const remote: SavedTrip[] = (data || []).map((row: any) => {
    const byDay = new Map<number, any[]>();
    for (const item of row.items || []) {
      const day = Number(item.day_number);
      byDay.set(day, [...(byDay.get(day) || []), item]);
    }
    const days = [...byDay.entries()].sort((a,b)=>a[0]-b[0]).map(([day, items]) => ({
      day,
      items: items.sort((a,b)=>(a.position||0)-(b.position||0)).map(item => ({ time: String(item.starts_at || '').slice(0,5), title: item.title, type: item.item_type }))
    }));
    return {
      localId: `cloud-${row.id}`,
      cloudId: row.id,
      citySlug: row.city?.slug || '',
      cityName: row.city?.name || 'Destination',
      title: row.title,
      createdAt: row.created_at,
      itinerary: { days, note: 'Programme sauvegardé dans votre compte Waka.' },
    };
  });
  const remoteIds = new Set(remote.map(item => item.cloudId).filter(Boolean));
  const localOnly = local.filter(item => !item.cloudId || !remoteIds.has(item.cloudId));
  return [...remote, ...localOnly];
}

export async function deleteTrip(trip: SavedTrip) {
  writeArray(TRIPS_KEY, readArray<SavedTrip>(TRIPS_KEY).filter(x => x.localId !== trip.localId));
  if (trip.cloudId) {
    const supabase = createClient();
    if (supabase) await supabase.from('itineraries').delete().eq('id', trip.cloudId);
  }
}

export async function updateProfile(input: { firstName?: string; residenceCitySlug?: string }) {
  if (input.residenceCitySlug !== undefined) localStorage.setItem('waka:residence', input.residenceCitySlug);
  if (input.firstName !== undefined) localStorage.setItem('waka:first-name', input.firstName);
  const supabase = createClient();
  if (!supabase) return { mode: 'local' as const };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { mode: 'local' as const };

  const patch: Record<string, unknown> = { id: userData.user.id };
  if (input.firstName !== undefined) patch.first_name = input.firstName.trim() || null;
  if (input.residenceCitySlug !== undefined) {
    const { data: city } = await supabase.from('cities').select('id').eq('slug', input.residenceCitySlug).maybeSingle();
    patch.residence_city_id = city?.id || null;
  }
  const { error } = await supabase.from('profiles').upsert(patch);
  if (error) throw error;
  return { mode: 'cloud' as const };
}

export async function track(eventName: string, properties: Record<string, unknown> = {}) {
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'false') return;
  try {
    const headers: Record<string,string> = { 'content-type': 'application/json' };
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) headers.authorization = `Bearer ${data.session.access_token}`;
    }
    await fetch('/api/analytics', {
      method: 'POST',
      headers,
      body: JSON.stringify({ eventName, properties, anonymousSessionId: getAnonymousSessionId() }),
      keepalive: true,
    });
  } catch {}
}
