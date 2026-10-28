import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from '@/lib/supabase-config';
import { isRecordType } from '@/lib/record-types';
export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const kinds=['requirement','employee','asset','document','inspection','action','service'];
const statuses=['open','in_progress','complete','not_applicable'];
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function context(request:NextRequest){
 const token=request.headers.get('authorization');
 if(!token?.startsWith('Bearer '))return {error:json({error:'Sign in to access your workspace.'},401)};
 const db=createClient(supabaseUrl,supabaseKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:token}}});
 const {data:{user},error}=await db.auth.getUser(token.slice(7));
 if(error||!user)return {error:json({error:'Your session has ended. Please sign in again.'},401)};
 const company=request.headers.get('x-company-id')||request.nextUrl.searchParams.get('company')||'';
 if(!uuid.test(company))return {error:json({error:'Select a company.'},400)};
 const membership=await db.from('company_members').select('role').eq('company_id',company).eq('user_id',user.id).maybeSingle();
 if(membership.error)return {error:json({error:'Company access is temporarily unavailable.'},503)};
 if(!membership.data)return {error:json({error:'You do not have access to this company.'},403)};
 return {db,user,company,role:membership.data.role};
}
function item(row:Record<string,unknown>){return {id:row.id,kind:row.kind,recordType:row.record_type,title:row.title,owner:row.owner,reference:row.reference,dueDate:row.due_date||'',status:row.status,notes:row.notes,createdAt:row.created_at,updatedAt:row.updated_at};}
export async function GET(request:NextRequest){
 try{const c=await context(request);if(c.error)return c.error;
 // Page all records so reports and dashboard totals never silently stop at the API row limit.
 const rows:Record<string,unknown>[]=[];
 for(let offset=0;;offset+=500){const r=await c.db.from('compliance_records').select('*').eq('company_id',c.company).order('updated_at',{ascending:false}).order('id').range(offset,offset+499);if(r.error)throw r.error;rows.push(...r.data);if(r.data.length<500)break;}
 const events=await c.db.from('compliance_activity').select('*').eq('company_id',c.company).order('at',{ascending:false}).limit(40);
 if(events.error)throw events.error;
 return json({items:rows.map(item),events:events.data.map(e=>({id:e.id,recordId:e.record_id,action:e.action,actor:e.actor,at:e.at})),user:c.user.email,role:c.role});
 }catch{return json({error:'Records are temporarily unavailable. Please try again.'},503);}
}
export async function POST(request:NextRequest){
 try{const c=await context(request);if(c.error)return c.error;
 if(!['owner','admin','editor'].includes(c.role))return json({error:'This company gives you read-only access.'},403);
 let b:Record<string,unknown>;try{b=await request.json() as Record<string,unknown>;}catch{return json({error:'Invalid request.'},400);}
 if(!b||typeof b!=='object')return json({error:'Invalid request.'},400);
 const clean=(key:string,max:number)=>typeof b[key]==='string'?b[key].trim().slice(0,max):'';
 const kind=clean('kind',32),title=clean('title',160),recordType=clean('recordType',100),due=clean('dueDate',10),status=clean('status',32)||'open';
 if(!kinds.includes(kind)||!title||!isRecordType(kind,recordType)||!statuses.includes(status))return json({error:'Choose a valid category, type, title and status.'},400);
 if(due&&(!/^\d{4}-\d{2}-\d{2}$/.test(due)||Number.isNaN(Date.parse(due))||new Date(due).toISOString().slice(0,10)!==due))return json({error:'Enter a valid date.'},400);
 const r=await c.db.from('compliance_records').insert({company_id:c.company,kind,record_type:recordType,title,owner:clean('owner',120),reference:clean('reference',160),due_date:due||null,status,notes:clean('notes',2000)}).select().single();
 if(r.error)throw r.error;return json({item:item(r.data)},201);
 }catch{return json({error:'The record could not be saved. Please try again.'},503);}
}
export async function PATCH(request:NextRequest){
 try{const c=await context(request);if(c.error)return c.error;
 if(!['owner','admin','editor'].includes(c.role))return json({error:'This company gives you read-only access.'},403);
 let b:Record<string,unknown>;try{b=await request.json() as Record<string,unknown>;}catch{return json({error:'Invalid request.'},400);}
 if(!b||typeof b.id!=='string'||typeof b.status!=='string'||!uuid.test(b.id)||!statuses.includes(b.status))return json({error:'Invalid status change.'},400);
 const r=await c.db.from('compliance_records').update({status:b.status}).eq('company_id',c.company).eq('id',b.id).select('id').maybeSingle();
 if(r.error)throw r.error;if(!r.data)return json({error:'Record not found.'},404);return json({ok:true});
 }catch{return json({error:'The status could not be saved. Please try again.'},503);}
}
