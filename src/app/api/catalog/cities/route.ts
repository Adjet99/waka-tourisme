import { NextResponse } from 'next/server';
import { getPublicCities } from '@/lib/server/catalog';
export async function GET(){const cities=await getPublicCities();return NextResponse.json({cities},{headers:{'cache-control':'public, max-age=60, s-maxage=300, stale-while-revalidate=600'}});}
