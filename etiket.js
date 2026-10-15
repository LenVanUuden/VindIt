/* =====================================================================
   Vined It – getekende etiketten
   Een etiket in de stijl van het album, op basis van de kenmerken van het
   echte etiket (kleuren, letterstijl, opbouw, embleem). Bewust algemeen:
   geen exacte logo's of wapens.
   ===================================================================== */
const ETK_FONTS={
  condensed:{f:"'Oswald','Arial Narrow',sans-serif",w:600,ls:.02},
  classic:{f:"'Cormorant Garamond',Georgia,serif",w:700,ls:.01},
  didone:{f:"'Playfair Display',Georgia,serif",w:700,ls:.01},
  script:{f:"'Dancing Script',cursive",w:600,ls:0},
  gothic:{f:"'UnifrakturMaguntia','Old English Text MT',serif",w:400,ls:0},
  modern:{f:"'Libre Franklin',Helvetica,Arial,sans-serif",w:600,ls:.08},
  display:{f:"Limelight,Georgia,serif",w:400,ls:.06},
};
const ETK_SMALL="'Cormorant Garamond',Georgia,serif";
let ETK_N=0;
function etkMetal(id,kind){
  const s=kind==='silver'?['#F4F4F2','#B9BCC0','#E8E9EA','#8E9296']:['#F3DC96','#C9A253','#EBCB7A','#8F6B22'];
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${s[0]}"/><stop offset=".45" stop-color="${s[1]}"/><stop offset=".6" stop-color="${s[2]}"/><stop offset="1" stop-color="${s[3]}"/></linearGradient>`;
}
/* ---- emblemen (in een vak van 100×100, gecentreerd op 50,50) ---- */
const ETK_EMB={
  crest:(c,ink)=>`<g stroke="${ink}" stroke-width="1.2" stroke-linejoin="round">
    <path d="M32 30h36v22c0 14-8 23-18 28-10-5-18-14-18-28z" fill="${c}"/>
    <path d="M32 44h36M50 30v50" stroke-opacity=".55"/>
    <path d="M36 34l6 0M58 34l6 0" stroke-opacity=".4"/>
    <path d="M36 22l4-9 5 7 5-9 5 9 5-7 4 9z" fill="${c}"/><rect x="36" y="22" width="28" height="5" fill="${c}"/>
    <path d="M28 40c-10 6-12 22-4 34M72 40c10 6 12 22 4 34" fill="none" stroke="${c}" stroke-width="3"/>
    <path d="M24 50c-4 1-6 4-6 7M22 60c-4 1-5 4-5 7M76 50c4 1 6 4 6 7M78 60c4 1 5 4 5 7" fill="none" stroke="${c}" stroke-width="2.2"/>
    <path d="M30 86c8-4 32-4 40 0" fill="none" stroke="${c}" stroke-width="3"/></g>`,
  castle:(c,ink)=>`<g fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round">
    <path d="M14 78h72M22 78V52h56v26M34 52V40h32v12M44 40V30h12v10"/>
    <path d="M20 52l8-12 8 12M64 52l8-12 8 12M42 30l8-12 8 12" fill="${c}" fill-opacity=".25"/>
    <path d="M28 60v6M38 60v6M62 60v6M72 60v6M47 64h6v14h-6z"/><path d="M46 46h8"/>
    <path d="M10 82c20-3 60-3 80 0" stroke-width="1"/></g>`,
  sun:(c)=>`<g><defs><clipPath id="etks${ETK_N}"><circle cx="50" cy="50" r="30"/></clipPath></defs>
    <g clip-path="url(#etks${ETK_N})" stroke="${c}" stroke-width="2.6">${Array.from({length:16},(_,i)=>`<path d="M14 ${21+i*3.8}h72"/>`).join('')}</g></g>`,
  /* abstract: rustige vormen in tinten van de etiketkleur (geen regenboog) */
  abstract:(c)=>{const sh=(t)=>{if(!/^#[0-9a-f]{6}$/i.test(c))return c;const n=parseInt(c.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255,m=t<0?0:255,k=Math.abs(t);return '#'+[r,g,b].map(v=>Math.round(v+(m-v)*k).toString(16).padStart(2,'0')).join('')};
    return `<g transform="translate(50 50)"><ellipse cx="-9" cy="-3" rx="24" ry="20" fill="${sh(.35)}" opacity=".85"/><ellipse cx="10" cy="4" rx="22" ry="18" fill="${sh(0)}" opacity=".85"/><path d="M-30 14 Q0 -4 30 14" fill="none" stroke="${sh(-.35)}" stroke-width="3" stroke-linecap="round"/><ellipse cx="2" cy="-6" rx="9" ry="7" fill="${sh(.6)}" opacity=".7"/></g>`},
  bull:(c)=>`<path d="M18 50c0-6 6-10 14-10h30c4-4 10-6 16-4 4 1 6 5 5 9l-2 6c-1 3-4 4-7 4v15h-6l-2-10c-8 3-18 3-26 0l-2 10h-6l1-12c-6 0-10-3-12-6-2 2-4 6-4 9l-2-1c0-5 2-8 3-10z" fill="${c}"/><path d="M74 37c-2-6-8-9-14-8 5 2 8 4 9 8M82 38c4-5 10-6 14-3-4 0-8 2-10 6" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`,
  grapes:(c,ink)=>`<g fill="${c}" stroke="${ink}" stroke-width=".8">${[[38,38],[50,36],[62,38],[44,49],[56,49],[38,60],[50,60],[62,60],[44,71],[56,71],[50,82]].map(([x,y])=>`<circle cx="${x}" cy="${y-6}" r="6.4"/>`).join('')}</g><path d="M50 30V16c6-6 16-6 20 0" fill="none" stroke="${c}" stroke-width="2"/>`,
  leaf:(c)=>`<path d="M50 84V54M50 54c-4-8-14-8-20-14 6-1 9-5 8-11-6 2-12 0-16-6 8-2 14-1 18 3 0-8 4-14 10-18 6 4 10 10 10 18 4-4 10-5 18-3-4 6-10 8-16 6-1 6 2 10 8 11-6 6-16 6-20 14z" fill="${c}" stroke="${c}" stroke-width="1.4"/>`,
  stars:(c)=>[[30,50,7],[50,40,10],[70,50,7]].map(([x,y,r])=>`<path d="M${x} ${y-r}l${r*.3} ${r*.7} ${r*.75} .05-.6 .48.25 .75-.7-.42-.7.42.25-.75-.6-.48.75-.05z" transform="translate(0 0)" fill="${c}"/>`).join('')+`<path d="M24 64h52" stroke="${c}" stroke-width="1.5"/>`,
  none:()=>'',
};
/* ---- het etiket ---- */
function makeLabelSVG(st,c){
  ETK_N++;const id='etk'+ETK_N;
  st=st||{};const L=st.lines||{};
  const paper=st.paper||'#F3E9D2',ink=st.ink||'#2B2118',acc=st.accent||'#8E1F31';
  const F=ETK_FONTS[st.font]||ETK_FONTS.classic,metal=st.metal==='silver'?'silver':st.metal==='gold'?'gold':null;
  const nameFill=st.name_color==='metal'&&metal?`url(#${id}m)`:(st.name_color&&st.name_color[0]==='#'?st.name_color:ink);
  const embCol=st.emblem&&st.emblem.color==='metal'&&metal?`url(#${id}m)`:(st.emblem&&st.emblem.color)||acc;
  const name=String(L.name||c&&c.naam||'').trim(),up=st.upper!==false?name.toUpperCase():name;
  const words=up.split(/\s+/);let lines=[up];
  if(up.length>11&&words.length>1){let best=null;for(let k=1;k<words.length;k++){const a=words.slice(0,k).join(' '),b=words.slice(k).join(' '),d=Math.abs(a.length-b.length);if(!best||d<best.d)best={a,b,d}}lines=[best.a,best.b]}
  const longest=Math.max(...lines.map(s=>s.length));
  const fs=Math.min(st.font==='condensed'?64:st.font==='script'?52:46,(st.font==='condensed'?420:330)/Math.max(4,longest));
  const layout=st.layout||'center';
  const emb=(st.emblem&&ETK_EMB[st.emblem.type])?st.emblem.type:'none';
  // verticale opbouw
  let yTop=58,yName,yEmb,embS=emb==='none'?0:(st.emblem.size==='large'?1.25:1);
  const nameH=lines.length*fs*1.02;
  if(layout==='top'){yName=74+fs*.8;yEmb=yName+nameH-fs*.2+28+50*embS*.7}
  else if(layout==='bottom'){yEmb=90+50*embS*.7;yName=yEmb+50*embS*.75+fs*.9}
  else{yEmb=emb==='none'?0:96+50*embS*.6;yName=(emb==='none'?160:yEmb+50*embS*.82+fs*.95)}
  const txt=(s,y,size,fill,fam,wt,ls,extra='')=>`<text x="150" y="${y.toFixed(1)}" text-anchor="middle" font-family="${fam}" font-weight="${wt}" font-size="${size.toFixed(1)}" letter-spacing="${ls}" fill="${fill}" ${extra}>${esc(s)}</text>`;
  const fit=s=>s.length*fs*(st.font==='condensed'?.5:.62)>236?`textLength="236" lengthAdjust="spacingAndGlyphs"`:'';
  const nameSvg=lines.map((s,i)=>txt(s,yName+i*fs*1.02,fs,nameFill,F.f,F.w,(F.ls*fs).toFixed(1),fit(s)+(st.font==='condensed'?' transform="scale(1 1.18)" transform-origin="150 '+(yName+i*fs*1.02).toFixed(0)+'"':''))).join('');
  // bij 'top' staan jaar en herkomst onder het embleem, zoals op de meeste Bordeaux-etiketten
  let y=(layout==='top'&&emb!=='none')?yEmb+44*embS-10:yName+nameH-fs*.55;
  const yearSvg=(c&&c.jaar||L.year)?txt(String(L.year||c.jaar),(layout==='top'?y+20:y+24),17,st.year_color||ink,ETK_SMALL,600,2):'';
  if(yearSvg)y+=layout==='top'?20:24;
  const subSvg=L.sub?(st.sub_color?txt(String(L.sub).toUpperCase(),y+24,12.5,st.sub_color,F.f,F.w,1):txt(L.sub,y+24,13,ink,ETK_SMALL,600,1,'font-style="italic"')):'';
  const topSvg=L.top?txt(String(L.top).toUpperCase(),48,9.5,ink,ETK_SMALL,600,3):'';
  const botSvg=L.bottom?txt(String(L.bottom).toUpperCase(),362,st.bottom_big?15:9.5,st.bottom_big?ink:ink,st.bottom_big?F.f:ETK_SMALL,st.bottom_big?F.w:600,st.bottom_big?3:2.4):'';
  const embSvg=emb==='none'?'':`<g transform="translate(${150-50*embS*1.2} ${yEmb-50*embS*1.2}) scale(${1.2*embS})">${ETK_EMB[emb](embCol,ink)}</g>`;
  // extra merkteken (bv. een gestreepte zon onderaan)
  const mk=st.mark&&ETK_EMB[st.mark.type]?`<g transform="translate(${150-34} ${(st.mark.y||300)-34}) scale(.68)">${ETK_EMB[st.mark.type](st.mark.color||acc,ink)}</g>`:'';
  const bd=st.border||'none',bc=st.border_color==='metal'&&metal?`url(#${id}m)`:(st.border_color||ink);
  const border=bd==='thin'?`<rect x="14" y="14" width="272" height="372" fill="none" stroke="${bc}" stroke-width="2"/>`
    :bd==='double'?`<rect x="12" y="12" width="276" height="376" fill="none" stroke="${bc}" stroke-width="2.4"/><rect x="19" y="19" width="262" height="362" fill="none" stroke="${bc}" stroke-width="1"/>`
    :bd==='frame'?`<rect x="10" y="10" width="280" height="380" fill="none" stroke="${bc}" stroke-width="7"/>`
    :bd==='band'?`<rect x="0" y="330" width="300" height="70" fill="${acc}"/>`:'';
  return `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Etiket ${esc(name)}">
  <defs>${metal?etkMetal(id+'m',metal):''}
    <linearGradient id="${id}sh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".18" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".10"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
    <radialGradient id="etkgl${ETK_N}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <filter id="${id}g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${ETK_N%9}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .07 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs>
  <rect width="300" height="400" fill="${paper}"/><rect width="300" height="400" fill="${paper}" filter="url(#${id}g)"/>
  ${border}${topSvg}${embSvg}${nameSvg}${yearSvg}${subSvg}${mk}${botSvg}
  <rect width="300" height="400" fill="url(#${id}sh)"/></svg>`;
}
