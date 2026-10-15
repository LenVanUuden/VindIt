# Vined It – ideeënmap

Ideeën uit tests en eigen inval. Per idee: waar het vandaan komt, wat het oplevert, inschatting van het werk en de status.

| # | Idee | Bron | Waarde | Werk | Status |
|---|---|---|---|---|---|
| 1 | **Herinnering schrijven**: een eigen, handgeschreven notitie op de achterkant van een kaart | Len | Hoog: herinneringen maken van kaarten, onderscheidend | Middel | Live |
| 2 | **Spectaculairder omdraaien** van een nieuwe kaart | Tester | Hoog: het piekmoment van de app | Middel | Live |
| 3 | **Top 10**: eigen bladzijde direct na het Kelderboek, #1 bovenaan en 3×3 eronder | Tester | Middel | Klein | Live |
| 4 | **"Inhoud" hernoemen** naar "Kelderboek" (naam kan later nog veranderen) | Tester | Klein, maar sfeerverhogend | Heel klein | Live |
| 5 | **Mijn wijnvrienden**: uitnodigen met een link, elkaars album alleen-lezen bekijken (herinneringen privé) | Tester / Len | Hoog voor groei | Middel | Live |
| 6 | Druivenjager: open logboek voor zeldzame druiven | Len | Hoog | Klein | Idee |
| 7 | Eigen sets ("Vakantie Toscane 2026") | Claude | Hoog | Middel | Idee |
| 8 | Welkomstrondleiding (4 schermen) | Claude | Hoog voor nieuwe gebruikers | Klein | Live |
| 9 | "Koop deze fles" vanuit een leeg vak | Len | Verdienmodel | Middel (partners nodig) | Later |
| 10 | Overzicht "Mijn kaarten" op datum | Claude | Middel | Klein | Idee |
| 11 | **Interactieve wereldkaart** ("Mijn wijnwereld") | Tester | Middel-hoog: overzicht en trots | Middel | Live |
| 13 | **Stapels per vak**: extra kaarten op de stapel in hun vak, zeldzaamste bovenop, zelf te kiezen | Len | Hoog: elke kaart een plek in context, minder 'Overige' | Middel | Live |
| 14 | **Walk-out bij nieuwe kaart** (FIFA-stijl): land, druif, streek, kaart; Ultra/Icon extra drama; overslaan kan altijd | Len | Hoog: het piekmoment verlengen | Middel | Live |
| 15 | **Gebruiksgemak**: menu linksboven, 'waar ben ik'-knop, vaste ✕ en ‹ Terug, telefoon-terugknop sluit vensters, ⓘ-uitleg, nieuwe 'Hoe werkt Vined It?', bevestigingen, alles op één scherm, premium scanknop | Len | Hoog | Middel | Live |
| 16 | **De wijn bepaalt de klasse**: signalen (prijs, classificatie, producent, productie, zeldzaamheid NL, jaar, leeftijd, magnum) → vaste klasse per wijn, met reden; Full Art (5%) als geluk; 'Nieuwe fles' telt flessen | Len | Hoog: eerlijk en uitlegbaar, later vervangen door #21 | Middel | Live |
| 17 | **Stickers**: verdiende stickers plakken op omslag, achterkant en bladzijden; verdienen via ontdekken, niet via drinken. Kopen pas bij ±100+ gebruikers | Len | Hoog: echt eigen album | Middel | Live (kopen: later) |
| 18 | **Deel deze bladzijde** als afbeelding voor WhatsApp/Instagram | Claude | Middel-hoog: zichtbaarheid | Klein | Idee |
| 19 | **Lakzegels en voorbladen**: voorblad per land met omtrek, weetjes en iconen; 58 unieke lakzegels voor landen, sets en uitdagingen | Len | Hoog: minder zakelijk, meer album | Middel | Live |
| 20 | **Getekende etiketten** op basis van het echte etiket (Claude beschrijft, app tekent); foto op de achterkant | Len | Hoog: herkenbaar en in stijl | Middel | Live |
| 21 | **Legendes en Iconen**: 20 Legendes als topklasse (prijs telt niet), ✦ Icoon-stempel met "Waarom icoon?" (3 per land, ook betaalbaar), overzicht Iconen van de wereld; stempel Eerste ontdekker weg | Len | Hoog: topklasse echt legendarisch, elk land een verhaal | Middel | Live |
| 22 | **Kelderboek en menu vernieuwd**: klassen als postzegels (tik = blad met al je kaarten van die klasse), landen als lakzegels, menu met tegels; bevestigingsmeldingen weg | Len | Middel-hoog: vriendelijker en minder lijst | Klein | Live |
| 23 | **Nieuwe Full Arts**: Rare = papieren etiket op zilverglitter (kantelt), Super Rare = fles voor het etiket op goudglitter (wiegt, met schaduw), Ultra = nachtelijke streek met gedetailleerd landmark, noorderlicht, open fles met bewegende kurk; scheurtjes uniek per wijn | Len | Hoog: elke klasse een eigen soort kaart | Groot | Live |
| 24 | **Legendes altijd Full Art met een eigen tekening** per wijn (fles, etiket, plek, glitter); geen 5%-kans meer voor Legendes | Len | Hoog: de topklasse echt uniek | Groot | Idee (later) |
| 12 | **Kaartje van de streek rechtsboven** op elke bladzijde, groot te openen met genummerde speldjes | Tester | Middel: oriëntatie en leerwaarde | Middel | Live |

