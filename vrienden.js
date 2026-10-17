/* =====================================================================
   Vined It – Mijn wijnvrienden
   Uitnodigen met een persoonlijke link (WhatsApp), geen e-mail nodig.
   Het album van een wijnvriend is alleen-lezen en zonder herinneringen.
   ===================================================================== */
let viewing=null;      // {id,name} als je het album van een wijnvriend bekijkt
let mineSaved=null;    // je eigen staat, om terug te zetten
const ownerId=()=>viewing?viewing.id:(session?session.user.id:'');

function inviteUrl(code){return `${location.origin}${location.pathname}?vriend=${encodeURIComponent(code)}`}

async function shareInvite(o,fresh){
  const btn=o.querySelector('#finv');if(btn)btn.disabled=true;
  const {data:code,error}=await sb.rpc('my_invite',{p_new:!!fresh});
  if(btn)btn.disabled=false;
  if(error||!code){toast('De uitnodiging kon niet worden gemaakt. Is de database bijgewerkt (stap 013)?');console.error(error);return}
  const url=inviteUrl(code),text=`Word mijn wijnvriend in Vined It! Dan kunnen we elkaars wijnalbum bekijken. 🍷`;
  const box=o.querySelector('#flink');if(box){box.hidden=false;box.querySelector('code').textContent=url}
  if(fresh){toast('Nieuwe link gemaakt. De oude werkt niet meer.');return}
  try{if(navigator.share){await navigator.share({title:'Vined It',text,url});return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(text+' '+url);toast('Link gekopieerd. Plak hem in WhatsApp.')}catch(e){toast('Kopieer de link hieronder en stuur hem door.')}
}

async function openFriends(nest){
  if(!session){toast('Log eerst in.');return}
  const o=overlay(`<p class="eyebrow">Delen</p><p class="status">Mijn wijnvrienden</p>
    <p class="hint">Wijnvrienden kunnen elkaars album bekijken. Je herinneringen blijven privé.</p>
    <div class="flist" id="flist"><p class="hint">Even laden…</p></div>
    <div class="finvite">
      <button class="btn primary" id="finv">${I('heart')} Nodig een wijnvriend uit</button>
      <p class="hint small">Je krijgt een persoonlijke link om via WhatsApp te sturen. Wie hem opent, wordt je wijnvriend.</p>
      <div class="flink" id="flink" hidden><code></code><button class="linkbtn" id="fnew">Nieuwe link maken (de oude werkt dan niet meer)</button></div>
    </div>
    <button id="close" hidden></button>`,{nest:!!nest});
  o.querySelector('#close').onclick=()=>closeOverlay();
  o.querySelector('#finv').onclick=()=>shareInvite(o,false);
  o.querySelector('#fnew').onclick=()=>askConfirm('Nieuwe link maken?','Wie de oude link nog niet heeft geopend, kan die dan niet meer gebruiken. Bestaande wijnvrienden blijven gewoon.','Nieuwe link',()=>{popOverlay();shareInvite(o,true)});
  const {data,error}=await sb.rpc('list_friends');
  const L=o.querySelector('#flist');if(!L)return;
  if(error){L.innerHTML='<p class="hint">Wijnvrienden konden niet worden geladen. Is de database bijgewerkt (stap 013)?</p>';console.error(error);return}
  if(!data||!data.length){L.innerHTML=`<div class="fempty">${MED('heart')}<p>Nog geen wijnvrienden.<br>Nodig iemand uit om elkaars album te bekijken.</p></div>`;return}
  L.innerHTML=data.map((f,n)=>`<div class="frow" style="--i:${n}"><span class="fbook sw-${esc(f.cover)}"><span class="swbook"></span></span>
      <span class="fname"><b>${esc(f.name)}</b><small>${f.kaarten} ${f.kaarten===1?'kaart':'kaarten'} · vrienden sinds ${esc(fmtDate(f.since))}</small></span>
      <button class="btn small primary" data-view="${f.id}" data-name="${esc(f.name)}">Bekijk album</button>
      <button class="fdel" data-del="${f.id}" data-name="${esc(f.name)}" aria-label="${esc(f.name)} verwijderen">${I('close')}</button></div>`).join('');
  L.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>viewFriend(b.dataset.view,b.dataset.name));
  L.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>askConfirm(`${b.dataset.name} verwijderen?`,'Jullie kunnen dan elkaars album niet meer bekijken. Je kunt later altijd opnieuw uitnodigen.','Verwijderen',async()=>{
    const {error}=await sb.rpc('remove_friend',{p_id:b.dataset.del});
    if(error){toast('Verwijderen lukte niet. Probeer het zo nog eens.');return}
    closeOverlay();setTimeout(()=>openFriends(),260)}));
}

