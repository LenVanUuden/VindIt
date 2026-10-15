/* =====================================================================
   Vined It – lakzegels
   Eén uniek embleem per land, per set (streek) en per uitdaging.
   Emblemen zijn eenvoudige silhouetten in een vak van -28..28, gecentreerd.
   ===================================================================== */
const ZW={ // wasskleuren [basis, licht, donker]
  rood:['#8E1F27','#B8443F','#4E0E12'],bordeaux:['#6E1830','#94405A','#3A0815'],groen:['#2C5546','#4F7D69','#14281F'],
  pruim:['#5B2A55','#80507A','#2C1029'],oker:['#9A6A1E','#C8963F','#4E330A'],roest:['#A04A22','#C8703F','#56230C'],
  blauw:['#2B4A6E','#4E719A','#13233A'],goud:['#B08A2E','#D8B45A','#5C4510'],zwart:['#252220','#4E4844','#0A0908'],
  olijf:['#5E6A2C','#86924A','#2C3412'],teal:['#1F5C66','#3F8590','#0C2A30'],roze:['#A0466A','#C76E90','#561E37'],
};
const P=(d,extra='')=>`<path d="${d}" ${extra}/>`;
const C=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}"/>`;
const L=(d,w=2.4)=>`<path d="${d}" fill="none" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ZE={
  /* ---------------- landen ---------------- */
  'Frankrijk':[ZW.blauw,P('M0-28l3 10h-6zM-3-18h6l2 12h-10zM-5-6h10l6 18h-6c-1-5-3-8-5-8s-4 3-5 8h-6zM-13 12h26v4h-26z')+L('M-8 0h16',1.6)],
  'Italië':[ZW.groen,P('M-26 14v-22h52v22h-6v-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8v8h-4v-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8v8z M-26-12v-6h52v6z')+L('M-26-14h52',1)],
  'Spanje':[ZW.rood,P('M-24-2c2-8 8-12 18-12h10c5 0 8-5 8-8 4 2 5 5 4 8 4 0 6 2 7 5-3 1-5 1-7 0-1 4-3 6-6 8v12h-5l-1-8c-6 2-13 2-18 0l-2 8h-5l1-10c-4-1-7 0-10 1z')+L('M14-18c-1-5-6-7-11-6M21-17c3-4 8-5 11-2',2.4)],
  'Portugal':[ZW.teal,P('M-22 8h44l-6 10h-32z M-2 6V-24l-1 0v30z M0-24c10 4 16 12 18 26H0z M-3-18c-7 4-12 11-14 20h14z')],
  'Duitsland':[ZW.goud,P('M-26 16h52v4h-52z M-24-8h48v4h-48z M-26-14h52l-4 6h-44z M-20-4h4v20h-4zM-10-4h4v20h-4zM6-4h4v20h-4zM16-4h4v20h-4z M-6-22h12v8h-12z')+P('M0-28l4 6h-8z')],
  'Oostenrijk':[ZW.rood,`<g>${Array.from({length:8},(_,i)=>`<ellipse cx="0" cy="-13" rx="5" ry="13" transform="rotate(${i*45})"/>`).join('')}</g>`+C(0,0,6)],
  'Nederland':[ZW.oker,P('M-6 22l2-26h8l2 26z M-8-6h16l-8-8z')+P('M0-8L-24-26l-3 3 21 19zM0-8l24-18 3 3-21 19zM0-8l-18 22 3 3 17-21zM0-8l18 22-3 3-17-21z','opacity=".85"')+C(0,-8,3)],
  'Verenigd Koninkrijk':[ZW.blauw,P('M-6 22v-30h12v30z M-8-8h16v-6h-16z M-4-14l4-12 4 12z')+`<circle cx="0" cy="2" r="4.5" fill="none" stroke-width="1.6"/>`+L('M0 2v-3M0 2l2 1',1.2)],
  'Zuid-Afrika':[ZW.roze,`<g>${Array.from({length:9},(_,i)=>`<path d="M0 4C-4-6-4-16 0-24 4-16 4-6 0 4z" transform="rotate(${-80+i*20} 0 6)"/>`).join('')}</g>`+P('M-10 8c3 6 17 6 20 0-4 4-16 4-20 0z')],
  'Chili':[ZW.zwart,P('M-28-4c8-4 16-4 22 0 2-4 4-6 8-6 4 0 6 2 6 5l6 1-6 2c0 2-2 4-4 5 7-2 14-2 22 1-8 2-14 4-20 8l-4 10-4-8c-6-4-14-8-26-18z')],
  'Argentinië':[ZW.blauw,C(0,0,9)+`<g>${Array.from({length:16},(_,i)=>i%2?`<path d="M0-12l2 10h-4z" transform="rotate(${i*22.5})"/>`:`<path d="M0-12c3 4-3 8 0 14" transform="rotate(${i*22.5}) translate(0 -8)" fill="none" stroke-width="2"/>`).join('')}</g>`],
  'Verenigde Staten':[ZW.blauw,P('M-4 24v-24h8v24z M-8 0h16l-2-6h-12z M-6-6c-4-8 2-14 6-20 4 6 10 12 6 20z')+L('M-2-12c-1-4 1-7 2-9',1.4)],
  'Australië':[ZW.oker,P('M-28 16h56v4h-56z M-24 16c2-14 8-24 18-28-4 8-5 18-4 28z M-10 16c2-16 10-28 22-32-5 10-7 22-6 32z M6 16c3-12 10-20 20-22-4 6-6 14-6 22z')],
  'Nieuw-Zeeland':[ZW.groen,L('M0 26C0 6 6-10 20-14',2.4)+`<g>${Array.from({length:7},(_,i)=>{const t=i/7,x=t*18,y=24-t*36;return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l-14-${(4+i).toFixed(0)}c6 0 11 2 14 ${(4+i/2).toFixed(0)}z M${x.toFixed(1)} ${y.toFixed(1)}l12-${(10-i).toFixed(0)}c-2 6-6 9-12 ${(10-i).toFixed(0)}z"/>`}).join('')}</g>`],
  'Griekenland':[ZW.blauw,P('M-14-22h28v4h-28z M-11-18h22v3h-22z M-9-15h4v32h-4zM-2-15h4v32h-4zM5-15h4v32h-4z M-14 17h28v5h-28z')],
  'Hongarije':[ZW.groen,P('M-26 18h52v4h-52z M-24 6h48v12h-48z M-10-6a10 10 0 0 1 20 0v12h-20z M-1-24h2v8h-2z M-22 0l4-8 4 8zM14 0l4-8 4 8z')+C(0,-16,2)],
  'Georgië':[ZW.roest,P('M-14-18h28c0 4-3 6-4 8 10 6 14 16 10 26-3 6-10 9-16 9s-13-3-16-9c-4-10 0-20 10-26-1-2-4-4-4-8z')+L('M-12 0h24',1.4)],
  'Libanon':[ZW.groen,P('M-2 24v-8h4v8z M0-26l6 6h-3l7 7h-4l9 8h-5l10 9H-20l10-9h-5l9-8h-4l7-7h-3z')],
  'Uruguay':[ZW.oker,P('M-12-4c0-10 6-16 12-16s12 6 12 16c0 12-6 20-12 20s-12-8-12-20z M-6-22h12v-4h-12z')+L('M8-26l10-4',2.4)],
  'België':[ZW.zwart,`<g>${[[0,0],[0,-18],[0,18],[-15,-9],[15,-9],[-15,9],[15,9]].map(([x,y])=>C(x,y,5)).join('')}</g>`+L('M0-18V18M-15-9l30 18M15-9l-30 18',1.6)],
  'Zwitserland':[ZW.rood,P('M-28 22l18-30 6 8 10-26 22 48z')+P('M-1-26l5 14-3-2-2 4-2-4-3 2z','opacity=".5"')],
  'Canada':[ZW.rood,P('M0-26l4 8 6-2-2 10 8-6 2 4 6-2-4 10 4 2-12 8 2 4H2v10h-4V12h-12l2-4-12-8 4-2-4-10 6 2 2-4 8 6-2-10 6 2z')],
  'Japan':[ZW.rood,P('M-26-20c18 3 34 3 52 0v5c-18 3-34 3-52 0z M-20-10h40v4h-40z M-16-10h5v32h-5zM11-10h5v32h-5z M-2-14h4v8h-4z')],
  'Israël':[ZW.roze,P('M0-14c-12 0-20 8-20 18s8 18 20 18 20-8 20-18-8-18-20-18z M-6-14l2-8 4 5 4-5 2 8z')+L('M-8 2c4 3 12 3 16 0',1.6)],
  'Kroatië':[ZW.rood,`<g>${Array.from({length:25},(_,i)=>{const r=Math.floor(i/5),c=i%5;return (r+c)%2?'':`<rect x="${-15+c*6}" y="${-16+r*6}" width="6" height="6"/>`}).join('')}</g>`+L('M-16-16h30v14c0 10-8 16-15 18-7-2-15-8-15-18z',1.6)],
  'Luxemburg':[ZW.blauw,P('M-6-22c6-2 12 2 12 8 0 4-2 6 0 10 4 6 4 14-2 18 4 0 8 2 8 6H-10c0-4 2-6 6-7-4-4-6-10-2-16-4-2-6-6-4-10l-4-2 4-1c0-3 2-5 4-6z')+L('M6-16c6-6 14-2 12 4',2)],
  /* ---------------- sets met meerdere sets per land ---------------- */
  'bordeaux':[ZW.bordeaux,P('M-24 20h48v3h-48z M-20 20V0h40v20z M-24 0l4-10 4 10zM16 0l4-10 4 10z M-6 0v-14h12V0z M-8-14l8-10 8 10z M-2 10h4v10h-4z')+`<g fill="none" stroke-width="1.4"><path d="M-14 6h4v6h-4zM10 6h4v6h-4z"/></g>`],
  'bourgogne':[ZW.pruim,P('M-22 22V2l22-14 22 14v20z M-4 22V10a4 4 0 0 1 8 0v12z M-2-12v-12h4v12z')+`<g fill="none" stroke-width="1.6"><path d="M-14 6v6M14 6v6"/></g>`+C(0,-6,3)],
  'beaujolais':[ZW.rood,P('M-10-20h20l-2 6c8 4 12 12 10 22-1 8-8 14-18 14S-17 16-18 8c-2-10 2-18 10-22z')+L('M-16 4c10 3 22 3 32 0',1.4)],
  'rhone':[ZW.roest,`<g transform="rotate(-35)"><path d="M-3-26h6v30h6v4h-6v4h4v4h-4v6h-6z"/><circle cx="0" cy="-20" r="7" fill="none" stroke-width="3"/></g><g transform="rotate(35)"><path d="M-3-26h6v30h6v4h-6v4h4v4h-4v6h-6z"/><circle cx="0" cy="-20" r="7" fill="none" stroke-width="3"/></g>`],
  'loire':[ZW.teal,P('M-24 22v-18h10v-8l-3-8h16l-3 8v8h8v-8l-3-8h16l-3 8v8h10v18z M-22-4l7-10 7 10zM8-4l7-10 7 10z M-4-4V-16h8v12z M-6-16l6-10 6 10z')],
  'jura':[ZW.oker,P('M-26 14l30-26 22 14v14z')+`<g fill="none" stroke-width="1.6">${C(-6,6,3)}${C(8,2,2.5)}${C(14,12,2)}</g>`+L('M-26 14l30-8 22 8',1.4)],
  'champagne':[ZW.goud,P('M-18-14h36c0 10-8 16-18 16s-18-6-18-16z M-2 2h4v16h-4z M-12 18h24v4h-24z')+C(-6,-20,2)+C(4,-24,2.5)+C(10,-19,1.6)],
  'elzas':[ZW.zwart,P('M-4 4c-10 2-18-4-20-12 6 4 12 6 18 4-6-2-10-8-8-14 4 6 10 8 16 8 4-6 10-8 14-6l6-4-4 6c2 4 0 8-4 10z')+L('M-2 4l-4 20M2 4l4 20M20-10l8-2',1.8)],
  'languedoc':[ZW.roest,P('M-28 22l6-10h44l6 10z M-20 12V-6h6v4h4v-4h6v4h4v-4h6v4h4v-4h6v18z M-6-6v-16h4v4h4v-4h4v16z')],
  'provence':[ZW.pruim,L('M0 26V-4M-8 26l6-18M8 26l-6-18',1.8)+`<g>${Array.from({length:9},(_,i)=>C(0,-8-i*2.4,2.4)+C(-8+i*.4,6-i*2.2,2)+C(8-i*.4,6-i*2.2,2)).join('')}</g>`],
  'zuidwest':[ZW.olijf,P('M-22 6c0-8 8-12 16-10 2-8 8-12 14-10 6 2 8 8 4 12l10 2-10 2c0 10-10 18-22 18-8 0-12-6-12-14z')+C(8,-10,1.8)],
  'toscane':[ZW.rood,P('M0-26c5 7 6 20 4 32H-4c-2-12-1-25 4-32z M-13-12c4 6 4 14 3 20h-6c-1-6-1-14 3-20z M13-12c4 6 4 14 3 20h-6c-1-6-1-14 3-20z')+L('M-24 12c10-4 38-4 48 0',2.4)],
  'piemonte':[ZW.oker,P('M-18 2c-4-10 4-20 14-20 6 0 10 2 14 0 8 0 14 8 12 18-2 12-14 18-24 16-8-2-14-6-16-14z')+`<g fill="none" stroke-width="1.4">${C(-6,-4,2)}${C(4,4,2.5)}${C(10,-6,1.8)}${C(-2,10,1.6)}</g>`],
  'veneto':[ZW.teal,P('M-28 8c10 6 46 6 56 0l-2 4c-8 6-44 6-52 0z M-22 8l2-6c6 2 34 2 40 0l2 6z M20 2l6-14 2 1-5 13z M-10 2v-8h8v8z')+L('M24-12l-8 24',1.6)],
  'midden-noord-italie':[ZW.olijf,L('M-22 18C-8 8 6-6 22-20',2.2)+`<g>${Array.from({length:6},(_,i)=>{const x=-18+i*7,y=15-i*6.4;return `<ellipse cx="${(x-3).toFixed(1)}" cy="${(y-5).toFixed(1)}" rx="2.6" ry="6" transform="rotate(-50 ${(x-3).toFixed(1)} ${(y-5).toFixed(1)})"/><ellipse cx="${(x+4).toFixed(1)}" cy="${(y+3).toFixed(1)}" rx="2.6" ry="6" transform="rotate(40 ${(x+4).toFixed(1)} ${(y+3).toFixed(1)})"/>`}).join('')}</g>`+C(-8,4,3)+C(6,-8,3)],
  'zuid-italie':[ZW.oker,P('M-16 4c0-12 8-20 18-20s16 8 16 18c0 12-8 18-18 18-10 0-16-6-16-16z M2-16c0-6 4-10 10-10-2 4-4 8-10 10z')+P('M18-2l6-2-5 4z')],
  'sicilie':[ZW.roest,P('M-28 20l18-22h20l18 22z M-10-2c2-2 6-4 10-4s8 2 10 4z')+L('M-2-8c-4-6 0-12 4-14M4-8c2-6 8-8 10-14',2)],
  'rioja':[ZW.bordeaux,P('M-18-16c6-6 30-6 36 0 4 10 4 22 0 32-6 6-30 6-36 0-4-10-4-22 0-32z')+`<g fill="none" stroke-width="2"><path d="M-21-6c8 3 34 3 42 0M-21 6c8 3 34 3 42 0"/></g>`+L('M-8-16c-2 10-2 22 0 32M8-16c2 10 2 22 0 32',1)],
  'noordwest-spanje':[ZW.blauw,P('M0 22C-20 18-26 0-24-14c8-8 40-8 48 0 2 14-4 32-24 36z M-6 22h12l-2 4h-8z')+`<g fill="none" stroke-width="1.4">${[-16,-8,0,8,16].map(x=>`<path d="M0 20L${x} -14"/>`).join('')}</g>`],
  'noordoost-spanje':[ZW.rood,P('M-14-6c0-6 6-10 14-10s14 4 14 10c0 4-2 6-4 8 6 4 8 10 6 16-2 6-8 8-16 8S-14 24-16 18c-2-6 0-12 6-16-2-2-4-4-4-8z')+L('M8-12l14-14M-2-16v-8',2.2)],
  'oost-spanje':[ZW.oker,C(0,4,17)+P('M0-12c2-8 8-12 14-12-2 6-6 10-14 12z')+`<g fill="none" stroke-width="1.2" opacity=".6">${C(-6,0,1.2)}${C(4,8,1.2)}${C(8,-2,1.2)}</g>`],
  'centraal-zuid-spanje':[ZW.roest,P('M-28 6c6-4 16-6 28-6s22 2 28 6c-4 4-14 6-28 6S-24 10-28 6z M-14 2c0-10 6-16 14-16s14 6 14 16c-8 2-20 2-28 0z')+L('M-14-2c8 2 20 2 28 0',1.6)],
  /* ---------------- uitdagingen ---------------- */
  'starter':[ZW.goud,`<g>${[-18,-9,0,9,18].map((x,i)=>`<circle cx="${x}" cy="${Math.abs(x)/3-4}" r="5.5"/>`).join('')}</g>`+L('M-22 12h44',2)+P('M0-26l2 5 5 .4-4 3 1.4 5L0-15l-4.4 2.6 1.4-5-4-3 5-.4z')],
  'wereldreiziger':[ZW.blauw,`<circle r="20" fill="none" stroke-width="2"/>`+P('M0-26l5 26-5 26-5-26z')+P('M-26 0l26-5 26 5-26 5z','opacity=".7"')+C(0,0,3)],
  'wereldreiziger-2':[ZW.teal,P('M0-26c12 0 20 8 20 18 0 8-8 14-12 18h-16C-12 6-20 0-20-8c0-10 8-18 20-18z M-6 14h12v8h-12z')+L('M-8 10l2 4M8 10l-2 4M0-26c-6 6-6 30 0 36M0-26c6 6 6 30 0 36',1.4)],
  'chardonnay':[ZW.oker,`<text x="0" y="9" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="26">Ch</text>`+L('M-22 16c10 6 34 6 44 0',1.6)],
  'pinot-noir':[ZW.pruim,`<text x="0" y="9" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="26">PN</text>`+L('M-22 16c10 6 34 6 44 0',1.6)],
  'sauvignon-blanc':[ZW.groen,`<text x="0" y="9" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="26">SB</text>`+L('M-22 16c10 6 34 6 44 0',1.6)],
  'syrah':[ZW.zwart,`<text x="0" y="9" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="26">Sy</text>`+L('M-22 16c10 6 34 6 44 0',1.6)],
  'cabernet':[ZW.bordeaux,`<text x="0" y="9" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="26">CS</text>`+L('M-22 16c10 6 34 6 44 0',1.6)],
  'bubbels':[ZW.goud,P('M-6 26V2c-2-4-2-10 0-14h12c2 4 2 10 0 14v24z M-6-14h12v-4h-12z')+P('M-2-22h4l2-6h-8z')+C(-12,-22,2)+C(12,-24,2.4)+C(-16,-12,1.6)+C(16,-14,1.6)],
  'icons':[ZW.zwart,P('M-22 12l-4-26 14 12 12-20 12 20 14-12-4 26z M-22 14h44v6h-44z')+C(-26,-16,2.6)+C(0,-28,2.6)+C(26,-16,2.6)],
};
ZE.overige=[ZW.zwart,P('M-12-22h24c0 14-5 22-12 23-7-1-12-9-12-23z M-2 1h4v15h-4z M-10 16h20v4h-20z')+P('M-10-12h20c-1 8-5 12-10 12s-9-4-10-12z','opacity=".5"')];
ZE['Overige landen']=[ZW.olijf,`<circle r="20" fill="none" stroke-width="2.4"/>`+L('M-20 0h40M0-20c-8 8-8 32 0 40M0-20c8 8 8 32 0 40M-17-10h34M-17 10h34',1.6)];
ZE['bordeaux-1']=ZE['bordeaux-2']=ZE.bordeaux;ZE['bourgogne-1']=ZE['bourgogne-2']=ZE.bourgogne;
// Landen met één set: zelfde zegel
const ZE_SET_LAND={'nieuw-zeeland':'Nieuw-Zeeland',portugal:'Portugal',duitsland:'Duitsland',oostenrijk:'Oostenrijk',nederland:'Nederland','verenigd-koninkrijk':'Verenigd Koninkrijk','zuid-afrika':'Zuid-Afrika',chili:'Chili',argentinie:'Argentinië','verenigde-staten':'Verenigde Staten',australie:'Australië'};
for(const [k,v] of Object.entries(ZE_SET_LAND))ZE[k]=ZE[v];
const ZE_NUM={'bordeaux-1':'I','bordeaux-2':'II','bourgogne-1':'I','bourgogne-2':'II'};

let ZN=0;
function zBlob(r,seed){
  const pts=[];for(let i=0;i<28;i++){const a=i/28*Math.PI*2,j=Math.sin(i*2.7+seed)*0.06+Math.sin(i*5.3+seed*2)*0.04;pts.push([Math.cos(a)*r*(1+j),Math.sin(a)*r*(1+j)])}
  let d=`M${((pts[0][0]+pts[27][0])/2).toFixed(1)} ${((pts[0][1]+pts[27][1])/2).toFixed(1)}`;
  for(let i=0;i<pts.length;i++){const q=pts[i],p=pts[(i+1)%pts.length];d+=` Q${q[0].toFixed(1)} ${q[1].toFixed(1)} ${((p[0]+q[0])/2).toFixed(1)} ${((p[1]+q[1])/2).toFixed(1)}`}return d+'Z';
}
/* key: landnaam, set-id of uitdaging-id; label: tekst rond de rand; state: {have,tot,done,count} */
function waxSeal(key,label,o={}){
  ZN++;const id='z'+ZN,e=ZE[key]||[ZW.bordeaux,C(0,0,8)],w=e[0],emb=e[1],num=ZE_NUM[key];
  const t=String(label||'').toUpperCase(),fs=t.length>18?6.2:t.length>13?7.2:9;
  const text=`<path id="${id}t" d="M-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0" fill="none"/>`;
  if(o.ghost) return `<svg viewBox="-75 -75 150 150" class="wax ghost" aria-hidden="true"><defs>${text}</defs>
    <circle r="56" fill="none" stroke="rgba(233,211,160,.28)" stroke-width="1.5" stroke-dasharray="3 4"/>
    <circle r="48" fill="rgba(0,0,0,.18)" stroke="rgba(233,211,160,.18)"/><circle r="36" fill="none" stroke="rgba(233,211,160,.2)"/>
    <g fill="rgba(233,211,160,.28)" stroke="rgba(233,211,160,.45)" stroke-width=".9" transform="scale(1.22)">${emb}</g>${num?`<text y="31" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="9" fill="rgba(233,211,160,.4)">${num}</text>`:''}
    <text font-family="Cormorant Garamond,Georgia,serif" font-weight="700" font-size="${fs}" letter-spacing="2" fill="rgba(233,211,160,.42)"><textPath href="#${id}t" startOffset="25%" text-anchor="middle">${esc(t)}</textPath></text></svg>`;
  const badge=o.done?`<g transform="translate(0 56)"><path d="M-36-7h72l-7 8 7 8h-72l7-8z" fill="#C9A253" stroke="#7A5A1C"/><text y="4.5" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="8" letter-spacing="1.4" fill="#3A2418">VOLTOOID</text></g>`
    :o.count!=null?`<g transform="translate(44 40)"><circle r="15" fill="#1F2622" stroke="#C9A253" stroke-width="1.6"/><text y="4" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-weight="600" font-size="11" fill="#F6E2A8">${o.count}</text></g>`
    :o.have!=null?`<g transform="translate(44 40)"><circle r="15" fill="#1F2622" stroke="#C9A253" stroke-width="1.6"/><text y="4" text-anchor="middle" font-family="Libre Franklin,sans-serif" font-weight="600" font-size="${String(o.have+'/'+o.tot).length>4?8.5:10.5}" fill="#F6E2A8">${o.have}/${o.tot}</text></g>`:'';
  return `<svg viewBox="-75 -75 150 150" class="wax" aria-hidden="true"><defs>
    <radialGradient id="${id}w" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="${w[1]}"/><stop offset=".55" stop-color="${w[0]}"/><stop offset="1" stop-color="${w[2]}"/></radialGradient>
    <radialGradient id="${id}i" cx=".62" cy=".68" r=".75"><stop offset="0" stop-color="${w[0]}"/><stop offset=".7" stop-color="${w[0]}"/><stop offset="1" stop-color="${w[2]}"/></radialGradient>
    <filter id="${id}f" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity=".55"/></filter>
    <filter id="${id}e"><feGaussianBlur in="SourceAlpha" stdDeviation="1"/><feOffset dx="-1" dy="-1.2" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="hl"/><feFlood flood-color="#fff" flood-opacity=".45"/><feComposite in2="hl" operator="in" result="h"/><feGaussianBlur in="SourceAlpha" stdDeviation="1"/><feOffset dx="1.2" dy="1.4" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="sh"/><feFlood flood-color="#000" flood-opacity=".55"/><feComposite in2="sh" operator="in" result="s"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="h"/><feMergeNode in="s"/></feMerge></filter>
    ${text}</defs>
    <g filter="url(#${id}f)"><path d="${zBlob(60,(key.length*7+ZN)%13)}" fill="url(#${id}w)"/></g>
    <circle r="49" fill="url(#${id}i)" filter="url(#${id}e)"/>
    <circle r="49" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/><circle r="37" fill="none" stroke="rgba(255,255,255,.18)"/>
    <g fill="${w[2]}" stroke="${w[1]}" stroke-width=".9" filter="url(#${id}e)" opacity=".85" transform="scale(1.22)">${emb}</g>
    ${num?`<text y="32" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="9" fill="${w[2]}" filter="url(#${id}e)">${num}</text>`:''}
    <text font-family="Cormorant Garamond,Georgia,serif" font-weight="700" font-size="${fs}" letter-spacing="2" fill="${w[2]}" filter="url(#${id}e)"><textPath href="#${id}t" startOffset="25%" text-anchor="middle">${esc(t)}</textPath></text>
    <path d="M-50-22c4-14 14-26 28-32" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/>${badge}</svg>`;
}
