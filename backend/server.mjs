// Node 20+ server. API key stays on the server; never put it in index.html.
import http from 'node:http';
import { randomUUID } from 'node:crypto';
const PORT = Number(process.env.PORT || 8787);
const KEY = process.env.MESHY_API_KEY;
const ORIGIN = process.env.ALLOWED_ORIGIN;
const API = 'https://api.meshy.ai/openapi/v1/image-to-3d';
const jobs = new Map();
const MAX = 8 * 1024 * 1024;
if (!KEY || !ORIGIN) { console.error('Set MESHY_API_KEY and ALLOWED_ORIGIN'); process.exit(1); }
function send(res, status, data, type='application/json') {
  res.writeHead(status, {'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(type === 'application/json' ? JSON.stringify(data) : data);
}
function fail(res, status, error) { send(res,status,{error}); }
function cors(req,res) {
  if (req.headers.origin !== ORIGIN) return false;
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  return true;
}
async function meshy(url, opts={}) {
  const r=await fetch(url,{...opts,headers:{Authorization:`Bearer ${KEY}`,...opts.headers},signal:AbortSignal.timeout(120000)});
  const data=await r.json().catch(()=>({}));
  if (!r.ok) throw Error(data.message || data.error || `Meshy error ${r.status}`);
  return data;
}
// Minimal multipart parser for one image field; body limited to 8MB plus headers.
function parseImage(req,buffer) {
  const ct=req.headers['content-type']||'';
  const m=ct.match(/^multipart\/form-data;\s*boundary=(?:"([^"]+)"|([^;]+))/i);
  if(!m) throw Error('Expected multipart image upload');
  const boundary=Buffer.from('--'+(m[1]||m[2]));
  const first=buffer.indexOf(boundary);
  if(first<0) throw Error('Malformed multipart upload');
  const headersEnd=buffer.indexOf(Buffer.from('\r\n\r\n'),first);
  if(headersEnd<0) throw Error('Malformed upload headers');
  const head=buffer.subarray(first,headersEnd).toString('latin1');
  if(!/name="image"/.test(head)) throw Error('Missing image field');
  const mime=head.match(/Content-Type:\s*(image\/(?:png|jpeg|webp))/i)?.[1]?.toLowerCase();
  if(!mime) throw Error('Only PNG, JPEG and WebP images are accepted');
  const start=headersEnd+4;
  const end=buffer.indexOf(Buffer.concat([Buffer.from('\r\n'),boundary]),start);
  if(end<start) throw Error('Malformed image body');
  const bytes=buffer.subarray(start,end);
  if(!bytes.length || bytes.length>MAX) throw Error('Image must be under 8 MB');
  const valid=mime==='image/png' ? bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')) : mime==='image/jpeg' ? bytes[0]===0xff && bytes[1]===0xd8 : bytes.subarray(0,4).toString()==='RIFF' && bytes.subarray(8,12).toString()==='WEBP';
  if(!valid) throw Error('File does not match image type');
  return `data:${mime};base64,${bytes.toString('base64')}`;
}
function readBody(req) { return new Promise((resolve,reject)=>{
  let size=0; const chunks=[];
  req.on('data',chunk=>{size+=chunk.length;if(size>MAX+8192){reject(Error('Image too large'));req.destroy();return;}chunks.push(chunk);});
  req.on('end',()=>resolve(Buffer.concat(chunks)));req.on('error',reject);
});}
// Expire jobs; job IDs are unguessable bearer tokens. For public deployment add authentication and quotas.
setInterval(()=>{const now=Date.now();for(const [id,j] of jobs)if(now-j.created>2*60*60*1000)jobs.delete(id);},60000).unref();
const server=http.createServer(async(req,res)=>{
  if(!cors(req,res)) return fail(res,403,'Origin not allowed');
  if(req.method==='OPTIONS') return send(res,204,'');
  const url=new URL(req.url,'http://localhost');
  try {
    if(req.method==='POST' && url.pathname==='/api/generate') {
      const image_url=parseImage(req,await readBody(req));
      const data=await meshy(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image_url,enable_pbr:false})});
      const providerId=data.result;
      if(typeof providerId!=='string') throw Error('Provider did not return a task ID');
      const id=randomUUID();jobs.set(id,{providerId,created:Date.now(),status:'PENDING',progress:0});
      return send(res,202,{id});
    }
    const match=url.pathname.match(/^\/api\/jobs\/([0-9a-f-]{36})(\/model)?$/);
    if(req.method==='GET' && match) {
      const job=jobs.get(match[1]);if(!job)return fail(res,404,'Job not found or expired');
      if(match[2]) {
        if(job.status!=='SUCCEEDED' || !job.modelUrl)return fail(res,409,'Model is not ready');
        // URL comes exclusively from the trusted Meshy API, never from the client.
        const target=new URL(job.modelUrl);
        if(target.protocol!=='https:')throw Error('Provider returned an insecure model URL');
        const model=await fetch(target,{signal:AbortSignal.timeout(120000)});
        if(!model.ok)throw Error('Could not download generated model');
        const maxDownload=100*1024*1024;
        const length=Number(model.headers.get('content-length')||0);
        if(length>maxDownload)throw Error('Generated model too large');
        const chunks=[];let n=0;
        for await(const c of model.body){n+=c.length;if(n>maxDownload)throw Error('Generated model too large');chunks.push(c);}
        return send(res,200,Buffer.concat(chunks),'model/gltf-binary');
      }
      const state=await meshy(API+'/'+encodeURIComponent(job.providerId));
      job.status=state.status||'PENDING';job.progress=state.progress??0;
      if(job.status==='SUCCEEDED')job.modelUrl=state.model_urls?.glb;
      return send(res,200,{status:job.status,progress:job.progress,error:state.task_error?.message||null});
    }
    return fail(res,404,'Not found');
  } catch(e) { console.error(e);return fail(res,400,e.message||'Request failed'); }
});
server.listen(PORT,()=>console.log(`3D backend listening on ${PORT}`));
