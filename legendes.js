/* =====================================================================
   Vined It – leren Legende-kaarten (21 stuks)
   Elke Legende is een eigen kaart: getooid leer met roodgouden lijst, het etiket
   nagemaakt op een lap licht leer (ingebrand, bladgoud) en opgestikt.
   Alles is één SVG (schaalt naar elke kaartgrootte). legSVG(c) geeft de kaart,
   of null als er (nog) geen ontwerp is. Mouton krijgt per jaargang een eigen,
   uniek abstract kunstwerk (geen kopie van het echte werk).
   ===================================================================== */
(()=>{
const INK='#3A1B0B',RED='#7A1A16',GRN='#1F4A2A',NAVY='#1E2A44';
const F={c:"Cormorant Garamond",p:"Playfair Display",o:"Oswald",l:"Libre Franklin",s:"Dancing Script",g:"UnifrakturMaguntia"};
let U=0,LY='',LMINI=false;
const T=(x,y,t,o={})=>`<text x="${x}" y="${y}" font-family="${F[o.f||'c']}" font-weight="${o.w||600}" font-size="${o.s||8}" letter-spacing="${o.ls||0}" fill="${o.c||INK}" text-anchor="${o.a||'middle'}" ${o.it?'font-style="italic"':''} ${String(o.c||'').startsWith('url')?'stroke="#4A2A0A" stroke-width=".35"':''} ${o.fit?`textLength="${o.fit}" lengthAdjust="spacingAndGlyphs"`:''} filter="url(#b${U})">${t}</text>`;
const G=()=>`url(#g${U})`;
const frame=(w,h,m=14,c)=>`<rect x="${m}" y="${m}" width="${w-2*m}" height="${h-2*m}" rx="2" fill="none" stroke="${c||G()}" stroke-width="1.4"/><rect x="${m+4}" y="${m+4}" width="${w-2*m-8}" height="${h-2*m-8}" rx="1.5" fill="none" stroke="${c||G()}" stroke-width=".55"/>`;
const lines=(x,y,w,n,c=INK)=>Array.from({length:n},(_,i)=>`<rect x="${x}" y="${y+i*5}" width="${w*(i==n-1?.55:.85+((i*7)%4)*.04)}" height="1.3" rx=".6" fill="${c}" opacity=".5"/>`).join('');
const NOISE=(id,f,o,seed)=>`<filter id="${id}" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="3" seed="${seed}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${o} 0"/></filter>`;
/* opgestikte lap leer met het etiket erop */
const patch=(o,inner)=>{const id=++U,w=o.w,h=o.h,p1=o.p1||'#D9AE76',p2=o.p2||'#A9743F';
 return `<g transform="translate(${150-w/2} ${o.top}) rotate(${o.r||0} ${w/2} ${h/2})"><g class="legp">
  <defs><radialGradient id="pl${id}" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="${p1}"/><stop offset=".85" stop-color="${p2}"/></radialGradient>
   <radialGradient id="pv${id}" cx=".5" cy=".5" r=".72"><stop offset=".72" stop-color="#46200A" stop-opacity="0"/><stop offset="1" stop-color="#46200A" stop-opacity=".55"/></radialGradient>
   <clipPath id="pc${id}"><rect width="${w}" height="${h}" rx="7"/></clipPath>${LMINI?'':NOISE('pn'+id,'.9',.5,id%9)}
   <linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE7B0"/><stop offset=".5" stop-color="#C9A253"/><stop offset=".62" stop-color="#8F6B22"/><stop offset="1" stop-color="#E9C77A"/></linearGradient>
   <filter id="b${id}"><feGaussianBlur stdDeviation=".35"/></filter></defs>
  <rect x="2" y="5" width="${w}" height="${h}" rx="7" fill="#000" opacity=".45" filter="url(#lsh)"/>
  <g clip-path="url(#pc${id})"><rect width="${w}" height="${h}" fill="url(#pl${id})"/>${LMINI?'':`<rect width="${w}" height="${h}" filter="url(#pn${id})"/>`}
   <rect width="${w}" height="${h}" fill="url(#pv${id})"/>
   <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible">${typeof inner==='function'?inner(o):inner}</svg></g>
  <rect x="6" y="6" width="${w-12}" height="${h-12}" rx="4" fill="none" stroke="#3C1C0A" stroke-opacity=".85" stroke-width="1.3" stroke-dasharray="4 3"/>
  <rect x="6.7" y="6.9" width="${w-12}" height="${h-12}" rx="4" fill="none" stroke="#FFEBC8" stroke-opacity=".28" stroke-width="1.3" stroke-dasharray="4 3"/></g></g>`};
/* de hele kaart */
const card=(inner,name,sub,gl)=>{const id=++U;sub=String(sub||'').replace(/\s·\s\d{4}$/,'')+(LY?` · ${LY}`:'');
 const long=name.length>18;
 return `<svg class="legsvg" viewBox="0 0 300 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Legende ${name}">
 <defs><linearGradient id="lf${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E1E14"/><stop offset=".3" stop-color="#B9714A"/><stop offset=".5" stop-color="#6E2618"/><stop offset=".72" stop-color="#D69A68"/><stop offset="1" stop-color="#5A1C12"/></linearGradient>
  <radialGradient id="lb${id}" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#6B3B22"/><stop offset=".7" stop-color="#3E1E10"/><stop offset="1" stop-color="#24100A"/></radialGradient>
  <radialGradient id="lv${id}" cx=".5" cy=".45" r=".7"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  <radialGradient id="lr${id}" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#FBE2C0"/><stop offset=".5" stop-color="#B9714A"/><stop offset="1" stop-color="#4A160E"/></radialGradient>
  <radialGradient id="lc${id}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#F6D2A8"/><stop offset=".55" stop-color="#C47E52"/><stop offset="1" stop-color="#6E2618"/></radialGradient>
  <linearGradient id="lg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE7B0"/><stop offset=".45" stop-color="#C9A253"/><stop offset=".6" stop-color="#8F6B22"/><stop offset="1" stop-color="#E9C77A"/></linearGradient>
  <linearGradient id="lbd${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140804" stop-opacity="0"/><stop offset=".4" stop-color="#140804" stop-opacity=".75"/></linearGradient>
  <linearGradient id="ls${id}" x1="0" y1="0" x2="1" y2=".45"><stop offset=".3" stop-color="#FFDCAA" stop-opacity="0"/><stop offset=".44" stop-color="#FFDCAA" stop-opacity=".18"/><stop offset=".58" stop-color="#FFDCAA" stop-opacity="0"/></linearGradient>
  ${LMINI?'':NOISE('ln'+id,'.85',.55,3)+NOISE('lgr'+id,'.018 .06',.35,4)}
  <filter id="lsh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
  <clipPath id="lk${id}"><rect x="7" y="7" width="286" height="416" rx="9"/></clipPath></defs>
 <rect width="300" height="430" rx="14" fill="url(#lf${id})"/>
 <g clip-path="url(#lk${id})"><rect width="300" height="430" fill="url(#lb${id})"/>${LMINI?'':`<rect width="300" height="430" filter="url(#ln${id})" opacity=".55"/><rect width="300" height="430" filter="url(#lgr${id})" opacity=".5"/>`}
  <rect width="300" height="430" fill="url(#lv${id})"/>
  <rect x="16" y="16" width="268" height="398" rx="6" fill="none" stroke="#ECD6AA" stroke-opacity=".75" stroke-width="1.6" stroke-dasharray="5 3.5"/>
  ${[[21,21],[279,21],[21,409],[279,409]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4.5" fill="url(#lr${id})"/>`).join('')}
  ${inner}
  <rect class="legsheen" x="-300" width="900" height="430" fill="url(#ls${id})"/>
  <g class="legband"><rect y="330" width="300" height="100" fill="url(#lbd${id})"/>
   <rect x="117" y="${long?346:362}" width="66" height="13" rx="6.5" fill="#000" fill-opacity=".25" stroke="#F6D2A8" stroke-opacity=".7"/>
   <text x="150" y="${long?355.5:371.5}" text-anchor="middle" font-family="${F.l}" font-size="7.6" font-weight="600" letter-spacing="1.3" fill="#F6D2A8">♛ LEGENDE</text>
   ${long?`<text x="150" y="380" text-anchor="middle" font-family="Limelight,serif" font-size="19" fill="url(#lg${id})">${name.split(' ').slice(0,Math.ceil(name.split(' ').length/2)).join(' ')}</text><text x="150" y="400" text-anchor="middle" font-family="Limelight,serif" font-size="19" fill="url(#lg${id})">${name.split(' ').slice(Math.ceil(name.split(' ').length/2)).join(' ')}</text>`
     :`<text x="150" y="394" text-anchor="middle" font-family="Limelight,serif" font-size="20" fill="url(#lg${id})">${name}</text>`}
   <text x="150" y="${long?413:410}" text-anchor="middle" font-family="${F.l}" font-size="9.4" fill="#E8C9A0" letter-spacing=".3" textLength="${Math.min(240,sub.length*5)}" lengthAdjust="spacingAndGlyphs">${sub}</text></g>
  ${LMINI?'':(gl||[[18,30],[84,26],[80,66]]).map(([x,y],i)=>`<g class="legglint" style="animation-delay:${-i*.9}s"><g transform="translate(${x*3} ${y*4.3})"><circle r="1.6" fill="#fff"/><path d="M-9 0H9M0 -9V9" stroke="#FFE8C8" stroke-width=".9"/></g></g>`).join('')}</g>
 <circle cx="150" cy="22" r="20" fill="url(#lc${id})" stroke="#5A1C12" stroke-opacity=".5" stroke-width="2"/><circle cx="150" cy="22" r="16.5" fill="none" stroke="#F6D2A8" stroke-opacity=".5"/>
 <text x="150" y="29" text-anchor="middle" font-size="18" fill="#3A120C">♛</text></svg>`};
const REG=[];
(()=>{
const L=[];
const SIG=(x,y,sc=1)=>`<path transform="translate(${x} ${y}) scale(${sc})" d="M0 6c4-8 8-10 9-4s-2 8 1 6 5-9 8-8-1 7 2 7 5-6 7-6 0 5 3 5 6-4 9-3M6 10c6 1 18 0 30-2" stroke="${INK}" stroke-width="1" fill="none" stroke-linecap="round"/>`;

/* 1. Romanée-Conti: breed wit etiket, dunne dubbele lijnen, grote kapitalen, groene appellatie */
L.push(()=>['Romanée-Conti','Domaine de la Romanée-Conti · Bourgogne',card(patch({top:68,w:262,h:196,r:.8,p1:'#E9D3AE',p2:'#BC9462'},o=>`
  <path d="M14 18h234M14 21h234M14 178h234M14 181h234" stroke="${INK}" stroke-width=".8" filter="url(#b${U})"/>
  ${T(131,34,'SOCIÉTÉ CIVILE DU DOMAINE DE LA ROMANÉE-CONTI',{s:7,w:600,f:'l',ls:.2,fit:226})}
  ${T(131,44,'PROPRIÉTAIRE À VOSNE-ROMANÉE (CÔTE-D\'OR) FRANCE',{s:7,w:600,f:'l',ls:.2,fit:214})}
  <path d="M18 41l5 2-5 2zM244 41l-5 2 5 2" fill="${INK}"/>
  ${T(131,84,'ROMANÉE-CONTI',{s:30,f:'l',w:600,ls:1,fit:226})}
  ${T(131,98,'APPELLATION ROMANÉE-CONTI CONTRÔLÉE',{s:8,f:'l',w:600,c:GRN,ls:.4,fit:170,a:'start'}).replace('x="131"','x="34"')}
  ${T(131,118,'Bouteilles Récoltées',{s:12,f:'s',w:500,it:0})}
  ${T(30,136,'BOUTEILLE Nº',{s:6,f:'l',w:600,a:'start'})}
  ${T(30,152,'ANNÉE '+LY,{s:8.5,f:'l',w:700,a:'start'})}
  ${T(170,134,'LES ASSOCIÉS-GÉRANTS',{s:5.6,f:'l',w:600,a:'start'})}
  ${SIG(166,138,1.1)}${SIG(184,152,.9)}
  ${T(131,172,'Mise en bouteille au domaine',{s:10,f:'c',w:600,it:1})}`),'Romanée-Conti','Domaine de la Romanée-Conti · Bourgogne',[[16,40],[86,30],[22,66]]),
  'Wit etiket tussen dunne dubbele lijnen, twee regels kleine tekst, ROMANÉE-CONTI in grote rechte kapitalen, de groene appellatieregel, "Bouteilles Récoltées" en de twee handtekeningen.']);

/* 2. Musigny (Comte Georges de Vogüé): kroon op schild met haan, rode regels, jaartal in een kader */
L.push(()=>['Musigny','Comte Georges de Vogüé · Bourgogne · 2022',card(patch({top:34,w:220,h:272,r:-1,p1:'#E6C88E',p2:'#B98A50'},o=>`
  <g transform="translate(110 40)">
   <g fill="${G()}" stroke="${INK}" stroke-width=".4"><path d="M-14 4h28l2-12-7 5-4-9-5 9-5-9-4 9-7-5z"/><rect x="-14" y="5" width="28" height="3" rx="1"/>${[-10,-5,0,5,10].map(x=>`<circle cx="${x}" cy="-9" r="1.4"/>`).join('')}</g>
   <path d="M-15 10h30v18c0 12-8 18-15 22-7-4-15-10-15-22z" fill="${INK}" fill-opacity=".12" stroke="${G()}" stroke-width="1.4"/>
   <g fill="${G()}"><path d="M-6 34c-2-6 0-12 5-14l-1-5 3 1 2-3 1 3 3 0-2 3c3 2 3 6 1 9 4-2 7-6 8-11 1 6-1 12-6 15-3 2-7 3-10 2z"/><path d="M-3 36v5M2 36v5" stroke="${G()}" stroke-width="1.2"/></g></g>
  ${T(110,118,'MUSIGNY',{s:34,f:'c',w:600,ls:3,fit:172})}
  ${T(110,132,'GRAND CRU',{s:8,f:'l',w:600,c:RED,ls:.6})}
  ${T(110,142,'APPELLATION MUSIGNY CONTRÔLÉE',{s:6.6,f:'l',w:600})}
  ${T(110,152,'CUVÉE VIEILLES VIGNES',{s:6.6,f:'l',w:600,c:RED})}
  ${T(110,162,'RED BURGUNDY WINE',{s:5.4,f:'l',w:600,c:RED})}
  ${T(110,182,'Domaine Comte Georges de Vogüé',{s:12,f:'c',w:600,fit:186})}
  ${T(110,194,'CHAMBOLLE-MUSIGNY (CÔTE-D\'OR)',{s:6.4,f:'c',w:600,ls:1.2})}
  ${SIG(92,198,.9)}
  ${T(26,220,'Réserve numérotée',{s:5.8,f:'c',it:1,c:RED,a:'start'})}
  ${T(26,232,'Nº 194',{s:7,f:'c',w:600,a:'start'})}
  <rect x="78" y="218" width="64" height="24" fill="none" stroke="${INK}" stroke-width="1" filter="url(#b${U})"/>
  ${T(110,236,LY,{s:17,f:'c',w:600})}
  ${T(194,218,'Mis en bouteilles',{s:5.8,f:'c',it:1,c:RED,a:'end'})}
  ${T(194,226,'au domaine',{s:5.8,f:'c',it:1,c:RED,a:'end'})}
  ${T(194,236,'par SD Comte Georges de Vogüé',{s:4.2,f:'c',it:1,a:'end'})}
  ${T(110,252,'PRODUCT OF FRANCE',{s:5,f:'l',w:600,ls:.6})}`),'Musigny','Comte Georges de Vogüé · Bourgogne · 2022',[[16,24],[86,30],[82,66]]),
  'Geel etiket met de kroon op het schild met de haan (vereenvoudigd, in bladgoud), MUSIGNY in brede kapitalen, rode regels "Grand Cru" en "Cuvée Vieilles Vignes", en het jaartal in een kader.']);

/* 3. Pétrus: sierlijst met zuilen en wingerd, medaillon, PETRVS in rood, rode zegel, Grand Vin */
L.push(()=>['Pétrus','Pomerol',card(patch({top:34,w:216,h:272,r:1,p1:'#E8CF98',p2:'#B98D55'},o=>`
  <g stroke="${INK}" fill="none" stroke-width=".9" stroke-opacity=".9" filter="url(#b${U})">
   <path d="M22 226V66M194 226V66M28 226V66M188 226V66"/>${[22,188].map(x=>`<path d="M${x-3} 66h12M${x-3} 226h12"/>`).join('')}
   <path d="M22 66c20-30 40-38 58-36M194 66c-20-30-40-38-58-36"/>
   ${[0,1,2,3].map(i=>`<path d="M${34+i*9} ${52-i*5}c-4-6 2-10 5-6M${182-i*9} ${52-i*5}c4-6-2-10-5-6"/>`).join('')}
   ${[0,1,2].map(i=>`<circle cx="${40+i*7}" cy="${60-i*4}" r="2"/><circle cx="${176-i*7}" cy="${60-i*4}" r="2"/>`).join('')}
   <rect x="18" y="228" width="180" height="14"/>${Array.from({length:11},(_,i)=>`<path d="M${24+i*16} 240c4-8 8-8 12 0"/>`).join('')}</g>
  <g transform="translate(108 46)"><ellipse rx="21" ry="24" fill="${INK}" fill-opacity=".1" stroke="${G()}" stroke-width="1.6"/>
   <g stroke="${G()}" stroke-width="2" fill="none" stroke-linecap="round"><path d="M-9 -10l18 22M9 -10l-18 22"/><circle cx="-11" cy="-13" r="3.5"/><circle cx="11" cy="-13" r="3.5"/><path d="M6 9h4v4M-6 9h-4v4"/></g>
   <path d="M-4 -30h8l-4-6z" fill="${G()}"/></g>
  <text x="108" y="124" text-anchor="middle" font-family="${F.p}" font-weight="900" font-size="40" letter-spacing="2" fill="${RED}" stroke="${INK}" stroke-width=".9" paint-order="stroke" filter="url(#b${U})" textLength="150" lengthAdjust="spacingAndGlyphs">PETRVS</text>
  <text x="108" y="150" text-anchor="middle" font-family="${F.p}" font-weight="700" font-size="16" letter-spacing="2" fill="none" stroke="${INK}" stroke-width=".8" filter="url(#b${U})">POMEROL</text>
  <g transform="translate(60 182)"><circle r="16" fill="${RED}" fill-opacity=".9"/><circle r="12" fill="none" stroke="#F0D6A8" stroke-opacity=".6" stroke-width=".7"/><text y="6" text-anchor="middle" font-family="${F.g}" font-size="16" fill="#F0D6A8" fill-opacity=".85">P.</text></g>
  ${T(140,182,'Grand Vin',{s:17,f:'g',w:400,c:RED})}
  ${T(140,196,'S.C. DU CHATEAU PETRUS',{s:6,f:'c',w:700})}
  ${T(140,204,'PROPRIÉTAIRE À POMEROL (GIRONDE) FRANCE',{s:4,f:'c',w:600})}
  ${T(108,220,'MIS EN BOUTEILLES AU CHATEAU',{s:7,f:'c',w:700,ls:.6})}
  ${T(108,256,'APPELLATION POMEROL CONTRÔLÉE',{s:6.2,f:'c',w:700,ls:.8})}`),'Pétrus','Pomerol',[[14,26],[86,36],[84,70]]),
  'De sierlijst met zuilen en wingerd, bovenaan het medaillon (op het echte etiket de heilige Petrus; hier zijn gekruiste sleutels), PETRVS in rood met zwarte rand, de rode zegel met P. en "Grand Vin".']);

/* 4. Le Pin: liggend wit etiket, dunne rode lijst, "Le Pin" in schuine sierletters, handtekening */
L.push(()=>['Le Pin','Pomerol',card(patch({top:80,w:248,h:176,r:-1.2,p1:'#EAD3AE',p2:'#BE9663'},o=>`
  <rect x="14" y="14" width="220" height="148" fill="none" stroke="${RED}" stroke-width="1.2" filter="url(#b${U})"/>
  ${T(124,72,'Le Pin',{s:50,f:'p',w:700,it:1,c:RED})}
  ${T(124,96,'POMEROL',{s:12,f:'c',w:700,ls:3})}
  ${T(124,107,'APPELLATION POMEROL CONTRÔLÉE',{s:6,f:'c',w:600,ls:.6})}
  <path d="M168 128c6-10 10-14 12-10s-4 10 0 8 8-12 12-10-2 8 2 7 8-6 14-5M170 132c14 0 30-1 42-4" stroke="${INK}" stroke-width="1" fill="none" stroke-linecap="round" filter="url(#b${U})"/>
  ${T(124,146,'MIS EN BOUTEILLE AU CHATEAU',{s:7.4,f:'c',w:700,ls:.6})}
  ${T(124,155,'S.C.A. DU CHÂTEAU DU PIN · PROPRIÉTAIRE À POMEROL · GIRONDE · FRANCE',{s:4,f:'c',w:600,fit:170})}`),'Le Pin','Pomerol',[[18,34],[84,42],[22,60]]),
  'Liggend wit etiket met een dunne rode lijst, "Le Pin" groot in rode schuine sierletters, POMEROL, de handtekening rechts en "Mis en bouteille au Château".']);


REG.push(...L);})();
(()=>{
const L=[];
const SIG=(x,y,sc=1,c=INK)=>`<path transform="translate(${x} ${y}) scale(${sc})" d="M0 6c4-8 8-10 9-4s-2 8 1 6 5-9 8-8-1 7 2 7 5-6 7-6 0 5 3 5 6-4 9-3M6 10c6 1 18 0 30-2" stroke="${c}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
const GU=()=>'url(#g'+U+')';
const hatch=(x,y,w,h,step=3,op=.35)=>Array.from({length:Math.floor(h/step)},(_,i)=>`<path d="M${x} ${y+i*step}h${w}" stroke="${INK}" stroke-opacity="${op}" stroke-width=".5"/>`).join('');
const tree=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width=".7" fill="${INK}" fill-opacity=".18"><path d="M0 0v-26" fill="none"/><path d="M-14 -24c-4-10 4-18 10-16 2-8 14-8 16 0 8-2 12 8 6 14 4 8-6 14-12 10-4 6-14 4-16-2-8 0-10-8-4-6z"/></g>`;

/* 5. Lafite: gedetailleerde gravure – kasteel met vleugels en spits torentje, terras met balustrade, hoge bomen, weide met tuinlieden */
let RS=7;const rnd=()=>{RS=(RS*16807)%2147483647;return RS/2147483647};
const crown=(cx,cy,rx,ry,n,op=.75)=>{let o='';for(let k=0;k<n;k++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd());const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;const sz=1.8+rnd()*2;
  o+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sz.toFixed(1)}" fill="${INK}" fill-opacity="${(op*(.12+r*.25)).toFixed(2)}" stroke="${INK}" stroke-opacity="${(op*(.35+r*.4)).toFixed(2)}" stroke-width=".45"/>`}return o};
