# Vined It

Een digitaal wijnzegelalbum. Scan het etiket van een wijn die je drinkt, krijg een kaart en steek hem in de sleeve van een dik, in leer gebonden album. Spaar regio's vol en hoop op een zeldzame kaart.

**Status:** fase 3. Echt scannen met camera en etiketherkenning (Claude via de Edge Function `recognize`); testers kunnen in Instellingen terug naar demowijnen.

## Spelregels

- Maximaal **3 nieuwe scans per dag**. Dat gaat valsspelen tegen en moedigt geen extra alcoholgebruik aan.
- **Eén kaart per wijn** (producent + cuvée; de jaargang is alleen een detail).
- **Nieuwe fles:** scan je een wijn die je al hebt, dan kies je "Nieuwe fles" (kost één scan, één keer per dag per wijn): de teller "N× gedronken" gaat omhoog en je maakt opnieuw 5% kans op een Full Art. De klasse zelf verandert niet, want die hoort bij de wijn. Kies je "Niet tellen", dan telt de scan niet mee.
- Het album is ingedeeld in **hoofdstukken per land**, met per regio een set van 9 **benoemde** vakken (appellations). Achterin staan de **uitdagingen** (druiven, bubbels, Wereldreiziger, Legendes).
- **Kelderboek** (de inhoudsopgave) en **Top 10**: zet je favoriete kaarten op een eigen bladzijde, met nummer 1 bovenaan.
- **Herinnering schrijven:** een korte tekst (max. 140 tekens) in handschrift op de achterkant van een kaart, met datum. De grote kaart is rond te draaien.
- **Stapels:** past een nieuwe kaart in een vak dat al gevuld is, dan komt hij op de stapel in dat vak (onbeperkt, teller ×n). Bovenop ligt de zeldzaamste, tenzij je zelf een andere kiest (tik op de stapel).
- **Kaarten:** een bladzijde "Mijn wijnwereld": een draaibare wereldbol in leer en goud (horizontaal draaien, ±35° kantelen, knijpen om tot 10× in te zoomen, ontdekte landen in goud, tik om erheen te gaan; `wereldbol.js`, data in `globe.js` via `tools/globe-gen.js`, d3-geo wordt pas geladen als de bol in beeld komt) en een kaartje rechtsboven op elke bladzijde met speldjes per streek of vak. De kaartdata (`maps.js`) is vooraf berekend uit Natural Earth (publiek domein); het speldje markeert waar een streek ligt, niet de officiële grenzen.
- **Voorbladen:** elk land begint met een voorblad: omtrek van het land met speldjes, oude of nieuwe wereld, drie weetjes, drie iconen (goud als je ze hebt, grijs als niet; `landen.js`) en de sets als lakzegels. Landen en Uitdagingen zijn ook lakzegels. Elk land, elke set en elke uitdaging heeft een eigen zegel (`zegels.js`).
- **Groeiend album:** een land of regioset krijgt pas een bladzijde bij je eerste passende wijn. Nog niet ontdekte landen en sets staan grijs op de Inhoud en zijn als voorbeeld te bekijken.
- Tik op een leeg vak voor een gids: wat het is, prijsindicatie, type winkel en waar je op het etiket op let (`gids.js`).
- **Stickers:** plak verdiende stickers op de omslag, de achterkant en elke bladzijde (knopje naast het bladnummer, of Menu → Stickers plakken). Verdienen gaat via ontdekken, nooit via meer drinken: een basisset voor iedereen, een visumstempel per nieuw land, mijlpalen bij 10/25/50/100 verschillende wijnen, een embleem per voltooide set en een holo-embleem bij een Full Art (`stickers.js`).
- **Mijn wijnvrienden:** nodig iemand uit met een persoonlijke link (WhatsApp, geen e-mail nodig) en bekijk elkaars album alleen-lezen. Herinneringen blijven privé. Een nieuwe link maakt de oude ongeldig (`vrienden.js`).
- Een kaart telt automatisch mee voor elke set waar hij past. Sommige sets worden pas zichtbaar als je een andere voltooit of de eerste passende wijn vindt. Zie `docs/setcatalogus.md`.

## Kaartklassen

De **wijn bepaalt de klasse**, voor iedereen gelijk. Bij de eerste scan schat Claude signalen in (prijs in NL, classificatie, faam van de producent, productieomvang, zeldzaamheid in NL, kwaliteit van het jaar, flesleeftijd, magnum). De formule `wine_tier()` (laatste versie in `supabase/012_formule_strenger.sql`) maakt daar een klasse van, met een korte reden ("Waarom Rare? ±€12 · topjaar 2020"). Het jaar, de leeftijd en het flesformaat tellen samen maar beperkt mee. Medailles en scores tellen niet mee. Een beheerder kan per wijn `tier_override` zetten.

| Klasse | Symbool | Uiterlijk | Typisch |
|---|---|---|---|
| Common | ● | Regio als vintage reisposter | Tot ±€20, alledaags |
| Rare | ◆ | Het etiket uit je foto op de streekposter, zilveren glans | ±€20–60, of goedkoper met bijzondere herkomst |
| Super Rare | ◆◆ | Etiket met regenboogfolie | ±€60–200 |
| Ultra | ★ | Etiket met goudfolie, goud metallic | ±€200+ |
| Legende | ♛ | Onyx en goud | Alleen de 20 Legendes (vaste lijst in `landen.js` en migratie 016; prijs telt niet) |

