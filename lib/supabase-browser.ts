import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from './supabase-config';
let client: SupabaseClient | undefined;
export function browserDb() {
  return client ??= createClient(supabaseUrl, supabaseKey, {auth: {persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
}
export async function companyFetch(companyId:string, init:RequestInit={}) {
  const {data:{session},error} = await browserDb().auth.getSession();
  if(error || !session) return new Response(JSON.stringify({error:'Your session has ended. Please sign in again.'}),{status:401,headers:{'Content-Type':'application/json'}});
  return fetch('/api/records?company='+encodeURIComponent(companyId),{...init,cache:'no-store',headers:{...init.headers,Authorization:'Bearer '+session.access_token,'X-Company-ID':companyId}});
}
