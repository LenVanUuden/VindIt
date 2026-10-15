/* =====================================================================
   Vined It – stickers
   Verdiende stickers plakken op de omslag, de achterkant en elke bladzijde.
   Verdienen gaat via ontdekken (landen, sets, mijlpalen in verschillende
   wijnen, Full Art), nooit via hoeveelheid drinken.
   Opslag per bladzijde: [{s:id, x:%, y:%, r:graden, k:schaal}]
   ===================================================================== */

/* ---------- Ontwerpen (viewBox 0 0 100 100) ---------- */
const STK_INKS=['#7A1E2C','#1F3B6B','#2F5A3A','#6B3F1D','#4A2A5E'];
const STK_ART={
  kurk:{n:'Kurk',svg:`<g transform="rotate(-22 50 50)"><rect x="32" y="16" width="36" height="68" rx="9" fill="#C99A62"/><rect x="32" y="16" width="36" height="68" rx="9" fill="url(#stkCork)"/><ellipse cx="50" cy="19" rx="18" ry="5.5" fill="#DDB582"/><rect x="32" y="70" width="36" height="14" rx="7" fill="#7A1E2C" opacity=".85"/><g fill="#A27645"><circle cx="42" cy="34" r="2"/><circle cx="56" cy="42" r="1.6"/><circle cx="46" cy="52" r="2.2"/><circle cx="58" cy="60" r="1.5"/><circle cx="40" cy="62" r="1.4"/><circle cx="54" cy="28" r="1.2"/></g><text x="50" y="49" text-anchor="middle" font-size="7" font-family="Limelight,Georgia,serif" fill="#7A4E26" transform="rotate(90 50 47)">VINED IT</text></g>`},
  glas:{n:'Wijnglas',svg:`<path d="M30 10h40c0 28-8 42-20 44-12-2-20-16-20-44z" fill="#FBF6EC" stroke="#C9A253" stroke-width="3"/><path d="M32.5 28h35c-2 15-8 23-17.5 25C40.5 51 34.5 43 32.5 28z" fill="#8E1F31"/><path d="M36 30c1 8 4 14 8 17" stroke="#fff" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round"/><rect x="48" y="54" width="4" height="26" fill="#C9A253"/><ellipse cx="50" cy="84" rx="17" ry="4.5" fill="#C9A253"/>`},
  druiven:{n:'Druiventros',svg:`<path d="M50 20c4-10 14-12 22-8-6 2-10 6-12 12" fill="#5E8B3A"/><path d="M50 22v-8" stroke="#6B4A2A" stroke-width="3" stroke-linecap="round"/><g fill="#5A2350">${[[36,32],[50,30],[64,32],[43,44],[57,44],[36,56],[50,56],[64,56],[43,68],[57,68],[50,80]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8"/>`).join('')}</g><g fill="#B784B0" opacity=".7">${[[33,29],[47,27],[61,29],[40,41],[54,41],[33,53],[47,53],[61,53],[40,65],[54,65],[47,77]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.2"/>`).join('')}</g>`},
  kurkentrekker:{n:'Kurkentrekker',svg:`<rect x="16" y="14" width="68" height="14" rx="7" fill="#7A4E26"/><rect x="16" y="14" width="68" height="5" rx="2.5" fill="#9C6A3A"/><rect x="46" y="26" width="8" height="12" fill="#B9B9B4"/><path d="M50 38c10 3 10 7 0 10s-10 7 0 10 10 7 0 10-10 7 0 10l0 8" stroke="#C9C9C4" stroke-width="4" fill="none" stroke-linecap="round"/>`},
  vlek:{n:'Wijnvlek',ink:true,svg:`<circle cx="50" cy="50" r="33" fill="none" stroke="#7A1E2C" stroke-width="5" opacity=".55" stroke-dasharray="70 6 40 4 90 8"/><circle cx="51" cy="49" r="30" fill="none" stroke="#7A1E2C" stroke-width="2" opacity=".35"/><circle cx="82" cy="70" r="4" fill="#7A1E2C" opacity=".45"/><circle cx="88" cy="62" r="2" fill="#7A1E2C" opacity=".4"/>`},
  lakzegel:{n:'Lakzegel',svg:`<path d="M50 12c8 0 10 6 17 8s12 7 12 15-4 10-3 17-2 13-9 16-8 9-17 9-11-6-18-9-10-9-10-17 4-11 3-17 6-12 12-15S42 12 50 12z" fill="#9E1B2B"/><circle cx="50" cy="50" r="24" fill="#B4283A"/><circle cx="50" cy="50" r="24" fill="none" stroke="#7A0E1C" stroke-width="2"/><path d="M38 38l12 26 12-26" stroke="#7A0E1C" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 30c4-4 9-6 14-6" stroke="#fff" stroke-width="2.5" opacity=".35" fill="none" stroke-linecap="round"/>`},
  washi:{n:'Washi-tape',wide:true,ink:true,svg:`<g transform="rotate(-8 50 50)" opacity=".88"><path d="M4 38l3 3-3 3 3 3-3 3 3 3-3 3 3 3h86l-3-3 3-3-3-3 3-3-3-3 3-3-3-3 3-3z" fill="#E8C9A0"/><g fill="#C9A253" opacity=".55">${Array.from({length:9},(_,i)=>`<rect x="${10+i*10}" y="38" width="4" height="24"/>`).join('')}</g></g>`},
  blad:{n:'Geperst wijnblad',svg:`<path d="M50 86V52" stroke="#7A5226" stroke-width="3"/><path d="M50 52c-4-8-14-8-20-14 6-1 9-5 8-11-6 2-12 0-16-6 8-2 14-1 18 3 0-8 4-14 10-18 6 4 10 10 10 18 4-4 10-5 18-3-4 6-10 8-16 6-1 6 2 10 8 11-6 6-16 6-20 14z" fill="#C8742E"/><path d="M50 52V16M50 40l-14-12M50 40l14-12M50 30l-10-10M50 30l10-10" stroke="#8A4A1A" stroke-width="1.6" fill="none"/>`},
};

/* Stempel van een land (inkt, paspoortstijl) */
function stkVisa(land,i,year){
  const ink=STK_INKS[i%STK_INKS.length],shape=i%3,name=String(land).toUpperCase(),fs=name.length>12?9:name.length>8?11:13;
  const frame=shape===0?`<circle cx="50" cy="50" r="40" fill="none" stroke="${ink}" stroke-width="3"/><circle cx="50" cy="50" r="33" fill="none" stroke="${ink}" stroke-width="1.2"/>`
    :shape===1?`<rect x="8" y="22" width="84" height="56" rx="6" fill="none" stroke="${ink}" stroke-width="3"/><rect x="13" y="27" width="74" height="46" rx="3" fill="none" stroke="${ink}" stroke-width="1.2"/>`
    :`<ellipse cx="50" cy="50" rx="44" ry="32" fill="none" stroke="${ink}" stroke-width="3"/><ellipse cx="50" cy="50" rx="38" ry="26" fill="none" stroke="${ink}" stroke-width="1.2"/>`;
  return `<g opacity=".82">${frame}<text x="50" y="${shape===1?44:42}" text-anchor="middle" font-size="7" letter-spacing="2" font-family="Georgia,serif" fill="${ink}">VINED IT</text><text x="50" y="${shape===1?58:57}" text-anchor="middle" font-size="${fs}" font-weight="700" font-family="Limelight,Georgia,serif" fill="${ink}" ${name.length>14?'textLength="70" lengthAdjust="spacingAndGlyphs"':''}>${esc(name)}</text>${year?`<text x="50" y="${shape===1?69:68}" text-anchor="middle" font-size="7" font-family="Georgia,serif" fill="${ink}">${year}</text>`:''}<path d="M18 50h6M76 50h6" stroke="${ink}" stroke-width="1.5"/></g>`;
}
/* Embleem van een streek of uitdaging */
function stkEmblem(label,c){
  c=c||{sky:'#F3DDAA',sun:'#E4A23A',far:'#B0734A',near:'#7A5226',dark:'#3A2418'};
  const id='e'+Math.random().toString(36).slice(2,7),t=String(label).toUpperCase(),fs=t.length>14?6.4:t.length>10?7.6:9;
  return `<defs><clipPath id="${id}"><circle cx="50" cy="46" r="34"/></clipPath></defs>
    <circle cx="50" cy="46" r="40" fill="#C9A253"/><circle cx="50" cy="46" r="37" fill="#F6E6BE"/>
    <g clip-path="url(#${id})"><rect x="0" y="0" width="100" height="100" fill="${c.sky}"/><circle cx="64" cy="34" r="9" fill="${c.sun}"/>
    <path d="M10 60c14-12 26-14 40-6s26 4 40-4v40H10z" fill="${c.far}"/><path d="M10 70c16-8 30-8 44-2s24 2 36-4v36H10z" fill="${c.near}"/></g>
    <circle cx="50" cy="46" r="34" fill="none" stroke="${c.dark}" stroke-width="1.5"/>
    <path d="M8 72h84l-6 8 6 8H8l6-8z" fill="${c.dark}"/><text x="50" y="83" text-anchor="middle" font-size="${fs}" letter-spacing="1" font-family="Limelight,Georgia,serif" fill="#F6E6BE">${esc(t)}</text>`;
}
/* Mijlpaal: aantal verschillende wijnen */
function stkMedal(n){
  return `<path d="M34 8l10 30h-14zM66 8L56 38h14z" fill="#7A1E2C"/><path d="M38 8l8 28M62 8l-8 28" stroke="#5A0E1A" stroke-width="2"/>
    <circle cx="50" cy="60" r="30" fill="#C9A253"/><circle cx="50" cy="60" r="25" fill="#E9D3A0"/><circle cx="50" cy="60" r="25" fill="none" stroke="#A8832F" stroke-width="1.5" stroke-dasharray="3 2"/>
    <text x="50" y="66" text-anchor="middle" font-size="20" font-family="Limelight,Georgia,serif" fill="#6B4A16">${n}</text><text x="50" y="77" text-anchor="middle" font-size="6.5" letter-spacing="1.5" font-family="Georgia,serif" fill="#6B4A16">WIJNEN</text>`;
}

/* ---------- Welke stickers heb je verdiend? ---------- */
function stkEarned(){
  const L=[];
  for(const k of Object.keys(STK_ART))L.push({id:'b:'+k,group:'Basis'});
  if(!cards.length)return L;
  const lands=[...new Set(cards.map(c=>c.land).filter(Boolean))];
  lands.forEach(l=>L.push({id:'v:'+l,group:'Visumstempels'}));
  for(const n of [10,25,50,100])if(cards.length>=n)L.push({id:'m:'+n,group:'Mijlpalen'});
  if(st)for(const set of SETS)if(st.visible[set.id]&&st.complete[set.id])L.push({id:'e:'+set.id,group:'Voltooide sets'});
  const fa=[...new Set(cards.filter(c=>c.fa).map(c=>c.regio||c.land))];
  fa.forEach(r=>L.push({id:'h:'+r,group:'Holo (Full Art)'}));
  return L;
}
const stkLocked=()=>[
  {t:'Visumstempel',d:'Je eerste wijn uit een nieuw land'},
  {t:'Mijlpaal',d:'10, 25, 50 en 100 verschillende wijnen'},
  {t:'Embleem',d:'Een set of uitdaging voltooien'},
  {t:'Holo-embleem',d:'Een Full Art trekken'}];

function stkInfo(id){
  const [kind,key]=[id.slice(0,1),id.slice(2)];
  if(kind==='b'){const a=STK_ART[key];return a?{n:a.n,svg:a.svg,ink:!!a.ink,wide:!!a.wide}:null}
  if(kind==='v'){const ls=[...new Set(cards.map(c=>c.land))];const i=Math.max(0,LANDS.indexOf(key)>=0?LANDS.indexOf(key):ls.indexOf(key)+3);
    const first=cards.filter(c=>c.land===key).map(c=>c.created).sort()[0];return {n:'Stempel '+key,svg:stkVisa(key,i,first?new Date(first).getFullYear():''),ink:true}}
  if(kind==='m')return {n:key+' wijnen',svg:stkMedal(key)};
  if(kind==='e'){const set=SETS.find(s=>s.id===key);if(!set)return null;const A=set.area&&typeof AREAS!=='undefined'?AREAS[set.area]:null;return {n:set.name,svg:stkEmblem(set.name,A&&A.c)}}
  if(kind==='h'){const A=typeof AREAS!=='undefined'?AREAS[key]:null;const nm=A?A.naam:key;return {n:'Holo '+nm,svg:stkEmblem(nm,A?A.c:null),holo:true}}
  return null;
}
function stkHTML(it,idx){
  const inf=stkInfo(it.s);if(!inf)return '';
  const w=(inf.wide?26:17)*(it.k||1);
  return `<div class="stk${inf.ink?' ink':''}${inf.holo?' holo':''}" data-i="${idx}" style="left:${it.x}%;top:${it.y}%;width:${w.toFixed(2)}%;transform:translate(-50%,-50%) rotate(${it.r||0}deg)"><svg viewBox="0 0 100 100" aria-label="${esc(inf.n)}">${inf.ink?inf.svg:`<g filter="url(#stkDie)">${inf.svg}</g>`}</svg>${inf.holo?'<i class="stkholo"></i>':''}</div>`;
}

/* ---------- Opslag ---------- */
let STK={};                 // eigen stickers per bladzijde
let STK_VIEW=null;          // stickers van een wijnvriend (alleen-lezen)
const stkStore=()=>STK_VIEW||STK;
function pageKey(p){
  if(!p)return '';
  switch(p.t){
    case 'set':return 'set:'+p.set.id+(p.from?':'+p.from:'');
    case 'chapter':return 'ch:'+p.land;
    case 'overige':return 'ov:'+p.land;
    default:return p.t;
  }
}
async function loadStickers(){
  STK={};
  try{const {data,error}=await sb.from('stickers').select('page,items');if(!error)for(const r of data||[])STK[r.page]=Array.isArray(r.items)?r.items:[]}catch(e){}
}
async function saveStickers(pk){
  const items=(STK[pk]||[]).map(i=>({s:i.s,x:+(+i.x).toFixed(2),y:+(+i.y).toFixed(2),r:Math.round(i.r||0),k:+(+i.k||1).toFixed(2)}));
  try{const {error}=await sb.rpc('save_page_stickers',{p_page:pk,p_items:items});if(error)throw error;return true}
  catch(e){console.error(e);return false}
}

/* ---------- Laag op een bladzijde ---------- */
function stkLayer(i){
  const pk=pageKey(pages[i]),list=stkStore()[pk]||[];
  return `<div class="stklayer" data-pk="${esc(pk)}">${list.map(stkHTML).join('')}</div>`;
}

/* ---------- Plakken (bewerkmodus) ---------- */
let stkEdit=null; // {pk, sel}
function stkCanEdit(){return !!session&&!(typeof viewing!=='undefined'&&viewing)}
function openStickers(){
  if(!stkCanEdit())return;
  if(busy||stkEdit)return;
  const pk=pageKey(pages[cur]);if(!pk)return;
  closeOverlay();
  stkEdit={pk,sel:-1,before:JSON.stringify(STK[pk]||[])};
  STK[pk]=STK[pk]||[];
  document.body.classList.add('stkedit');
  const earned=stkEarned(),groups=[...new Set(earned.map(e=>e.group))];
  const tray=document.createElement('div');tray.className='stktray';tray.setAttribute('role','dialog');tray.setAttribute('aria-label','Stickers plakken');
  tray.innerHTML=`<button class="stkhead" id="stktog" aria-expanded="true"><span class="stkgrip" aria-hidden="true"></span><b>Stickers plakken</b><span class="stksub">Tik om te plakken · sleep om te verplaatsen · hoekje om te draaien</span><span class="stkmore">${I('sticker')} Meer stickers</span></button>
    <div class="stkgrid">${groups.map(g=>`<p class="stkg">${g}</p>${earned.filter(e=>e.group===g).map(e=>{const inf=stkInfo(e.id);return inf?`<button class="stkpick${inf.holo?' holo':''}" data-s="${esc(e.id)}" aria-label="${esc(inf.n)}"><svg viewBox="0 0 100 100">${inf.ink?inf.svg:`<g filter="url(#stkDie)">${inf.svg}</g>`}</svg>${inf.holo?'<i class="stkholo"></i>':''}</button>`:''}).join('')}`).join('')}
      <p class="stkg">Nog te verdienen</p>${stkLocked().map(l=>`<div class="stklock"><b>${l.t}</b><span>${l.d}</span></div>`).join('')}</div>
    <div class="stkacts"><button class="btn" id="stkcancel">Annuleren</button><button class="btn primary" id="stkdone">Klaar</button></div>`;
  document.body.appendChild(tray);
  requestAnimationFrame(()=>tray.classList.add('in'));
  tray.querySelectorAll('.stkpick').forEach(b=>b.onclick=()=>{stkAdd(b.dataset.s);stkTray(false)});
  tray.querySelector('#stktog').onclick=()=>stkTray(tray.classList.contains('folded'));
  tray.querySelector('#stkdone').onclick=()=>stkClose(true);
  tray.querySelector('#stkcancel').onclick=()=>stkClose(false);
  stkRender();
}
/* Lade in- en uitklappen, zodat de hele bladzijde vrij is om te plakken */
function stkTray(open){
  const t=document.querySelector('.stktray');if(!t)return;
  t.classList.toggle('folded',!open);t.querySelector('#stktog').setAttribute('aria-expanded',String(!!open));
}
function stkLayerEl(){return stack.querySelector('.leaf .stklayer')}
function stkRender(){
  const el=stkLayerEl();if(!el||!stkEdit)return;
  const list=STK[stkEdit.pk]||[];
  el.innerHTML=list.map(stkHTML).join('');
  el.querySelectorAll('.stk').forEach(s=>{
    const i=+s.dataset.i;
    if(i===stkEdit.sel){s.classList.add('sel');s.insertAdjacentHTML('beforeend','<button class="stkx" aria-label="Sticker weghalen">×</button><span class="stkrot" aria-label="Draaien en vergroten"></span>')}
    stkWire(s,i);
  });
}
function stkSelect(i){
  stkEdit.sel=i;const el=stkLayerEl();if(!el)return;
  el.querySelectorAll('.stk').forEach(x=>{x.classList.remove('sel');x.querySelectorAll('.stkx,.stkrot').forEach(h=>h.remove())});
  const s=el.querySelector(`.stk[data-i="${i}"]`);if(!s)return;
  s.classList.add('sel');s.insertAdjacentHTML('beforeend','<button class="stkx" aria-label="Sticker weghalen">×</button><span class="stkrot" aria-label="Draaien en vergroten"></span>');
}
function stkAdd(id){
  const list=STK[stkEdit.pk];
  if(list.length>=40){toast('Maximaal 40 stickers per bladzijde.');return}
  list.push({s:id,x:50+(Math.random()*16-8),y:42+(Math.random()*16-8),r:Math.round(Math.random()*16-8),k:1});
  stkEdit.sel=list.length-1;stkRender();buzz([10]);
}
function stkWire(s,i){
  const el=stkLayerEl(),it=STK[stkEdit.pk][i];
  const rectOf=()=>el.getBoundingClientRect();
  s.addEventListener('pointerdown',e=>{
    if(e.target.closest('.stkx')){e.stopPropagation();STK[stkEdit.pk].splice(i,1);stkEdit.sel=-1;stkRender();return}
    e.preventDefault();e.stopPropagation();
    if(stkEdit.sel!==i)stkSelect(i);
    stkTray(false);
    const R=rectOf(),rot=e.target.closest('.stkrot');
    const cx=R.left+it.x/100*R.width,cy=R.top+it.y/100*R.height;
    const a0=Math.atan2(e.clientY-cy,e.clientX-cx),d0=Math.hypot(e.clientX-cx,e.clientY-cy)||1,r0=it.r||0,k0=it.k||1;
    const x0=e.clientX,y0=e.clientY,ix=it.x,iy=it.y;
    try{s.setPointerCapture(e.pointerId)}catch(_){}
    const mv=ev=>{
      if(rot){const a=Math.atan2(ev.clientY-cy,ev.clientX-cx),d=Math.hypot(ev.clientX-cx,ev.clientY-cy);
        it.r=Math.round(r0+(a-a0)*180/Math.PI);it.k=Math.max(.45,Math.min(3,k0*d/d0))}
      else{it.x=Math.max(0,Math.min(100,ix+(ev.clientX-x0)/R.width*100));it.y=Math.max(0,Math.min(100,iy+(ev.clientY-y0)/R.height*100))}
      const inf=stkInfo(it.s);const w=((inf&&inf.wide)?26:17)*it.k;
      s.style.left=it.x+'%';s.style.top=it.y+'%';s.style.width=w.toFixed(2)+'%';s.style.transform=`translate(-50%,-50%) rotate(${it.r}deg)`;
    };
    const up=()=>{s.removeEventListener('pointermove',mv);s.removeEventListener('pointerup',up);s.removeEventListener('pointercancel',up)};
    s.addEventListener('pointermove',mv);s.addEventListener('pointerup',up);s.addEventListener('pointercancel',up);
  });
}
async function stkClose(save){
  if(!stkEdit)return;
  const {pk,before}=stkEdit;
  const tray=document.querySelector('.stktray');
  if(save&&JSON.stringify(STK[pk]||[])!==before){
    const ok=await saveStickers(pk);
    if(!ok){toast('Opslaan lukte niet. Controleer je verbinding en probeer het opnieuw.');return}
    toast('Stickers geplakt.');
  }else if(!save){STK[pk]=JSON.parse(before)}
  stkEdit=null;document.body.classList.remove('stkedit');
  if(tray){tray.classList.remove('in');setTimeout(()=>tray.remove(),260)}
  go(cur,true);
}
// Tik naast een sticker: selectie opheffen
document.addEventListener('pointerdown',e=>{if(!stkEdit)return;if(e.target.closest('.stk')||e.target.closest('.stktray'))return;if(stkEdit.sel!==-1)stkSelect(-1)},true);
// Tijdens plakken niet bladeren of kaarten openen
document.addEventListener('click',e=>{if(stkEdit&&!e.target.closest('.stktray')&&!e.target.closest('.stk')){e.stopPropagation();e.preventDefault()}},true);

/* Gedeeld filter: witte snijrand rond stickers */
document.body.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="stkDie" x="-15%" y="-15%" width="130%" height="130%"><feMorphology in="SourceAlpha" operator="dilate" radius="3.2" result="d"/><feFlood flood-color="#FFFBF2"/><feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="stkCork" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".35" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
</defs></svg>`);
