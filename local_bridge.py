"""Local-only Hunyuan3D bridge for Graphic Staging Animation (Python 3.10–3.12; standard library)."""
import base64, cgi, io, json, os, threading, uuid, urllib.request, urllib.error
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path

HOST='127.0.0.1'
PORT=int(os.environ.get('GSA_PORT','8787'))
HUNYUAN_URL=os.environ.get('HUNYUAN_URL','http://127.0.0.1:8080/generate')
MAX_IMAGE=8*1024*1024
MAX_MODEL=120*1024*1024
JOBS={}
LOCK=threading.Lock()
OUT=Path(__file__).resolve().parent/'generated-models'
OUT.mkdir(exist_ok=True)

def run_job(jid, img):
    with LOCK: JOBS[jid]['status']='IN_PROGRESS'; JOBS[jid]['progress']=10
    try:
        payload=json.dumps({'image':base64.b64encode(img).decode('ascii')}).encode()
        request=urllib.request.Request(HUNYUAN_URL,data=payload,headers={'Content-Type':'application/json'},method='POST')
        with urllib.request.urlopen(request,timeout=3600) as response:
            if response.headers.get('Content-Type','').startswith('application/json'):
                raise RuntimeError('Hunyuan returned JSON instead of a GLB: '+response.read(512).decode('utf-8','replace'))
            model=response.read(MAX_MODEL+1)
        if len(model)>MAX_MODEL: raise RuntimeError('Model exceeds 120 MB')
        if len(model)<12 or model[:4]!=b'glTF': raise RuntimeError('Hunyuan did not return a valid GLB file')
        path=OUT/(jid+'.glb');path.write_bytes(model)
        with LOCK: JOBS[jid].update(status='SUCCEEDED',progress=100,path=str(path))
    except Exception as e:
        with LOCK: JOBS[jid].update(status='FAILED',error=str(e))

class Handler(BaseHTTPRequestHandler):
    def _origin(self):
        origin=self.headers.get('Origin','')
        # The API binds to loopback, so it is not accessible directly from other computers.
        return origin in ('','null','http://localhost','http://127.0.0.1') or origin.startswith('https://') and origin.endswith('.github.io')
    def send(self,code,data,kind='application/json'):
        if isinstance(data,dict): data=json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type',kind)
        self.send_header('Cache-Control','no-store')
        self.send_header('Access-Control-Allow-Origin',self.headers.get('Origin') or '*')
        self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.send_header('Content-Length',str(len(data)))
        self.end_headers();self.wfile.write(data)
    def do_OPTIONS(self):
        if not self._origin():return self.send(403,{'error':'Origin not allowed'})
        self.send(204,b'')
    def do_POST(self):
        if not self._origin():return self.send(403,{'error':'Origin not allowed'})
        if self.path!='/api/generate':return self.send(404,{'error':'Not found'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length<1 or length>MAX_IMAGE+8192:raise ValueError('Image too large (8 MB maximum)')
            content_type, params=cgi.parse_header(self.headers.get('Content-Type',''))
            if content_type!='multipart/form-data' or 'boundary' not in params:raise ValueError('Expected multipart image upload')
            form=cgi.FieldStorage(fp=io.BytesIO(self.rfile.read(length)),headers=self.headers,environ={'REQUEST_METHOD':'POST','CONTENT_TYPE':self.headers['Content-Type']})
            if 'image' not in form:raise ValueError('Missing image field')
            item=form['image'];img=item.file.read(MAX_IMAGE+1)
            if len(img)>MAX_IMAGE or not img:raise ValueError('Invalid image size')
            if not (img.startswith(b'\x89PNG\r\n\x1a\n') or img.startswith(b'\xff\xd8') or img.startswith(b'RIFF') and img[8:12]==b'WEBP'):raise ValueError('Only PNG, JPEG, WebP images are accepted')
            jid=str(uuid.uuid4())
            with LOCK:JOBS[jid]={'status':'PENDING','progress':0}
            threading.Thread(target=run_job,args=(jid,img),daemon=True).start()
            self.send(202,{'id':jid})
        except Exception as e:self.send(400,{'error':str(e)})
    def do_GET(self):
        if not self._origin():return self.send(403,{'error':'Origin not allowed'})
        if self.path=='/api/health':return self.send(200,{'ok':True,'hunyuan_url':HUNYUAN_URL})
        parts=self.path.strip('/').split('/')
        if len(parts) not in (3,4) or parts[:2]!=['api','jobs']:return self.send(404,{'error':'Not found'})
        jid=parts[2]
        with LOCK:job=JOBS.get(jid,{}).copy()
        if not job:return self.send(404,{'error':'Job not found'})
        if len(parts)==4:
            if parts[3]!='model' or job['status']!='SUCCEEDED':return self.send(409,{'error':'Model not ready'})
            return self.send(200,Path(job['path']).read_bytes(),'model/gltf-binary')
        self.send(200,{k:v for k,v in job.items() if k!='path'})

if __name__=='__main__':
    print(f'Local AI bridge: http://{HOST}:{PORT} -> {HUNYUAN_URL}',flush=True)
    ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
