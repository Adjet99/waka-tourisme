'use client';
import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & { prompt:()=>Promise<void>; userChoice:Promise<{outcome:'accepted'|'dismissed'}> };
export function InstallPrompt(){
  const [event,setEvent]=useState<BeforeInstallPromptEvent|null>(null);
  const [hidden,setHidden]=useState(true);
  useEffect(()=>{
    if(process.env.NEXT_PUBLIC_ENABLE_PWA==='false')return;
    const handler=(e:Event)=>{e.preventDefault();setEvent(e as BeforeInstallPromptEvent);setHidden(false);};
    window.addEventListener('beforeinstallprompt',handler);
    return()=>window.removeEventListener('beforeinstallprompt',handler);
  },[]);
  if(hidden||!event)return null;
  const install=async()=>{await event.prompt();const choice=await event.userChoice;if(choice.outcome==='accepted')setHidden(true);};
  return <div className="install-banner"><div><b>Installer Waka</b><span>Accédez plus vite à vos voyages depuis l’écran d’accueil.</span></div><div className="filters"><button className="btn green" onClick={install}>Installer</button><button className="btn ghost" onClick={()=>setHidden(true)}>Plus tard</button></div></div>;
}
