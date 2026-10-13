# Café de Brouwer: open punten

## Bij het café navragen
- **Openingstijden.** Die staan nergens online. Nu staat er een verwijzing naar Facebook.
- **Telefoonnummer.** De eigen site noemt 013-5131360, Bezoek Oisterwijk noemt 013-5134360. In de demo staat 013-5131360.
- **Tapbieren.** Welke bieren lopen er echt (merk, soort, alcohol, seizoensbok)? `data/bieren.js` is nu voorbeelddata.
- **Agenda.** `data/agenda.js` is een voorbeeldprogramma, met uitzondering van de nieuwjaarsreceptie met C.V. de Pierewaaiers en carnaval. Echte data opvragen.
- **Carnaval.** Het motto en het programma in `data/carnaval.js` komen van carnaval 2025 en staan als voorbeeld op de data van 2027 (5 tot en met 9 februari). Opvragen: het motto voor 2027, het programma, de kleuren van het embleem en een foto van het embleem.
- **Cafétocht.** "Brett" staat niet op OpenStreetMap: het adres ontbreekt. De positie van Hierneffe op het Sint Jansplein is geschat. De volgorde van de route is door ons gekozen (van oost naar west, eindigend bij De Brouwer).
- **Feesten.** Wat bieden ze precies aan (zaal, maximaal aantal gasten, buffetten)? Het formulier is nu een demo en verstuurt niets. Bij livegang koppelen aan FormSubmit naar info@cafedebrouwer.nl (eerste inzending vraagt activatie).
- **Fotografie.** Een eigen avondfoto van de bar met de lampen aan (`assets/img/bar.jpg`) en een foto van een volle zaal (`assets/img/volle-zaal.jpg`, bijvoorbeeld de omslagfoto van Facebook). Het beste is een fotoshoot op een drukke avond.
- **Huidige logobestanden.** Bijvoorbeeld het groene ronde logo, liefst als vector. Nu is het silhouet nagetekend uit het kleine bestand op de oude site.

## Technisch
- **Bar-foto.** Die wordt nu tijdelijk van `cafedebrouwer.nl/wp-content/uploads/bg.jpg` geladen. Sla de foto op als `assets/img/bar.jpg`, dan gebruikt de site de eigen kopie. Op een https-domein werkt het externe http-adres niet.
- **Logo aanpassen.** Wijzig `assets/img/logo.svg` en draai daarna `python3 build.py`. Dat zet het pad opnieuw in `index.html`. Bewerk `index.src.html`, niet `index.html`.
- **Versienummers.** Bij elke wijziging aan CSS of JS de `?v=` in `index.src.html` ophogen.

## Kaart
De straten en de Reusel komen uit OpenStreetMap (ODbL). De bronvermelding staat onder de kaart en moet daar blijven staan.
