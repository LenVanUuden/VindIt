/* =====================================================================
   Vined It – stickerkistjes
   Verdien een wijnkistje met stickers voor ontdekken, vrienden en verzamelen.
   Een kistje wordt "bezorgd", je krikt het open en POEF: drie stickers.
   Bewust geen kistjes voor veel drinken (scans per dag of week): we belonen
   variatie, vriendschap en zorg voor je album, niet hoeveelheid.
   Opgeslagen per gebruiker in public.sticker_packs (welke al open zijn).
   ===================================================================== */

/* ---------- Stickerontwerpen in de kistjes (viewBox 0 0 100 100) ---------- */
const KG='url(#stkGold)';
const PACK_ART={
  /* Welkom */
  proost:{n:'Proost!',svg:`<path d="M4 32h92l-9 18 9 18H4l9-18z" fill="#7A1E2C"/><path d="M4 32l9 18-9 18M96 32l-9 18 9 18" fill="#5A0E1A"/><rect x="14" y="36" width="72" height="28" fill="none" stroke="${KG}" stroke-width="1.2"/><text x="50" y="58" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="19" letter-spacing="1" fill="${KG}">PROOST!</text><g fill="${KG}"><circle cx="50" cy="22" r="2.5"/><circle cx="40" cy="25" r="1.8"/><circle cx="60" cy="25" r="1.8"/></g>`},
  fles:{n:'Wijnfles',svg:`<g transform="rotate(14 50 50)"><rect x="43" y="6" width="14" height="12" rx="2" fill="#7A1E2C"/><path d="M44 18h12v14c0 4 10 8 10 18v38c0 4-3 6-6 6H40c-3 0-6-2-6-6V50c0-10 10-14 10-18z" fill="#24402C"/><path d="M40 52h20v24H40z" fill="#F3E7CC"/><path d="M42 56h16M44 62h12M45 68h10" stroke="#7A1E2C" stroke-width="2"/><path d="M38 50c0-6 4-9 7-12" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/></g>`},
  kaas:{n:'Kaasplankje',svg:`<ellipse cx="50" cy="66" rx="40" ry="16" fill="#9C6A3A"/><ellipse cx="50" cy="62" rx="40" ry="16" fill="#C08A52"/><path d="M26 58l26-22 22 18z" fill="#F2C94C"/><path d="M26 58l48-4v8l-48 4z" fill="#E0B23C"/><circle cx="46" cy="50" r="3" fill="#E0B23C"/><circle cx="58" cy="52" r="2" fill="#E0B23C"/><g fill="#5A2350"><circle cx="72" cy="64" r="4"/><circle cx="78" cy="68" r="4"/><circle cx="70" cy="70" r="4"/></g>`},
  /* Eerste wijnvriend */
  klink:{n:'Klinkende glazen',svg:`<g transform="rotate(-16 36 50)"><path d="M22 18h26c0 20-5 30-13 31-8-1-13-11-13-31z" fill="#FBF6EC" stroke="#C9A253" stroke-width="2.5"/><path d="M24 30h22c-1 10-5 16-11 17-6-1-10-7-11-17z" fill="#8E1F31"/><path d="M35 49v24M26 75h18" stroke="#C9A253" stroke-width="3" stroke-linecap="round"/></g><g transform="rotate(16 64 50)"><path d="M52 18h26c0 20-5 30-13 31-8-1-13-11-13-31z" fill="#FBF6EC" stroke="#C9A253" stroke-width="2.5"/><path d="M54 30h22c-1 10-5 16-11 17-6-1-10-7-11-17z" fill="#E8C35A"/><path d="M65 49v24M56 75h18" stroke="#C9A253" stroke-width="3" stroke-linecap="round"/></g><g stroke="#C9A253" stroke-width="2.5" stroke-linecap="round"><path d="M50 8v6M42 10l3 5M58 10l-3 5"/></g>`},
  sante:{n:'Santé!',svg:`<path d="M14 20h72c4 0 6 2 6 6v34c0 4-2 6-6 6H44l-16 14 2-14H14c-4 0-6-2-6-6V26c0-4 2-6 6-6z" fill="#FBF6EC" stroke="#7A1E2C" stroke-width="3"/><text x="50" y="51" text-anchor="middle" font-family="Dancing Script,cursive" font-weight="700" font-size="24" fill="#7A1E2C">Santé!</text>`},
  hartdruif:{n:'Druivenhart',svg:`<path d="M50 30c4-12 14-14 20-10" stroke="#5E8B3A" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#8E1F31">${[[38,36],[50,36],[62,36],[32,48],[44,48],[56,48],[68,48],[38,60],[50,60],[62,60],[44,72],[56,72],[50,83]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g><g fill="#fff" opacity=".35">${[[36,34],[48,34],[60,34],[30,46],[42,46]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2"/>`).join('')}</g>`},
  /* 5 wijnvrienden */
  kaars:{n:'Kaars',svg:`<rect x="40" y="38" width="20" height="46" rx="3" fill="#F6EEDC"/><path d="M40 46c6 2 14 2 20 0" stroke="#E2D3B4" stroke-width="2" fill="none"/><path d="M50 38v-6" stroke="#3A2418" stroke-width="2"/><path d="M50 10c8 10 8 18 0 22-8-4-8-12 0-22z" fill="#F2A33A"/><path d="M50 18c4 6 4 10 0 13-4-3-4-7 0-13z" fill="#FFE08A"/><ellipse cx="50" cy="86" rx="22" ry="5" fill="#C9A253"/>`},
  stokbrood:{n:'Stokbrood',svg:`<g transform="rotate(-30 50 50)"><rect x="12" y="38" width="76" height="24" rx="12" fill="#D79A4E"/><rect x="12" y="38" width="76" height="10" rx="5" fill="#E9B46C"/><g stroke="#A86A2A" stroke-width="3" stroke-linecap="round"><path d="M26 44l6 12M42 44l6 12M58 44l6 12M74 44l4 9"/></g></g>`},
  karaf:{n:'Karaf',svg:`<path d="M42 8h16v18c14 6 24 20 24 36 0 18-14 30-32 30S18 80 18 62c0-16 10-30 24-36z" fill="#FBF6EC" fill-opacity=".9" stroke="#C9A253" stroke-width="2.5"/><path d="M20 62c0-8 4-14 10-18 8 4 22 4 40 0 6 4 10 10 10 18 0 16-12 28-30 28S20 78 20 62z" fill="#8E1F31"/><path d="M30 56c2-6 6-10 10-12" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>`},
  /* 10 wijnvrienden */
  knalkurk:{n:'Knallende kurk',svg:`<g fill="#F2C94C">${Array.from({length:10},(_,i)=>{const a=i*36*Math.PI/180;return `<circle cx="${50+Math.cos(a)*34}" cy="${46+Math.sin(a)*34}" r="${2+i%3}"/>`}).join('')}</g><g fill="#8E1F31">${Array.from({length:6},(_,i)=>{const a=(i*60+20)*Math.PI/180;return `<rect x="${48+Math.cos(a)*40}" y="${44+Math.sin(a)*40}" width="5" height="3" transform="rotate(${i*40} ${50+Math.cos(a)*40} ${46+Math.sin(a)*40})"/>`}).join('')}</g><g transform="rotate(-24 50 50)"><path d="M38 34h24l-3 30H41z" fill="#C99A62"/><rect x="36" y="28" width="28" height="10" rx="3" fill="#DDB582"/><path d="M41 64c2 8 16 8 18 0" fill="#B0844F"/></g>`},
  discodruif:{n:'Discodruif',holo:true,svg:`<path d="M50 16c3-8 10-10 15-7" stroke="#5E8B3A" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="50" cy="54" r="34" fill="#B9C3CC"/>${Array.from({length:7},(_,r)=>Array.from({length:7},(_,c)=>{const x=26+c*8,y=30+r*8;return Math.hypot(x+4-50,y+4-54)<32?`<rect x="${x}" y="${y}" width="7" height="7" fill="${['#E9EEF2','#9AA6B0','#D6DEE4','#7E8A94'][(r*3+c)%4]}"/>`:''}).join('')).join('')}<circle cx="50" cy="54" r="34" fill="none" stroke="#5A6670" stroke-width="2"/><path d="M34 40l4-4M38 44l2-2" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`},
  slinger:{n:'Slinger',wide:true,svg:`<path d="M4 30c16 14 30 14 46 0s30-14 46 0" stroke="#7A4E26" stroke-width="2" fill="none"/>${[[10,34,'#8E1F31'],[26,42,'#C9A253'],[42,38,'#2F5A3A'],[58,38,'#8E1F31'],[74,42,'#C9A253'],[90,34,'#2F5A3A']].map(([x,y,f])=>`<path d="M${x-7} ${y-4}h14l-7 18z" fill="${f}"/>`).join('')}`},
  /* 3 landen */
  koffer:{n:'Kofferlabel',svg:`<path d="M10 28h66l14 22-14 22H10z" fill="#E8C9A0" stroke="#7A4E26" stroke-width="2.5"/><circle cx="76" cy="50" r="4" fill="#fff" stroke="#7A4E26" stroke-width="2"/><path d="M80 50c6 0 10-6 10-12" stroke="#7A4E26" stroke-width="2" fill="none"/><text x="40" y="47" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="11" fill="#7A1E2C">BON</text><text x="40" y="60" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="11" fill="#7A1E2C">VOYAGE</text>`},
  kompas:{n:'Kompas',svg:`<circle cx="50" cy="50" r="38" fill="${KG}"/><circle cx="50" cy="50" r="31" fill="#FBF6EC" stroke="#8F6B22" stroke-width="1.5"/><path d="M50 22l7 28-7 28-7-28z" fill="#7A1E2C"/><path d="M50 50l7 0-7 28-7-28z" fill="#3A2418"/><path d="M22 50l28-6 28 6-28 6z" fill="#C9A253" opacity=".6"/><circle cx="50" cy="50" r="3.5" fill="#3A2418"/><text x="50" y="18" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="8" fill="#3A2418">N</text>`},
  ballon:{n:'Luchtballon',svg:`<path d="M50 8c20 0 32 14 32 30 0 18-18 30-24 38H42c-6-8-24-20-24-38C18 22 30 8 50 8z" fill="#8E1F31"/><path d="M50 8c-8 4-12 18-12 30s6 26 4 38h16c-2-12 4-26 4-38S58 12 50 8z" fill="#C9A253"/><path d="M42 76l2 8h12l2-8" stroke="#7A4E26" stroke-width="1.5" fill="none"/><rect x="42" y="84" width="16" height="10" rx="2" fill="#9C6A3A"/><path d="M8 92c10-6 20-6 30 0" stroke="#5E8B3A" stroke-width="3" fill="none"/><path d="M62 94c10-6 22-6 30 0" stroke="#5E8B3A" stroke-width="3" fill="none"/>`},
  /* 6 landen */
  paspoort:{n:'Wijnpaspoort',svg:`<rect x="24" y="12" width="52" height="76" rx="5" fill="#2A3D63"/><rect x="28" y="16" width="44" height="68" rx="3" fill="none" stroke="${KG}" stroke-width="1.2"/><circle cx="50" cy="44" r="12" fill="none" stroke="${KG}" stroke-width="2"/><path d="M38 44h24M50 32c-6 6-6 18 0 24M50 32c6 6 6 18 0 24" stroke="${KG}" stroke-width="1.4" fill="none"/><text x="50" y="70" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="7" letter-spacing="1" fill="${KG}">PASPOORT</text><text x="50" y="78" text-anchor="middle" font-family="Georgia,serif" font-size="5" letter-spacing="1" fill="${KG}">VINED IT</text>`},
  wereldbol:{n:'Gouden wereldbol',holo:true,svg:`<circle cx="50" cy="46" r="34" fill="#1F4A6B"/><path d="M28 30c8 2 10 8 18 6s8 8 2 12-4 12-10 10-12-8-10-16zM56 22c8 0 14 6 20 4 4 8 2 16-6 18s-6 10-12 8-4-12-2-18z" fill="${KG}"/><circle cx="50" cy="46" r="34" fill="none" stroke="${KG}" stroke-width="3"/><path d="M50 80v8M34 92h32" stroke="${KG}" stroke-width="5" stroke-linecap="round"/>`},
  vliegtuig:{n:'Vliegtuigje',svg:`<path d="M10 56l70-26c6-2 10 2 6 6L30 70z" fill="#FBF6EC" stroke="#3A5A7A" stroke-width="2.5"/><path d="M40 52l-10-22 8-2 18 18zM46 60l6 20-8 2-10-16z" fill="#3A5A7A"/><path d="M14 54l-6-10 6-2 8 8z" fill="#8E1F31"/><path d="M60 46h6M68 43h4" stroke="#3A5A7A" stroke-width="2"/>`},
  /* Alle kleuren */
  rose:{n:'Roséglas',svg:`<path d="M30 10h40c0 28-8 42-20 44-12-2-20-16-20-44z" fill="#FBF6EC" stroke="#C9A253" stroke-width="3"/><path d="M32.5 28h35c-2 15-8 23-17.5 25C40.5 51 34.5 43 32.5 28z" fill="#EE9AA8"/><path d="M50 54v28M36 86h28" stroke="#C9A253" stroke-width="4" stroke-linecap="round"/><path d="M36 30c1 8 4 14 8 17" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>`},
  coupe:{n:'Champagnecoupe',svg:`<path d="M18 26h64c0 14-14 22-32 22S18 40 18 26z" fill="#FBF6EC" stroke="#C9A253" stroke-width="3"/><path d="M21 30h58c-2 9-14 15-29 15S23 39 21 30z" fill="#F2D27A"/><g fill="#fff">${[[34,36],[46,38],[58,35],[66,37],[40,33]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.8"/>`).join('')}</g><g fill="#F2D27A">${[[44,16,2.4],[54,10,1.8],[60,18,2.2],[38,8,1.6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g><path d="M50 48v32M34 84h32" stroke="#C9A253" stroke-width="4" stroke-linecap="round"/>`},
  witglas:{n:'Glas witte wijn',svg:`<path d="M34 8h32c0 32-6 46-16 48-10-2-16-16-16-48z" fill="#FBF6EC" stroke="#C9A253" stroke-width="3"/><path d="M35.5 30h29c-1 14-6 22-14.5 24-8.5-2-13.5-10-14.5-24z" fill="#F5E39A"/><path d="M50 56v26M36 86h28" stroke="#C9A253" stroke-width="4" stroke-linecap="round"/><path d="M39 32c1 8 3 13 6 16" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>`},
  /* Eerste Super Rare of hoger */
  ster:{n:'Gouden ster',holo:true,svg:`<path d="M50 8l11 26 28 2-21 18 7 28-25-15-25 15 7-28-21-18 28-2z" fill="${KG}" stroke="#8F6B22" stroke-width="2" stroke-linejoin="round"/><path d="M50 22l6 14 15 1-11 10 4 15-14-8" fill="#FFF3C4" opacity=".55"/>`},
  diamant:{n:'Diamant',svg:`<path d="M26 30h48l14 16-38 42-38-42z" fill="#BFE4F2"/><path d="M26 30l10 16h28l10-16M12 46h76M36 46l14 42 14-42" stroke="#5A9AB4" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M26 30l10 16-24 0z" fill="#E6F6FC"/><path d="M50 14v8M36 16l3 7M64 16l-3 7" stroke="#C9A253" stroke-width="2.5" stroke-linecap="round"/>`},
  kroon:{n:'Kroontje',svg:`<path d="M14 72l-4-40 22 18 18-30 18 30 22-18-4 40z" fill="${KG}" stroke="#8F6B22" stroke-width="2" stroke-linejoin="round"/><rect x="14" y="72" width="72" height="12" rx="2" fill="${KG}" stroke="#8F6B22" stroke-width="2"/><circle cx="50" cy="78" r="4" fill="#8E1F31"/><circle cx="30" cy="78" r="3" fill="#2A5D8F"/><circle cx="70" cy="78" r="3" fill="#2A5D8F"/><circle cx="10" cy="32" r="4" fill="${KG}"/><circle cx="50" cy="20" r="4" fill="${KG}"/><circle cx="90" cy="32" r="4" fill="${KG}"/>`},
  /* 5 herinneringen */
  veer:{n:'Ganzenveer',svg:`<path d="M80 10C56 14 34 34 24 66l6 4C42 42 60 26 80 10z" fill="#FBF6EC" stroke="#9C8A6A" stroke-width="2"/><path d="M80 10C62 22 44 40 30 70" stroke="#9C8A6A" stroke-width="1.5" fill="none"/><path d="M24 66l-6 20 10-14" fill="#3A2418"/><ellipse cx="22" cy="88" rx="12" ry="4" fill="#1F2A44" opacity=".8"/>`},
  polaroid:{n:'Polaroid',svg:`<g transform="rotate(-8 50 50)"><rect x="18" y="12" width="64" height="76" rx="2" fill="#FBF8F0" stroke="#D8CFBC" stroke-width="1.5"/><rect x="24" y="18" width="52" height="50" fill="#F3C98B"/><circle cx="62" cy="30" r="6" fill="#F7E2A8"/><path d="M24 56c10-8 20-8 28-2s16 4 24-2v16H24z" fill="#7A9A4A"/><path d="M24 62c12-4 22-4 30 0s14 2 22-2v8H24z" fill="#5E7A36"/><text x="50" y="81" text-anchor="middle" font-family="Dancing Script,cursive" font-weight="700" font-size="8" fill="#3A2418">mooie avond</text></g>`},
  brief:{n:'Liefdesbrief',svg:`<rect x="12" y="26" width="76" height="52" rx="3" fill="#F3E7CC" stroke="#C9A253" stroke-width="2"/><path d="M12 28l38 28 38-28" stroke="#C9A253" stroke-width="2" fill="none"/><circle cx="50" cy="56" r="11" fill="url(#stkWax)"/><path d="M50 62c-6-4-8-7-6-10s5-2 6 0c1-2 4-3 6 0s0 6-6 10z" fill="#F6D2C4" opacity=".85"/>`},
  /* Top 10 vol */
  beker:{n:'Wijnbeker',holo:true,svg:`<path d="M28 12h44v18c0 14-10 24-22 24S28 44 28 30z" fill="${KG}" stroke="#8F6B22" stroke-width="2"/><path d="M28 18H16c0 12 6 18 14 18M72 18h12c0 12-6 18-14 18" stroke="${KG}" stroke-width="4" fill="none"/><path d="M50 54v14" stroke="#8F6B22" stroke-width="6"/><rect x="34" y="68" width="32" height="8" rx="2" fill="${KG}"/><rect x="28" y="76" width="44" height="10" rx="2" fill="#5A3A1E"/><text x="50" y="35" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="12" fill="#6B4A16">10</text>`},
  rozet:{n:'Rozet',svg:`<path d="M38 60l-10 30 12-6 6 12 8-32zM62 60l10 30-12-6-6 12-8-32z" fill="#7A1E2C"/><g fill="#C9A253">${Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180;return `<circle cx="${50+Math.cos(a)*24}" cy="${42+Math.sin(a)*24}" r="9"/>`}).join('')}</g><circle cx="50" cy="42" r="22" fill="#E9D3A0"/><circle cx="50" cy="42" r="17" fill="none" stroke="#8F6B22" stroke-width="1.5" stroke-dasharray="3 2"/><text x="50" y="47" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="13" fill="#6B4A16">Nº1</text>`},
  podium:{n:'Podium',svg:`<rect x="36" y="38" width="28" height="48" fill="${KG}"/><rect x="10" y="54" width="26" height="32" fill="#C8CDD2"/><rect x="64" y="64" width="26" height="22" fill="#C08A52"/><text x="50" y="62" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="16" fill="#6B4A16">1</text><text x="23" y="74" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="13" fill="#5A6670">2</text><text x="77" y="80" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="12" fill="#6B3F1D">3</text><path d="M50 14l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="${KG}"/>`},
  /* Eerste set compleet */
  tastevin:{n:'Tastevin',svg:`<ellipse cx="44" cy="54" rx="32" ry="26" fill="#D6DEE4" stroke="#7E8A94" stroke-width="2.5"/><ellipse cx="44" cy="54" rx="24" ry="19" fill="#8E1F31"/><g fill="#B04050" opacity=".7">${[[34,46],[46,44],[56,50],[38,58],[50,60]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5"/>`).join('')}</g><path d="M74 46c10-4 16 0 14 6s-8 6-14 4" stroke="#7E8A94" stroke-width="4" fill="none"/>`},
  sleutel:{n:'Kelder­sleutel',svg:`<circle cx="30" cy="34" r="18" fill="none" stroke="${KG}" stroke-width="7"/><circle cx="30" cy="34" r="6" fill="${KG}"/><path d="M42 46l40 40" stroke="${KG}" stroke-width="8" stroke-linecap="round"/><path d="M66 70l8-8M74 78l8-8" stroke="${KG}" stroke-width="7" stroke-linecap="round"/>`},
  loep:{n:'Vergrootglas',svg:`<circle cx="40" cy="40" r="26" fill="#E6F2F8" fill-opacity=".85" stroke="#5A3A1E" stroke-width="7"/><path d="M60 60l26 26" stroke="#5A3A1E" stroke-width="10" stroke-linecap="round"/><g fill="#5A2350"><circle cx="36" cy="38" r="5"/><circle cx="46" cy="38" r="5"/><circle cx="41" cy="47" r="5"/></g><path d="M26 28c4-4 8-6 12-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`},
  /* Samen: 10 wijnen gemeen met één wijnvriend */
  hartglazen:{n:'Hart van glazen',holo:true,svg:`<path d="M50 88C30 72 12 58 12 38c0-14 10-24 22-24 7 0 12 3 16 9 4-6 9-9 16-9 12 0 22 10 22 24 0 20-18 34-38 50z" fill="#8E1F31"/><path d="M50 88C30 72 12 58 12 38c0-14 10-24 22-24 7 0 12 3 16 9" fill="none" stroke="${KG}" stroke-width="3"/><path d="M50 23c4-6 9-9 16-9 12 0 22 10 22 24 0 20-18 34-38 50" fill="none" stroke="${KG}" stroke-width="3"/><g transform="rotate(-16 40 46)"><path d="M32 30h14c0 12-3 17-7 18-4-1-7-6-7-18z" fill="#FBF6EC"/><path d="M39 48v12M34 61h10" stroke="#FBF6EC" stroke-width="2.4" stroke-linecap="round"/></g><g transform="rotate(16 60 46)"><path d="M54 30h14c0 12-3 17-7 18-4-1-7-6-7-18z" fill="#FBF6EC"/><path d="M61 48v12M56 61h10" stroke="#FBF6EC" stroke-width="2.4" stroke-linecap="round"/></g>`},
  kurkduo:{n:'Kurkenduo',svg:`<g transform="rotate(-14 34 52)"><rect x="22" y="22" width="24" height="56" rx="8" fill="#C99A62"/><ellipse cx="34" cy="24" rx="12" ry="4" fill="#DDB582"/><circle cx="30" cy="44" r="2" fill="#3A2418"/><circle cx="38" cy="44" r="2" fill="#3A2418"/><path d="M29 52c3 3 7 3 10 0" stroke="#3A2418" stroke-width="2" fill="none" stroke-linecap="round"/></g><g transform="rotate(14 66 52)"><rect x="54" y="22" width="24" height="56" rx="8" fill="#C99A62"/><rect x="54" y="64" width="24" height="14" rx="7" fill="#7A1E2C" opacity=".85"/><ellipse cx="66" cy="24" rx="12" ry="4" fill="#DDB582"/><circle cx="62" cy="44" r="2" fill="#3A2418"/><circle cx="70" cy="44" r="2" fill="#3A2418"/><path d="M61 52c3 3 7 3 10 0" stroke="#3A2418" stroke-width="2" fill="none" stroke-linecap="round"/></g><path d="M50 12c-3-4-8-3-8 1 0 4 8 8 8 8s8-4 8-8c0-4-5-5-8-1z" fill="#C8343F"/>`},
  tafeltwee:{n:'Tafel voor twee',svg:`<g stroke="#4A2A14" stroke-width="3" fill="none" stroke-linecap="round"><path d="M10 50c0-12 6-18 12-18s10 6 10 14"/><path d="M14 50c0-8 4-12 8-12s6 4 6 9" stroke-width="1.6"/><path d="M12 62l-3 26M30 62l2 26M10 62h22"/><path d="M90 50c0-12-6-18-12-18s-10 6-10 14"/><path d="M86 50c0-8-4-12-8-12s-6 4-6 9" stroke-width="1.6"/><path d="M88 62l3 26M70 62l-2 26M90 62H68"/></g><path d="M50 74v12" stroke="#4A2A14" stroke-width="5"/><ellipse cx="50" cy="88" rx="12" ry="3.5" fill="#4A2A14"/><path d="M18 56c0 6 2 14 4 18 4 1 8-1 10 0s6 1 9 0 6 1 9 0 6 1 9 0 6 1 9 0 6 1 10 0c2-4 4-12 4-18z" fill="#F6EEDC"/><path d="M24 58v15M33 58v16M42 58v16M50 58v16M58 58v16M67 58v16M76 58v15" stroke="#B4283A" stroke-width="3.2" opacity=".75"/><ellipse cx="50" cy="56" rx="32" ry="8" fill="#FBF6EC" stroke="#E2D3B4" stroke-width="1"/><rect x="46" y="28" width="8" height="26" rx="3" fill="#24402C"/><rect x="47.5" y="21" width="5" height="9" rx="1" fill="#7A1E2C"/><rect x="46.6" y="38" width="6.8" height="8" fill="#F3E7CC"/><g transform="rotate(-8 34 48)"><path d="M29 38h10c0 8-2 11-5 11.5-3-.5-5-3.5-5-11.5z" fill="#FBF6EC" stroke="#C9A253" stroke-width="1.2"/><path d="M30 43h8c-.6 4-2 5.6-4 6-2-.4-3.4-2-4-6z" fill="#8E1F31"/><path d="M34 49.5v5" stroke="#C9A253" stroke-width="1.4"/></g><g transform="rotate(8 66 48)"><path d="M61 38h10c0 8-2 11-5 11.5-3-.5-5-3.5-5-11.5z" fill="#FBF6EC" stroke="#C9A253" stroke-width="1.2"/><path d="M62 43h8c-.6 4-2 5.6-4 6-2-.4-3.4-2-4-6z" fill="#8E1F31"/><path d="M66 49.5v5" stroke="#C9A253" stroke-width="1.4"/></g><rect x="56" y="47" width="4" height="7" fill="#F6EEDC"/><path d="M58 40c2.5 3 2.5 5 0 6.5-2.5-1.5-2.5-3.5 0-6.5z" fill="#F2A33A"/><path d="M50 16c-2.6-3.6-8-2.6-8 1.4 0 4 8 8 8 8s8-4 8-8c0-4-5.4-5-8-1.4z" fill="#C8343F" transform="translate(13 -6) scale(.8) translate(12.5 3)"/>`},
  /* Oogst (scan in september–november) */
  mand:{n:'Oogstmand',svg:`<path d="M14 46h72l-8 40H22z" fill="#B57E44"/><g stroke="#8A5A2A" stroke-width="2.5"><path d="M18 56h64M20 66h60M22 76h56"/><path d="M30 46l2 40M50 46v40M70 46l-2 40"/></g><path d="M22 46c0-26 56-26 56 0" stroke="#8A5A2A" stroke-width="4" fill="none"/><g fill="#5A2350">${[[34,40],[42,36],[50,40],[58,36],[66,40],[38,44],[62,44]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6"/>`).join('')}</g><path d="M54 30c6-6 14-4 16 2-6 0-10 0-16-2z" fill="#5E8B3A"/>`},
  schaar:{n:'Oogstschaar',svg:`<g transform="rotate(-30 50 50)"><path d="M50 50L30 14c8-2 16 4 22 26z" fill="#B9C3CC" stroke="#5A6670" stroke-width="2"/><path d="M50 50L70 14c-8-2-16 4-22 26z" fill="#D6DEE4" stroke="#5A6670" stroke-width="2"/><path d="M48 52c-6 14-10 26-6 34 6 2 10-8 10-18z" fill="#8E1F31"/><path d="M52 52c6 14 10 26 6 34-6 2-10-8-10-18z" fill="#A8323F"/><circle cx="50" cy="50" r="3.5" fill="#5A6670"/></g>`},
  maan:{n:'Oogstmaan',svg:`<circle cx="50" cy="44" r="32" fill="#F2B34A"/><circle cx="40" cy="36" r="5" fill="#E09A30"/><circle cx="60" cy="52" r="7" fill="#E09A30"/><circle cx="58" cy="30" r="3" fill="#E09A30"/><path d="M8 84c10-12 20-14 30-6s20 6 28-2 18-6 26 2v14H8z" fill="#3A2418"/><g fill="#2F5A3A">${[16,30,44,58,72,86].map(x=>`<path d="M${x} 80c-3-8 0-14 3-16 3 2 6 8 3 16z"/>`).join('')}</g>`},
};

/* ---------- De kistjes en wat je ervoor moet doen ---------- */
/* prog(S) geeft [nu, doel]; een kistje is verdiend als nu >= doel */
const PACKS=[
  {id:'welkom',naam:'Welkomstkistje',om:'je eerste wijnkaart',prog:S=>[S.cards,1],stk:['proost','fles','kaas']},
  {id:'vriend1',naam:'Proostkistje',om:'je eerste wijnvriend',prog:S=>[S.friends,1],stk:['klink','sante','hartdruif']},
  {id:'vriend5',naam:'Tafelkistje',om:'5 wijnvrienden',prog:S=>[S.friends,5],stk:['kaars','stokbrood','karaf']},
  {id:'vriend10',naam:'Feestkistje',om:'10 wijnvrienden',prog:S=>[S.friends,10],stk:['knalkurk','discodruif','slinger']},
  {id:'land3',naam:'Reiskistje',om:'wijnen uit 3 landen',prog:S=>[S.lands,3],stk:['koffer','kompas','ballon']},
  {id:'land6',naam:'Wereldkistje',om:'wijnen uit 6 landen',prog:S=>[S.lands,6],stk:['paspoort','wereldbol','vliegtuig']},
  {id:'kleuren',naam:'Kleurenkistje',om:'rood, wit, rosé én bubbels in je album',prog:S=>[S.colors,4],stk:['rose','coupe','witglas']},
  {id:'glans',naam:'Glanskistje',om:'je eerste Super Rare of hoger',prog:S=>[S.shiny,1],stk:['ster','diamant','kroon']},
  {id:'dagboek',naam:'Dagboekkistje',om:'5 herinneringen geschreven',prog:S=>[S.memos,5],stk:['veer','polaroid','brief']},
  {id:'top10',naam:'Prijzenkistje',om:'je Top 10 helemaal gevuld',prog:S=>[S.top,10],stk:['beker','rozet','podium']},
  {id:'meester',naam:'Meesterkistje',om:'je eerste set compleet',prog:S=>[S.sets,1],stk:['tastevin','sleutel','loep']},
  {id:'samen10',naam:'Samen-kistje',om:'10 wijnen gemeen met één wijnvriend',prog:S=>[S.samen,10],stk:['hartglazen','kurkduo','tafeltwee']},
  {id:'oogst',naam:'Oogstkistje',om:'een wijn gescand in de oogsttijd (september–november)',prog:S=>[S.autumn,1],stk:['mand','schaar','maan']},
];

let PACKS_OPEN=null;        // Set met geopende kistjes (null = nog niet geladen)
let FRIENDS_N=0,friendsAt=0;
let kistBusy=false;

async function loadPacks(){
  PACKS_OPEN=new Set();
  if(!session)return;
  try{const {data,error}=await sb.from('sticker_packs').select('pack');if(!error)for(const r of data||[])PACKS_OPEN.add(r.pack)}catch(e){}
}
async function friendsCount(force){
  if(!session)return 0;
  if(!force&&Date.now()-friendsAt<60000)return FRIENDS_N;
  try{const {data,error}=await sb.rpc('list_friends');if(!error&&Array.isArray(data)){FRIENDS_N=data.length;friendsAt=Date.now()}}catch(e){}
  return FRIENDS_N;
}
function packStats(){
  const C=cards||[];
  const col=new Set();for(const c of C){if(c.style==='mousserend')col.add('bubbels');else if(c.color)col.add(c.color)}
  return {cards:C.length,friends:FRIENDS_N,lands:new Set(C.map(c=>c.land).filter(Boolean)).size,
    colors:['rood','wit','rosé','bubbels'].filter(k=>col.has(k)).length,
    shiny:C.some(c=>['superrare','ultra','icon'].includes(c.rar))?1:0,
    memos:C.filter(c=>c.memo).length,top:C.filter(c=>c.fav).length,
    sets:st?SETS.filter(s=>st.visible[s.id]&&st.complete[s.id]).length:0,
    samen:(()=>{try{return +(localStorage.getItem('vi.samenmax')||0)}catch(e){return 0}})(),
    autumn:C.some(c=>{const m=new Date(c.created).getMonth();return m>=8&&m<=10})?1:0};
}
const packEarned=(p,S)=>{const [n,g]=p.prog(S);return n>=g};

/* Stickers uit geopende kistjes horen bij je verdiende stickers */
function packStickers(){
  if(!PACKS_OPEN)return [];
  const L=[];for(const p of PACKS)if(PACKS_OPEN.has(p.id))for(const k of p.stk)L.push({id:'p:'+k,group:'Uit kistjes'});
  return L;
}
/* Voortgang voor in de stickerlade: wat kun je nog verdienen? */
function packsProgress(){
  const S=packStats();
  return PACKS.filter(p=>!PACKS_OPEN||!PACKS_OPEN.has(p.id)).map(p=>{const [n,g]=p.prog(S);return {p,n:Math.min(n,g),g,ready:n>=g}});
}

/* ---------- Bezorging: verdiende, nog dichte kistjes één voor één tonen ---------- */
async function checkPacks(){
  if(window.__NOKIST||kistBusy||!session||(typeof viewing!=='undefined'&&viewing)||!cards)return;
  if(PACKS_OPEN===null)await loadPacks();
  await friendsCount();
  const S=packStats();
  const due=PACKS.filter(p=>!PACKS_OPEN.has(p.id)&&packEarned(p,S));
  if(!due.length)return;
  // niet over een open scherm, een onthulling of het stickerplakken heen
  if(document.querySelector('.overlay:not([hidden]):not(.leaving)')||document.querySelector('.reveal,.primeur,.kistov')||(typeof stkEdit!=='undefined'&&stkEdit))return;
  deliverPack(due[0],due.length-1);
}

function crateSVG(){
  const plank=(y,h,c)=>`<rect x="8" y="${y}" width="184" height="${h}" fill="${c}"/>`;
  return `<svg class="kcrate" viewBox="0 0 200 170" aria-hidden="true">
   <defs><linearGradient id="kwood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C48A50"/><stop offset="1" stop-color="#8E5C2E"/></linearGradient>
   <pattern id="kgrain" width="40" height="8" patternUnits="userSpaceOnUse"><path d="M0 4c10-3 20 3 40 0" stroke="#7A4A22" stroke-opacity=".35" fill="none"/></pattern></defs>
   <ellipse cx="100" cy="162" rx="92" ry="7" fill="#000" opacity=".35"/>
   <g class="kbody">${plank(62,32,'url(#kwood)')}${plank(96,32,'url(#kwood)')}${plank(130,28,'url(#kwood)')}
    <rect x="8" y="62" width="184" height="96" fill="url(#kgrain)"/>
    <path d="M8 94h184M8 128h184" stroke="#6B421C" stroke-width="2"/>
    <rect x="8" y="62" width="14" height="96" fill="#7A4A22"/><rect x="178" y="62" width="14" height="96" fill="#7A4A22"/>
    <text x="100" y="110" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="17" letter-spacing="2" fill="#4A2A10" opacity=".75">VINED IT</text>
    <text x="100" y="124" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" letter-spacing="3" fill="#4A2A10" opacity=".65">GRAND CRU · STICKERS</text>
    <g fill="#3A2410">${[[15,70],[15,150],[185,70],[185,150]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.2"/>`).join('')}</g></g>
   <g class="klid"><rect x="4" y="44" width="192" height="20" rx="2" fill="url(#kwood)"/><rect x="4" y="44" width="192" height="20" fill="url(#kgrain)"/><rect x="4" y="44" width="192" height="4" fill="#D8A066" opacity=".7"/>
    <g fill="#3A2410" class="knails">${[20,70,130,180].map(x=>`<circle cx="${x}" cy="54" r="2.4"/>`).join('')}</g></g>
   <g class="kbar"><path d="M150 30l46 -22" stroke="#4A4F55" stroke-width="7" stroke-linecap="round"/><path d="M150 30c-8 4-12 12-8 18l6 2" stroke="#4A4F55" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M150 30l46 -22" stroke="#8A9096" stroke-width="2" stroke-linecap="round"/></g>
  </svg>`;
}

function deliverPack(p,more){
  kistBusy=true;
  const ov=document.createElement('div');ov.className='kistov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Kistje met stickers');
  ov.innerHTML=`<div class="kist-top"><p class="kist-eyebrow">Bezorgd</p><h2 class="kist-title">Er is een kistje bezorgd!</h2><p class="kist-sub">${esc(p.naam)} · voor ${esc(p.om)}</p></div>
    <div class="kist-stage">${crateSVG()}<div class="kist-puff"></div><div class="kist-stk"></div></div>
    <p class="kist-hint">Tik op het kistje om het open te krikken</p>
    <div class="kist-acts" hidden><button class="btn" id="kistlater">${more?'Volgende kistje':'Mooi!'}</button><button class="btn primary" id="kistplak">Meteen plakken</button></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.classList.add('in'));
  const stage=ov.querySelector('.kist-stage'),crate=ov.querySelector('.kcrate'),hint=ov.querySelector('.kist-hint');
  let pries=0,opened=false;
  const pry=()=>{
    if(opened)return;
    pries++;buzz&&buzz([18]);
    crate.classList.remove('pry');void crate.getBoundingClientRect();crate.classList.add('pry');
    const nails=crate.querySelectorAll('.knails circle');if(nails[pries-1])nails[pries-1].classList.add('pop');
    if(pries<3){hint.textContent=pries===1?'Nog een keer…':'Bijna!';return}
    opened=true;open();
  };
  stage.addEventListener('click',pry);
  setTimeout(()=>{if(!opened&&pries===0)hint.classList.add('nudge')},2600);
  const open=async()=>{
    hint.textContent='';
    // eerst opslaan, zodat een kistje nooit twee keer komt (ook als iemand halverwege sluit)
    try{const {error}=await sb.from('sticker_packs').insert({pack:p.id});if(error&&!/duplicate/i.test(error.message||''))console.warn('kistje',error)}catch(e){}
    PACKS_OPEN.add(p.id);
    crate.classList.add('open');buzz&&buzz([30,40,60]);
    const puff=ov.querySelector('.kist-puff');
    puff.innerHTML=Array.from({length:16},(_,i)=>{const a=(i/16)*Math.PI*2,d=60+Math.random()*50;return `<i style="--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d*0.7-30).toFixed(0)}px;--s:${(0.6+Math.random()*0.9).toFixed(2)};--dl:${(Math.random()*.12).toFixed(2)}s"></i>`}).join('')
      +Array.from({length:12},(_,i)=>`<b style="--dx:${(Math.random()*240-120).toFixed(0)}px;--dy:${(-60-Math.random()*90).toFixed(0)}px;--r:${(Math.random()*360).toFixed(0)}deg;--dl:${(Math.random()*.2).toFixed(2)}s"></b>`).join('');
    puff.classList.add('go');
    const box=ov.querySelector('.kist-stk');
    box.innerHTML=p.stk.map((k,i)=>{const a=PACK_ART[k];return `<figure class="kst${a.holo?' holo':''}" style="--i:${i};--x:${(i-1)*31}vw;--rot:${(i-1)*8}deg"><div class="kst-in"><svg viewBox="0 0 100 100"><g filter="url(#stkDie)">${a.svg}</g></svg></div><figcaption>${esc(a.n)}${a.holo?' <i>✦ glans</i>':''}</figcaption></figure>`}).join('');
    setTimeout(()=>box.classList.add('go'),260);
    setTimeout(()=>{ov.querySelector('.kist-title').textContent='POEF! Drie nieuwe stickers';ov.querySelector('.kist-acts').hidden=false;try{if(typeof refresh==='function')renderChrome()}catch(e){}},1500);
  };
  const close=next=>{ov.classList.remove('in');ov.classList.add('out');setTimeout(()=>{ov.remove();kistBusy=false;if(next)checkPacks()},320)};
  ov.querySelector('#kistlater').onclick=()=>close(true);
  ov.querySelector('#kistplak').onclick=()=>{close(false);setTimeout(()=>{try{openStickers()}catch(e){}},360)};
}

/* Admin: testen zonder iets op te slaan */
function demoPack(id){
  const p=PACKS.find(x=>x.id===id)||PACKS[0];
  const save=PACKS_OPEN;PACKS_OPEN=new Set(PACKS_OPEN||[]);
  const ins=sb.from;sb.from=t=>t==='sticker_packs'?{insert:async()=>({error:null}),select:async()=>({data:[],error:null})}:ins.call(sb,t);
  deliverPack(p,0);
  const restore=()=>{if(!document.querySelector('.kistov')){sb.from=ins;PACKS_OPEN=save;return}setTimeout(restore,500)};setTimeout(restore,800);
}
