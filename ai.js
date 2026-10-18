// Cloudflare Pages Function: POST /api/ai
// Rahasia (Settings > Variables and Secrets): ANTHROPIC_API_KEY, ACCESS_CODE (opsional)
// Opsional: DAILY_LIMIT (angka, bawaan 60) dan KV binding bernama RL untuk pembatas per IP.
const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json'}});

export async function onRequestPost({request,env}){
  if(!env.ANTHROPIC_API_KEY)return json({error:'API key belum diatur di server'},500);
  if(env.ACCESS_CODE&&request.headers.get('x-access-code')!==env.ACCESS_CODE)return json({error:'kode akses salah'},401);

  if(env.RL){
    const ip=request.headers.get('CF-Connecting-IP')||'x',k='rl:'+ip+':'+new Date().toISOString().slice(0,10);
    const n=+(await env.RL.get(k)||0);
    if(n>=(+env.DAILY_LIMIT||60))return json({error:'batas harian tercapai'},429);
    await env.RL.put(k,String(n+1),{expirationTtl:86400});
  }

  let body;try{body=await request.json()}catch(e){return json({error:'permintaan tidak valid'},400)}
  const {prompt,images=[]}=body;
  if(typeof prompt!=='string'||!prompt||prompt.length>60000)return json({error:'prompt tidak valid'},400);
  const content=[];
  for(const im of images.slice(0,6)){
    if(!im||typeof im.data!=='string'||im.data.length>2_000_000)continue;
    const t=['image/jpeg','image/png','image/webp','image/gif'].includes(im.type)?im.type:'image/jpeg';
    content.push({type:'image',source:{type:'base64',media_type:t,data:im.data}});
  }
  content.push({type:'text',text:prompt});

  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01','content-type':'application/json'},
    body:JSON.stringify({model:env.MODEL||'claude-sonnet-5-5',max_tokens:8000,messages:[{role:'user',content}]})
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok)return json({error:(d.error&&d.error.message)||'gagal memanggil AI'},r.status===429?429:502);
  return json({text:(d.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('')});
}
