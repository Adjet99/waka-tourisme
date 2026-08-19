import Link from 'next/link';
import { Compass, Heart, Home, MapPinned, UserRound } from 'lucide-react';
import { branding } from '@/config/branding';
import { UserStatus } from '@/components/UserStatus';
import { InstallPrompt } from '@/components/InstallPrompt';
import { FeedbackWidget } from '@/components/FeedbackWidget';

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="shell"><header className="site-header"><div className="container topbar"><Link href="/" className="brand"><span className="brand-mark">W</span><span>{branding.name}</span></Link><div className="top-actions"><Link className="pill desktop-only" href="/partenaires">Devenir partenaire</Link><UserStatus/></div></div></header>{children}<footer className="site-footer"><div className="container footer-grid"><div><div className="brand"><span className="brand-mark">W</span>{branding.name}</div><p>La Côte d’Ivoire à découvrir, sans perdre du temps à choisir.</p></div><div><b>Explorer</b><Link href="/destinations">Destinations</Link><Link href="/activites">Activités</Link><Link href="/voyages">Mes voyages</Link></div><div><b>Waka</b><Link href="/partenaires">Partenaires</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/cgu">CGU</Link></div></div></footer><InstallPrompt/><FeedbackWidget/><nav className="bottom-nav" aria-label="Navigation principale"><Link href="/"><Home size={20}/><span>Accueil</span></Link><Link href="/explorer"><MapPinned size={20}/><span>Explorer</span></Link><Link href="/surprise"><Compass size={20}/><span>Surprise</span></Link><Link href="/favoris"><Heart size={20}/><span>Favoris</span></Link><Link href="/profil"><UserRound size={20}/><span>Profil</span></Link></nav></div>;
}
