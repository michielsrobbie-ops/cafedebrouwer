# Café de Brouwer: visuele richting

**Werktitel: "Het licht gaat aan."**
Een avond in De Brouwer begint als de lampen boven de bar opwarmen. De site doet hetzelfde: alles is donker hout en warm licht, en het enige wat echt beweegt is het bier.

## Kleur

| Naam    | Hex       | Rol |
|---------|-----------|-----|
| Hout    | `#1E140D` | Basis. Diep warm donkerbruin, nooit zwart. |
| Rook    | `#2B1D13` | Vlakken, de bar, het formulier. |
| Schuim  | `#F2E9D8` | Tekst en koppen. Gebroken wit, als een schuimkraag. |
| Kurk    | `#BDAE98` | Rustige tekst, adresregels. |
| Amber   | `#C8812A` | Het enige accent: knoppen, focus, het bier zelf. |
| Goud    | `#F0C36A` | Alleen als licht: lampgloed, reflectie op glas en tap. Nooit als versiering. |
| Fles    | `#23402C` | Het groen van het huidige logo. Alleen als klein merkdetail (het tapschild). |

## Typografie (twee families)

- **Big Shoulders Display** 600/800: de koppen. Hoog en smal, zoals gevelletters en cafébordjes. Groot gezet en strak gespatieerd.
- **Newsreader** (variabel, met optische maten): de lopende tekst. Een warme, leesbare serif, iets ruimer interlinie dan een schreefloze.
- Geen versalen-labels en geen monospace. Labels zijn gewoon tekst in Newsreader-cursief.

## Beeld

- **Logo:** het bestaande silhouet (familie aan tafel, hond) is als vector nagetekend uit de oude site. De vorm blijft precies gelijk, alleen de kleur is aangepast (schuimwit in goudlicht).
- **Foto bar:** de huidige achtergrondfoto van cafedebrouwer.nl, warm gegradeerd en donker. *Tijdelijk*: vervangen door een eigen avondfoto van de bar (zie open-vragen).
- **Bier en glas:** volledig in canvas getekend, met de echte bierkleur. Geen stockfoto nodig.

## Compositie

```
HOOFDSTUK 1: BINNENKOMST (100vh, niet vastgezet)
┌──────────────────────────────────────────────┐
│ logo-klein      Op de tap Agenda …   Bel ons │
│   ╲   lamp      lamp       lamp      lamp    │ ← hanglampen, warmen op na elkaar
│                                              │
│           [ silhouet + woordmerk ]           │ ← in het licht, gecentreerd
│      Hét café voor gezelligheid in Moergestel│
│      Rootven 11  ·  [Route]  [Agenda]        │
│   (bar-foto komt in lichtvlekken tevoorschijn)│
│                    scroll voor je eerste bier │
└──────────────────────────────────────────────┘

HOOFDSTUK 2: HET EERSTE BIER (vast, ±2,2 schermhoogtes scroll)
┌──────────────────────────────────────────────┐
│  Eerst een biertje.            ┌─tap─┐       │
│  korte tekst, links uitgelijnd │  ║  │       │
│                                 ╲   ╱ glas   │ ← glas vult op scroll
│  ───────────── bar ─────────────┴───┴─────── │
└──────────────────────────────────────────────┘
   Glas vol → even stilstand ("Proost.") → camera duikt het bier in:
   het amber vult het beeld en zakt weg tot het donker van hoofdstuk 3.

HOOFDSTUK 3: NU OP DE TAP (begin)
 Seizoensbier groot links met kleurstaal, de rest als rustige lijst rechts.
```

Tekst is links uitgelijnd. Alleen de binnenkomst is gecentreerd, omdat het logo daar het middelpunt is.

## Choreografie

1. **Laden (eenmalig, ±3 s).** Donker. De lampen warmen op van links naar rechts: geen flikkering, wel een vertraagde opbouw zoals een gloeidraad. Elk licht onthult een stuk bar. Het silhouet wordt zichtbaar in het licht, daarna het woordmerk en daarna de tekst. Daarna staat alles stil.
2. **Scrollen door de binnenkomst.** De bar-foto schuift heel licht naar je toe (schaal 1 → 1,06), zodat je binnenloopt. Geen parallax op tekst.
3. **Het eerste bier (scrub met traagheid).**
   - 0–8%: de tapkraan draait open.
   - 8–70%: het bier stijgt. Eerst snel, daarna langzamer, met bubbels, een iets onrustig oppervlak en een groeiende schuimkraag. Op het koude glas verschijnt condens.
   - 70–78%: de tap sluit en de kraag zet zich. Stilstand: "Proost."
   - 78–100%: het glas groeit tot het amber het hele scherm vult, en zakt dan weg naar Hout. De kop van hoofdstuk 3 staat er al.
4. **Geen beweging zonder reden.** Geen hover-sprongen en geen fade-up per sectie. Knoppen krijgen alleen kleurovergangen.

## Minder beweging en mobiel

- **prefers-reduced-motion:** lampen staan direct aan, het glas staat vol en stil, er is niets vastgezet en geen duik. Alle inhoud is dan nog steeds aanwezig.
- **Mobiel (< 760 px):** het glas staat gecentreerd onder de tekst, het vastgezette stuk is korter (±1,6 schermhoogtes), er zijn minder bubbels en er is geen condens.

## Waar het op beoordeeld wordt

1. Is het stilstaande beeld al sterk zonder effecten?
2. Voelt het vullen van het glas tastbaar?
3. Reageert het voorspelbaar op scrollen, ook bij terug scrollen?
4. Zijn merk, tekst en navigatie helder?
5. Blijft het verzorgd op mobiel en met minder beweging?
