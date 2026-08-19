import type { MetadataRoute } from 'next';
import { branding } from '@/config/branding';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: branding.name,
    short_name: 'Waka',
    description: `Tourisme ludique en ${branding.country}`,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#fbf7ef',
    theme_color: '#174f3a',
    categories: ['travel','lifestyle'],
    icons: [
      { src:'/icon-192.png', sizes:'192x192', type:'image/png', purpose:'any' },
      { src:'/icon-512.png', sizes:'512x512', type:'image/png', purpose:'any maskable' }
    ]
  };
}
