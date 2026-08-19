'use client';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="container"><div className="empty-state"><div className="empty-icon">🧭</div><h1>Waka a perdu le nord</h1><p>Une erreur inattendue est survenue. Vos données locales n’ont pas été supprimées.</p><button className="btn green" onClick={reset}>Réessayer</button></div></main>}
