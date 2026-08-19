'use client';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

const icon = L.divIcon({ className:'waka-map-marker', html:'<span></span>', iconSize:[28,34], iconAnchor:[14,34], popupAnchor:[0,-30] });
function Recenter({center}:{center:[number,number]}){const map=useMap();useEffect(()=>{map.setView(center,map.getZoom(),{animate:true});},[center,map]);return null;}
export function MapView({ center, points }: { center: [number, number]; points: {id:string;name:string;latitude:number;longitude:number}[] }) {
  return <MapContainer center={center} zoom={11} scrollWheelZoom className="leaflet-container"><Recenter center={center}/><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{points.map(point => <Marker key={point.id} position={[point.latitude, point.longitude]} icon={icon}><Popup>{point.name}</Popup></Marker>)}</MapContainer>;
}
