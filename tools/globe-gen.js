// Genereert winex/globe.js: landen als lon/lat-ringen (Natural Earth, publiek domein, via world-atlas)
const topo=require('topojson-client'),fs=require('fs');
const w110=require('world-atlas/countries-110m.json'),w50=require('world-atlas/countries-50m.json');
const f110=topo.feature(w110,w110.objects.countries).features,f50=topo.feature(w50,w50.objects.countries).features;
const ISO=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const wineIds=new Set(Object.values(ISO));
function simp(rings,step,minD){
  const out=[];
  for(const r of rings){const q=[];let last=null;
    for(const [x,y] of r){const p=[+(Math.round(x/step)*step).toFixed(2),+(Math.round(y/step)*step).toFixed(2)];if(last&&Math.hypot(p[0]-last[0],p[1]-last[1])<minD)continue;q.push(p);last=p}
    if(q.length>=4){const a=q[0],b=q[q.length-1];if(a[0]!==b[0]||a[1]!==b[1])q.push([a[0],a[1]]);out.push(q)}}
  return out;
}
function polys(g){return g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[]}
const C=[];
for(const f of f110){if(!f.id||f.id==='010')continue;
  const src=wineIds.has(f.id)?(f50.find(x=>x.id===f.id)||f):f,fine=src!==f;
  const P=polys(src.geometry).map(p=>simp(p,fine?0.05:0.1,fine?0.09:0.25)).filter(p=>p.length);
  if(P.length)C.push({id:f.id,p:P});
}
const js='/* Vined It – wereldbol. Natural Earth (publiek domein) via world-atlas, vereenvoudigd. Niet met de hand bewerken: tools/globe-gen.js */\nconst GLOBE='+JSON.stringify(C)+';\n';
fs.writeFileSync(process.argv[3],js);console.log('bytes',js.length,'countries',C.length);
