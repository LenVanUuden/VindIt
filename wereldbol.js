/* =====================================================================
   Vined It – draaibare wereldbol ("Mijn wijnwereld")
   Horizontaal draaien, licht kantelen (±35°), knijpen om in te zoomen,
   tik op een land. d3-geo en de landdata (globe.js) worden pas geladen
   als de wereldbol in beeld komt.
   ===================================================================== */
const GSTATE={lam:-12,phi:-30,z:1,spun:false};
let GLOBE_READY=null,GFEAT=null;
function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function globeLibs(){
  if(!GLOBE_READY)GLOBE_READY=(async()=>{
    if(!(window.d3&&d3.geoOrthographic)){
      await loadScript('https://cdn.jsdelivr.net/npm/d3-array@3.2.4/dist/d3-array.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/dist/d3-geo.min.js');
    }
    if(typeof GLOBE==='undefined')await loadScript('globe.js');
    const name={};for(const [n,id] of Object.entries(MAPS.ISO))name[id]=n;
    GFEAT=GLOBE.map(c=>{
      const f={type:'Feature',id:c.id,properties:{name:name[c.id]||''},geometry:{type:'MultiPolygon',coordinates:c.p}};
      // Ringen die "binnenstebuiten" staan (na vereenvoudiging) omdraaien
      if(d3.geoArea(f)>2*Math.PI)f.geometry.coordinates=c.p.map(poly=>poly.map(r=>r.slice().reverse()));
      f.properties.c=d3.geoCentroid(f);
      return f;
    });
  })().catch(e=>{GLOBE_READY=null;throw e});
  return GLOBE_READY;
}

/* Lerennerf voor de zee (één keer gemaakt) */
let GRAIN=null;
function grain(){
  if(GRAIN)return GRAIN;
  const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d'),im=g.createImageData(96,96);
  for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=Math.random()<.5?40:0}
  g.putImageData(im,0,0);GRAIN=g.createPattern(c,'repeat');return GRAIN;
}
function globeHTML(){
  return `<div class="gwrap"><div class="gfall">${worldSVG(MAPS.world,false)}</div><canvas class="globe" aria-label="Wereldbol met je wijnlanden. Sleep om te draaien, knijp om in te zoomen."></canvas>
    <div class="gctl"><button class="gbtn" data-gz="-1" aria-label="Uitzoomen">−</button><button class="gbtn" data-gz="0" aria-label="Terug naar Europa">${I('globe')}</button><button class="gbtn" data-gz="1" aria-label="Inzoomen">+</button></div></div>`;
}

function initGlobe(wrap){
  if(!wrap)return;
  let tries=0;
  const wait=()=>{if(!wrap.isConnected){if(++tries<120)requestAnimationFrame(wait);return}start()};
  const start=()=>globeLibs().then(()=>{if(wrap.isConnected)runGlobe(wrap)}).catch(()=>{/* geen verbinding: de platte kaart blijft staan */});
  wait();
}

