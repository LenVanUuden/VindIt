# Vined It

Een digitaal wijnzegelalbum. Scan het etiket van een wijn die je drinkt, krijg een kaart en steek hem in de sleeve van een dik, in leer gebonden album. Spaar regio's vol en hoop op een zeldzame kaart.

**Status:** fase 3. Echt scannen met camera en etiketherkenning (Claude via de Edge Function `recognize`); testers kunnen in Instellingen terug naar demowijnen.

## Spelregels

- Maximaal **3 nieuwe scans per dag**. Dat gaat valsspelen tegen en moedigt geen extra alcoholgebruik aan.
- **Eén kaart per wijn** (producent + cuvée; de jaargang is alleen een detail).
- **Nieuwe fles:** scan je een wijn die je al hebt, dan kies je "Nieuwe fles" (kost één scan, één keer per dag per wijn): de teller "N× gedronken" gaat omhoog en je maakt opnieuw 5% kans op een Full Art. De klasse zelf verandert niet, want die hoort bij de wijn. Kies je "Niet tellen", dan telt de scan niet mee.
- Het album is ingedeeld in **hoofdstukken per land**, met per regio een set van 9 **benoemde** vakken (appellations). Achterin staan de **uitdagingen** (druiven, bubbels, Wereldreiziger, Icons).
- **Kelderboek** (de inhoudsopgave) en **Top 10**: zet je favoriete kaarten op een eigen bladzijde, met nummer 1 bovenaan.
- **Herinnering schrijven:** een korte tekst (max. 140 tekens) in handschrift op de achterkant van een kaart, met datum. De grote kaart is rond te draaien.
- **Stapels:** past een nieuwe kaart in een vak dat al gevuld is, dan komt hij op de stapel in dat vak (onbeperkt, teller ×n). Bovenop ligt de zeldzaamste, tenzij je zelf een andere kiest (tik op de stapel).
- **Kaarten:** een bladzijde "Mijn wijnwereld": een draaibare wereldbol in leer en goud (horizontaal draaien, ±35° kantelen, knijpen om tot 10× in te zoomen, ontdekte landen in goud, tik om erheen te gaan; `wereldbol.js`, data in `globe.js` via `tools/globe-gen.js`, d3-geo wordt pas geladen als de bol in beeld komt) en een kaartje rechtsboven op elke bladzijde met speldjes per streek of vak. De kaartdata (`maps.js`) is vooraf berekend uit Natural Earth (publiek domein); het speldje markeert waar een streek ligt, niet de officiële grenzen.
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
| Icon | ♛ | Onyx en goud | Wereldiconen (vaste lijst of iconisch en ±€300+) |

Vanaf Rare (ook bij Icon) knipt de app het etiket uit je foto (Claude geeft het kader, `label_box`; anders het midden van de zoeker). Demowijnen en kaarten van vóór deze versie tonen een getekend etiket tot de eerste echte scan van die wijn; scan je een wijn opnieuw, dan wordt de foto vervangen.

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

Het schema staat in `supabase/schema.sql`, gevolgd door `supabase/002_sets.sql` (extra wijnvelden voor sets en de echte Icons) `supabase/003_instellingen.sql` (omslagkleur, naam en bladkleur) `supabase/004_herproeven.sql` (herproeven en de dagteller) `supabase/005_herproeven_wachttijd.sql` (één poging per wijn per dag) `supabase/006_testerlimiet.sql` (hogere dagelimiet voor testaccounts) en `supabase/007_scannen.sql` (budgetteller, daglimiet herkenningen, opslag voor kaartafbeeldingen) `supabase/008_feedback.sql` (feedback van testers; bekijken met `select * from public.feedback_overzicht;`) `supabase/009_herinneringen_top10.sql` (herinneringen op de achterkant, de top 10 en de bovenste kaart van een stapel) `supabase/010_klasse_door_wijn.sql` (klasse per wijn, Full Art, nieuwe fles) `supabase/011_reassess_rechten.sql` (leesrecht voor reassess) en `supabase/012_formule_strenger.sql` (strengere formule: prijs als anker, bonussen samen max. 0,75) `supabase/013_vrienden_stickers.sql` (wijnvrienden, uitnodigingscodes, stickers per bladzijde) en `supabase/014_jaargang_per_kaart.sql` (eigen jaargang per kaart: die van je laatst gescande fles). De Edge Function `reassess` (`supabase/functions/reassess/index.ts`) beoordeelt bestaande wijnen opnieuw. De Edge Function staat in `supabase/functions/recognize/index.ts` en heeft het geheim `ANTHROPIC_API_KEY` nodig. De sets zelf staan in `data.js`. De app mag alleen lezen; kaarten ontstaan uitsluitend via de functie `scan_wine()`, die de dagelijkse limiet, de dubbelcheck, de klasse en de Full Art-kans aan de serverkant afhandelt.
