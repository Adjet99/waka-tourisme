'use client';
import dynamic from 'next/dynamic';
import type { Attraction } from '@/types';
const DynamicMap=dynamic(()=>import('@/components/MapView').then(m=>m.MapView),{ssr:false,loading:()=> <div className="panel">Chargement de la carte…</div>});
export function ActivityMap({attraction}:{attraction:Attraction}){return <div className="map-wrap activity-map"><DynamicMap center={[attraction.latitude,attraction.longitude]} points={[{id:attraction.id,name:attraction.name,latitude:attraction.latitude,longitude:attraction.longitude}]}/></div>}
