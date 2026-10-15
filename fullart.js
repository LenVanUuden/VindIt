/* =====================================================================
   Vined It – Full Art vanaf Rare
   Rare       : groot papieren etiket op zilverglitter, kantelt langzaam
   Super Rare : groot etiket op goudglitter, een fles ervoor die zacht wiegt
                (met schaduw op het etiket)
   Ultra      : nachtelijke streek met het landmark van de regio, noorderlicht,
                een open fles waarvan de kurk langzaam op en neer gaat, en een
                kantelend etiket
   Common houdt de reisposter. Legendes krijgen later een eigen tekening.
   Alle maten in cqw (procent van de kaartbreedte), zodat het in de sleeve
   en groot geopend hetzelfde is.
   ===================================================================== */
(function(){
const css=`
.fart{position:absolute;inset:0;z-index:0;overflow:hidden;container-type:size}
.fart .fl{position:absolute;inset:0}
.fart .fglit{background:radial-gradient(circle,var(--gc) 0 .45cqw,transparent .7cqw) 0 0/3.2cqw 3.6cqw,radial-gradient(circle,#fff 0 .3cqw,transparent .55cqw) 1.4cqw 1cqw/4.6cqw 5.2cqw,radial-gradient(circle at 50% 42%,var(--gm),var(--gb) 72%)}
.fart .fvig{background:radial-gradient(ellipse at 50% 45%,transparent 40%,rgba(0,0,0,.5))}
.fart .fdust{background-image:radial-gradient(circle,rgba(255,226,150,.95) 0 .3cqw,transparent .55cqw),radial-gradient(circle,rgba(255,240,200,.8) 0 .2cqw,transparent .45cqw);background-size:4cqw 4.6cqw,2.6cqw 3.2cqw;mix-blend-mode:screen;opacity:.5}
.fart .fprism{background:repeating-conic-gradient(from 10deg at 50% 42%,rgba(255,140,190,.35) 0 6deg,rgba(255,220,120,.3) 6deg 12deg,rgba(140,255,200,.3) 12deg 18deg,rgba(120,190,255,.35) 18deg 24deg,rgba(200,150,255,.35) 24deg 30deg);mix-blend-mode:screen;opacity:.14}
.fart .fpaper{position:absolute;perspective:300cqw}
.fart .fpap{filter:drop-shadow(.3cqw .3cqw 0 #EDE2C8) drop-shadow(.3cqw .3cqw 0 #DCCDAA) drop-shadow(.3cqw .4cqw 0 #C8B892) drop-shadow(3.5cqw 5.5cqw 5cqw rgba(0,0,0,.55))}
.fart .fpin{position:relative;border-radius:1.8cqw;overflow:hidden}
.fart .fpin>svg:first-child{display:block;width:100%;height:auto}
.fart .fgr{position:absolute;inset:0;pointer-events:none}
.fart .fglint{position:absolute;width:7.5cqw;height:7.5cqw;margin:-3.75cqw;z-index:8;background:radial-gradient(circle,#fff 0 .5cqw,transparent .9cqw),linear-gradient(90deg,transparent 46%,#fff 50%,transparent 54%),linear-gradient(0deg,transparent 46%,#fff 50%,transparent 54%);filter:drop-shadow(0 0 1cqw #fff);animation:fatw 2.6s ease-in-out infinite alternate}
@keyframes fatw{0%{opacity:.15;transform:scale(.5)}100%{opacity:1;transform:scale(1.1)}}
@keyframes fasway{0%{transform:rotateY(-9deg) rotateX(4deg) rotate(-2deg)}100%{transform:rotateY(9deg) rotateX(-3deg) rotate(1.5deg)}}
.fart .fsway{animation:fasway 3.2s ease-in-out infinite alternate;transform-style:preserve-3d}
.fart .fsway.s2{animation-duration:3.8s;animation-delay:-1.3s}
@keyframes farock{0%{transform:rotate(-2.6deg)}100%{transform:rotate(2.6deg)}}
.fart .frock{transform-origin:50% 96%;animation:farock 5.5s ease-in-out infinite alternate}
.fart .fshad{transform-origin:50% 100%;animation:farock 5.5s ease-in-out infinite alternate}
@keyframes facork{0%,20%{transform:translateY(0)}80%,100%{transform:translateY(-22px)}}
.fart .fcork{animation:facork 7s ease-in-out infinite alternate}
@keyframes fatwf{0%{opacity:.25}100%{opacity:.9}}
.fart .fsa{animation:fatwf 3.1s ease-in-out infinite alternate}.fart .fsb{animation:fatwf 2.3s ease-in-out infinite alternate-reverse}
.fart .fstars{-webkit-mask:linear-gradient(#000 26%,transparent 46%);mask:linear-gradient(#000 26%,transparent 46%)}
.fart .fbot{position:absolute;z-index:5;overflow:visible}
@media (prefers-reduced-motion: reduce){.fart *{animation:none!important}}
/* kaartlijst in de klassekleur, regenboogstempel blijft */
.card.fa.fa.t-rare,.mini.fa.t-rare{background:var(--silverfoil);animation:none}
.card.fa.fa.t-superrare,.mini.fa.t-superrare{background:var(--gilt);animation:none}
.card.fa.fa.t-ultra,.mini.fa.t-ultra{background:conic-gradient(from 0deg,#C6E6FF,#FFFFFF,#B5C8FF,#E0D2FF,#C6FFF0,#FFFFFF,#C6E6FF);animation:none}
.card.fa.fa.t-ultra{box-shadow:0 0 0 1px #2B4A7A,0 0 26px rgba(120,170,255,.5),0 20px 40px rgba(0,0,0,.5)}
.card.fa.fa.t-superrare{box-shadow:0 0 0 1px #6B4A1A,0 0 24px rgba(242,198,94,.4),0 20px 40px rgba(0,0,0,.5)}
.card.fa.fa.t-rare{box-shadow:0 0 0 1px #5A636A,0 0 20px rgba(220,230,240,.3),0 20px 40px rgba(0,0,0,.5)}
.fa.t-rare .fashine,.fa.t-superrare .fashine,.fa.t-ultra .fashine{opacity:.12}
.fa.t-rare .glare,.fa.t-superrare .glare,.fa.t-ultra .glare,.fa.t-rare .fasweep,.fa.t-superrare .fasweep,.fa.t-ultra .fasweep,.fa.t-rare .fatw,.fa.t-superrare .fatw,.fa.t-ultra .fatw{display:none}
/* groot geopend: gegevens op één regel, zodat fles en etiket zichtbaar blijven */
.card.fa.t-rare .facts,.card.fa.t-superrare .facts,.card.fa.t-ultra .facts{display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;gap:0 6px;border:0;margin-top:3px;padding-top:0;font-size:10.5px;text-align:center}
.card.fa.t-rare .uinfo,.card.fa.t-superrare .uinfo,.card.fa.t-ultra .uinfo{background:linear-gradient(rgba(10,6,4,0),rgba(10,6,4,.86) 55%);padding-top:26px}
.card.fa.t-rare .facts dt,.card.fa.t-superrare .facts dt,.card.fa.t-ultra .facts dt{display:none}
.card.fa.t-rare .facts div,.card.fa.t-superrare .facts div,.card.fa.t-ultra .facts div{display:block;padding:0}
.card.fa.t-rare .facts div+div::before,.card.fa.t-superrare .facts div+div::before,.card.fa.t-ultra .facts div+div::before{content:"· ";opacity:.7}
.card.fa.t-rare .facts dd,.card.fa.t-superrare .facts dd,.card.fa.t-ultra .facts dd{display:inline;margin:0}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();

let FAN=0;
const faRnd=seed=>{let x=0;for(const ch of seed)x=(x*31+ch.charCodeAt(0))>>>0;x=x||1;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}};
/* Scheurtjes per wijn: een gescheurde hoek (of niet), 1–2 inkepingen, soms een vouwlijntje */
function faTear(seed){
  const r=faRnd(seed),P=[],F=[];
  const corner=Math.floor(r()*5);
  const nick=()=>({side:Math.floor(r()*4),pos:15+r()*70,d:1+r()*1.6,w:2+r()*3});
  const nicks=[nick()];if(r()>.4)nicks.push(nick());
  const sides=[[[0,0],[100,0]],[[100,0],[100,100]],[[100,100],[0,100]],[[0,100],[0,0]]];
  for(let s=0;s<4;s++){
    const [A,B]=sides[s];
    if(corner===s){const k=5+r()*5,j=[];for(let i=0;i<=5;i++){const t=i/5;
      const px=A[0]+(s===1?-k*(1-t):s===3?k*(1-t):0)+(s===0?k*t:s===2?-k*t:0),py=A[1]+(s===0?k*(1-t):s===2?-k*(1-t):0)+(s===1?k*t:s===3?-k*t:0);
      j.push([px+(r()-.5)*1.2,py+(r()-.5)*1.2])}P.push(...j);F.push(j)}
    else P.push(A);
    for(const nk of nicks.filter(n=>n.side===s).sort((a,b)=>a.pos-b.pos)){
      const t0=nk.pos/100,ln=[],dx=B[0]-A[0],dy=B[1]-A[1],nx=s===1?-1:s===3?1:0,ny=s===0?1:s===2?-1:0;
      for(let i=0;i<=4;i++){const t=t0+(i/4-.5)*nk.w/100,dep=(i===0||i===4)?0:nk.d*(.6+r()*.6);ln.push([A[0]+dx*t+nx*dep,A[1]+dy*t+ny*dep])}
      P.push(...ln);F.push(ln);
    }
  }
  const crease=r()>.3?{x:20+r()*60,y:10+r()*70,a:r()*6.28,l:6+r()*10}:null;
  return {poly:'polygon('+P.map(([x,y])=>`${x.toFixed(1)}% ${y.toFixed(1)}%`).join(',')+')',fib:F,crease};
}
/* Groot etiket als echt papier: dikte, schaduw, scheurtjes, glans */
function faPaper(c,{l,top,w,z,sway,ry=0,rx=0,rot=0}){
  const T=faTear(`${c.maker||''}|${c.naam||''}`);
  return `<div class="fpaper" style="left:${l}%;top:${top}%;width:${w}%;z-index:${z||6}"><div class="${sway?'fsway '+sway:''}" style="${sway?'':`transform:rotateY(${ry}deg) rotateX(${rx}deg) rotate(${rot}deg)`}"><div class="fpap">
    <div class="fpin" style="clip-path:${T.poly}">${drawnLabel(c)}
     <div class="fgr" style="background:radial-gradient(circle,rgba(110,80,30,.10) 0 .2cqw,transparent .35cqw) 0 0/1cqw 1cqw,radial-gradient(ellipse at 20% 80%,rgba(160,120,60,.18),transparent 40%),radial-gradient(ellipse at 85% 15%,rgba(160,120,60,.12),transparent 35%)"></div>
     <div class="fgr" style="background:linear-gradient(118deg,rgba(255,255,255,0) 22%,rgba(255,255,255,.5) 38%,rgba(255,255,255,0) 50%);mix-blend-mode:soft-light"></div>
     <div class="fgr" style="box-shadow:inset 0 0 6cqw rgba(120,85,35,.3),inset 0 0 0 .3cqw rgba(255,255,255,.5)"></div>
     <svg class="fgr" viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%">${T.fib.map(p=>`<polyline points="${p.map(q=>q.map(v=>v.toFixed(1)).join(' ')).join(' ')}" fill="none" stroke="#fff" stroke-width=".9" stroke-opacity=".9"/>`).join('')}${T.crease?`<path d="M${T.crease.x.toFixed(1)} ${T.crease.y.toFixed(1)} l${(Math.cos(T.crease.a)*T.crease.l).toFixed(1)} ${(Math.sin(T.crease.a)*T.crease.l).toFixed(1)}" stroke="rgba(110,80,30,.3)" stroke-width=".4"/>`:''}</svg>
    </div></div></div></div>`;
}
const FA_BOTTLE='M56 4h28v100c0 26 40 38 40 76v214c0 9-6 14-14 14H30c-8 0-14-5-14-14V180c0-38 40-50 40-76z';
/* Fles van glas met het etiket eromheen gebogen */
function faBottle(c,t,{x,y,h,moon,open,cls}){
  const id='fb'+(++FAN),cap={superrare:['#5A3E0C','#FFF0C4','#C9973C','#8A6420'],ultra:['#0E2148','#F0F8FF','#6E9AD8','#28487E']}[t]||['#4A535A','#F4F6F8','#AEB7BE','#6E777E'];
  const hi=moon?'#D8E8FF':'#FFFFFF',g=moon?['#03080A','#0C1F1A','#1F4436','#4E8670','#163327','#0A1712']:['#020604','#0D2016','#22432E','#5C9370','#183522','#08140D'];
  const lab=drawnLabel(c).replace('<svg ',`<svg x="18" y="214" width="104" height="146" preserveAspectRatio="xMidYMid slice" `);
  const nick=faRnd(c.naam||'x')()>.5;
  return `<svg viewBox="0 0 140 420" class="fbot ${cls||''}" style="left:${x}%;top:${y}%;height:${h}%">
  <defs>
   <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset=".08" stop-color="${g[1]}"/><stop offset=".2" stop-color="${g[2]}"/><stop offset=".3" stop-color="${g[3]}"/><stop offset=".36" stop-color="${g[2]}"/><stop offset=".6" stop-color="${g[4]}"/><stop offset=".84" stop-color="${g[5]}"/><stop offset=".93" stop-color="${g[2]}"/><stop offset="1" stop-color="${g[0]}"/></linearGradient>
   <linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#7FD0A0" stop-opacity=".35"/></linearGradient>
   <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="${cap[0]}"/><stop offset=".22" stop-color="${cap[3]}"/><stop offset=".34" stop-color="${cap[1]}"/><stop offset=".46" stop-color="${cap[2]}"/><stop offset=".8" stop-color="${cap[3]}"/><stop offset="1" stop-color="${cap[0]}"/></linearGradient>
   <linearGradient id="${id}w" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset=".16" stop-color="#000" stop-opacity=".15"/><stop offset=".3" stop-color="#fff" stop-opacity=".18"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient>
   <clipPath id="${id}k"><path d="M18 226 Q70 236 122 226 V346 Q70 356 18 346z"/></clipPath>
   <clipPath id="${id}b"><path d="${FA_BOTTLE}"/></clipPath>
   <clipPath id="${id}ck"><rect x="0" y="-80" width="140" height="84"/></clipPath>
   <filter id="${id}f1"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="${id}f2"><feGaussianBlur stdDeviation="4"/></filter>
   <radialGradient id="${id}s"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
   <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <g transform="translate(0 820) scale(1 -1)" opacity=".28"><path d="M30 408h80c8 0 14-5 14-14V330H16v64c0 9 6 14 14 14z" fill="url(#${id}g)"/></g>
  <ellipse cx="70" cy="410" rx="66" ry="9" fill="url(#${id}s)"/>
  <g clip-path="url(#${id}b)">
   <rect width="140" height="420" fill="url(#${id}g)"/><rect width="140" height="420" fill="url(#${id}v)"/>
   ${open?`<rect x="51" y="3" width="38" height="8" rx="2" fill="${hi}" opacity=".18"/><rect x="52" y="16" width="36" height="62" fill="url(#${id}c)"/><path d="M52 16 l4 3 4 -3 4 3 4 -3 4 3 4 -3 4 3 4 -3 4 3" stroke="#000" stroke-opacity=".3" fill="none"/>`:`<rect x="52" y="0" width="36" height="78" fill="url(#${id}c)"/>`}
   ${[14,26,38,50,62].map(yy=>`<path d="M52 ${yy+(open?6:0)} q18 2 36 0" stroke="#000" stroke-opacity=".18" stroke-width=".8" fill="none"/>`).join('')}
   <path d="M52 70 q18 4 36 0 v8 q-18 4 -36 0z" fill="#000" opacity=".3"/>
   <g clip-path="url(#${id}k)">${lab}</g>
   <path d="M18 226 Q70 236 122 226 V346 Q70 356 18 346z" fill="url(#${id}w)"/>
   <path d="M18 226 Q70 236 122 226" stroke="#fff" stroke-opacity=".5" stroke-width=".8" fill="none"/>
   <path d="M18 346 Q70 356 122 346" stroke="#000" stroke-opacity=".35" stroke-width="1" fill="none"/>
   ${nick?`<path d="M106 343 l4 -6 3 4 3 -5 4 7" fill="${g[1]}" opacity=".85"/>`:`<path d="M20 232 l5 1 -3 4 4 2 -6 1z" fill="${g[1]}" opacity=".85"/>`}
   <path d="M38 190 Q36 290 38 395" stroke="${hi}" stroke-opacity=".75" stroke-width="7" stroke-linecap="round" fill="none" filter="url(#${id}f1)"/>
   <path d="M40 200 Q39 290 40 380" stroke="#fff" stroke-opacity=".95" stroke-width="2" stroke-linecap="round" fill="none"/>
   <path d="M46 150 Q56 124 64 112" stroke="${hi}" stroke-opacity=".7" stroke-width="5" stroke-linecap="round" fill="none" filter="url(#${id}f1)"/>
   <path d="M62 84 V104" stroke="#fff" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round"/>
   <path d="M104 190 Q106 290 104 396" stroke="${hi}" stroke-opacity=".28" stroke-width="5" fill="none" filter="url(#${id}f2)"/>
   <path d="M118 200 Q120 300 118 396" stroke="${hi}" stroke-opacity=".35" stroke-width="1.4" fill="none"/>
   <ellipse cx="70" cy="404" rx="40" ry="6" fill="${moon?'#9FD8FF':'#9FE0B0'}" opacity=".25" filter="url(#${id}f1)"/>
   <rect width="140" height="420" fill="url(#${id}r)" opacity=".5"/>
  </g>
  <path d="${FA_BOTTLE}" fill="none" stroke="${hi}" stroke-opacity=".22" stroke-width="1"/>
  ${open?`<g clip-path="url(#${id}ck)"><g class="fcork"><rect x="58" y="-30" width="24" height="44" rx="3" fill="#C8A276"/><rect x="58" y="-30" width="24" height="44" rx="3" fill="url(#${id}w)" opacity=".5"/>${[-24,-16,-8,0].map(yy=>`<path d="M60 ${yy} h20" stroke="#8E6A42" stroke-opacity=".5" stroke-width=".7"/>`).join('')}<circle cx="64" cy="-20" r="1" fill="#7A5634" opacity=".6"/><circle cx="74" cy="-6" r=".9" fill="#7A5634" opacity=".6"/><ellipse cx="70" cy="-30" rx="12" ry="2" fill="#D9B88E"/></g></g>`:`<ellipse cx="70" cy="2" rx="16" ry="2.4" fill="${cap[1]}" opacity=".9"/>`}
  </svg>`;
}
const faGlints=(pts)=>pts.map(([x,y],i)=>`<i class="fglint" style="left:${x}%;top:${y}%;animation-delay:${(-i*.83%2.6).toFixed(2)}s"></i>`).join('');

function faArt(c){
  const t=c.rar;
  if(t==='rare')return `<div class="fart">
    <div class="fl fglit" style="--gc:#C9D1D6;--gm:#C9D1D688;--gb:#3E474E"></div><div class="fl fvig"></div>
    ${faPaper(c,{l:15,top:9,w:70,sway:'s1'})}${faGlints([[18,22],[82,50],[70,14]])}</div>`;
  if(t==='superrare'){
    const sil=`<svg viewBox="0 0 140 420" style="width:100%;height:100%;filter:blur(1.6cqw)"><path d="${FA_BOTTLE}" fill="#1A0E02" opacity=".55"/></svg>`;
    return `<div class="fart">
    <div class="fl fglit" style="--gc:#E9C46A;--gm:#E9C46A88;--gb:#4A2E08"></div>
    <div class="fl" style="background:radial-gradient(ellipse at 50% 80%,rgba(255,226,150,.5),transparent 55%),radial-gradient(ellipse at 50% 45%,transparent 45%,rgba(0,0,0,.45))"></div>
    ${faPaper(c,{l:9,top:6,w:82,z:3,ry:7,rx:-2,rot:-2})}
    <div style="position:absolute;z-index:4;left:43%;top:6%;height:82%;width:34%"><div class="fshad" style="width:100%;height:100%">${sil}</div></div>
    <div class="frock" style="position:absolute;inset:0;z-index:5">${faBottle(c,t,{x:30,y:13,h:83})}</div>
    ${faGlints([[14,28],[86,34],[66,72],[20,60]])}</div>`;
  }
  if(t==='ultra'){
    const kind=(typeof artSpec==='function'?artSpec(areaOf(c)).landmark:'village')||'village';
    const MS='';
    return `<div class="fart">
    <div class="fl" style="background:linear-gradient(#040A1A,#142A58 48%,#2C5694)"></div>
    <div class="fl" style="background:linear-gradient(168deg,transparent 8%,rgba(110,255,200,.42) 18%,rgba(130,190,255,.4) 26%,rgba(210,150,255,.34) 33%,transparent 44%)"></div>
    <div class="fl" style="background:linear-gradient(176deg,transparent 22%,rgba(110,255,200,.18) 28%,transparent 36%)"></div>
    <div class="fl fstars fsa" style="background-image:radial-gradient(circle,#fff 0 .32cqw,transparent .5cqw);background-size:9.5cqw 11cqw;background-position:1.8cqw 1cqw"></div>
    <div class="fl fstars fsb" style="background-image:radial-gradient(circle,#cfe6ff 0 .22cqw,transparent .4cqw);background-size:6cqw 6.7cqw;background-position:3.9cqw 3.2cqw"></div>
    <div class="fl" style="background:radial-gradient(circle at 84% 13%,#F6FAFF 0 4%,rgba(200,225,255,.35) 6%,transparent 16%)"></div>
    <div style="position:absolute;left:8%;top:20%;width:86%;z-index:3">${faLandmark(kind)}</div>
    <div class="fl" style="z-index:4;background:radial-gradient(ellipse at 50% 30%,transparent 45%,rgba(0,0,0,.5))"></div>
    ${faBottle(c,t,{x:0,y:33,h:64,moon:true,open:true})}
    ${faPaper(c,{l:57,top:43,w:37,sway:'s2'})}
    <div class="fl fprism" style="z-index:7"></div>${faGlints([[30,8],[72,12],[92,56],[14,30]])}</div>`;
  }
  return '';
}

/* ---------- Landmarks bij nacht, in detail (220 × 130, grond op y≈108) ---------- */
function faLandmark(kind){
  const id='fl'+(++FAN),W=`url(#${id}w)`,R=`url(#${id}r)`,LIT='#FFD27A',DK='#2A3F6A',TREE='#0F1E3C';
  const defs=`<defs><radialGradient id="${id}gl"><stop offset="0" stop-color="#FFE7A0"/><stop offset="1" stop-color="#FFB040" stop-opacity="0"/></radialGradient>
   <linearGradient id="${id}w" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5D7BAA"/><stop offset="1" stop-color="#2E4777"/></linearGradient>
   <linearGradient id="${id}r" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2C4270"/><stop offset="1" stop-color="#162848"/></linearGradient>
   <linearGradient id="${id}m" x1="1" x2="0"><stop offset="0" stop-color="#9FB8E0" stop-opacity=".35"/><stop offset=".55" stop-color="#9FB8E0" stop-opacity="0"/></linearGradient>
   <linearGradient id="${id}wh" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C9D8F0"/><stop offset="1" stop-color="#7F98C4"/></linearGradient></defs>`;
  const rect=(x,y,w,h,f)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f||W}"/>`;
  const moon=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}m)"/>`;
  const poly=(pts,f)=>`<polygon points="${pts}" fill="${f||R}"/>`;
  const win=(x,y,w=6,h=10,on=true,arch=false)=>(on?`<circle cx="${x+w/2}" cy="${y+h/2}" r="${w*1.2}" fill="url(#${id}gl)" opacity=".55"/>`:'')+
    (arch?`<path d="M${x} ${y+h} V${y+w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 V${y+h}z" fill="${on?LIT:DK}"/>`:`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx=".8" fill="${on?LIT:DK}"/>`)+
    (w>4?`<path d="M${x+w/2} ${y+(arch?w/2:0)} V${y+h} M${x} ${y+h/2} h${w}" stroke="#2E4777" stroke-width=".6"/>`:'');
  const poplar=(x,h)=>`<path d="M${x} 108 q-6 -${h*.55} 0 -${h} q6 ${h*.45} 0 ${h}z" fill="${TREE}"/>`;
  const cypress=(x,h)=>`<path d="M${x} 108 q-4 -${h*.6} 0 -${h} q4 ${h*.4} 0 ${h}z" fill="${TREE}"/>`;
  const pine=(x,h)=>`<path d="M${x} ${108-h} l-9 ${h*.45} h5 l-8 ${h*.35} h6 l-7 ${h*.2} h26 l-7 -${h*.2} h6 l-8 -${h*.35} h5z" fill="${TREE}"/>`;
  const oak=(x,s)=>`<path d="M${x} 108 v-${10*s}" stroke="${TREE}" stroke-width="${2*s}"/><ellipse cx="${x}" cy="${108-16*s}" rx="${13*s}" ry="${9*s}" fill="${TREE}"/>`;
  const vines=`<path d="M0 108 H220 V130 H0z" fill="#0E1C3A"/>`+Array.from({length:9},(_,i)=>`<path d="M110 108 L${-40+i*37} 130" stroke="#26406E" stroke-width="1.2"/>`).join('');
  const door=(x,y=108,w=10,h=14)=>`<circle cx="${x}" cy="${y-h/2}" r="${h}" fill="url(#${id}gl)" opacity=".45"/><path d="M${x-w/2} ${y} v-${h-w/2} a${w/2} ${w/2} 0 0 1 ${w} 0 v${h-w/2}z" fill="#FFC864"/>`;
  const cren=(x,y,w,n,h=3)=>Array.from({length:n},(_,i)=>rect(x+i*(w/n),y-h,w/n*.55,h)).join('');
  let g='';
  switch(kind){
   case 'chateau':
    g=[12,24,196,208].map((x,i)=>poplar(x,48+i*4)).join('')
     +rect(44,40,26,68)+poly('41,41 57,8 73,41')+rect(150,40,26,68)+poly('147,41 163,8 179,41')
     +rect(70,52,80,56)+poly('66,53 76,30 144,30 154,53')
     +[84,103,122,137].map(x=>`<path d="M${x-5} 44 v-8 l5 -5 l5 5 v8z" fill="#3A5688"/><rect x="${x-2.5}" y="37" width="5" height="6" fill="${LIT}" opacity=".9"/>`).join('')
     +rect(86,22,5,10,'#22365E')+rect(130,22,5,10,'#22365E')+moon(70,52,80,56)
     +[78,92,106,120,134].flatMap(x=>[60,80].map(y=>win(x,y,6,10,(x+y)%3!==0))).join('')
     +[49,62,155,168].map(x=>win(x,58,5,9,true)+win(x,80,5,9,false)).join('')
     +door(110,108,12,16)+`<path d="M96 108 h28 l3 3 h-34z" fill="#3A5688"/>`;break;
   case 'church':
    g=[18,30,190].map(x=>cypress(x,42)).join('')+oak(205,1)
     +rect(60,58,70,50)+poly('56,59 95,30 134,59')+moon(60,58,70,50)
     +rect(126,30,26,78)+poly('122,31 139,-6 156,31')+`<path d="M139 -6 v-6 M136 -9 h6" stroke="#9FB8E0" stroke-width="1"/>`
     +win(133,40,12,14,true,true)+`<circle cx="139" cy="70" r="6" fill="${LIT}"/><circle cx="139" cy="70" r="10" fill="url(#${id}gl)" opacity=".6"/>`
     +[70,86,102].map(x=>win(x,72,8,16,x!==86,true)).join('')+`<circle cx="95" cy="46" r="5" fill="${LIT}" opacity=".9"/>`
     +rect(160,74,30,34)+poly('157,75 175,58 193,75')+win(166,84,6,8)+win(178,84,6,8,false)
     +rect(30,80,26,28)+poly('27,81 43,66 59,81')+win(37,88,6,8)+door(118,108,9,14);break;
   case 'cathedral':
    g=poplar(14,40)+poplar(206,44)
     +rect(48,26,34,82)+rect(138,26,34,82)+cren(48,26,34,6)+cren(138,26,34,6)
     +rect(82,46,56,62)+poly('80,47 110,18 140,47')+moon(48,26,124,82)
     +`<circle cx="110" cy="66" r="13" fill="url(#${id}gl)" opacity=".8"/><circle cx="110" cy="66" r="9" fill="${LIT}"/>`+Array.from({length:8},(_,i)=>`<path d="M110 66 l${(Math.cos(i*.785)*9).toFixed(1)} ${(Math.sin(i*.785)*9).toFixed(1)}" stroke="#B8862E" stroke-width=".8"/>`).join('')
     +[54,66,144,156].flatMap(x=>[36,62].map(y=>win(x,y,7,16,(x+y)%4!==0,true))).join('')
     +`<path d="M98 108 v-14 l12 -12 l12 12 v14z" fill="#FFC864"/><circle cx="110" cy="98" r="16" fill="url(#${id}gl)" opacity=".45"/>`
     +[44,82,138,176].map(x=>`<path d="M${x} 108 v-40 l-4 6 v34z" fill="#3A5688"/>`).join('');break;
   case 'papal':
    g=cypress(16,40)+cypress(204,46)
     +rect(30,40,120,68)+cren(30,40,120,16)+moon(30,40,120,68)
     +rect(142,10,34,98)+cren(142,10,34,5)+rect(18,26,22,82)+cren(18,26,22,3)
     +`<path d="M159 10 v-6" stroke="#9FB8E0"/><path d="M155 4 l4 -8 l4 8z" fill="#E9C46A"/>`
     +[44,62,80,98,116].map(x=>`<path d="M${x} 108 V60 a6 6 0 0 1 12 0 V108" fill="none" stroke="#3A5688" stroke-width="2"/>`).join('')
     +[48,66,84,102,120].map(x=>win(x,66,5,12,x%36!==12,true)).join('')+[150,162].flatMap(x=>[24,50,76].map(y=>win(x,y,5,10,(x+y)%3!==0,true))).join('')
     +win(24,40,5,10)+door(90,108,12,18);break;
   case 'timber':
    g=[[18,40,48],[62,46,58],[112,42,52],[158,44,46]].map(([x,w,h],i)=>{const top=108-h;return rect(x,top,w,h,`url(#${id}wh)`)+poly(`${x-3},${top+1} ${x+w/2},${top-w*.65} ${x+w+3},${top+1}`)
      +`<path d="M${x} ${top+h*.45} h${w} M${x+w*.33} ${top} v${h} M${x+w*.66} ${top} v${h} M${x} ${top} l${w*.33} ${h*.45} M${x+w} ${top} l-${w*.33} ${h*.45}" stroke="#3A2A20" stroke-width="1.6"/>`
      +win(x+w*.1,top+h*.1,w*.18,h*.22,i%2===0)+win(x+w*.72,top+h*.1,w*.18,h*.22,i!==2)+win(x+w*.1,top+h*.6,w*.18,h*.22,i!==1)+(i===1?door(x+w*.66+3,108,8,13):win(x+w*.72,top+h*.6,w*.18,h*.22,true))
      +`<rect x="${x+w*.08}" y="${top+h*.34}" width="${w*.22}" height="2.5" fill="#B84A4A"/>`}).join('')+moon(18,50,184,58);break;
   case 'walled':
    g=rect(10,72,200,36)+cren(10,72,200,25)+moon(10,72,200,36)
     +[[10,48],[60,40],[150,40],[196,48]].map(([x,h])=>rect(x-2,108-h-20,18,h+20)+poly(`${x-4},${88-h} ${x+7},${66-h} ${x+18},${88-h}`)+win(x+4,96-h,5,8,(x+h)%3!==0,true)).join('')
     +rect(92,54,36,54)+cren(92,54,36,5)+door(110,108,16,24)+[30,46,170,182].map(x=>win(x,82,3,6,x%2===0)).join('');break;
   case 'farmhouse':
    g=[14,26,38,182,194,206].map((x,i)=>cypress(x,40+(i%3)*6)).join('')
     +rect(56,64,96,44)+poly('52,65 104,46 156,65','#5A3A3A')+moon(56,64,96,44)
     +rect(132,34,24,74)+poly('129,35 144,22 159,35','#5A3A3A')+win(140,44,8,10,true,true)
     +[64,80,96,112].map(x=>win(x,72,7,10,x!==96)).join('')
     +[66,84,102].map(x=>`<path d="M${x} 108 v-12 a7 7 0 0 1 14 0 v12" fill="#22365E"/>`).join('')+`<circle cx="91" cy="100" r="9" fill="url(#${id}gl)" opacity=".5"/>`;break;
   case 'castle':
    g=`<path d="M20 108 Q60 78 110 74 Q160 78 200 108z" fill="#1A2C52"/>`+pine(24,30)+pine(196,34)
     +rect(60,58,100,22)+cren(60,58,100,12)
     +rect(92,18,34,60)+cren(92,18,34,5)+moon(92,18,34,60)
     +rect(56,40,18,40)+poly('53,41 65,22 77,41')+rect(146,44,18,36)+poly('143,45 155,28 167,45')
     +win(104,28,6,10,true,true)+win(112,28,6,10,false,true)+win(106,50,7,12)+win(61,52,5,8)+win(151,56,5,8,false)+door(110,80,10,12);break;
   case 'campanile':
    g=cypress(20,44)+cypress(34,36)+cypress(198,44)
     +rect(96,6,24,102)+poly('93,7 108,-12 123,7')+moon(96,6,24,102)
     +[16,26].map(y=>`<path d="M100 ${y+10} v-7 a4 4 0 0 1 8 0 v7z M110 ${y+10} v-7 a4 4 0 0 1 8 0 v7z" fill="${y===16?LIT:DK}"/>`).join('')
     +[50,74].map(y=>win(104,y,8,12,y===74,true)).join('')
     +rect(44,66,52,42)+poly('40,67 70,50 100,67','#5A3A3A')+`<circle cx="70" cy="78" r="5" fill="${LIT}"/>`+door(70,108,10,14)
     +rect(126,72,44,36)+poly('122,73 148,60 174,73','#5A3A3A')+win(134,80,6,9)+win(150,80,6,9,false)+win(160,90,6,9);break;
   case 'bodega':
    g=oak(16,1)+oak(204,1.1)
     +rect(30,62,160,46,`url(#${id}wh)`)+poly('26,63 110,46 194,63','#6A3A2A')+moon(30,62,160,46)
     +`<path d="M98 46 v-14 h24 v14" fill="url(#${id}wh)"/><path d="M104 40 v-5 a6 6 0 0 1 12 0 v5z" fill="#2E4777"/><circle cx="110" cy="37" r="2.5" fill="#E9C46A"/>`
     +[44,72,100,128,156].map(x=>`<path d="M${x} 108 v-22 a10 10 0 0 1 20 0 v22z" fill="${x===100?'#FFC864':'#22365E'}"/>`).join('')+`<circle cx="110" cy="96" r="16" fill="url(#${id}gl)" opacity=".4"/>`
     +[[176,100],[184,100],[180,92]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="5" fill="#5A3A2A" stroke="#2A1A10"/>`).join('');break;
   case 'abbey':
    g=pine(14,32)+pine(206,36)
     +rect(26,58,168,50,`url(#${id}wh)`)+poly('22,59 110,46 198,59','#2C4270')+moon(26,58,168,50)
     +[[72,18],[148,18]].map(([x])=>rect(x-12,26,24,82,`url(#${id}wh)`)+`<path d="M${x-12} 26 q12 -16 24 0z" fill="#3E6A8A"/><ellipse cx="${x}" cy="14" rx="5" ry="6" fill="#3E6A8A"/><path d="M${x} 8 v-6" stroke="#E9C46A"/>`+win(x-4,36,8,12,true,true)).join('')
     +`<path d="M92 46 q18 -26 36 0z" fill="#3E6A8A"/><path d="M110 22 v-6" stroke="#E9C46A"/>`
     +[34,46,92,104,116,170,182].map(x=>win(x,66,6,10,x%3!==1,true)).join('')+[34,46,92,104,116,170,182].map(x=>win(x,86,6,10,x%4===2,true)).join('')+door(110,108,10,14);break;
   case 'windmill':
    g=`<path d="M0 104 H220 V112 H0z" fill="#1C3466"/><path d="M0 108 H220" stroke="#5E8FD8" stroke-opacity=".4"/>`
     +`<path d="M90 104 L96 40 L124 40 L130 104z" fill="${W}"/><path d="M92 42 L110 24 L128 42z" fill="${R}"/>`+rect(86,72,48,3,'#22365E')
     +win(105,52,10,12,true,true)+door(110,104,10,16)
     +`<g transform="rotate(18 110 34)" fill="#22365E" stroke="#9FB8E0" stroke-width=".5"><rect x="108" y="-26" width="4" height="120"/><rect x="50" y="32" width="120" height="4"/><rect x="112" y="-24" width="12" height="54" fill="#33507E"/><rect x="96" y="38" width="12" height="54" fill="#33507E"/><rect x="52" y="22" width="54" height="10" fill="#33507E"/><rect x="114" y="36" width="54" height="10" fill="#33507E"/></g>`
     +rect(150,80,40,24)+poly('147,81 170,64 193,81')+win(158,88,6,8)+win(174,88,6,8,false)+poplar(30,36)+poplar(42,30);break;
   case 'gable':
    g=oak(22,1.3)+oak(198,1.2)
     +rect(40,72,140,36,`url(#${id}wh)`)+poly('36,73 110,58 184,73','#3A3020')+moon(40,72,140,36)
     +`<path d="M90 108 V60 q0 -6 6 -8 q-2 -8 6 -12 q4 -8 8 -10 q4 2 8 10 q8 4 6 12 q6 2 6 8 V108z" fill="url(#${id}wh)"/>`
     +win(104,46,12,10,true,true)+door(110,108,12,18)
     +[50,66,140,156].map(x=>win(x,80,8,14,x!==66)).join('');break;
   case 'barn':
    g=pine(20,34)+pine(200,38)
     +`<path d="M60 108 V66 L76 48 L110 38 L144 48 L160 66 V108z" fill="#7A2A26"/><path d="M60 66 L76 48 L110 38 L144 48 L160 66" fill="none" stroke="#E9E2D0" stroke-width="2"/>`
     +moon(60,40,100,68)+`<path d="M96 108 V80 H124 V108 M96 80 L124 108 M124 80 L96 108" stroke="#E9E2D0" stroke-width="1.6" fill="#4A1A16"/>`
     +win(104,56,12,10,true)+`<circle cx="110" cy="94" r="16" fill="url(#${id}gl)" opacity=".3"/>`
     +rect(166,40,20,68,'#8A9AB8')+`<path d="M166 40 q10 -12 20 0z" fill="#5E6E8E"/>`+`<path d="M20 100 H58 M20 94 H58 M162 100 H200" stroke="#9FB8E0" stroke-width="1"/>`;break;
   default: // dorp
    g=poplar(14,40)+cypress(206,40)
     +[[24,34,30],[54,30,40],[82,36,34],[150,32,38],[180,26,28]].map(([x,w,h],i)=>rect(x,108-h,w,h)+poly(`${x-2},${109-h} ${x+w/2},${96-h} ${x+w+2},${109-h}`)+win(x+w*.2,112-h+6,w*.2,h*.22,i%2===0)+win(x+w*.6,112-h+6,w*.2,h*.22,i!==3)).join('')
     +rect(118,26,16,82)+poly('115,27 126,2 137,27')+win(122,34,8,10,true,true)+door(126,108,8,12)+moon(24,26,182,82);
  }
  return `<svg viewBox="0 -14 220 144" style="display:block;width:100%;height:auto" aria-hidden="true">${defs}${g}${vines}</svg>`;
}
