'use client';
import { useEffect } from 'react';
export function PwaRegister(){useEffect(()=>{if('serviceWorker'in navigator&&process.env.NEXT_PUBLIC_ENABLE_PWA!=='false'){navigator.serviceWorker.register('/sw.js').catch(()=>{});}},[]);return null;}