async function viewFriend(id,name){
  const {data,error}=await sb.rpc('friend_album',{p_id:id});
  if(error||!data||data.status!=='ok'){toast(data&&data.status==='not_friends'?'Jullie zijn geen wijnvrienden meer.':'Het album kon niet worden geopend.');console.error(error);return}
  if(!viewing)mineSaved={cards,ownedKeys,settings,cur,LBL:{...LBL}};
  viewing={id:data.id,name:data.name};
  for(const k in LBL)delete LBL[k];
  settings={name:data.name,cover:data.cover||'bordeaux',pages:data.pages||'zwart'};applySettings();
  cards=[];ownedKeys=new Set();
  for(const r of data.cards||[]){if(!r.wine)continue;cards.push(toCard(r,r.wine))}
  STK_VIEW=data.stickers||{};
  computeSamen(data.name);
  document.body.classList.add('viewing');
  const vb=document.getElementById('viewbar');vb.hidden=false;vb.querySelector('b').textContent=`Album van ${data.name}`;
  closeOverlay();refresh();cur=0;go(0,true);renderChrome();fitAlbum();
}
function exitFriend(){
  if(!viewing||!mineSaved)return;
  viewing=null;STK_VIEW=null;
  SAMEN=null;document.body.classList.remove('onlysamen');{const sb2=document.getElementById('samenbar');if(sb2)sb2.hidden=true}
  for(const k in LBL)delete LBL[k];Object.assign(LBL,mineSaved.LBL);
  cards=mineSaved.cards;ownedKeys=mineSaved.ownedKeys;settings=mineSaved.settings;applySettings();
  const back=mineSaved.cur;mineSaved=null;
  document.body.classList.remove('viewing');document.getElementById('viewbar').hidden=true;
  closeOverlay();refresh();cur=Math.min(back,pages.length-1);go(cur,true);renderChrome();fitAlbum();
}

/* Uitnodigingslink geopend: na inloggen meteen wijnvrienden worden */
const INV_KEY='vi.invite';
function captureInvite(){
  try{const u=new URL(location.href),c=u.searchParams.get('vriend');
    if(c){localStorage.setItem(INV_KEY,c);u.searchParams.delete('vriend');history.replaceState(history.state,'',u.pathname+(u.search||'')+u.hash)}}catch(e){}
}
async function acceptPendingInvite(){
  let c=null;try{c=localStorage.getItem(INV_KEY)}catch(e){}
  if(!c||!session)return;
  try{localStorage.removeItem(INV_KEY)}catch(e){}
  const {data,error}=await sb.rpc('accept_invite',{p_code:c});
  if(error){toast('De uitnodiging kon niet worden verwerkt.');console.error(error);return}
  if(data.status==='self'){toast('Dit is je eigen uitnodigingslink. Stuur hem naar een vriend!');return}
  if(data.status==='invalid'){toast('Deze uitnodigingslink werkt niet meer. Vraag om een nieuwe.',6000);return}
  const nm=data.friend&&data.friend.name||'je vriend';
  toast(data.status==='already'?`Je bent al wijnvrienden met ${nm}.`:`Je bent nu wijnvrienden met ${nm}! 🍷`,6000);
  setTimeout(()=>openFriends(),900);
}
captureInvite();

/* Balk bovenaan tijdens het bekijken van een vriend */
function initViewbar(){
  if(document.getElementById('viewbar'))return;
  document.querySelector('.album').insertAdjacentHTML('beforebegin',`<div class="viewbar" id="viewbar" hidden><span>${I('book')}<b></b><small>alleen-lezen</small></span><button class="btn small primary" id="vbback">${I('arrowl')} Mijn album</button></div>`);
  document.getElementById('vbback').onclick=()=>exitFriend();
}

