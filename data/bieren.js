/*
  Bieraanbod Café de Brouwer: gestructureerde gegevens.
  LET OP: dit is VOORBEELDDATA. Namen, percentages en kleuren nog bevestigen met het café.
  Later kan dit bestand door een beheeromgeving worden gegenereerd (zelfde opzet als vacatures bij Veldwerk).

  kleur      = bierkleur zoals in het glas (hex)
  seizoen    = true voor het bier dat bovenaan staat
  tap        = true als het van de tap komt, anders fles
*/
window.BIEREN = {
  bijgewerkt: "2026-10-13",
  bieren: [
    {
      naam: "Herfstbok",
      stijl: "Bokbier",
      alcohol: "6,5%",
      kleur: "#6A240F",
      smaak: "Karamel, geroosterd mout en een zachte, warme afdronk. Alleen in het bokseizoen.",
      seizoen: true,
      tap: true
    },
    {
      naam: "Pils",
      stijl: "Pilsener",
      alcohol: "5,0%",
      kleur: "#E0A43A",
      smaak: "Fris en droog, met twee vingers schuim.",
      tap: true
    },
    {
      naam: "Blond",
      stijl: "Speciaalbier",
      alcohol: "6,5%",
      kleur: "#D88E2C",
      smaak: "Zacht, licht fruitig en een tikje kruidig.",
      tap: true
    },
    {
      naam: "Saison",
      stijl: "Saison",
      alcohol: "6,0%",
      kleur: "#D7A246",
      smaak: "Droog, peperig en licht troebel.",
      tap: false
    },
    {
      naam: "Witbier",
      stijl: "Witbier",
      alcohol: "5,0%",
      kleur: "#EBC877",
      smaak: "Troebel, met citrus en koriander.",
      tap: false
    },
    {
      naam: "Alcoholvrij",
      stijl: "Pils 0,0%",
      alcohol: "0,0%",
      kleur: "#DE9F3C",
      smaak: "Voor de bob. Smaakt gewoon naar pils.",
      tap: false
    }
  ]
};
