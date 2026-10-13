(function () {
  "use strict";

  var minderBeweging = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var smal = window.matchMedia("(max-width: 860px)").matches;
  var heeftGsap = !!(window.gsap && window.ScrollTrigger);
  if (heeftGsap) gsap.registerPlugin(ScrollTrigger);

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

  /* ---------- topbalk ---------- */
  var topbar = $("[data-topbar]");
  var intro = $(".intro");
  function topbalk() { topbar.classList.toggle("is-vast", intro.getBoundingClientRect().bottom < 80); }
  window.addEventListener("scroll", topbalk, { passive: true });
  topbalk();

  /* ---------- HOOFDSTUK 3: taplijst uit data ---------- */
  function glasIcoon(kleur, klasse) {
    // zelfde silhouet als het getapte glas, gevuld met de echte bierkleur
    return '<svg class="' + klasse + '" viewBox="0 0 40 80" aria-hidden="true">' +
      '<path d="M3 4 L37 4 L33 70 Q33 76 20 76 Q7 76 7 70 Z" fill="none" stroke="rgba(242,233,216,.45)" stroke-width="1.2"/>' +
      '<path d="M4.6 17 L35.4 17 L32 66 Q32 69 20 69 Q8 69 8 66 Z" fill="' + kleur + '"/>' +
      '<path d="M4.1 8 L35.9 8 L35.4 17 L4.6 17 Z" fill="#F3E8D2"/>' +
      '<path d="M9 20 L11 62" stroke="rgba(255,250,240,.35)" stroke-width="1.6"/>' +
      "</svg>";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var data = window.BIEREN;
  if (data) {
    var seizoen = data.bieren.filter(function (b) { return b.seizoen; })[0];
    var rest = data.bieren.filter(function (b) { return !b.seizoen; });
    if (seizoen) {
      $("[data-seizoen]").innerHTML =
        glasIcoon(seizoen.kleur, "seizoen__glas") +
        "<div>" +
        '<p class="seizoen__label">Seizoensbier</p>' +
        '<h3 class="seizoen__naam">' + esc(seizoen.naam) + "</h3>" +
        '<p class="seizoen__stijl">' + esc(seizoen.stijl) + ", " + esc(seizoen.alcohol) + (seizoen.tap ? ", van de tap" : "") + "</p>" +
        '<p class="seizoen__smaak">' + esc(seizoen.smaak) + "</p>" +
        "</div>";
    }
    $("[data-bierlijst]").innerHTML = rest.map(function (b) {
      return '<li class="bier">' + glasIcoon(b.kleur, "bier__glas") +
        '<span class="bier__naam">' + esc(b.naam) + "</span>" +
        '<span class="bier__alc">' + esc(b.alcohol) + (b.tap ? ", tap" : ", fles") + "</span>" +
        '<span class="bier__smaak">' + esc(b.smaak) + "</span></li>";
    }).join("");
    var d = new Date(data.bijgewerkt);
    $("[data-bijgewerkt]").textContent = "Bijgewerkt op " + d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) + ".";
  }

  /* ---------- HOOFDSTUK 2: het glas ---------- */
  var canvas = $("[data-glas]");
  var wrap = $("[data-glas-wrap]");
  var bar = $(".tappen__bar");
  var glas = new BierGlas(canvas, {
    kleur: "#E0A43A",
    licht: smal,
    barY: function () { return bar.offsetTop - wrap.offsetTop; }
  });
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { glas.resize(); }, 120);
  });

  /* ---------- zonder animatie: alles in eindstand ---------- */
  if (minderBeweging || !heeftGsap) {
    $$("[data-lamp]").forEach(function (l) { l.style.setProperty("--on", 1); });
    glas.direct({ tap: 0, vul: 1, rust: 1 });
    return;
  }

  document.documentElement.classList.add("met-beweging");

  /* ---------- HOOFDSTUK 1: de lampen gaan aan ---------- */
  var foto = $("[data-intro-foto]");
  var lampen = $$("[data-lamp]");
  var mark = $("[data-logo-mark]"), woord = $("[data-logo-woord]");
  var tekst = $$("[data-intro-tekst]");
  var verder = $("[data-intro-verder]");
  var straal = smal ? ["0vmax", "56vmax", "56vmax", "0vmax"] : ["40vmax", "44vmax", "44vmax", "40vmax"];

  gsap.set([mark, woord], { opacity: 0 });
  gsap.set(tekst, { opacity: 0, y: 14 });
  gsap.set(verder, { opacity: 0 });

  var binnen = gsap.timeline({ delay: 0.35, defaults: { ease: "power2.out" } });
  lampen.forEach(function (lamp, i) {
    var t = i * 0.32;
    // een gloeidraad warmt op: eerst traag, dan voluit
    binnen.to(lamp, { "--on": 1, duration: 1.4, ease: "power1.in" }, t);
    var o = {}; o["--r" + (i + 1)] = straal[i];
    binnen.to(foto, Object.assign(o, { duration: 2.2, ease: "power2.out" }), t + 0.25);
  });
  binnen
    .to(mark, { opacity: 1, duration: 1.4, ease: "power1.inOut" }, 0.7)
    .to(woord, { opacity: 1, duration: 1.0 }, 1.5)
    .to(tekst, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }, 1.9)
    .to(verder, { opacity: 1, duration: 0.8 }, 2.6);

  // binnenlopen: de bar komt heel licht naar je toe
  gsap.to(foto, {
    scale: 1.06, ease: "none",
    scrollTrigger: { trigger: intro, start: "top top", end: "bottom top", scrub: true }
  });

  /* ---------- HOOFDSTUK 2: tappen op scroll ---------- */
  var podium = $("[data-podium]");
  var tappenTekst = $("[data-tappen-tekst]");
  var proost = $("[data-proost]");
  var duik = $("[data-duik]");

  // fases als deel van de totale scroll (0..1)
  var F = { open: [0, 0.06], vul: [0.05, 0.64], dicht: [0.64, 0.7], rust: [0.64, 0.76], duik: [0.8, 0.96] };

  function toestand(p) {
    var open = smooth(F.open[0], F.open[1], p) * (1 - smooth(F.dicht[0], F.dicht[1], p));
    var v = clamp((p - F.vul[0]) / (F.vul[1] - F.vul[0]));
    var vul = 1 - Math.pow(1 - v, 1.3);      // eerst vlot, bovenin rustiger
    glas.zet({ tap: open, vul: vul, rust: smooth(F.rust[0], F.rust[1], p) });
  }

  var tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: podium,
      start: "top top",
      end: smal ? "+=160%" : "+=210%",
      pin: true,
      scrub: 0.9,                       // traagheid: het glas loopt licht na
      anticipatePin: 1,
      onEnter: function () { glas.start(); },
      onEnterBack: function () { glas.start(); },
      onLeave: function () { glas.stop(); },
      onLeaveBack: function () { glas.stop(); toestand(0); glas.teken(); }
    }
  });
  tl.set({}, {}, 1); // tijdlijn loopt van 0 tot 1
  // de gescrubde (vertraagde) voortgang stuurt het glas, zodat alles gelijk oploopt
  tl.eventCallback("onUpdate", function () { toestand(tl.progress()); });

  // tekst blijft lang staan; "Proost." op het rustmoment
  tl.to(tappenTekst, { opacity: 0, y: -16, duration: 0.05, ease: "power1.in" }, 0.68)
    .to(proost, { autoAlpha: 1, duration: 0.05, ease: "power2.out" }, 0.71)
    .to(proost, { autoAlpha: 0, duration: 0.04, ease: "power1.in" }, 0.82);

  // de duik: het glas komt naar je toe tot het bier het beeld vult
  function zetDuikpunt() {
    var p = glas.duikpunt();
    gsap.set(wrap, { transformOrigin: p.x + "% " + p.y + "%" });
  }
  zetDuikpunt();
  window.addEventListener("resize", zetDuikpunt);

  tl.to(wrap, { scale: smal ? 14 : 11, duration: F.duik[1] - F.duik[0], ease: "power3.in" }, F.duik[0])
    .to(".tappen__bar", { opacity: 0, duration: 0.08 }, F.duik[0] + 0.04)
    .to(duik, { opacity: 1, duration: 0.06, ease: "power1.in" }, 0.87)
    .to("[data-duik-donker]", { opacity: 1, duration: 0.07, ease: "power1.inOut" }, 0.93);

  toestand(0);

  // zuinig: glas tekent alleen als het in beeld is
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) glas.start(); else glas.stop(); });
    }).observe(podium);
  }

  document.fonts && document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