/* ---------- Samen geproefd: wijnen die jij en je wijnvriend allebei hebben ---------- */
let SAMEN=null;   // Map: kaart-id van de vriend -> jouw kaart (alleen tijdens het bekijken)
function samenOf(c){return SAMEN&&c?SAMEN.get(c.id)||null:null}
function computeSamen(name){
  SAMEN=new Map();
  const mine=(mineSaved&&mineSaved.cards)||[];
  const byKey=new Map();for(const m of mine){const k=m.key||((m.maker||'').toLowerCase()+'|'+(m.naam||'').toLowerCase());if(!byKey.has(k))byKey.set(k,m)}
  for(const c of cards){const k=c.key||((c.maker||'').toLowerCase()+'|'+(c.naam||'').toLowerCase());const m=byKey.get(k)||mine.find(x=>x.wineId===c.wineId);if(m)SAMEN.set(c.id,m)}
  const shared=new Set([...SAMEN.values()].map(m=>m.wineId)).size;
  // Wijnmatch: lijkt jullie smaak op elkaar? Streken (50%), kleur/stijl (25%) en gedeelde wijnen (25%)
  const vec=(L,f)=>{const v={};for(const x of L){const k=f(x);if(k)v[k]=(v[k]||0)+1}return v};
  const cos=(a,b)=>{let d=0,na=0,nb=0;for(const k in a){na+=a[k]*a[k];if(b[k])d+=a[k]*b[k]}for(const k in b)nb+=b[k]*b[k];return na&&nb?d/Math.sqrt(na*nb):0};
  const reg=cos(vec(mine,x=>x.regio||x.land),vec(cards,x=>x.regio||x.land));
  const col=cos(vec(mine,x=>x.style==='mousserend'?'bubbels':x.color),vec(cards,x=>x.style==='mousserend'?'bubbels':x.color));
  const ov=Math.min(1,shared/Math.max(1,Math.min(new Set(mine.map(x=>x.wineId)).size,new Set(cards.map(x=>x.wineId)).size))*2);
  const match=mine.length&&cards.length?Math.round((reg*.5+col*.25+ov*.25)*100):0;
  try{const k='vi.samenmax',prev=+(localStorage.getItem(k)||0);if(shared>prev)localStorage.setItem(k,String(shared))}catch(e){}
  let bar=document.getElementById('samenbar');
  if(!bar){document.getElementById('viewbar').insertAdjacentHTML('afterend',`<div class="samenbar" id="samenbar" hidden><span class="sbtxt"></span><button class="btn small" id="sbonly" aria-pressed="false">Alleen samen</button></div>`);bar=document.getElementById('samenbar');
    bar.querySelector('#sbonly').onclick=e=>{const on=document.body.classList.toggle('onlysamen');e.currentTarget.setAttribute('aria-pressed',String(on));e.currentTarget.classList.toggle('primary',on)}}
  bar.querySelector('.sbtxt').innerHTML=shared?`${GLAS2} <b>${shared}</b> ${shared===1?'wijn':'wijnen'} gemeen · Wijnmatch <b>${match}%</b>`:`Nog geen wijnen gemeen · Wijnmatch <b>${match}%</b>`;
  bar.querySelector('#sbonly').hidden=!shared;bar.querySelector('#sbonly').classList.remove('primary');bar.querySelector('#sbonly').setAttribute('aria-pressed','false');
  bar.hidden=false;
}
/* Twee klinkende glaasjes (klein, goud) */
const GLAS2='<span class="glas2" aria-hidden="true">🥂</span>';
/* Je eigen exemplaar laten zien terwijl je het album van een vriend bekijkt */
function withMine(fn){
  const v=viewing,saved={...LBL};
  viewing=null;for(const k in LBL)delete LBL[k];Object.assign(LBL,(mineSaved&&mineSaved.LBL)||{});
  try{return fn()}finally{viewing=v;for(const k in LBL)delete LBL[k];Object.assign(LBL,saved)}
}
function openMyCopy(m){
  const html=withMine(()=>`<div class="spin">${bigCard(m)}${memoBack(m)}</div>`);
  const o=overlay(`<p class="status">Jouw kaart</p>${html}<p class="hint">Gescand op ${esc(m.datum||'')}${m.memo?' · tik om je herinnering te lezen':''}</p><div class="actions"><button class="btn" id="turn">${I('turn')} Omdraaien</button><button class="btn primary" id="mcback">Terug naar ${esc(viewing?viewing.name:'')}</button></div>`,{nest:true});
  tilt(o.querySelector('.card'));if(typeof spinCard==='function')spinCard(o,m);
  o.querySelector('#mcback').onclick=()=>popOverlay();
}