function runGlobe(wrap){
  const cv=wrap.querySelector('canvas.globe'),ctx=cv.getContext('2d');
  wrap.classList.add('live');
  const cnt={};cards.forEach(c=>{const id=MAPS.ISO[c.land];if(id)cnt[id]=(cnt[id]||0)+1});
  const max=Math.max(1,...Object.values(cnt));
  const pins=cards.map(cardPin).filter(Boolean).map(p=>[p[1],p[0]]);
  let W=0,H=0,R=0,dpr=1;
  const proj=d3.geoOrthographic().clipAngle(90).precision(.35);
  const path=d3.geoPath(proj,ctx),grat=d3.geoGraticule10();
  const size=()=>{const b=cv.getBoundingClientRect();dpr=Math.min(2.5,window.devicePixelRatio||1);W=b.width;H=b.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);R=Math.min(W,H)/2-6};
  size();
  let dirty=true,vel=0,idle=!GSTATE.spun;const P=new Map();
  const draw=()=>{
    const z=GSTATE.z,r=R*z;
    const gold=ctx.createLinearGradient(W/2-r,H/2-r,W/2+r,H/2+r);gold.addColorStop(0,'#F0D58C');gold.addColorStop(.45,'#C9A253');gold.addColorStop(.55,'#E9CC7E');gold.addColorStop(1,'#9C7A30');
    proj.translate([W/2,H/2]).scale(r).rotate([GSTATE.lam,GSTATE.phi]);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    // gloed rond de bol
    const glow=ctx.createRadialGradient(W/2,H/2,r*.92,W/2,H/2,r*1.12);glow.addColorStop(0,'rgba(201,162,83,.38)');glow.addColorStop(1,'rgba(201,162,83,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(W/2,H/2,r*1.12,0,7);ctx.fill();
    // zee: bruin leer met nerf
    const sea=ctx.createRadialGradient(W/2-r*.35,H/2-r*.4,r*.1,W/2,H/2,r);sea.addColorStop(0,'#7A4426');sea.addColorStop(.65,'#4A2414');sea.addColorStop(1,'#26110A');
    ctx.beginPath();path({type:'Sphere'});ctx.fillStyle=sea;ctx.fill();
    ctx.save();ctx.clip();ctx.globalAlpha=.35;ctx.fillStyle=grain();ctx.fillRect(0,0,W,H);ctx.restore();
    ctx.beginPath();path(grat);ctx.strokeStyle='rgba(201,162,83,.22)';ctx.lineWidth=.6;ctx.setLineDash([2,3]);ctx.stroke();ctx.setLineDash([]);
    // landen
    for(const f of GFEAT){
      const n=cnt[f.id]||0,wine=!!f.properties.name;
      ctx.beginPath();path(f);
      if(n){ctx.fillStyle=gold;ctx.globalAlpha=.6+.4*Math.min(1,n/Math.max(4,max))}else ctx.fillStyle=wine?'#F2E5C6':'#CDB990';
      ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=n?'#5A3A12':'rgba(74,36,20,.75)';ctx.lineWidth=n||wine?.8:.45;ctx.stroke();
    }
    // speldjes van je kaarten
    const ctr=[-GSTATE.lam,-GSTATE.phi];
    ctx.fillStyle='#7A1E2C';ctx.strokeStyle='#F0D58C';ctx.lineWidth=1.4;
    for(const ll of pins){if(d3.geoDistance(ll,ctr)>1.5)continue;const p=proj(ll);if(!p)continue;ctx.beginPath();ctx.arc(p[0],p[1],Math.min(5,2.4+z*.35),0,7);ctx.fill();ctx.stroke()}
    // namen van wijnlanden bij inzoomen
    if(z>=2.2){ctx.font=`600 ${Math.min(13,8+z)}px system-ui,sans-serif`;ctx.textAlign='center';
      for(const f of GFEAT){if(!f.properties.name)continue;const c=f.properties.c;if(d3.geoDistance(c,ctr)>1.3)continue;const p=proj(c);if(!p||p[0]<0||p[1]<0||p[0]>W||p[1]>H)continue;
        ctx.lineWidth=3;ctx.strokeStyle='rgba(26,20,14,.75)';ctx.strokeText(f.properties.name,p[0],p[1]+4);ctx.fillStyle=cnt[f.id]?'#F6E2A8':'#F4EAD6';ctx.fillText(f.properties.name,p[0],p[1]+4)}}
    // glans
    const sh=ctx.createRadialGradient(W/2-r*.45,H/2-r*.5,0,W/2-r*.45,H/2-r*.5,r*1.1);sh.addColorStop(0,'rgba(255,255,255,.22)');sh.addColorStop(.5,'rgba(255,255,255,.04)');sh.addColorStop(1,'rgba(0,0,0,.18)');
    ctx.beginPath();path({type:'Sphere'});ctx.fillStyle=sh;ctx.fill();
    // gouden rand, als de meridiaanring van een oude globe
    ctx.beginPath();ctx.arc(W/2,H/2,r+1.5,0,7);ctx.strokeStyle=gold;ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.arc(W/2,H/2,r+4.2,0,7);ctx.strokeStyle='rgba(42,16,10,.85)';ctx.lineWidth=1.2;ctx.stroke();
  };
  const clampPhi=v=>Math.max(-35,Math.min(35,v));
  const loop=()=>{
    if(!cv.isConnected)return;
    if(idle&&!reduced){GSTATE.lam+=.08;dirty=true}
    if(Math.abs(vel)>.01&&!P.size){GSTATE.lam+=vel;vel*=.9;dirty=true}
    if(dirty){draw();dirty=false}
    requestAnimationFrame(loop);
  };
  const stopIdle=()=>{idle=false;GSTATE.spun=true};
  // ---- bediening: slepen, knijpen, tikken ----
  let g0=null,tap=null;
  const degPx=()=>180/(Math.PI*R*GSTATE.z);
  cv.addEventListener('pointerdown',e=>{
    e.stopPropagation();stopIdle();vel=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}
    P.set(e.pointerId,{x:e.clientX,y:e.clientY,t:performance.now()});
    if(P.size===1)tap={x:e.clientX,y:e.clientY,t:performance.now()};else tap=null;
    if(P.size===2){const [a,b]=[...P.values()];g0={d:Math.hypot(a.x-b.x,a.y-b.y)||1,z:GSTATE.z}}
  });
  cv.addEventListener('pointermove',e=>{
    const p=P.get(e.pointerId);if(!p)return;e.stopPropagation();
    if(P.size===1){const dx=e.clientX-p.x,dy=e.clientY-p.y,k=degPx();
      GSTATE.lam+=dx*k;GSTATE.phi=clampPhi(GSTATE.phi-dy*k);vel=Math.max(-2.5,Math.min(2.5,dx*k*.35));
      if(tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>6)tap=null}
    p.x=e.clientX;p.y=e.clientY;p.t=performance.now();
    if(P.size===2&&g0){const [a,b]=[...P.values()];GSTATE.z=Math.max(1,Math.min(10,g0.z*Math.hypot(a.x-b.x,a.y-b.y)/g0.d))}
    dirty=true;
  });
  const end=e=>{
    if(!P.has(e.pointerId))return;e.stopPropagation();P.delete(e.pointerId);
    if(P.size<2)g0=null;
    if(P.size===1){vel=0;const q=[...P.values()][0];q.t=performance.now()}
    if(tap&&e.type==='pointerup'&&performance.now()-tap.t<450){
      const b=cv.getBoundingClientRect(),ll=proj.invert([e.clientX-b.left,e.clientY-b.top]);
      if(ll&&d3.geoDistance(ll,[-GSTATE.lam,-GSTATE.phi])<1.57){const f=GFEAT.find(f=>f.properties.name&&d3.geoContains(f,ll));if(f){vel=0;openWorldLand(f.properties.name)}}
    }
    tap=null;
  };
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  // bladeren met vegen niet laten afgaan op de bol
  ['touchstart','touchmove','touchend'].forEach(t=>cv.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
  cv.addEventListener('click',e=>e.stopPropagation());
  cv.addEventListener('wheel',e=>{e.preventDefault();stopIdle();GSTATE.z=Math.max(1,Math.min(10,GSTATE.z*Math.exp(-e.deltaY*.0015)));dirty=true},{passive:false});
  wrap.querySelectorAll('[data-gz]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();stopIdle();const k=+b.dataset.gz;
    if(k===0){GSTATE.lam=-12;GSTATE.phi=-30;GSTATE.z=1.6;vel=0}else GSTATE.z=Math.max(1,Math.min(10,GSTATE.z*(k>0?1.6:1/1.6)));dirty=true}));
  const ro=new ResizeObserver(()=>{if(!cv.isConnected){ro.disconnect();return}size();dirty=true});ro.observe(cv);
  loop();
}