## 1. Herinnering schrijven (eerder: Flessenpost)

- Optioneel bij elke kaart: na het scannen ("Schrijf flessenpost") of later vanuit de kaart.
- Maximaal ±140 tekens, zodat het op de achterkant past en kort en persoonlijk blijft.
- Weergave op de achterkant: een handschriftlettertype, de datum automatisch erbij ("14 okt 2026"), alsof je achterop een ansichtkaart schrijft.
- De kaart is in het groot volledig rond te draaien (vegen), zodat je voor- en achterkant ziet.
- Achteraf aan te passen, maar de oorspronkelijke datum blijft.
- Een kleine pen-indicator op de mini in de sleeve laat zien dat er flessenpost op zit.
- Privé: alleen jij ziet het (tot er eventueel sociale functies komen, en dan alleen als je dat wilt).
- Technisch: kolommen `memo` en `memo_at` op `cards`, plus een functie `set_memo()` die alleen je eigen kaart aanpast.

Namen die overwogen zijn: Flessenpost, Achterop, Ansicht, Souvenir, Kurknotitie.

## 2. Spectaculairder omdraaien

- Een opbouw van spanning: de kaart trilt even, en de gloed aan de randen verraadt de klasse (wit, zilver, regenboog, goud).
- Eerst een "vasthouden om te openen", of de kaart zelf omvegen.
- Per klasse meer spektakel: vonken bij Rare, holo-flits bij Super Rare, lichtstralen en schermvullend goud bij Ultra en Icon.
- Trillen van de telefoon (waar ondersteund).

## 3. Mijn favorieten

- Een eigen bladzijde direct na de Inhoud, met 9 vakken. Juist de beperking maakt het betekenisvol: "mijn top 9".
- Een ster-knop op de grote kaart om hem op de favorietenpagina te zetten of eraf te halen.
- De kaart blijft ook gewoon in zijn set staan.

## 4. Naam voor "Inhoud"

Opties: Kelderboek, Mijn kelder, Mijn collectie, Register. Let op: "kelder" suggereert flessen die je nog hebt liggen, terwijl het album gaat over wat je gedronken hebt.

## 5. Verbinden met anderen (later)

- Vrienden toevoegen, elkaars album bekijken (alleen-lezen) en vergelijken.
- Vereist privacy-keuzes, uitnodigingen en een eigen e-maildomein.
