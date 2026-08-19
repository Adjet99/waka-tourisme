import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { branding } from '@/config/branding';
import { PwaRegister } from '@/components/PwaRegister';

const appUrl=process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase:new URL(appUrl),
  title:{default:`${branding.name} — Explorez la Côte d’Ivoire`,template:`%s · ${branding.name}`},
  description:'Découvrez des lieux autour de vous ou laissez Waka choisir votre prochaine aventure en Côte d’Ivoire.',
  applicationName:branding.name,
  manifest:'/manifest.webmanifest',
  icons:{icon:[{url:'/icon-192.png',sizes:'192x192',type:'image/png'}],apple:'/apple-touch-icon.png'},
  alternates:{canonical:'/'},
  openGraph:{type:'website',locale:'fr_CI',siteName:branding.name,title:`${branding.name} — Explorez la Côte d’Ivoire`,description:'Une destination, un trajet et un programme pour partir à la découverte de la Côte d’Ivoire.'},
  robots:{index:true,follow:true},
};
export const viewport: Viewport = { themeColor: '#174f3a', width: 'device-width', initialScale: 1, viewportFit:'cover' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {return <html lang="fr"><body><PwaRegister/><AppShell>{children}</AppShell></body></html>;}
