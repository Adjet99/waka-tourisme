'use client';
import { useEffect, useState } from 'react';
import { cities as fallbackCities } from '@/data/cities';
import type { City } from '@/types';
export function useCatalogCities(){const [cities,setCities]=useState<City[]>(fallbackCities);useEffect(()=>{fetch('/api/catalog/cities').then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(Array.isArray(data.cities)&&data.cities.length)setCities(data.cities);}).catch(()=>{});},[]);return cities;}