Full Art (5% kans, niet bij Legendes): Common = reisposter over de hele kaart; Rare = papieren etiket op zilverglitter dat langzaam kantelt; Super Rare = fles voor het etiket op goudglitter, wiegt met schaduw; Ultra = nachtelijke streek met het landmark van de regio (15 gedetailleerde landmarks in `fullart.js`), noorderlicht, open fles met bewegende kurk en kantelend etiket. Scheurtjes in het etiket zijn per wijn verschillend. Beheerder: Instellingen → Full Art-voorbeelden.

Kleuren in de sleeve: Common crème mat, Rare zilver, Super Rare goud, Ultra saffier (donker vlak, prismalijst), Legende onyx met donker roodgoud.

**✦ Icoon** is geen klasse maar een stempel: een wijn die zijn land op de kaart zette (drie per land, `LANDINFO` in `landen.js`) krijgt op elke klasse een gouden stempel en een regel "Waarom icoon?". Alle iconen staan in het overzicht *Iconen van de wereld* (knop op Legendes blad 2). Het stempel "Eerste ontdekker" staat niet meer op de kaart.

Vanaf Rare (ook bij Legende) staat er een **getekend etiket** op de streekposter: Claude beschrijft bij de eerste scan het ontwerp (kleuren, letterstijl, opbouw, embleem; `label_style` op de wijn) en `etiket.js` tekent het in de stijl van het album, bewust algemeen (geen exacte logo's). Zonder ontwerp krijgt de wijn een passend standaardetiket. Je eigen foto staat op de achterkant van de kaart. Bestaande wijnen krijgen een ontwerp via Instellingen → Etiketten tekenen (beheerder; Edge Function `reassess`, mode `label`).

**Full Art** is de geluksvariant (streekposter over de hele kaart, vanaf Rare met je etiket groot erop). Groot geopend: regenboogrand, twinkelende glitters, lichtstreep, foliestempel en lichtstralen erachter; bij het trekken flits, vuurwerk en "FULL ART!". In het album alleen een lichte glans. Elke nieuwe kaart of nieuwe fles heeft 5% kans, in elke klasse. Bestaande wijnen worden opnieuw beoordeeld met de Edge Function `reassess` (alleen beheerder, knop in Instellingen).

## Bouwplan

1. **Prototype**: album, sleeves, klassen, holo-effecten (klaar)
2. **Fundament** (in test): hosting, inloggen met e-maillink, database (Supabase, EU), de 3-per-dag-regel en de klassetrekking aan de serverkant
3. **Scannen**: camera, etiketherkenning, dubbelcheck, budgetgrens van €30 per maand
4. **Illustraties**: getekende reisposters per regio en land (art.js, klaar in eerste versie); later eventueel AI- of illustratorwerk
5. **Test**: eerst Len en Malou, daarna 10–20 vrienden

## Lokaal bekijken

Live: https://lenvanuuden.github.io/VinedIt/ — of open `index.html` in een browser. Er is geen build-stap nodig.

## Database

Het schema staat in `supabase/schema.sql`, gevolgd door `supabase/002_sets.sql` (extra wijnvelden voor sets en de echte Icons) `supabase/003_instellingen.sql` (omslagkleur, naam en bladkleur) `supabase/004_herproeven.sql` (herproeven en de dagteller) `supabase/005_herproeven_wachttijd.sql` (één poging per wijn per dag) `supabase/006_testerlimiet.sql` (hogere dagelimiet voor testaccounts) en `supabase/007_scannen.sql` (budgetteller, daglimiet herkenningen, opslag voor kaartafbeeldingen) `supabase/008_feedback.sql` (feedback van testers; bekijken met `select * from public.feedback_overzicht;`) `supabase/009_herinneringen_top10.sql` (herinneringen op de achterkant, de top 10 en de bovenste kaart van een stapel) `supabase/010_klasse_door_wijn.sql` (klasse per wijn, Full Art, nieuwe fles) `supabase/011_reassess_rechten.sql` (leesrecht voor reassess) en `supabase/012_formule_strenger.sql` (strengere formule: prijs als anker, bonussen samen max. 0,75) `supabase/013_vrienden_stickers.sql` (wijnvrienden, uitnodigingscodes, stickers per bladzijde) `supabase/014_jaargang_per_kaart.sql` (eigen jaargang per kaart: die van je laatst gescande fles) `supabase/015_etiketontwerp.sql` (getekend etiket per wijn) en `supabase/016_legendes.sql` (de twintig Legendes; de topklasse alleen via die lijst). De Edge Function `reassess` (`supabase/functions/reassess/index.ts`) beoordeelt bestaande wijnen opnieuw. De Edge Function staat in `supabase/functions/recognize/index.ts` en heeft het geheim `ANTHROPIC_API_KEY` nodig. De sets zelf staan in `data.js`. De app mag alleen lezen; kaarten ontstaan uitsluitend via de functie `scan_wine()`, die de dagelijkse limiet, de dubbelcheck, de klasse en de Full Art-kans aan de serverkant afhandelt.