L.push(()=>['Château Lafite Rothschild','Pauillac · 2014',card(patch({top:38,w:226,h:262,r:-1,p1:'#E8CFA2',p2:'#BB925C'},o=>{RS=7;return `
  ${T(113,30,'MIS EN BOUTEILLE AU CHÂTEAU',{s:8.5,f:'c',w:600,c:RED,ls:.8})}
  <g filter="url(#b${U})" transform="translate(113 100) scale(1.1) translate(-113 -100)">
   ${Array.from({length:16},(_,i)=>`<path d="M${26+(i%3)*3} ${46+i*3}h${170-(i%4)*4}" stroke="${INK}" stroke-opacity="${(.08+i*.012).toFixed(2)}" stroke-width=".5"/>`).join('')}
   ${Array.from({length:22},(_,i)=>`<path d="M${30+i*7} 96c1-4 3-6 4-6s3 2 4 6" stroke="${INK}" stroke-opacity=".35" stroke-width=".5" fill="none"/>`).join('')}
   ${crown(36,92,10,6,30,.6)}
   <g stroke="${INK}" stroke-width=".6" fill="none">
    <path d="M58 112V96h22v16"/><path d="M56 96l13-6 13 6"/>${Array.from({length:7},(_,i)=>`<path d="M57 ${92+i}h${24}" stroke-opacity=".25"/>`).join('')}
    ${[61,67,73].map(x=>`<rect x="${x}" y="100" width="3" height="5" fill="${INK}" fill-opacity=".45"/>`).join('')}
    <path d="M80 112V88h52v24"/><path d="M78 88l8-9h40l8 9z"/>${Array.from({length:9},(_,i)=>`<path d="M${87+i*.4} ${80+i}h${38-i*.8}" stroke-opacity=".3"/>`).join('')}
    ${[84,91,98,105,112,119,126].flatMap(x=>[92,102].map(y=>`<rect x="${x}" y="${y}" width="3.2" height="5.5" fill="${INK}" fill-opacity=".5"/>`)).join('')}
    <path d="M92 79v-5h3v5M118 79v-6h3v6"/>
    <path d="M132 112V82h12v30"/><path d="M130 82l8-26 8 26z"/>${Array.from({length:8},(_,i)=>`<path d="M${131+i*.9} ${80-i*2.6}h${14-i*1.8}" stroke-opacity=".4"/>`).join('')}
    <path d="M138 56v-5"/><rect x="135" y="88" width="3" height="6" fill="${INK}" fill-opacity=".5"/><rect x="135" y="100" width="3" height="6" fill="${INK}" fill-opacity=".5"/>
    <path d="M144 112V94h14v18M143 94l8-5 8 5"/><rect x="148" y="99" width="3" height="5" fill="${INK}" fill-opacity=".45"/>
    <path d="M48 112h120v4H48z"/>${Array.from({length:30},(_,i)=>`<path d="M${50+i*4} 112v4" stroke-opacity=".6"/>`).join('')}
    <path d="M44 116h128l6 4H38z" stroke-opacity=".7"/></g>
   <path d="M62 112c-3-8-2-14 2-18 1 6 0 12-2 18zM66 112c-1-6 2-12 6-14-1 6-3 10-6 14z" stroke="${INK}" stroke-opacity=".5" stroke-width=".5" fill="none"/>
   <path d="M172 122V96M192 122V92M182 122V104" stroke="${INK}" stroke-width="1.1"/>
   ${crown(174,70,16,24,120)}${crown(193,62,12,25,110)}${crown(184,98,19,12,70)}${crown(164,102,9,9,30)}${crown(62,114,9,4,22)}${crown(158,116,9,4,22)}
   <path d="M32 122V100" stroke="${INK}" stroke-width=".9"/>${crown(32,88,11,15,60)}
   <path d="M22 122c40-4 140-6 186 0" stroke="${INK}" stroke-opacity=".6" stroke-width=".6" fill="none"/>
   ${Array.from({length:110},()=>{const x=24+rnd()*180,y=124+rnd()*32;return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(3+rnd()*5).toFixed(1)} -${(rnd()*1.5).toFixed(1)}" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>`}).join('')}
   <path d="M70 158c10-16 24-26 46-34" stroke="${INK}" stroke-opacity=".35" stroke-width=".6" fill="none"/>
   <path d="M140 150c6-4 14-4 18 2-6 2-12 2-18-2zM154 140c4-3 9-2 11 2-4 1-8 1-11-2z" fill="${INK}" fill-opacity=".25" stroke="${INK}" stroke-width=".5"/>
   <g stroke="${INK}" stroke-width=".7" fill="${INK}" fill-opacity=".55">
    <circle cx="46" cy="128" r="2.4"/><path d="M43.5 131l-5 19h13l-4-19z"/><path d="M48 134l5-3" fill="none"/>
    <circle cx="56" cy="130" r="2.2"/><path d="M54 133l-4 17h11l-3-17z"/>
    <circle cx="98" cy="130" r="1.7"/><path d="M97 132v9l-3 6M98 141l3 6M98 134l8 3M106 137l6 8" fill="none"/>
    <circle cx="116" cy="128" r="1.7"/><path d="M115 130v9l-3 6M116 139l3 6M116 132l-7 4M109 136l-6 9" fill="none"/></g>
   <path d="M24 158c30 4 70 6 92 2s50-6 86-2" stroke="${INK}" stroke-opacity=".3" stroke-width=".5" fill="none"/></g>
  ${T(113,186,'CHATEAU LAFITE ROTHSCHILD',{s:13,f:'c',w:700,fit:178})}
  ${T(113,208,LY,{s:18,f:'c',w:700,c:RED})}
  ${T(113,226,'PAUILLAC',{s:10,f:'l',w:500,ls:1.5})}`}),'Château Lafite Rothschild','Pauillac · 2014',[[16,28],[86,22],[80,62]]),
  'De gravure in detail: het kasteel met zijn vleugels, de leien daken en het spitse torentje, het terras met balustrade, de hoge bomen rechts, de weide met twee dames en twee maaiers, en de lucht in fijne lijnen.']);

/* Mouton: elke jaargang een eigen, uniek abstract kunstwerk (geen kopie van het echte werk). Zelfde jaar = zelfde werk. */
function moutonArt(year,uid,x0=14,y0=14,W=178,H=80){
  let s=(year*9301+49297)%233280;const r=()=>{s=(s*9301+49297)%233280;return s/233280};const pick=a=>a[Math.floor(r()*a.length)];
  const PAL=[['#1E3A6E','#E4B23A','#C8432B','#F2E3C4','#2E7D5B'],['#7A1A16','#F2C14E','#1F1A17','#E9DCC0','#3C6E9E'],['#264653','#2A9D8F','#E9C46A','#F4A261','#E76F51'],
    ['#3D2C8D','#916BBF','#C996CC','#F3E9DD','#1C0C5B'],['#0B3C49','#D96C06','#F2D0A4','#7C3626','#6E9887'],['#111111','#D7263D','#F2F2F2','#1B998B','#F4D35E'],['#5B3F2E','#C9A253','#8FB8A8','#EFE3C8','#3A5A40']];
  const P=pick(PAL),bg=P[3],style=Math.floor(r()*5);let o=`<clipPath id="mc${uid}"><rect x="${x0}" y="${y0}" width="${W}" height="${H}"/></clipPath><g clip-path="url(#mc${uid})" opacity=".85"><rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="${bg}"/>`;
  const X=()=>x0+r()*W,Y=()=>y0+r()*H,C=()=>pick([P[0],P[1],P[2],P[4]]);
  if(style===0){for(let k=0;k<9;k++){const rr=6+r()*20;o+=`<circle cx="${X().toFixed(1)}" cy="${Y().toFixed(1)}" r="${rr.toFixed(1)}" fill="${C()}" fill-opacity="${(.6+r()*.4).toFixed(2)}"/>`}}
  else if(style===1){for(let k=0;k<6;k++){const y=Y();o+=`<path d="M${x0} ${y.toFixed(1)}C${(x0+W*.3).toFixed(1)} ${(y-20+r()*40).toFixed(1)} ${(x0+W*.6).toFixed(1)} ${(y-20+r()*40).toFixed(1)} ${x0+W} ${(y-10+r()*20).toFixed(1)}" stroke="${C()}" stroke-width="${(4+r()*9).toFixed(1)}" fill="none" stroke-linecap="round"/>`}}
  else if(style===2){const n=4+Math.floor(r()*4);for(let k=0;k<n;k++){const w=W/n;o+=`<rect x="${(x0+k*w).toFixed(1)}" y="${y0}" width="${(w*.8).toFixed(1)}" height="${H}" fill="${C()}" fill-opacity="${(.5+r()*.5).toFixed(2)}" transform="skewX(${(-15+r()*30).toFixed(0)})"/>`}o+=`<circle cx="${X().toFixed(1)}" cy="${Y().toFixed(1)}" r="12" fill="${P[1]}"/>`}
  else if(style===3){for(let k=0;k<7;k++){const x=X(),y=Y(),sz=10+r()*26;o+=`<polygon points="${x.toFixed(1)},${(y-sz).toFixed(1)} ${(x+sz).toFixed(1)},${(y+sz*.7).toFixed(1)} ${(x-sz).toFixed(1)},${(y+sz*.7).toFixed(1)}" fill="${C()}" fill-opacity="${(.55+r()*.45).toFixed(2)}" transform="rotate(${(r()*360).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`}}
  else{for(let k=0;k<5;k++){const x=X(),y=Y(),a=8+r()*22,b=6+r()*16;o+=`<path d="M${(x-a).toFixed(1)} ${y.toFixed(1)}c${(a*.3).toFixed(1)} -${b.toFixed(1)} ${(a*1.7).toFixed(1)} -${b.toFixed(1)} ${(a*2).toFixed(1)} 0s-${(a*.6).toFixed(1)} ${(b*1.4).toFixed(1)} -${a.toFixed(1)} ${b.toFixed(1)}z" fill="${C()}" fill-opacity="${(.6+r()*.4).toFixed(2)}"/>`}}
  for(let k=0;k<3+Math.floor(r()*4);k++){const x=X(),y=Y();o+=`<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(-12+r()*24).toFixed(1)} ${(-12+r()*24).toFixed(1)}" stroke="${P[2]==bg?P[0]:P[2]}" stroke-width="1.6" stroke-linecap="round"/>`}
  for(let k=0;k<4;k++)o+=`<circle cx="${X().toFixed(1)}" cy="${Y().toFixed(1)}" r="${(1+r()*2.4).toFixed(1)}" fill="${P[0]}"/>`;
  return o+`</g><rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="none" stroke="#2B2118" stroke-opacity=".25" stroke-width=".6"/>`;
}
/* 6. Mouton: bovenaan een kleurrijk kunstwerk (eigen ontwerp), gouden wapen met twee rammen, gouden schrijfletters */
L.push(()=>['Château Mouton Rothschild','Pauillac · 2023',card(patch({top:32,w:206,h:276,r:1,p1:'#EAD3AA',p2:'#BE9662'},o=>`
  ${moutonArt(+LY||0,U)}
  ${T(30,104,'"Œuvre de l\'année"',{s:5.4,f:'c',it:1,a:'start'})}
  ${SIG(140,96,.8,NAVY)}
  <g transform="translate(103 128)" fill="${G()}" stroke="${INK}" stroke-width=".35">
   <path d="M-8 -12h16v12c0 7-4 10-8 12-4-2-8-5-8-12z"/><path d="M-7 -18h14l1-5-4 3-4-5-4 5-4-3z"/>
   <path d="M-10 -8c-6-4-12-2-12 4 0 5 4 8 6 14h4c-2-6-2-10 2-12zM10 -8c6-4 12-2 12 4 0 5-4 8-6 14h-4c2-6 2-10-2-12z"/>
   <path d="M-20 14c10 4 30 4 40 0l-2 4c-10 3-26 3-36 0z"/></g>
  ${T(103,166,'Château',{s:17,f:'s',w:700,c:'url(#g'+U+')'})}
  ${T(103,190,'Mouton Rothschild',{s:23,f:'s',w:700,c:'url(#g'+U+')',fit:168})}
  ${T(103,208,LY,{s:13,f:'c',w:600,it:1})}
  ${T(103,219,'Toute la récolte a été mise',{s:5.6,f:'c',it:1})}
  ${T(103,226,'en bouteilles au Château',{s:5.6,f:'c',it:1})}
  ${SIG(118,226,.8,RED)}
  ${T(103,244,'PAUILLAC',{s:8,f:'l',w:600,ls:1.4})}
  ${T(103,258,'Baronne Philippine de Rothschild g.f.a',{s:9,f:'s',w:700,c:'url(#g'+U+')',fit:160})}`),'Château Mouton Rothschild','Pauillac · 2023',[[18,20],[84,30],[80,66]]),
  'Bovenaan het kunstwerk van het jaar (hier een eigen abstract werk, niet dat van de kunstenaar), het gouden wapen met twee rammen, de naam in grote gouden schrijfletters en Baronne Philippine de Rothschild.']);

/* 7. Margaux: liggend achthoekig etiket, gouden dubbele lijst, boog-kapitalen, château in ovaal, rode kopregel */
L.push(()=>['Château Margaux','Premier Grand Cru Classé · Margaux',card((()=>{const w=266,h=214,c=16,oct=(m)=>`M${c+m} ${m}H${w-c-m}L${w-m} ${c+m}V${h-c-m}L${w-c-m} ${h-m}H${c+m}L${m} ${h-c-m}V${c+m}Z`;
 return patch({top:56,w,h,r:.8,p1:'#EBD5AE',p2:'#BF9864'},o=>`
  <path d="${oct(8)}" fill="none" stroke="${G()}" stroke-width="1.8"/><path d="${oct(12)}" fill="none" stroke="${G()}" stroke-width=".6"/>
  ${T(133,30,'MIS EN BOUTEILLE AU CHÂTEAU',{s:8,f:'l',w:500,c:RED,ls:1})}
  <defs><path id="ma${U}" d="M26 88 Q133 18 240 88"/><path id="mb${U}" d="M30 132 Q133 196 236 132"/></defs>
  <text font-family="${F.c}" font-weight="700" font-size="17" letter-spacing=".5" fill="url(#g${U})" stroke="${INK}" stroke-width=".3"><textPath href="#ma${U}" startOffset="50%" text-anchor="middle">CHÂTEAU MARGAUX</textPath></text>
  ${T(133,68,'GRAND VIN',{s:9,f:'l',w:500,c:'url(#g'+U+')',ls:1})}
  <ellipse cx="133" cy="106" rx="52" ry="30" fill="${INK}" fill-opacity=".05" stroke="${G()}" stroke-width=".5" stroke-dasharray="1 1.6"/>
  <g transform="translate(0 6)" stroke="url(#g${U})" fill="none" stroke-width=".9" stroke-linejoin="round">
   <path d="M100 120V92h66v28M100 92l6-6h54l6 6"/><path d="M122 120V90h22v30M122 90l11-7 11 7"/>${[126,131,136,141].map(x=>`<path d="M${x} 91v29"/>`).join('')}
   ${[104,110,116,150,156,162].flatMap(x=>[96,108].map(y=>`<rect x="${x}" y="${y}" width="3" height="5" stroke-width=".6"/>`)).join('')}
   <path d="M110 86v-5h3v5M150 86v-6h3v6M156 86v-4h3v4"/><path d="M124 120h18l4 6h-26z" stroke-width=".7"/>
   <path d="M86 122c-6-6-6-20 2-26 6 4 8 18 2 26zM180 122c6-6 6-20-2-26-6 4-8 18-2 26z" fill="url(#g${U})" fill-opacity=".35"/></g>
  <text font-family="${F.c}" font-weight="700" font-size="11.5" letter-spacing=".3" fill="url(#g${U})" stroke="${INK}" stroke-width=".3"><textPath href="#mb${U}" startOffset="50%" text-anchor="middle">PREMIER GRAND CRU CLASSÉ</textPath></text>
  ${T(133,178,'MARGAUX',{s:8.5,f:'l',w:500,c:'url(#g'+U+')',ls:1.2})}
  ${T(133,188,'APPELLATION MARGAUX CONTRÔLÉE',{s:5.8,f:'l',w:500,c:'url(#g'+U+')',ls:.6})}
  ${T(133,197,'S.C.A. CHATEAU MARGAUX PROPRIÉTAIRE A MARGAUX - FRANCE',{s:4.6,f:'l',w:500,c:'url(#g'+U+')',fit:170})}`)})(),'Château Margaux','Premier Grand Cru Classé · Margaux',[[14,30],[86,24],[84,58]]),
  'Liggend etiket met afgeschuinde hoeken en een gouden dubbele lijst. De rode kopregel, CHÂTEAU MARGAUX in een boog, het château met zuilen en trap in een ovaal, en PREMIER GRAND CRU CLASSÉ in een boog eronder, alles in goud.']);

/* 8. Cheval Blanc: naam in een boog die binnen het etiket past, twee medailles met reliëf (zittende groep / gevleugelde Victoria), sierkader */
L.push(()=>['Château Cheval Blanc','1er Grand Cru Classé A · Saint-Émilion',card(patch({top:86,w:262,h:172,r:-1.2,p1:'#EBD4A8',p2:'#BF9661'},o=>{
  const rim=(x)=>`<g transform="translate(${x} 88)"><circle r="29" fill="${GU()}" fill-opacity=".5" stroke="${GU()}" stroke-width="2"/><circle r="24.5" fill="${GU()}" fill-opacity=".25" stroke="#5A3A0C" stroke-opacity=".6" stroke-width=".6"/>
   ${Array.from({length:28},(_,i)=>{const a=i/28*Math.PI*2;return `<circle cx="${(26.8*Math.cos(a)).toFixed(1)}" cy="${(26.8*Math.sin(a)).toFixed(1)}" r=".85" fill="#5A3A0C" fill-opacity=".55"/>`}).join('')}`;
  const left=`${rim(46)}<g fill="#6B4410" fill-opacity=".55" stroke="#4A2A0A" stroke-width=".5">
    <path d="M-16 14h32v3h-32z"/><circle cx="-9" cy="-6" r="3"/><path d="M-13 -2c-2 6-2 12 0 16h10c1-6-1-12-3-16z"/><path d="M-4 4c4 0 8 2 9 8"  fill="none"/>
    <circle cx="4" cy="-12" r="2.8"/><path d="M1 -9c-2 8-2 16 0 23h7c1-8 0-16-2-23z"/><path d="M7 -6l7-6M14 -12l2 -4" fill="none"/>
    <circle cx="13" cy="0" r="2.2"/><path d="M11 3c-1 4-1 8 0 11h5c0-4 0-8-1-11z"/><path d="M-20 -14c3-3 6-3 9 0" fill="none"/></g></g>`;
  const right=`${rim(216)}<g fill="#6B4410" fill-opacity=".55" stroke="#4A2A0A" stroke-width=".5">
    <path d="M-2 -6c-8-4-16-14-18-20 6 2 14 8 18 14zM2 -6c8-4 16-14 18-20-6 2-14 8-18 14z"/>
    <circle cx="0" cy="-10" r="3"/><path d="M-4 -6c-3 8-6 16-10 22h22c-2-6-4-14-4-22z"/><path d="M-1 -12l-6-8M-7 -20a3 3 0 1 0 0.1 0" fill="none"/>
    <path d="M-16 16c6-3 26-3 32 0" fill="none"/><path d="M6 4l8 4" fill="none"/></g></g>`;
  return `
  <defs><path id="cb${U}" d="M32 52 Q131 22 230 52"/></defs>
  <text font-family="${F.p}" font-weight="700" font-size="17" fill="url(#g${U})" stroke="${INK}" stroke-width=".45" textLength="196" lengthAdjust="spacingAndGlyphs"><textPath href="#cb${U}" startOffset="50%" text-anchor="middle">CHÂTEAU CHEVAL BLANC</textPath></text>
  ${left}${right}
  <g stroke="url(#g${U})" fill="none" stroke-width="1"><path d="M100 66h62c4 0 6 4 4 8-2 6 2 10 0 14H96c-2-4 2-8 0-14-2-4 0-8 4-8z"/><path d="M92 70c-6-2-8 4-4 6M170 70c6-2 8 4 4 6"/>
   <path d="M118 60c4-6 10-6 13-2 3-4 9-4 13 2"/><path d="M104 92c8 4 46 4 54 0"/></g>
  ${T(131,112,'St Émilion Grand Cru',{s:10,f:'c',w:600,it:1})}
  ${T(131,140,'1er GRAND CRU CLASSÉ "A"',{s:11,f:'c',w:600,fit:150})}
  ${T(131,156,'Mis en bouteille au Château',{s:10,f:'c',w:600,c:RED})}`}),'Château Cheval Blanc','1er Grand Cru Classé A · Saint-Émilion',[[16,40],[86,32],[22,62]]),
  'De naam in een boog die binnen het etiket blijft, en twee medailles met een parelrand en reliëf: links een zittende groep figuren, rechts een gevleugelde Victoria met krans (vereenvoudigd), zoals op het echte etiket.']);


REG.push(...L);})();
(()=>{
const L=[];
const SIG=(x,y,sc=1,c=INK)=>`<path transform="translate(${x} ${y}) scale(${sc})" d="M0 6c4-8 8-10 9-4s-2 8 1 6 5-9 8-8-1 7 2 7 5-6 7-6 0 5 3 5 6-4 9-3M6 10c6 1 18 0 30-2" stroke="${c}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
const GU=()=>'url(#g'+U+')';
const CREAM='#EFE3C8';

/* 9. Yquem: liggend, dunne zwarte dubbele lijst met afgeschuinde hoeken, vaag wapen erachter, kroon, sierlijke naam */
L.push(()=>["Château d'Yquem",'Sauternes · 2001',card((()=>{const w=258,h=184,c=12,oct=m=>`M${c+m} ${m}H${w-c-m}L${w-m} ${c+m}V${h-c-m}L${w-c-m} ${h-m}H${c+m}L${m} ${h-c-m}V${c+m}Z`;
 return patch({top:80,w,h,r:1,p1:'#E9CF9C',p2:'#BC9058'},o=>`
  <path d="${oct(9)}" fill="none" stroke="${INK}" stroke-width="2.2" filter="url(#b${U})"/><path d="${oct(14)}" fill="none" stroke="${INK}" stroke-width=".6" filter="url(#b${U})"/>
  <g transform="translate(129 98)" fill="${GU()}" fill-opacity=".22" stroke="${GU()}" stroke-opacity=".35" stroke-width="1">
   <path d="M-26 -34h52v30c0 22-14 34-26 40-12-6-26-18-26-40z"/><path d="M-26 -30c-14 6-20 22-14 40M26 -30c14 6 20 22 14 40" fill="none"/><path d="M-50 40h100" fill="none"/></g>
  <g transform="translate(129 44)" fill="${GU()}" stroke="${INK}" stroke-width=".4"><path d="M-17 8h34l3-15-9 6-5-11-6 11-6-11-5 11-9-6z"/><rect x="-17" y="9" width="34" height="3.5" rx="1"/>${[-11,0,11].map(x=>`<circle cx="${x}" cy="-9" r="1.6"/>`).join('')}</g>
  ${T(129,98,"Château d'Yquem",{s:30,f:'p',w:700,it:1,fit:196})}
  ${T(129,126,'Sauternes',{s:17,f:'p',w:700,it:1})}
  <path d="M60 152h42M156 152h42" stroke="${INK}" stroke-width=".9"/>
  ${T(129,157,LY,{s:15,f:'c',w:700})}`)})(),"Château d'Yquem",'Sauternes · 2001',[[18,36],[84,30],[78,60]]),
  'Liggend crème etiket met een dunne zwarte dubbele lijst, een vaag wapen op de achtergrond, de gouden kroon, "Château d\'Yquem" groot in schuine sierletters, Sauternes en het jaartal tussen twee lijntjes.']);

/* 10. Salon: zwart etiket, gouden lijst, witte kapitalen, grote gouden S, gouden schrijfletters */
L.push(()=>['Salon','Le Mesnil · Blanc de Blancs · 2012',card(patch({top:40,w:204,h:258,r:-1,p1:'#E2C08C',p2:'#B3824C'},o=>`
  <rect x="14" y="14" width="176" height="230" fill="none" stroke="${GU()}" stroke-width="1"/>
  ${T(102,42,'CHAMPAGNE',{s:17,f:'l',w:500,c:INK,ls:3,fit:160})}
  ${T(48,70,'Brut',{s:16,f:'s',w:700,c:'#4A2C06'})}
  ${T(156,70,LY,{s:14,f:'s',w:700,c:'#4A2C06'})}
  <text x="102" y="168" text-anchor="middle" font-family="${F.p}" font-weight="700" font-size="120" fill="${GU()}" stroke="#4A2A0A" stroke-width=".6">S</text>
  ${T(102,200,'SALON',{s:28,f:'p',w:700,c:INK,ls:1})}
  ${T(102,216,'BLANC de BLANCS',{s:9,f:'l',w:500,c:INK,ls:.6})}
  ${T(102,236,'Le Mesnil',{s:16,f:'s',w:700,c:'#4A2C06'})}`),'Salon','Le Mesnil · Blanc de Blancs · 2012',[[18,26],[84,34],[22,62]]),
  'Het zwarte etiket in hetzelfde lichte leer als de andere kaarten: gouden lijst, CHAMPAGNE en SALON in ingebrande kapitalen, de grote gouden S, en "Brut", het jaartal en "Le Mesnil" in gouden schrijfletters.']);

/* 11. Rayas: liggend wit etiket, zwart wapen met twee dieren, grote rode naam, schuine rode stempel */
L.push(()=>['Château Rayas','Châteauneuf-du-Pape',card(patch({top:80,w:262,h:186,r:-1.2,p1:'#EAD2A8',p2:'#BE9562'},o=>`
  <g transform="translate(131 40)" filter="url(#b${U})">
   <path d="M-11 -14h22v14c0 9-6 13-11 16-5-3-11-7-11-16z" fill="${INK}" fill-opacity=".55" stroke="${INK}"/><path d="M-7 -8h14M-7 -3h14M-5 2h10" stroke="${CREAM}" stroke-opacity=".7"/>
   ${[-1,1].map(s=>`<path transform="scale(${s} 1)" d="M-13 14c-4-8-4-16-2-22l-4-6 5 2 3-4 1 5c3 2 4 6 2 10l-2 6 2 9z" fill="${INK}"/>`).join('')}
   <path d="M-24 18h48" stroke="${INK}" stroke-width="1.2"/></g>
  ${T(131,92,'CHATEAU RAYAS',{s:28,f:'p',w:700,c:RED,ls:1,fit:212})}
  <g transform="rotate(-22 160 100)" opacity=".75">${T(160,104,'MIS EN BOUTEILLE AU CHATEAU',{s:7.5,f:'l',w:600,c:RED,ls:.3})}</g>
  ${T(131,124,'CHATEAUNEUF-DU-PAPE',{s:14,f:'p',w:700,fit:170})}
  ${T(131,142,'APPELLATION CHÂTEAUNEUF-DU-PAPE CONTRÔLÉE',{s:8,f:'l',w:600,c:RED,fit:200})}
  ${T(24,158,'S.C.E.A.',{s:5.6,f:'l',w:600,a:'start'})}${T(24,165,'CHATEAU RAYAS',{s:5.6,f:'l',w:600,a:'start'})}${T(24,174,'750 ml',{s:7,f:'l',w:700,a:'start'})}
  ${T(238,158,'CHATEAUNEUF-DU-PAPE',{s:5.6,f:'l',w:600,a:'end'})}${T(238,165,'VAUCLUSE',{s:5.6,f:'l',w:600,a:'end'})}${T(238,172,'FRANCE',{s:5.6,f:'l',w:600,a:'end'})}`),'Château Rayas','Châteauneuf-du-Pape',[[16,40],[86,30],[20,64]]),
  'Liggend wit etiket: bovenaan het zwarte wapen met twee dieren (vereenvoudigd), CHATEAU RAYAS in grote rode letters, de schuine rode stempel "Mis en bouteille au Château" en de rode appellatieregel.']);

/* 12. Masseto: staand, gouden sierrand, bruin-gouden vlak, MASSETO, rode lakzegel met M */
L.push(()=>['Masseto','Toscana',card(patch({top:34,w:196,h:272,r:1,p1:'#E2BE86',p2:'#B0804A'},o=>`
  <rect x="14" y="14" width="168" height="244" fill="none" stroke="${GU()}" stroke-width="1.4"/>
  <rect x="26" y="26" width="144" height="220" fill="none" stroke="${GU()}" stroke-width=".7"/>
  <g stroke="${GU()}" fill="none" stroke-width=".9">
   ${Array.from({length:10},(_,i)=>`<path d="M20 ${34+i*22}c4 4 4 10 0 14M176 ${34+i*22}c-4 4-4 10 0 14"/>`).join('')}
   ${Array.from({length:6},(_,i)=>`<path d="M${38+i*22} 20c4 4 10 4 14 0M${38+i*22} 252c4-4 10-4 14 0"/>`).join('')}
   <path d="M86 20c4 4 8 4 12 0 4 4 8 4 12 0M86 252c4-4 8-4 12 0 4-4 8-4 12 0" stroke-width="1.2"/></g>
  <rect x="30" y="30" width="136" height="212" fill="${INK}" fill-opacity=".06"/>
  ${T(98,84,'MASSETO',{s:24,f:'c',w:600,ls:3.5,fit:124})}
  <g transform="translate(98 140)"><path d="M0 -18c6 0 10 3 13 2 3 4 6 7 4 12 3 5 1 10-2 13 0 5-5 8-10 7-3 3-9 3-12 0-5 1-9-2-10-7-3-3-5-8-2-13-2-5 1-8 4-12 3 1 7-2 13-2z" fill="${RED}" fill-opacity=".9"/>
   <circle r="11" fill="none" stroke="#F0D6A8" stroke-opacity=".5" stroke-width=".7"/><text y="6" text-anchor="middle" font-family="${F.c}" font-weight="700" font-size="17" fill="#F0D6A8" fill-opacity=".8">M</text></g>
  ${T(98,206,'TOSCANA',{s:10,f:'c',w:700,ls:1})}
  ${T(98,218,'INDICAZIONE GEOGRAFICA TIPICA',{s:5.6,f:'c',w:600,ls:.4})}`),'Masseto','Toscana',[[16,24],[86,34],[80,66]]),
  'Staand etiket met een gouden sierrand, MASSETO in brede kapitalen, de rode lakzegel met M in het midden en Toscana onderaan.']);

/* 13. Biondi-Santi: Brunello bovenaan, BIONDI-SANTI groot in goud, kroon op het familiewapen, Marca Propria, Tenuta Greppo */
L.push(()=>['Brunello di Montalcino Riserva','Biondi-Santi · Tenuta Greppo',card(patch({top:44,w:216,h:250,r:-1,p1:'#B88E5A',p2:'#7E5530'},o=>`
  ${T(108,34,'BRUNELLO DI MONTALCINO',{s:13,f:'c',w:600,c:'#F4E6C8',fit:180})}
  ${T(108,45,'DENOMINAZIONE DI ORIGINE CONTROLLATA E GARANTITA',{s:5.4,f:'c',w:600,c:'#F4E6C8',fit:180})}
  <path d="M18 52h180" stroke="${GU()}" stroke-width="1.6"/>
  ${T(108,86,'BIONDI-SANTI',{s:30,f:'c',w:700,c:GU(),fit:186})}
  <g transform="translate(108 134)">
   <g fill="${GU()}" stroke="#4A2A0A" stroke-width=".4"><path d="M-15 -26h30l3-11-8 5-5-9-5 9-5-9-5 9-8-5z"/><rect x="-15" y="-25" width="30" height="3" rx="1"/>${[-12,-6,0,6,12].map(x=>`<circle cx="${x}" cy="-38" r="1.6"/>`).join('')}</g>
   <path d="M-17 -20h34v18c0 14-8 20-17 24-9-4-17-10-17-24z" fill="#F0DCB4" fill-opacity=".35" stroke="${GU()}" stroke-width="1.4"/>
   <path d="M0 -20v42M-17 0h34" stroke="${GU()}" stroke-width=".8"/>
   <path d="M-16 -19h15v18h-15z" fill="${NAVY}" fill-opacity=".45"/><path d="M-11 -6c-2-6 2-8 2-10h4c0 2 4 4 2 10z" fill="#F0DCB4" fill-opacity=".8"/>
   <path d="M1 -19h15v18H1z" fill="${NAVY}" fill-opacity=".35"/>${[[5,-14],[11,-13],[8,-7]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.2" fill="${RED}" fill-opacity=".85"/>`).join('')}
   <path d="M-16 1h15v8c0 6-4 10-7 11-4-2-8-5-8-11z" fill="${RED}" fill-opacity=".6"/><path d="M-8 4l1.4 3 3 .4-2.2 2 .6 3-2.8-1.6-2.8 1.6.6-3-2.2-2 3-.4z" fill="#F0DCB4"/>
   <path d="M1 1h15v8c0 6-4 9-8 11-4-1-7-5-7-11z" fill="${NAVY}" fill-opacity=".35"/><path d="M1 8l7-6 8 6" stroke="#F0DCB4" stroke-width="2" fill="none"/><circle cx="8" cy="13" r="2.4" fill="${RED}" fill-opacity=".85"/></g>
  ${T(40,150,'MARCA',{s:7,f:'c',w:700,c:'#F2D88A'})}${T(176,150,'PROPRIA',{s:7,f:'c',w:700,c:'#F2D88A'})}
  ${T(108,184,'TENUTA "GREPPO»',{s:9,f:'c',w:700,c:'#F2D88A',ls:.6})}
  <path d="M18 194h180" stroke="${GU()}" stroke-width="1.6"/>
  ${T(108,206,'IMBOTTIGLIATO DA SOCIETÀ AGRICOLA',{s:5.6,f:'c',w:600,c:'#F4E6C8'})}
  ${T(108,214,'GREPPO - BIONDI SANTI SRL',{s:5.6,f:'c',w:600,c:'#F4E6C8'})}
  ${T(108,222,'PER CONTO DI BS INTERNATIONAL SRL NELLA CANTINA DELLA TENUTA «GREPPO»',{s:4.2,f:'c',w:600,fit:176,c:'#F4E6C8'})}
  ${T(108,230,'IN MONTALCINO - ITALIA',{s:5.6,f:'c',w:600,c:'#F4E6C8'})}`),'Biondi-Santi','Brunello di Montalcino · Tenuta Greppo',[[16,28],[86,22],[82,64]]),
  'Het zwarte etiket in een donkerder lap leer, zodat het goud opvalt: BRUNELLO DI MONTALCINO bovenaan, een gouden lijn, BIONDI-SANTI groot in bladgoud, de kroon op het gevierendeelde familiewapen (vaas, rozen, ster, keper; vereenvoudigd), "Marca Propria" en Tenuta "Greppo".']);

/* 14. Monfortino: crème, CONTERNO groot, gravure van het dorp, wapen, BAROLO, gouden gotische Monfortino */
L.push(()=>['Barolo Monfortino Riserva','Giacomo Conterno · 2013',card(patch({top:36,w:196,h:270,r:1.2,p1:'#E8D0A0',p2:'#BB915A'},o=>`
  ${T(98,44,'CONTERNO',{s:30,f:'p',w:700,c:'#5A2A14',fit:160})}
  <path d="M22 52h152" stroke="${GU()}" stroke-width="1.6"/>
  <g stroke="${INK}" stroke-width=".7" fill="${INK}" fill-opacity=".12" filter="url(#b${U})">
   <path d="M24 108c20-8 40-12 60-24 16-8 30-10 50-6 10 2 18 4 26 8v22z" fill-opacity=".06"/>
   ${[[40,96,14,10],[54,92,12,12],[68,88,14,14],[84,84,12,16],[98,86,14,12],[112,90,12,10]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="M${x-1} ${y}l${w/2+1} -5 ${w/2+1} 5" fill-opacity=".3"/>`).join('')}
   <rect x="88" y="62" width="6" height="22"/><path d="M87 62l4-7 4 7z" fill-opacity=".4"/></g>
  <g transform="translate(150 80)" fill="${GU()}" stroke="#4A2A0A" stroke-width=".4"><path d="M-12 -16h24v14c0 10-6 15-12 18-6-3-12-8-12-18z"/><path d="M-12 -16c-8-4-12 4-8 10M12 -16c8-4 12 4 8 10" fill="none" stroke="${GU()}" stroke-width="2"/><path d="M-6 -6h12M0 -12v14" stroke="#4A2A0A" stroke-width="1"/></g>
  ${T(98,146,'BAROLO',{s:40,f:'p',w:700,c:'#5A2A14',fit:150})}
  ${T(98,158,'DENOMINAZIONE DI ORIGINE CONTROLLATA E GARANTITA',{s:4.6,f:'l',w:600,fit:150})}
  ${T(98,174,'RISERVA '+LY,{s:11,f:'p',w:700,c:'#5A2A14',it:1})}
  ${T(98,202,'Monfortino',{s:26,f:'g',w:400,c:GU(),fit:150})}
  <path d="M40 210h116" stroke="${GU()}" stroke-width=".8"/>
  ${T(98,222,'DRY RED WINE',{s:5.6,f:'l',w:600})}
  ${T(98,232,'ESTATE BOTTLED BY AZIENDA VITIVINICOLA',{s:4.6,f:'l',w:600})}
  ${T(98,239,'GIACOMO CONTERNO di GIOVANNI CONTERNO s.s.',{s:4.6,f:'l',w:600})}
  ${T(98,246,'MONFORTE D\'ALBA - ITALIA',{s:4.6,f:'l',w:600})}`),'Monfortino','Giacomo Conterno · Barolo Riserva · 2013',[[16,28],[86,22],[82,64]]),
  'Crème etiket: CONTERNO groot bovenaan, de gravure van het heuveldorp met toren, het gouden wapen rechts, een groot BAROLO, "Riserva 2013" en Monfortino in gouden gotische letters.']);

/* 15. Vega Sicilia Único: wit, gouden wapen met gevleugelde staf en linten, VEGA-SICILIA in goud, UNICO zwart, kader met flesaantallen */
L.push(()=>['Vega Sicilia Único','Ribera del Duero',card(patch({top:34,w:196,h:274,r:-1,p1:'#ECD7B2',p2:'#C29B68'},o=>`
  <g transform="translate(98 46)" stroke="${GU()}" fill="none" stroke-width="1.2">
   <path d="M-12 -6h24v14c0 9-6 13-12 16-6-3-12-7-12-16z" fill="${GU()}" fill-opacity=".18"/>
   <path d="M0 -6v-14M-10 -20c4-6 8-6 10-2 2-4 6-4 10 2M-4 -16c2 2 6 2 8 0"/>
   <path d="M-12 0c-10-2-20 2-30 0l4 6-4 6c10 2 20-2 30 0M12 0c10-2 20 2 30 0l-4 6 4 6c-10 2-20-2-30 0"/>
   <text y="10" text-anchor="middle" font-family="${F.c}" font-size="9" font-weight="700" fill="${GU()}" stroke="none">VS</text></g>
  ${T(98,98,'VEGA-SICILIA',{s:20,f:'c',w:700,c:GU(),ls:1,fit:164})}
  ${T(98,130,'UNICO',{s:24,f:'p',w:700,ls:1})}
  ${T(98,152,'RIBERA DEL DUERO',{s:10,f:'p',w:700})}
  ${T(98,162,'DENOMINACIÓN DE ORIGEN',{s:6.6,f:'c',w:600})}
  ${T(98,176,'EMBOTELLADO EN LA PROPIEDAD',{s:5.6,f:'c',w:600})}
  ${T(98,183,'POR BODEGAS VEGA SICILIA, S.A.',{s:5.6,f:'c',w:600})}
  ${T(98,190,'VALBUENA DE DUERO. VALLADOLID (ESPAÑA)',{s:5.6,f:'c',w:600})}
  <rect x="22" y="198" width="152" height="50" fill="none" stroke="${INK}" stroke-width=".7" filter="url(#b${U})"/>
  ${T(98,207,'Esta cosecha ha sido escogida para ser embotellada en',{s:4.4,f:'c',w:500})}
  ${T(98,213,'87.516 botellas, 2.227 Mágnum, 156 Doble Mágnum y 5 Imperiales.',{s:4.4,f:'c',w:500,fit:144})}
  ${T(98,220,'El número de esta botella es el',{s:4.4,f:'c',w:500})}
  ${T(98,229,'LA PRESIDENTA',{s:4.8,f:'c',w:700})}
  ${SIG(80,231,.85)}
  ${T(22,262,'75CL.',{s:8,f:'c',w:700,a:'start'})}${T(98,261,'PRODUCTO DE ESPAÑA',{s:4.6,f:'c',w:600})}${T(174,262,'14%VOL.',{s:8,f:'c',w:700,a:'end'})}`),'Vega Sicilia Único','Ribera del Duero',[[16,26],[86,32],[82,64]]),
  'Wit etiket met het gouden wapen (gevleugelde staf, schild met VS en linten), VEGA-SICILIA in gouden kapitalen, UNICO in zwart, en onderaan het kader met de flesaantallen en de handtekening.']);

/* 16. Pingus: liggend wit, marineblauw, cirkel met zilveren penseelring, PINGUS in brede kapitalen */
L.push(()=>['Pingus','Ribera del Duero',card(patch({top:84,w:252,h:176,r:1.2,p1:'#ECD6B0',p2:'#C29A66'},o=>`
  <defs><linearGradient id="s${U}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#AEB6BC"/><stop offset="1" stop-color="#E8ECEF"/></linearGradient></defs>
  ${T(126,26,'RIBERA DEL DUERO · DENOMINACIÓN DE ORIGEN',{s:6.6,f:'l',w:500,c:NAVY,ls:1.4,fit:220})}
  <circle cx="126" cy="58" r="20" fill="${NAVY}" stroke="${NAVY}" stroke-width="1"/><circle cx="126" cy="58" r="22.5" fill="none" stroke="${NAVY}" stroke-width=".7"/>
  <path d="M117 50c6-6 18-4 20 6 2 9-8 14-15 11-6-3-7-10-3-14" stroke="url(#s${U})" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  ${T(126,116,'PINGUS',{s:34,f:'c',w:500,c:NAVY,ls:7,fit:176})}
  ${T(126,142,'Embotellado por Dominio de Pingus, S.L.R.E.: 7268-VA',{s:5.6,f:'l',w:500,fit:160})}
  ${T(126,150,'Quintanilla de Onesimo. (Valladolid)',{s:5.6,f:'l',w:500})}
  ${T(22,164,'14% Vol.',{s:10,f:'o',w:500,c:NAVY,a:'start'})}${T(126,162,'PRODUCE OF SPAIN',{s:5.6,f:'l',w:500})}${T(230,164,'750 ml',{s:10,f:'o',w:500,c:NAVY,a:'end'})}`),'Pingus','Ribera del Duero',[[18,36],[84,44],[24,60]]),
  'Liggend wit etiket in marineblauw: de kopregel in spatiëring, de blauwe cirkel met de zilveren penseelring, PINGUS in brede kapitalen en onderaan "14% Vol." en "750 ml".']);


REG.push(...L);})();
(()=>{
const L=[];
const CREAM='#EFE3C8';
const GU=()=>'url(#g'+U+')';
const tree=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width=".6" fill="${INK}" fill-opacity=".3"><path d="M0 0v-10" fill="none"/><path d="M-7 -9c-3-5 2-9 5-8 1-4 7-4 8 0 4-1 6 4 3 7 2 4-3 7-6 5-2 3-7 2-8-1-4 0-5-4-2-3z"/></g>`;

/* 17. Egon Müller: wit, kapitalen bovenaan, gravure van de Scharzhof met wijnheuvels, wijnrankrand, schuine schrijfregels, ovaal */
L.push(()=>['Scharzhofberger Riesling Trockenbeerenauslese','Egon Müller',card(patch({top:36,w:206,h:270,r:1,p1:'#ECD7B0',p2:'#C29B66'},o=>`
  ${T(103,30,'MOSEL-SAAR-RUWER',{s:12,f:'l',w:500,ls:.6,fit:150})}
  ${T(103,44,'RIESLING',{s:12,f:'l',w:500,ls:.6})}
  ${T(103,54,'Product of Germany',{s:6.4,f:'l',w:500})}
  <g filter="url(#b${U})">
   <path d="M18 92c14-22 30-30 50-32 20-2 34 6 50 2s30-8 70-4v34H18z" fill="${INK}" fill-opacity=".08" stroke="${INK}" stroke-opacity=".5" stroke-width=".6"/>
   ${Array.from({length:9},(_,i)=>`<path d="M${24+i*8} ${92-i*3}l18 -14" stroke="${INK}" stroke-opacity=".35" stroke-width=".5"/>`).join('')}
   <g stroke="${INK}" stroke-width=".6" fill="${INK}" fill-opacity=".1"><rect x="60" y="90" width="50" height="12"/><path d="M58 90l6-5h42l6 5z" fill-opacity=".3"/><rect x="110" y="86" width="10" height="16"/><path d="M109 86l6-6 6 6z" fill-opacity=".4"/>
    ${[64,72,80,88,96,104].map(x=>`<rect x="${x}" y="94" width="3" height="4" fill-opacity=".45"/>`).join('')}</g>
   ${tree(134,104,1.3)}${tree(150,102,1.1)}${tree(44,104,1)}${tree(168,104,1.2)}</g>
  <g fill="${GU()}" fill-opacity=".55" stroke="${GU()}" stroke-width=".5">
   ${Array.from({length:8},(_,i)=>`<path d="M${28+i*22} 118c-6-2-8-8-4-10 0-4 6-6 8-2 4-4 10 0 6 4 4 2 2 8-4 8z"/>${i%2?`<g>${[0,1,2,3,4,5].map(k=>`<circle cx="${30+i*22+(k%2)*3}" cy="${120+Math.floor(k/2)*3}" r="1.6"/>`).join('')}</g>`:''}`).join('')}
   <path d="M150 112c10-8 22-20 28-46" fill="none" stroke-width="1"/><path d="M168 72c4-4 10-2 8 4-4 2-8 0-8-4zM162 88c4-4 10-2 8 4-4 2-8 0-8-4z"/></g>
  <g transform="rotate(-14 103 180)">
   ${T(110,170,'Scharzhofberger Trockenbeerenauslese',{s:13,f:'s',w:700,fit:196})}
   ${T(118,192,'Erzeugerabfüllung Egon Müller zu Scharzhof',{s:11,f:'s',w:700,c:GU(),fit:184})}</g>
  <ellipse cx="146" cy="226" rx="52" ry="20" fill="none" stroke="${INK}" stroke-width=".7" filter="url(#b${U})"/>
  ${T(146,220,'Abgefüllt im',{s:7,f:'s',w:500})}${T(146,230,'Keller zu Scharzhof',{s:7,f:'s',w:500})}${T(150,239,'D 54459 Wiltingen',{s:5,f:'s',w:500})}
  ${T(103,260,'Qualitätswein mit Prädikat · Alc. 5,5% by vol.',{s:5.4,f:'l',w:500,fit:170})}`),'Scharzhofberger TBA','Egon Müller · Saar',[[16,26],[86,22],[82,64]]),
  'Wit etiket met MOSEL-SAAR-RUWER en RIESLING bovenaan, de gravure van de Scharzhof tussen de wijnheuvels, een rand van wijnbladeren en trossen, de schuine schrijfregels en het ovaal "Abgefüllt im Keller zu Scharzhof".']);

/* 18. Screaming Eagle: houtsnede van een duikende adelaar in een kader, lucht in lijnen, akkers in perspectief */
L.push(()=>['Screaming Eagle','Napa Valley',card(patch({top:38,w:196,h:262,r:-1},o=>`
  ${T(98,40,'SCREAMING',{s:20,f:'c',w:600,ls:2.5,fit:160})}
  <rect x="24" y="54" width="148" height="160" fill="${INK}" fill-opacity=".1" stroke="${GU()}" stroke-width="1.8"/>
  <g filter="url(#b${U})">
   ${Array.from({length:17},(_,i)=>`<path d="M28 ${60+i*5}c30 ${i%2?2:-2} 60 ${i%2?-2:2} 140 0" stroke="${INK}" stroke-opacity=".35" stroke-width="1" fill="none"/>`).join('')}
   <path d="M28 150h140" stroke="${INK}" stroke-width="1"/>
   ${Array.from({length:12},(_,i)=>`<path d="M${98+(i-6)*4} 150L${98+(i-6)*16} 210" stroke="${INK}" stroke-opacity=".5" stroke-width=".8"/>`).join('')}
   ${Array.from({length:6},(_,i)=>`<path d="M28 ${156+i*9}h140" stroke="${INK}" stroke-opacity=".35" stroke-width=".7"/>`).join('')}
   <g transform="translate(172 50) scale(-1.25 1.25)" fill="${INK}" stroke="#2A1206" stroke-width=".5" opacity=".95">
    <path d="M34 72C42 50 62 28 104 16C90 32 78 46 70 58Z"/>
    <path d="M44 70C46 58 52 48 58 44C56 54 56 62 60 68Z" opacity=".8"/>
    <path d="M18 92C28 78 46 66 68 60C78 57 88 60 92 66L104 68L92 72C84 80 66 84 50 86Z"/>
    <circle cx="90" cy="64" r="1.6" fill="${CREAM}"/><path d="M100 66l7 2-5 4z"/>
    <path d="M18 92L6 106L24 98L22 108L32 94Z"/>
    <path d="M58 84l-5 12M64 84l-1 12M70 82l3 11" stroke="${GU()}" stroke-width="1.6" fill="none"/>
    ${Array.from({length:6},(_,i)=>`<path d="M${50+i*8} ${56-i*6}l8 2" stroke="${CREAM}" stroke-opacity=".5" stroke-width=".7"/>`).join('')}</g></g>
  ${T(98,240,'EAGLE',{s:20,f:'c',w:600,ls:3})}`),'Screaming Eagle','Cabernet Sauvignon · Napa Valley',[[20,30],[82,44],[70,18]]),
  'Zoals jouw foto: SCREAMING boven en EAGLE onder een houtsnede in een kader, met een duikende adelaar, een lucht van golvende lijnen en akkers in perspectief. In licht leer, zoals je eerder wilde.']);

/* 19. Penfolds Grange: crème, rode lijnen langs de zijkanten, alles in rood, grote schrijfletters, tekstblok */
L.push(()=>['Penfolds Grange','South Australia · Shiraz',card(patch({top:34,w:204,h:272,r:1.2,p1:'#EBD5AE',p2:'#C09864'},o=>`
  <path d="M18 14v244M22 14v244M182 14v244M186 14v244" stroke="${RED}" stroke-width=".9" filter="url(#b${U})"/>
  ${T(30,30,'DEDICATED',{s:5.6,f:'c',w:600,c:RED,a:'start'})}${T(30,37,'MAX SCHUBERT',{s:5.6,f:'c',w:600,c:RED,a:'start'})}${T(34,44,'1915 - 1994',{s:5.6,f:'c',w:600,c:RED,a:'start'})}
  <text x="106" y="88" text-anchor="middle" font-family="${F.s}" font-weight="700" font-size="40" fill="none" stroke="${RED}" stroke-width="1.1" filter="url(#b${U})">Penfolds</text>
  <text x="106" y="88" text-anchor="middle" font-family="${F.s}" font-weight="700" font-size="40" fill="${RED}" fill-opacity=".35" filter="url(#b${U})">Penfolds</text>
  ${T(102,122,'Grange',{s:28,f:'s',w:700,c:RED})}
  <path d="M34 114h28M144 114h28" stroke="${RED}" stroke-width=".9"/>
  ${T(102,140,'SOUTH AUSTRALIA',{s:10,f:'l',w:500,c:RED})}
  ${T(102,151,'SHIRAZ',{s:10,f:'l',w:500,c:RED})}
  ${T(112,161,'BOTTLE No.',{s:7.5,f:'l',w:500,c:RED})}
  ${Array.from({length:12},(_,i)=>`<rect x="30" y="${170+i*5.4}" width="${i==4||i==11?90:146}" height="1.5" rx=".6" fill="${RED}" opacity=".55"/>`).join('')}
  ${T(102,248,'PRODUCED AND BOTTLED BY PENFOLDS WINES · MAGILL · SOUTH AUSTRALIA',{s:4.2,f:'l',w:600,c:RED,fit:150})}
  ${T(30,258,'75Cl℮',{s:7,f:'l',w:500,c:RED,a:'start'})}${T(102,258,'WINE OF AUSTRALIA',{s:6,f:'l',w:500,c:RED})}${T(176,258,'14% VOL',{s:7,f:'l',w:500,c:RED,a:'end'})}`),'Penfolds Grange','South Australia · Shiraz',[[16,24],[86,30],[80,66]]),
  'Crème etiket, helemaal in rood: dubbele rode lijnen langs de zijkanten, "Dedicated Max Schubert" linksboven, Penfolds in grote omlijnde schrijfletters, "Grange" tussen twee lijntjes en het lange tekstblok.']);

/* 20. Noval Nacional: wit etiket bovenaan, daaronder PORT en de regels direct op het leer (zoals op de fles) */
L.push(()=>['Quinta do Noval Nacional','Vintage Port · 2019',card(patch({top:36,w:206,h:150,r:-1,p1:'#ECD7B2',p2:'#C29B68'},o=>`
  ${T(103,40,'QUINTA DO NOVAL',{s:18,f:'p',w:700,c:RED,fit:168})}
  ${T(103,78,LY,{s:30,f:'l',w:500})}
  ${T(103,104,'VINTAGE',{s:17,f:'p',w:700,c:RED,ls:1})}
  ${T(103,124,'NACIONAL',{s:12,f:'p',w:700,c:RED,ls:1})}`)+`<g text-anchor="middle"><text x="150" y="238" font-family="${F.p}" font-weight="700" font-size="40" letter-spacing="4" fill="url(#g${U})" stroke="#4A2A0A" stroke-width=".4">PORT</text>
   <text x="150" y="258" font-family="${F.l}" font-weight="600" font-size="7" letter-spacing=".8" fill="#E9D3A8" fill-opacity=".85">BOTTLED AND SHIPPED BY</text>
   <text x="150" y="270" font-family="${F.l}" font-weight="600" font-size="7.5" letter-spacing=".6" fill="#E9D3A8" fill-opacity=".85">QUINTA DO <tspan fill="#D8584A" font-family="${F.p}" font-weight="700" font-size="9">NOVAL</tspan> - VINHOS, S.A.</text>
   <text x="150" y="280" font-family="${F.l}" font-weight="600" font-size="6.5" letter-spacing=".6" fill="#E9D3A8" fill-opacity=".75">PINHÃO - PORTUGAL</text></g>`,'Noval Nacional','Vintage Port · Douro · 2019',[[16,22],[86,30],[82,50]]),
  'Het witte etiket (QUINTA DO NOVAL in rood, het grote jaartal, VINTAGE en NACIONAL) opgestikt; daaronder staan PORT en de afzender direct op het leer, net zoals ze op de fles zelf gedrukt staan.']);


REG.push(...L);})();
(()=>{
const L=[];
const SIG=(x,y,sc=1)=>`<path transform="translate(${x} ${y}) scale(${sc})" d="M0 6c4-8 8-10 9-4s-2 8 1 6 5-9 8-8-1 7 2 7 5-6 7-6 0 5 3 5 6-4 9-3M6 10c6 1 18 0 30-2" stroke="${INK}" stroke-width="1" fill="none" stroke-linecap="round"/>`;
/* Échezeaux (DRC): zelfde opbouw als Romanée-Conti, naam in kapitalen met schaduwlijn */
L.push(()=>['Échezeaux','Domaine de la Romanée-Conti · 2004',card(patch({top:68,w:262,h:196,r:-.8,p1:'#E9D3AE',p2:'#BC9462'},o=>`
  <path d="M14 178h234M14 181h234" stroke="${INK}" stroke-width=".8" filter="url(#b${U})"/>
  ${T(131,26,'SOCIÉTÉ CIVILE DU DOMAINE DE LA ROMANÉE-CONTI',{s:7,w:600,f:'l',ls:.2,fit:226})}
  ${T(131,36,'PROPRIÉTAIRE À VOSNE-ROMANÉE (CÔTE-D\'OR) FRANCE',{s:7,w:600,f:'l',ls:.2,fit:214})}
  <path d="M18 33l5 2-5 2z" fill="${INK}"/>
  <text x="133" y="80" text-anchor="middle" font-family="${F.l}" font-weight="600" font-size="34" letter-spacing="1" fill="${INK}" fill-opacity=".45" textLength="206" lengthAdjust="spacingAndGlyphs" filter="url(#b${U})">ÉCHÉZEAUX</text>
  <text x="131" y="78" text-anchor="middle" font-family="${F.l}" font-weight="600" font-size="34" letter-spacing="1" fill="#E9D3AE" fill-opacity=".85" stroke="${INK}" stroke-width="1.1" textLength="206" lengthAdjust="spacingAndGlyphs" filter="url(#b${U})">ÉCHÉZEAUX</text>
  ${T(34,96,'APPELLATION ÉCHÉZEAUX CONTRÔLÉE',{s:8.4,f:'l',w:700,c:GRN,ls:.4,a:'start',fit:170})}
  ${T(30,116,'15.204',{s:8,f:'l',w:500,it:1,a:'start'})}
  ${T(132,114,'Bouteilles Récoltées',{s:13,f:'s',w:500})}
  ${T(170,128,'LES ASSOCIÉS-GÉRANTS',{s:5.6,f:'l',w:600,a:'start'})}
  ${SIG(166,132,1.1)}${SIG(184,146,.9)}
  ${T(30,140,'BOUTEILLE Nº 08306',{s:7,f:'l',w:600,a:'start'})}
  ${T(30,154,'ANNÉE '+LY,{s:9,f:'l',w:700,a:'start'})}
  ${T(131,172,'Mise en bouteille au domaine',{s:11,f:'c',w:600,it:1})}`),'Échezeaux','Domaine de la Romanée-Conti · 2004',[[16,40],[86,30],[22,66]]),
  'Zelfde opbouw als Romanée-Conti (zelfde domein), maar met ÉCHÉZEAUX in omlijnde kapitalen met een schaduwlijn, de groene appellatieregel, het aantal flessen en "Année 2004".']);

REG.push(...L);})();

/* namen uit landen.js → ontwerp */
const ALIAS={'Musigny Vieilles Vignes':'Musigny','Salon Le Mesnil':'Salon','Screaming Eagle Cabernet Sauvignon':'Screaming Eagle'};
let IDX=null;
const index=()=>{if(IDX)return IDX;IDX={};const keep=LY;LY='';for(const f of REG){try{const r=f();IDX[r[0]]=f}catch(e){console.warn('legende',e)}}LY=keep;return IDX};
function legSVG(c,opt={}){
  if(!c||c.rar!=='icon'||typeof iconOf!=='function')return null;
  const ic=iconOf(c);if(!ic||!ic.legend)return null;
  const f=index()[ALIAS[ic.name]||ic.name];if(!f)return null;
  LY=c.jaar?String(c.jaar):'';LMINI=!!opt.mini;try{return f()[2]}catch(e){console.warn('legende',e);return null}finally{LMINI=false}
}
/* alle 21 voor het beheerdersscherm */
const SAMPLE={'Romanée-Conti':2015,'Échezeaux':2004,'Musigny':2022,'Pétrus':2016,'Le Pin':2010,'Château Lafite Rothschild':2014,'Château Mouton Rothschild':2023,'Château Margaux':2015,"Château d'Yquem":2001,'Salon':2012,'Château Rayas':2017,'Masseto':2018,'Brunello di Montalcino Riserva':2015,'Barolo Monfortino Riserva':2013,'Vega Sicilia Único':2012,'Pingus':2019,'Scharzhofberger Riesling Trockenbeerenauslese':2018,'Screaming Eagle':2019,'Penfolds Grange':2018,'Quinta do Noval Nacional':2019};
function legAll(){const r=Object.keys(index()).map(n=>{LY=String(SAMPLE[n]||'');return {name:n,svg:IDX[n]()[2]}});LY='';return r}
window.legSVG=legSVG;window.legAll=legAll;window.moutonArt=typeof moutonArt==='function'?moutonArt:undefined;
})();
