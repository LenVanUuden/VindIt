// Genereer maps.js opnieuw: npm i world-atlas@2 topojson-client@3 && node tools/maps-gen.js maps.js
// Genereert winex/maps.js: vooraf berekende SVG-paden (Natural Earth via world-atlas, publiek domein)
const topo=require('topojson-client');
const w110=require('world-atlas/countries-110m.json');
const w50=require('world-atlas/countries-50m.json');
const fs=require('fs');

const ISO={'Frankrijk':'250','Italië':'380','Spanje':'724','Portugal':'620','Duitsland':'276','Oostenrijk':'040','Nederland':'528',
 'Verenigd Koninkrijk':'826','Zuid-Afrika':'710','Chili':'152','Argentinië':'032','Verenigde Staten':'840','Australië':'036','Nieuw-Zeeland':'554',
 'Griekenland':'300','Hongarije':'348','Georgië':'268','Libanon':'422','Uruguay':'858','België':'056','Zwitserland':'756','Canada':'124',
 'Japan':'392','Israël':'376','Kroatië':'191','Luxemburg':'442'};
const BOX={ // [lonMin, latMin, lonMax, latMax], vasteland
 'Frankrijk':[-5.3,42.2,8.4,51.2],'Italië':[6.5,36.5,18.7,47.2],'Spanje':[-9.5,35.9,3.5,43.9],'Portugal':[-9.7,36.8,-6.0,42.3],
 'Duitsland':[5.8,47.2,15.1,55.1],'Oostenrijk':[9.5,46.3,17.2,49.1],'Nederland':[3.3,50.7,7.3,53.6],'Verenigd Koninkrijk':[-8.3,49.8,1.9,58.8],
 'Zuid-Afrika':[16.3,-35,33,-22],'Chili':[-76,-56,-66.3,-17.4],'Argentinië':[-73.7,-55.2,-53.5,-21.7],'Verenigde Staten':[-125,24.3,-66.8,49.5],
 'Australië':[112.8,-43.8,153.8,-10.5],'Nieuw-Zeeland':[166.2,-47.5,178.7,-34.2]};

const fc110=topo.feature(w110,w110.objects.countries);
const fc50=topo.feature(w50,w50.objects.countries);

