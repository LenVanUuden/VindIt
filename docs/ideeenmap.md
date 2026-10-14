# Vined It – ideeënmap

Ideeën uit tests en eigen inval. Per idee: waar het vandaan komt, wat het oplevert, inschatting van het werk en de status.

| # | Idee | Bron | Waarde | Werk | Status |
|---|---|---|---|---|---|
| 1 | **Herinnering schrijven**: een eigen, handgeschreven notitie op de achterkant van een kaart | Len | Hoog: herinneringen maken van kaarten, onderscheidend | Middel | Klaar (wacht op livegang) |
| 2 | **Spectaculairder omdraaien** van een nieuwe kaart | Tester | Hoog: het piekmoment van de app | Middel | Klaar (wacht op livegang) |
| 3 | **Top 10**: eigen bladzijde direct na het Kelderboek, #1 bovenaan en 3×3 eronder | Tester | Middel | Klein | Klaar (wacht op livegang) |
| 4 | **"Inhoud" hernoemen** naar "Kelderboek" (naam kan later nog veranderen) | Tester | Klein, maar sfeerverhogend | Heel klein | Klaar (wacht op livegang) |
| 5 | **Verbinden met andere gebruikers**: elkaars album bekijken | Tester | Hoog voor groei, maar pas zinvol met meer gebruikers | Groot | Later |
| 6 | Druivenjager: open logboek voor zeldzame druiven | Len | Hoog | Klein | Idee |
| 7 | Eigen sets ("Vakantie Toscane 2026") | Claude | Hoog | Middel | Idee |
| 8 | Welkomstrondleiding (3 schermen) | Claude | Hoog voor nieuwe gebruikers | Klein | Idee |
| 9 | "Koop deze fles" vanuit een leeg vak | Len | Verdienmodel | Middel (partners nodig) | Later |
| 10 | Overzicht "Mijn kaarten" op datum | Claude | Middel | Klein | Idee |
| 11 | **Interactieve wereldkaart** ("Mijn wijnwereld") | Tester | Middel-hoog: overzicht en trots | Middel | Klaar (wacht op livegang) |
| 13 | **Stapels per vak**: extra kaarten op de stapel in hun vak, zeldzaamste bovenop, zelf te kiezen | Len | Hoog: elke kaart een plek in context, minder 'Overige' | Middel | Klaar (wacht op livegang) |
| 12 | **Kaartje van de streek rechtsboven** op elke bladzijde, groot te openen met genummerde speldjes | Tester | Middel: oriëntatie en leerwaarde | Middel | Klaar (wacht op livegang) |

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
