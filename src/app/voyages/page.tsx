import type { Metadata } from 'next';
import { TripsClient } from '@/components/TripsClient';
export const metadata:Metadata={title:'Mes voyages | Waka Tourisme'};
export default function Page(){return <main className="container"><header className="page-title"><span className="eyebrow">🧳 Planification</span><h1>Mes voyages</h1><p>Retrouvez les programmes que vous avez générés et sauvegardés. Sans compte, ils restent sur cet appareil ; avec un compte Waka, ils peuvent être synchronisés via Supabase.</p></header><TripsClient/></main>}