function mk(b,width){const c=Math.cos((b[1]+b[3])/2*Math.PI/180);const k=width/((b[2]-b[0])*c);return {b,k:+k.toFixed(5),c:+c.toFixed(5),w:width,h:+((b[3]-b[1])*k).toFixed(1)}}
function P(m,lon,lat){return [(lon-m.b[0])*m.k*m.c,(m.b[3]-lat)*m.k]}
function ringBox(r){let a=[1e9,1e9,-1e9,-1e9];for(const [x,y] of r){a[0]=Math.min(a[0],x);a[1]=Math.min(a[1],y);a[2]=Math.max(a[2],x);a[3]=Math.max(a[3],y)}return a}
function hits(bb,b){return !(bb[2]<b[0]||bb[0]>b[2]||bb[3]<b[1]||bb[1]>b[3])}
function clipRect(pts,x0,y0,x1,y1){
  const edges=[[p=>p[0]>=x0,(a,b)=>{const t=(x0-a[0])/(b[0]-a[0]);return [x0,a[1]+t*(b[1]-a[1])]}],
               [p=>p[0]<=x1,(a,b)=>{const t=(x1-a[0])/(b[0]-a[0]);return [x1,a[1]+t*(b[1]-a[1])]}],
               [p=>p[1]>=y0,(a,b)=>{const t=(y0-a[1])/(b[1]-a[1]);return [a[0]+t*(b[0]-a[0]),y0]}],
               [p=>p[1]<=y1,(a,b)=>{const t=(y1-a[1])/(b[1]-a[1]);return [a[0]+t*(b[0]-a[0]),y1]}]];
  let out=pts;
  for(const [inside,cut] of edges){const inp=out;out=[];if(!inp.length)break;
    for(let i=0;i<inp.length;i++){const cur=inp[i],prev=inp[(i+inp.length-1)%inp.length];
      if(inside(cur)){if(!inside(prev))out.push(cut(prev,cur));out.push(cur)}else if(inside(prev))out.push(cut(prev,cur))}}
  return out;
}
function pathOf(geom,m,dec,pad=0,minD=0,world=false){
  const polys=geom.type==='Polygon'?[geom.coordinates]:geom.type==='MultiPolygon'?geom.coordinates:[];
  const f=10**dec,e=m.w*0.02;let out='';
  for(const poly of polys){
    for(const ring of poly){
      let pts=ring.map(([lon,lat])=>P(m,lon,lat));
      if(world){ // ringen die de datumgrens kruisen overslaan (alleen kleine eilanden / randstukken)
        let jump=false;for(let i=1;i<pts.length;i++)if(Math.abs(pts[i][0]-pts[i-1][0])>m.w/2){jump=true;break}
        if(jump)continue;
      }
      pts=clipRect(pts,-e,-e,m.w+e,m.h+e);
      let last=null,seg=[];
      for(const [x,y] of pts){const q=[Math.round(x*f)/f,Math.round(y*f)/f];if(last&&Math.hypot(q[0]-last[0],q[1]-last[1])<=minD)continue;seg.push(q);last=q}
      if(seg.length<3)continue;
      out+='M'+seg.map(q=>q[0]+' '+q[1]).join('L')+'Z';
    }
  }
  return out;
}
const byId=(fc,id)=>fc.features.find(f=>f.id===id);
const out={ISO,world:null,europe:null,lands:{}};
// Wereld (110m), zonder Antarctica
{const m=mk([-180,-56,180,78],1000);m.c=1;m.k=+(1000/360).toFixed(5);m.h=+((78+56)*m.k).toFixed(1);const d={};
 for(const f of fc110.features){if(f.id==='010'||!f.id)continue;const p=pathOf(f.geometry,m,0,5,1.5,true);if(p)d[f.id]=p}
 out.world={...m,d};}
// Europa (50m)
{const m=mk([-11,34.5,32,61],600);const d={};
 for(const f of fc50.features){if(!f.id)continue;const p=pathOf(f.geometry,m,0,2,1.6);if(p)d[f.id]=p}
 out.europe={...m,d};}
// Landen (50m), breedte 100
for(const [name,b] of Object.entries(BOX)){const m=mk(b,100);const f=byId(fc50,ISO[name]);out.lands[name]={...m,d:pathOf(f.geometry,m,1,1,0.7)}}
// Middelpunten per land (voor stipjes)
out.centroid={};
const cen={'Frankrijk':[2.5,46.6],'Italië':[12.5,42.8],'Spanje':[-3.6,40.2],'Portugal':[-8.1,39.6],'Duitsland':[10.3,51.1],'Oostenrijk':[14.5,47.6],
 'Nederland':[5.6,52.2],'Verenigd Koninkrijk':[-1.6,52.6],'Zuid-Afrika':[19.5,-33.5],'Chili':[-71,-34.5],'Argentinië':[-68.5,-33],'Verenigde Staten':[-120.5,38],
 'Australië':[139,-34.8],'Nieuw-Zeeland':[173.5,-41.5],'Griekenland':[22.5,39.3],'Hongarije':[19.4,47.2],'Georgië':[44.3,42],'Libanon':[35.9,33.9],
 'Uruguay':[-56,-32.8],'België':[4.6,50.6],'Zwitserland':[8.2,46.8],'Canada':[-79.5,43.5],'Japan':[138.5,35.8],'Israël':[35,31.4],'Kroatië':[16,45.2],'Luxemburg':[6.1,49.7]};
out.centroid=cen;
const js='/* Vined It – kaarten. Vooraf berekend uit Natural Earth (publiek domein) via world-atlas. Niet met de hand bewerken: zie docs. */\nconst MAPS='+JSON.stringify(out)+';\nif(typeof module!=="undefined")module.exports={MAPS};\n';
fs.writeFileSync(process.argv[2],js);
console.log('bytes',js.length,'world',JSON.stringify(out.world.d).length,'europe',JSON.stringify(out.europe.d).length,'lands',JSON.stringify(out.lands).length);
