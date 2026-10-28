'use client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ShieldCheck } from 'lucide-react';
import { browserDb } from '@/lib/supabase-browser';
import Workspace from './workspace';
type Company={id:string;name:string;role:string};
export default function Account(){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[companies,setCompanies]=useState<Company[]>([]),[selected,setSelected]=useState(''),[loading,setLoading]=useState(false);
 const [mode,setMode]=useState<'signin'|'signup'|'reset'|'password'>('signin'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[companyName,setCompanyName]=useState(''),[newCompany,setNewCompany]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{
  const db=browserDb();
  const {data:{subscription}}=db.auth.onAuthStateChange((event,next)=>{setSession(next);setReady(true);if(event==='PASSWORD_RECOVERY')setMode('password');if(event==='SIGNED_OUT'){setCompanies([]);setSelected('');setPassword('');setMode('signin');}});
  db.auth.getSession().then(({data,error})=>{if(error)setError(error.message);setSession(data.session);setReady(true);}).catch(()=>{setError('Unable to restore your session. Please try again.');setReady(true);});
  return ()=>subscription.unsubscribe();
 },[]);
 useEffect(()=>{
  let cancelled=false;
  if(!session){setCompanies([]);setSelected('');return;}
  setLoading(true);
  (async()=>{const db=browserDb();const [c,m]=await Promise.all([db.from('companies').select('id,name').order('created_at'),db.from('company_members').select('company_id,role').eq('user_id',session.user.id)]);if(cancelled)return;if(c.error||m.error){setError('Unable to load your companies. Refresh to retry.');return;}const list=c.data.map(x=>({...x,role:m.data.find(y=>y.company_id===x.id)?.role||'viewer'}));setCompanies(list);setSelected(old=>list.some(x=>x.id===old)?old:list[0]?.id||'');})().catch(()=>{if(!cancelled)setError('Unable to load your companies. Refresh to retry.');}).finally(()=>{if(!cancelled)setLoading(false);});
  return ()=>{cancelled=true;};
 },[session?.user.id]);
 async function authenticate(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');setMessage('');const db=browserDb();
  try{
   if(mode==='signin'){const r=await db.auth.signInWithPassword({email:email.trim(),password});if(r.error)throw r.error;setPassword('');}
   if(mode==='signup'){const r=await db.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+'/'}});if(r.error)throw r.error;setMessage('Check your email to confirm your account, then sign in here.');setPassword('');}
   if(mode==='reset'){const r=await db.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/'});if(r.error)throw r.error;setMessage('If an account exists for this email, a password reset link will arrive shortly.');}
   if(mode==='password'){const r=await db.auth.updateUser({password});if(r.error)throw r.error;setPassword('');setMode('signin');setMessage('Password updated.');}
  }catch(e){setError(e instanceof Error?e.message:'Unable to complete this request.');}finally{setBusy(false);}
 }
 async function createCompany(e:React.FormEvent){e.preventDefault();if(!session)return;setBusy(true);setError('');try{const id=crypto.randomUUID();const r=await browserDb().from('companies').insert({id,name:companyName.trim(),created_by:session.user.id});if(r.error)throw r.error;setCompanies(old=>[...old,{id,name:companyName.trim(),role:'owner'}]);setSelected(id);setCompanyName('');setNewCompany(false);}catch(e){setError(e instanceof Error?e.message:'Unable to create the company.');}finally{setBusy(false);}}
 async function signOut(){setBusy(true);setError('');try{const {error}=await browserDb().auth.signOut();if(error)throw error;setMessage('');}catch(e){setError(e instanceof Error?e.message:'Unable to sign out. Please retry.');}finally{setBusy(false);}}
 const selectedCompany=companies.find(c=>c.id===selected);
 if(!ready||loading)return <div className="auth-screen"><p>Loading your secure workspace…</p></div>;
 if(!session||mode==='password')return <div className="auth-screen"><section className="auth-card"><div className="auth-brand"><ShieldCheck/><strong>ComplyK</strong></div><div className="eyebrow">INDUSTRIAL COMPLIANCE / KUWAIT</div><h1>{mode==='signup'?'Create your account':mode==='reset'?'Reset your password':mode==='password'?'Choose a new password':'Welcome back'}</h1><p>{mode==='signup'?'Create a secure account, then set up your company workspace.':'Sign in with your ComplyK account to access your company’s records.'}</p><form className="record-form" onSubmit={authenticate}>{mode!=='password'&&<label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}{mode!=='reset'&&<label>Password<input type="password" autoComplete={mode==='signin'?'current-password':'new-password'} minLength={mode==='signin'?1:12} required value={password} onChange={e=>setPassword(e.target.value)}/>{mode!=='signin'&&<small>Use at least 12 characters.</small>}</label>}{error&&<p className="form-error" role="alert">{error}</p>}{message&&<p role="status" className="auth-message">{message}</p>}<button className="primary-btn" disabled={busy} type="submit">{busy?'Please wait…':mode==='signup'?'Create account':mode==='reset'?'Send reset link':mode==='password'?'Update password':'Sign in'}</button></form><div className="auth-links">{mode==='signin'?<><button onClick={()=>{setMode('signup');setError('');setMessage('');}}>Create an account</button><button onClick={()=>{setMode('reset');setError('');setMessage('');}}>Forgot password?</button></>:<button onClick={()=>{setMode('signin');setError('');setMessage('');}}>Back to sign in</button>}</div></section></div>;
 return <><div className="account-bar"><label>Company <select aria-label="Company" value={selected} onChange={e=>{setSelected(e.target.value);setError('');}}>{!companies.length&&<option value="">Create a company</option>}{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button onClick={()=>setNewCompany(true)}>New company</button><span className="account-email">{session.user.email}</span><button disabled={busy} onClick={signOut}>Sign out</button></div>{error&&<p role="alert" className="error-banner">{error}</p>}{(!selectedCompany||newCompany)?<div className="auth-screen"><section className="auth-card"><h1>Create a company workspace</h1><p>Your records will be stored securely and only accessible to this company’s authorized members.</p><form className="record-form" onSubmit={createCompany}><label>Company name<input required minLength={2} maxLength={200} value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Your company’s legal or trading name"/></label><button className="primary-btn" disabled={busy||companyName.trim().length<2}>{busy?'Creating…':'Create company'}</button>{companies.length>0&&<button type="button" className="outline-btn" onClick={()=>setNewCompany(false)}>Cancel</button>}</form></section></div>:<Workspace key={session.user.id+selectedCompany.id} company={selectedCompany} onSessionExpired={()=>{void browserDb().auth.signOut({scope:'local'});}}/>}</>;
}
