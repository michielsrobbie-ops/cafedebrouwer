/*
  Agenda Café de Brouwer: gestructureerde gegevens.
  LET OP: VOORBEELDPROGRAMMA voor de demo. Echte data opvragen bij het café.
  Alleen evenementen vanaf vandaag worden getoond, op datum gesorteerd.

  soort: "live" | "feest" | "carnaval" | "familie" (bepaalt de opdruk van het viltje)
*/
window.AGENDA = [
  {
    datum: "2026-10-24", tijd: "20:00",
    titel: "Live muziek",
    tekst: "Rock, pop en Nederpop op de bühne. Van toen tot nu.",
    entree: "Gratis entree",
    soort: "live"
  },
  {
    datum: "2026-11-11", tijd: "20:11",
    titel: "Elfde van de elfde",
    tekst: "Het carnavalsseizoen gaat open, samen met C.V. de Pierewaaiers.",
    entree: "Gratis entree",
    soort: "carnaval"
  },
  {
    datum: "2026-11-21", tijd: "21:00",
    titel: "Brakka party",
    tekst: "Feestavond met DJ. Zaal open, bar open, volume open.",
    entree: "Gratis entree",
    soort: "feest"
  },
  {
    datum: "2026-12-26", tijd: "15:00",
    titel: "Tweede Kerstdag",
    tekst: "Even weg van de kerstdis. Borrel en muziek aan de bar.",
    entree: "Iedereen welkom",
    soort: "familie"
  },
  {
    datum: "2027-01-01", tijd: "15:00",
    titel: "Nieuwjaarsreceptie",
    tekst: "Met familie De Brouwer en C.V. de Pierewaaiers.",
    entree: "Iedereen welkom",
    soort: "familie"
  },
  {
    datum: "2027-02-05", tijd: "20:00",
    titel: "Carnaval 2027",
    tekst: "Vijf dagen feest, van inblaozen tot 't leste rondje.",
    entree: "Programma hieronder",
    soort: "carnaval",
    link: "#carnaval"
  }
];
