# Vined It

Een digitaal wijnzegelalbum. Scan het etiket van een wijn die je drinkt, krijg een kaart en steek hem in de sleeve van een dik, in leer gebonden album. Spaar regio's vol en hoop op een zeldzame kaart.

**Status:** fase 3. Echt scannen met camera en etiketherkenning (Claude via de Edge Function `recognize`); testers kunnen in Instellingen terug naar demowijnen.

## Spelregels

- Maximaal **3 nieuwe scans per dag**. Dat gaat valsspelen tegen en moedigt geen extra alcoholgebruik aan.
- **Eén kaart per wijn** (producent + cuvée; de jaargang is alleen een detail).
- **Herproeven:** scan je een wijn die je al hebt, dan kun je kiezen voor een nieuwe trekking. Dat kost één van je 3 scans en kan één keer per dag per wijn; alleen een hogere klasse vervangt je kaart. Icon-kaarten kun je niet herproeven. Kies je niet, dan telt de scan niet mee.
- Het album is ingedeeld in **hoofdstukken per land**, met per regio een set van 9 **benoemde** vakken (appellations). Achterin staan de **verzamellijsten** (druiven, bubbels, Wereldreiziger, Icons).
- **Kelderboek** (de inhoudsopgave) en **Top 10**: zet je favoriete kaarten op een eigen bladzijde, met nummer 1 bovenaan.
- **Herinnering schrijven:** een korte tekst (max. 140 tekens) in handschrift op de achterkant van een kaart, met datum. De grote kaart is rond te draaien.
- **Stapels:** past een nieuwe kaart in een vak dat al gevuld is, dan komt hij op de stapel in dat vak (onbeperkt, teller ×n). Bovenop ligt de zeldzaamste, tenzij je zelf een andere kiest (tik op de stapel).
- **Kaarten:** een bladzijde "Mijn wijnwereld" (wereld + Europa, ontdekte landen in goud, tik om erheen te gaan) en een kaartje rechtsboven op elke bladzijde met speldjes per streek of vak. De kaartdata (`maps.js`) is vooraf berekend uit Natural Earth (publiek domein); het speldje markeert waar een streek ligt, niet de officiële grenzen.
- **Groeiend album:** een land of regioset krijgt pas een bladzijde bij je eerste passende wijn. Nog niet ontdekte landen en sets staan grijs op de Inhoud en zijn als voorbeeld te bekijken.
- Tik op een leeg vak voor een gids: wat het is, prijsindicatie, type winkel en waar je op het etiket op let (`gids.js`).
- Een kaart telt automatisch mee voor elke set waar hij past. Sommige sets worden pas zichtbaar als je een andere voltooit of de eerste passende wijn vindt. Zie `docs/setcatalogus.md`.

## Kaartklassen

| Klasse | Symbool | Uiterlijk | Bepaald door |
|---|---|---|---|
| Common | ● | Regio als vintage reisposter | Geluk (~76%) |
| Rare | ◆ | Eigen flesfoto in posterstijl, zilveren rand | Geluk (~18%) |
| Super Rare | ◆◆ | Rare met regenboog-holo en glitter | Geluk (5%) |
| Ultra | ★ | Full art in lagen, goudrand | Geluk (~1%) |
| Icon | ♛ | Onyx en goud | De wijn (vaste lijst) |

Garantie: een Super Rare binnen 25 scans en een Ultra binnen 100. De kansen zijn niet zichtbaar in het album, alleen onder "Uitleg".

## Bouwplan

1. **Prototype**: album, sleeves, klassen, holo-effecten (klaar)
2. **Fundament** (in test): hosting, inloggen met e-maillink, database (Supabase, EU), de 3-per-dag-regel en de klassetrekking aan de serverkant
3. **Scannen**: camera, etiketherkenning, dubbelcheck, budgetgrens van €30 per maand
4. **Illustraties**: getekende reisposters per regio en land (art.js, klaar in eerste versie); later eventueel AI- of illustratorwerk
5. **Test**: eerst Len en Malou, daarna 10–20 vrienden

## Lokaal bekijken

Live: https://lenvanuuden.github.io/VinedIt/ — of open `index.html` in een browser. Er is geen build-stap nodig.

## Database

Het schema staat in `supabase/schema.sql`, gevolgd door `supabase/002_sets.sql` (extra wijnvelden voor sets en de echte Icons) `supabase/003_instellingen.sql` (omslagkleur, naam en bladkleur) `supabase/004_herproeven.sql` (herproeven en de dagteller) `supabase/005_herproeven_wachttijd.sql` (één poging per wijn per dag) `supabase/006_testerlimiet.sql` (hogere dagelimiet voor testaccounts) en `supabase/007_scannen.sql` (budgetteller, daglimiet herkenningen, opslag voor kaartafbeeldingen) `supabase/008_feedback.sql` (feedback van testers; bekijken met `select * from public.feedback_overzicht;`) en `supabase/009_herinneringen_top10.sql` (herinneringen op de achterkant, de top 10 en de bovenste kaart van een stapel). De Edge Function staat in `supabase/functions/recognize/index.ts` en heeft het geheim `ANTHROPIC_API_KEY` nodig. De sets zelf staan in `data.js`. De app mag alleen lezen; kaarten ontstaan uitsluitend via de functie `scan_wine()`, die de dagelijkse limiet, de dubbelcheck, de klassetrekking en de garantie aan de serverkant afhandelt.
