'use client';
import { useState } from 'react';
import { getAnonymousSessionId } from '@/lib/user-data';
export function FeedbackWidget(){
  const [open,setOpen]=useState(false),[rating,setRating]=useState(5),[message,setMessage]=useState(''),[status,setStatus]=useState('');
  if(process.env.NEXT_PUBLIC_BETA_MODE==='false')return null;
  const submit=async()=>{if(message.trim().length<3)return;setStatus('Envoi…');const res=await fetch('/api/feedback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({rating,message,pagePath:location.pathname,anonymousSessionId:getAnonymousSessionId()})});setStatus(res.ok?'Merci, retour enregistré.':'Impossible d’envoyer le retour.');if(res.ok)setTimeout(()=>{setOpen(false);setMessage('');setStatus('');},1200);};
  return <><button className="feedback-fab" onClick={()=>setOpen(true)}>💬 <span>Votre avis</span></button>{open&&<div className="modal-backdrop" onMouseDown={()=>setOpen(false)}><div className="feedback-modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setOpen(false)}>×</button><span className="eyebrow">Bêta Waka</span><h2>Comment se passe votre test ?</h2><div className="rating-row">{[1,2,3,4,5].map(n=><button key={n} className={n<=rating?'active':''} onClick={()=>setRating(n)}>★</button>)}</div><textarea className="field textarea" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Ce qui fonctionne, ce qui bloque, ce qui manque…"/><button className="btn green full" onClick={submit}>Envoyer mon retour</button>{status&&<small className="muted">{status}</small>}</div></div>}</>;
}
