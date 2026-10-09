# Vin’d It

Een digitaal wijnzegelalbum. Scan het etiket van een wijn die je drinkt, krijg een kaart en steek hem in de sleeve van een dik, in leer gebonden album. Spaar regio's vol en hoop op een zeldzame kaart.

**Status:** fase 2. Inloggen met e-mailcode en een echte database (Supabase); scannen gebruikt nog fictieve demowijnen.

## Spelregels

- Maximaal **3 nieuwe scans per dag**. Dat gaat valsspelen tegen en moedigt geen extra alcoholgebruik aan.
- **Eén kaart per wijn** (producent + cuvée; de jaargang is alleen een detail). Een dubbele scan levert niets op en telt niet mee.
- Het album is ingedeeld in **hoofdstukken per land**, met per regio een set van 9 **benoemde** vakken (appellations). Achterin staan de **verzamellijsten** (druiven, bubbels, Wereldreiziger, Icons).
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

Live: https://lenvanuuden.github.io/VindIt/ — of open `index.html` in een browser. Er is geen build-stap nodig.

## Database

Het schema staat in `supabase/schema.sql`, gevolgd door `supabase/002_sets.sql` (extra wijnvelden voor sets en de echte Icons) en `supabase/003_instellingen.sql` (omslagkleur, naam en bladkleur). De sets zelf staan in `data.js`. De app mag alleen lezen; kaarten ontstaan uitsluitend via de functie `scan_wine()`, die de dagelijkse limiet, de dubbelcheck, de klassetrekking en de garantie aan de serverkant afhandelt.
