(()=>{
const W=640,H=420,R=26,CS=20,GX=32,GY=21,D={x:40,y:380};
const obs=[{x:120,y:90,w:90,h:50},{x:380,y:60,w:60,h:110},{x:250,y:270,w:130,h:50},{x:520,y:290,w:70,h:70}];
const $=id=>document.getElementById(id),cv=$('robotCanvas'),ctx=cv.getContext('2d');
const S={mode:'AUTO',speed:1.75,suc:1,live:false,ip:'',ok:false,poll:null,first:false};
const LBL={IDLE:'Siaga',CLEAN:'Membersihkan',AVOID:'Menghindar',DOCK:'Kembali ke dock',CHARGE:'Mengisi daya',MANUAL:'Manual',PAUSED:'Berhenti',LOW_BATTERY:'Baterai rendah',WATER_EMPTY:'Air habis'};
let rb={x:D.x,y:D.y,a:-.6},st='IDLE',bat=85,water=72,temp=32,cov=new Uint8Array(GX*GY),covN=0,freeN=0,keys={},tgt=null,turn=1,stuck=0,bp=0,ph=0,dist=120,mv=0,n=0,ext=null;
const hit=(x,y,r)=>x<r||y<r||x>W-r||y>H-r||obs.some(o=>{const a=Math.max(o.x,Math.min(x,o.x+o.w)),b=Math.max(o.y,Math.min(y,o.y+o.h));return(x-a)**2+(y-b)**2<r*r});
const nrm=a=>Math.atan2(Math.sin(a),Math.cos(a)),cl=v=>Math.max(-1,Math.min(1,v));
for(let i=0;i<GX*GY;i++)if(!hit(i%GX*CS+10,Math.floor(i/GX)*CS+10,2))freeN++;
const sense=()=>{for(let d=0;d<=120;d+=4)if(hit(rb.x+Math.cos(rb.a)*(R+d),rb.y+Math.sin(rb.a)*(R+d),1))return d;return 120};
const covPct=()=>Math.min(100,covN/freeN*100);
const label=()=>S.live?(ext?LBL[ext.state]||ext.state:'Menunggu'):LBL[st];

function sim(){
 dist=sense();mv=0;
 if(!deviceOn){st='IDLE';return}
 if(st==='CHARGE'){bat=Math.min(100,bat+.3);water=Math.min(100,water+.6);
  if(bat>=100&&water>=100){st='CLEAN';rb.a=-.6;addActivity('Isi ulang selesai','Robot melanjutkan pembersihan','fa-bolt')}return}
 let f=0,tn=0;
 if(S.mode==='MANUAL'){st='MANUAL';f=(keys.up?1:0)-(keys.down?1:0);tn=(keys.right?1:0)-(keys.left?1:0);
  if(tgt){const dx=tgt.x-rb.x,dy=tgt.y-rb.y,da=nrm(Math.atan2(dy,dx)-rb.a);if(Math.hypot(dx,dy)>10){tn=cl(da/.06);if(Math.abs(da)<.6)f=1}}}
 else{
  if(st==='IDLE'||st==='MANUAL')st='CLEAN';
  if(st!=='DOCK'&&(bat<20||water<=0)){st='DOCK';addActivity('Kembali ke dock',bat<20?'Baterai rendah':'Tangki air habis','fa-house')}
  if(st==='DOCK'){const dx=D.x-rb.x,dy=D.y-rb.y,dd=Math.hypot(dx,dy),da=nrm(Math.atan2(dy,dx)-rb.a);
   if(dd<14){rb.x=D.x;rb.y=D.y;st='CHARGE';addActivity('Mengisi daya','Robot tiba di dock','fa-plug');return}
   if(dist<(dd<90?16:35))tn=turn;else{tn=cl(da/.06);f=1}}
  else if(dist<45){if(st!=='AVOID'){st='AVOID';turn=Math.random()<.5?-1:1;addActivity('Rintangan terdeteksi','Jarak '+dist+' cm, robot berbelok','fa-triangle-exclamation')}tn=turn}
  else{st='CLEAN';f=1}}
 rb.a+=tn*.06;const sp=S.speed*f;
 if(sp){const nx=rb.x+Math.cos(rb.a)*sp,ny=rb.y+Math.sin(rb.a)*sp;
  if(!hit(nx,ny,R)){rb.x=nx;rb.y=ny;mv=Math.abs(sp);stuck=0;bat=Math.max(0,bat-.008*mv*S.suc);
   if(st!=='DOCK'){water=Math.max(0,water-.012*S.suc);
    for(let i=0;i<cov.length;i++)if(!cov[i]&&((i%GX)*CS+10-rb.x)**2+(Math.floor(i/GX)*CS+10-rb.y)**2<(R-3)**2){cov[i]=1;covN++}
    if(covPct()>=90){cov.fill(0);covN=0;addActivity('Putaran selesai','Seluruh area telah dibersihkan','fa-circle-check')}}}
  else if(++stuck>20){rb.a+=1.6*turn;stuck=0}}
 ph+=mv;if(st==='CLEAN'||st==='AVOID'||st==='MANUAL')bp+=.35;
 temp+=(30+mv*3.4-temp)*.01}

function draw(){
 ctx.fillStyle='#efe3cc';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(0,0,0,.06)';
 for(let i=0;i<W;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke()}
 for(let i=0;i<H;i+=40){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke()}
 ctx.fillStyle='rgba(90,170,255,.3)';for(let i=0;i<cov.length;i++)if(cov[i])ctx.fillRect(i%GX*CS,Math.floor(i/GX)*CS,CS,CS);
 ctx.fillStyle='#7a5a3a';obs.forEach(o=>{ctx.beginPath();ctx.roundRect(o.x,o.y,o.w,o.h,8);ctx.fill()});
 ctx.fillStyle='#22c55e';ctx.beginPath();ctx.roundRect(4,346,64,68,10);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('DOCK',36,410);
 if(S.live){ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#111827';ctx.font='600 20px sans-serif';ctx.fillText('Mode ESP32 Asli',W/2,H/2-10);
  ctx.font='14px sans-serif';ctx.fillText(S.ok?'Status: '+label()+'  ·  Jarak: '+ext.distance_cm+' cm':'Belum tersambung ke ESP32',W/2,H/2+18);return}
 ctx.save();ctx.translate(rb.x,rb.y);ctx.rotate(rb.a);
 ctx.strokeStyle=dist<45?'rgba(228,87,46,.85)':'rgba(47,141,224,.6)';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(R,0);ctx.lineTo(R+dist,0);ctx.stroke();ctx.setLineDash([]);
 [-1,1].forEach(s=>{ctx.fillStyle='#2b2f36';ctx.fillRect(-14,s*R-4,28,9);ctx.fillStyle='#555d69';for(let i=-2;i<=2;i++)ctx.fillRect(((ph*.8+i*6)%12+12)%12-6,s*R-4,2,9)});
 ctx.fillStyle='#fff';ctx.strokeStyle='#1f3a5f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();ctx.stroke();
 ctx.fillStyle='#eaf5ff';ctx.beginPath();ctx.roundRect(-20,-18,22,36,5);ctx.fill();ctx.lineWidth=1.5;ctx.stroke();
 const h=34*water/100;ctx.fillStyle='#3a9bf0';ctx.fillRect(-19,17-h,20,h);
 ctx.fillStyle='#17283a';ctx.fillRect(4,-11,16,22);ctx.fillStyle='#d4a017';ctx.fillRect(8,-5,8,9);
 ctx.fillStyle=deviceOn?'#22c55e':'#9ca3af';ctx.beginPath();ctx.arc(R-6,12,2.8,0,7);ctx.fill();
 ctx.fillStyle='#2b3f5c';ctx.fillRect(R-7,-12,9,24);ctx.fillStyle='#cfdceb';[-6,6].forEach(y=>{ctx.beginPath();ctx.arc(R-2,y,3.5,0,7);ctx.fill()});
 ctx.save();ctx.translate(R-4,-R+2);ctx.rotate(bp);ctx.strokeStyle='#e4572e';ctx.lineWidth=2.5;for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(10,0);ctx.stroke()}ctx.restore();
 ctx.restore()}

function ui(){
 const set=(i,v)=>{const e=$(i);if(e)e.textContent=v},b=Math.round(bat),w=Math.round(water);
 set('battery',b);set('sensorBattery',b);set('water',w);set('sensorWater',w);
 $('batteryProgress').style.width=b+'%';$('waterProgress').style.width=w+'%';
 const t=S.live?'--':Math.round(temp),d=S.live?(ext?ext.distance_cm:'--'):(dist>=120?'>120':dist);
 set('temperature',t);set('sensorTemperature',t);set('dust',S.live?'--':Math.round(5+covPct()*.7));
 set('sensorDist',d);set('sensorCov',S.live?'--':Math.round(covPct()));
 if(deviceOn)set('deviceStatus',label().toUpperCase())}

async function api(p){const c=new AbortController(),t=setTimeout(()=>c.abort(),2500);try{return await(await fetch('http://'+S.ip+p,{signal:c.signal})).json()}finally{clearTimeout(t)}}
function conn(t,s,ok){$('connTitle').textContent=t;$('connSub').textContent=s;const b=$('connBadge');b.lastChild.textContent=ok?'Online':'Offline';b.style.background=ok?'':'#fee2e2';b.style.color=ok?'':'#dc2626';b.firstChild.style.background=ok?'':'#dc2626'}
async function pollOnce(){
 try{const s=await api('/status'),first=!S.ok;S.ok=true;S.first=false;ext=s;bat=s.battery_pct;water=s.water_pct;
  if(first){conn('ESP32 Terhubung','Sinyal '+s.rssi+' dBm',true);addActivity('ESP32 terhubung','Alamat '+S.ip,'fa-wifi');if(s.running!==deviceOn)_tp()}}
 catch(e){if(S.ok||S.first){S.ok=false;S.first=false;conn('ESP32 Terputus','Periksa IP & WiFi',false);addActivity('Koneksi terputus','Tidak dapat menjangkau ESP32','fa-triangle-exclamation')}}}
function setSrc(live){
 S.live=live;clearInterval(S.poll);S.ok=false;ext=null;
 $('srcSim').classList.toggle('active',!live);$('srcLive').classList.toggle('active',live);$('liveRow').hidden=!live;
 $('srcNote').textContent=live?'Data dibaca dari ESP32 lewat WiFi (hanya http://, satu jaringan). Suhu & debu tidak tersedia.':'Robot virtual berjalan di peta. Atur lewat Power, Mode, Kecepatan, dan Daya Hisap.';
 if(live)conn('ESP32','Belum tersambung',false);else{bat=85;water=72;conn('Mode Simulasi','Robot virtual aktif',true)}}

const _tp=window.togglePower,_cm=window.changeMode,_cs=window.changeSpeed,_ss=window.setSuction;
window.togglePower=()=>{_tp();if(S.live&&S.ok)api('/cmd?action='+(deviceOn?'start':'stop')).catch(()=>showToast('Gagal mengirim perintah'))};
window.changeMode=(m,b)=>{S.mode=m;_cm(m,b)};
window.changeSpeed=v=>{S.speed=v/100*3.5;_cs(v)};
window.setSuction=(v,b)=>{S.suc={Rendah:.8,Sedang:1,Tinggi:1.3}[v];_ss(v,b)};

const KM={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
const can=()=>S.mode==='MANUAL'&&deviceOn&&!S.live;
document.addEventListener('keydown',e=>{const k=KM[e.key];if(!k||e.target.tagName==='INPUT'||!can())return;keys[k]=true;tgt=null;e.preventDefault()});
document.addEventListener('keyup',e=>{const k=KM[e.key];if(k)keys[k]=false});
document.querySelectorAll('.dpad button').forEach(b=>{const k=b.dataset.k;
 b.addEventListener('pointerdown',e=>{if(can()){keys[k]=true;tgt=null;b.setPointerCapture(e.pointerId)}});
 ['pointerup','pointercancel'].forEach(n=>b.addEventListener(n,()=>keys[k]=false))});
const pt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
cv.addEventListener('pointerdown',e=>{if(can()){tgt=pt(e);cv.setPointerCapture(e.pointerId)}});
cv.addEventListener('pointermove',e=>{if(tgt)tgt=pt(e)});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>tgt=null));
$('srcSim').onclick=()=>setSrc(false);$('srcLive').onclick=()=>setSrc(true);
$('espGo').onclick=()=>{S.ip=$('espIp').value.trim();if(!S.ip)return;try{localStorage.setItem('esp_ip',S.ip)}catch(e){}
 clearInterval(S.poll);S.ok=false;S.first=true;conn('Menyambung…',S.ip,false);pollOnce();S.poll=setInterval(pollOnce,1000)};
try{$('espIp').value=localStorage.getItem('esp_ip')||''}catch(e){}
setSrc(false);
(function loop(){if(!S.live)for(let i=0;i<2;i++)sim();draw();if(++n%10===0)ui();requestAnimationFrame(loop)})();
})();
