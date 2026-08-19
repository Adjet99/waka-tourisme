'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deleteTrip, listTrips, type SavedTrip } from '@/lib/user-data';

export function TripsClient(){
  const [trips,setTrips]=useState<SavedTrip[]|null>(null);
  const reload=()=>listTrips().then(setTrips);
  useEffect(()=>{reload();},[]);
  if(trips===null)return <div className="panel">Chargement de vos voyages…</div>;
  if(!trips.length)return <div className="empty-state"><div className="empty-icon">🧳</div><h2>Aucun voyage sauvegardé</h2><p>Choisissez une destination puis générez votre programme.</p><Link className="btn green" href="/surprise">🎲 Surprends-moi</Link></div>;
  return <div className="stack">{trips.map(trip=><article className="panel trip-card" key={trip.localId}><div className="section-head"><div><span className="eyebrow">{trip.cityName}</span><h2>{trip.title}</h2><p className="muted">Sauvegardé le {new Date(trip.createdAt).toLocaleDateString('fr-FR')}</p></div><div className="filters"><Link className="btn green" href={`/destinations/${trip.citySlug}`}>Voir la destination</Link><button className="btn ghost" onClick={async()=>{await deleteTrip(trip);reload();}}>Supprimer</button></div></div><div className="itinerary-preview">{trip.itinerary.days.map(day=><div className="day-mini" key={day.day}><b>Jour {day.day}</b>{day.items.filter(x=>x.type==='visite').slice(0,2).map((item,i)=><span key={i}>{item.time} · {item.title}</span>)}</div>)}</div></article>)}</div>;
}
