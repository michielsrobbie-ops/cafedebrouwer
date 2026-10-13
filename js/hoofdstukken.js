/* Hoofdstukken 4 tot en met 8: agenda, cafétocht, carnaval, feesten, tot ziens. */
(function () {
  "use strict";

  var beweging = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !!(window.gsap && window.ScrollTrigger);
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var SVG = "http://www.w3.org/2000/svg";
  function el(naam, attrs, tekst) {
    var e = document.createElementNS(SVG, naam);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (tekst) e.textContent = tekst;
    return e;
  }

  /* ---------- menu op smalle schermen ---------- */
  var menu = $("[data-menu]"), menuknop = $("[data-menuknop]");
  function menuDicht() { menu.classList.remove("is-open"); menuknop.setAttribute("aria-expanded", "false"); }
  menuknop.addEventListener("click", function () {
    var open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    menuknop.setAttribute("aria-expanded", String(open));
    if (open) menu.querySelector("a").focus();
  });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) menuDicht(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { menuDicht(); menuknop.focus(); }
  });

  /* ---------- HOOFDSTUK 4: agenda als bierviltjes ---------- */
  var draai = [-3, 2.2, -1.4, 2.8, -2.4, 1.6, -1, 2.4];
  var vandaag = new Date(); vandaag.setHours(0, 0, 0, 0);
  var komend = (window.AGENDA || [])
    .map(function (a) { return Object.assign({ d: new Date(a.datum + "T00:00:00") }, a); })
    .filter(function (a) { return a.d >= vandaag; })
    .sort(function (a, b) { return a.d - b.d; })
    .slice(0, 6);
  var viltjes = $("[data-viltjes]");
  if (komend.length) {
    viltjes.innerHTML = komend.map(function (a, i) {
      var dag = a.d.toLocaleDateString("nl-NL", { weekday: "short" }).replace(".", "");
      var mnd = a.d.toLocaleDateString("nl-NL", { month: "short" }).replace(".", "");
      var lang = a.d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      var titel = a.link ? '<a href="' + esc(a.link) + '">' + esc(a.titel) + "</a>" : esc(a.titel);
      return '<li class="viltje viltje--' + esc(a.soort) + '" style="--draai:' + draai[i % draai.length] + 'deg">' +
        '<time class="viltje__datum" datetime="' + esc(a.datum) + "T" + esc(a.tijd) + '">' +
        '<span class="sr-only">' + esc(lang) + ", " + esc(a.tijd) + " uur</span>" +
        '<span class="viltje__nr" aria-hidden="true">' + a.d.getDate() + "</span>" +
        '<span class="viltje__dagmnd" aria-hidden="true"><span>' + esc(dag) + "</span><span>" + esc(mnd) + "</span></span></time>" +
        '<h3 class="viltje__titel">' + titel + "</h3>" +
        '<p class="viltje__tekst">' + esc(a.tekst) + "</p>" +
        '<p class="viltje__meta">' + esc(a.tijd) + " uur, " + esc(a.entree.charAt(0).toLowerCase() + a.entree.slice(1)) + "</p>" +
        "</li>";
    }).join("");
  } else {
    viltjes.outerHTML = '<p class="agenda__leeg">Er staat nog niets nieuws gepland. Kijk op Instagram of kom gewoon langs.</p>';
  }

  if (beweging && komend.length) {
    // viltjes worden op tafel gelegd: gecontroleerd, zonder stuiter
    $$(".viltje").forEach(function (v, i) {
      gsap.from(v, {
        y: -70, opacity: 0, rotate: (i % 2 ? 9 : -9), duration: 1.0, ease: "power3.out",
        delay: (i % 3) * 0.09,
        scrollTrigger: { trigger: v, start: "top 88%", once: true }
      });
    });
  }

  /* ---------- HOOFDSTUK 5: cafétocht ---------- */
  var T = window.CAFETOCHT;
  if (T) {
    $("[data-tochten]").innerHTML = T.tochten.map(function (t) {
      return "<li><strong>" + esc(t.naam) + "</strong><span>" + esc(t.wanneer) + ". " + esc(t.wat) + "</span></li>";
    }).join("");
    $("[data-tocht-lijst]").innerHTML = T.stops.map(function (s) {
      return '<li class="' + (s.wij ? "is-wij" : "") + '"><span class="nr">' + s.nr + '</span><span class="naam">' + esc(s.naam) + '</span><span class="adres">' + esc(s.adres) + "</span></li>";
    }).join("");

    var kaart = $("[data-kaart]");
    var K = T.kaart;
    ["water", "klein", "straat", "hoofd"].forEach(function (laag) {
      kaart.appendChild(el("path", { d: K[laag], class: "k-" + laag }));
    });
    K.namen.forEach(function (n) {
      kaart.appendChild(el("text", { x: n.xy[0], y: n.xy[1], class: "k-naam k-naam--desk", transform: "rotate(" + n.hoek + " " + n.xy[0] + " " + n.xy[1] + ")", "text-anchor": "middle" }, n.t));
    });
    kaart.appendChild(el("path", { d: T.route, class: "k-route-schets" }));
    var route = el("path", { d: T.route, class: "k-route" });
    kaart.appendChild(route);

    // markeringen: het Sint Jansplein is één plek met drie cafés
    var plekken = [
      { xy: [851, 295], nr: "1", label: ["'t Draaiboompje"], lx: 851, ly: 262, anker: "middle" },
      { xy: [418, 280], nr: "2–4", label: ["Sint Jansplein", "De Veerkes, Hierneffe, Den Boogaard"], lx: 438, ly: 222, anker: "start", breed: true },
      { xy: [356, 291], nr: "5", label: ["Root"], lx: 372, ly: 334, anker: "start" },
      { xy: [306, 290], nr: "7", label: ["De Klaore"], lx: 296, ly: 252, anker: "end" },
      { xy: [322, 296], nr: "8", label: ["Café de Brouwer"], lx: 322, ly: 350, anker: "middle", wij: true }
    ];
    var groepen = [];
    plekken.forEach(function (p) {
      var g = el("g", { class: "k-plek" });
      var lijnEind = [p.lx + (p.anker === "start" ? -3 : p.anker === "end" ? 3 : 0), p.ly + (p.ly > p.xy[1] ? -11 : 4 + (p.label.length - 1) * 11)];
      g.appendChild(el("path", { class: "k-lijn", d: "M" + p.xy[0] + " " + p.xy[1] + "L" + lijnEind[0] + " " + lijnEind[1] }));
      if (p.breed) g.appendChild(el("rect", { x: p.xy[0] - 10, y: p.xy[1] - 6.5, width: 20, height: 13, rx: 6.5, class: "k-stip" }));
      else g.appendChild(el("circle", { cx: p.xy[0], cy: p.xy[1], r: p.wij ? 8 : 6.5, class: "k-stip" + (p.wij ? " k-stip--wij" : "") }));
      g.appendChild(el("text", { x: p.xy[0], y: p.xy[1] + 0.5, class: "k-nr" }, p.nr));
      p.label.forEach(function (regel, i) {
        g.appendChild(el("text", { x: p.lx, y: p.ly + i * 11, class: "k-label" + (p.wij ? " k-label--wij" : ""), "text-anchor": p.anker, style: i ? "font-style:italic;fill:#BDAE98" : "" }, regel));
      });
      kaart.appendChild(g);
      groepen.push({ g: g, xy: p.xy });
    });
    // op mobiel: alleen het centrum, met een pijl naar 't Draaiboompje
    kaart.appendChild(el("text", { x: 449, y: 312, class: "k-mobiel k-label", "text-anchor": "end", style: "font-size:7px" }, "1 't Draaiboompje, 900 m →"));
    var smal = window.matchMedia("(max-width: 860px)");
    function viewbox() { kaart.setAttribute("viewBox", smal.matches ? "286 232 168 92" : "270 175 640 240"); }
    viewbox(); smal.addEventListener("change", viewbox);

    // lengte langs de route waar elke plek ligt
    var L = route.getTotalLength();
    var monsters = [];
    for (var i = 0; i <= 600; i++) { var pt = route.getPointAtLength((i / 600) * L); monsters.push([pt.x, pt.y, (i / 600)]); }
    groepen.forEach(function (gr) {
      var best = 1e9, waar = 0;
      monsters.forEach(function (m) { var d = Math.hypot(m[0] - gr.xy[0], m[1] - gr.xy[1]); if (d < best) { best = d; waar = m[2]; } });
      gr.waar = waar;
    });

    if (beweging) {
      route.style.strokeDasharray = L;
      route.style.strokeDashoffset = L;
      groepen.forEach(function (gr) { gr.g.style.opacity = 0; gr.g.style.transition = "opacity .5s cubic-bezier(.22,.61,.2,1)"; });
      ScrollTrigger.create({
        trigger: kaart, start: "top 78%", end: "bottom 38%", scrub: 0.8,
        onUpdate: function (st) {
          var p = st.progress;
          route.style.strokeDashoffset = L * (1 - p);
          groepen.forEach(function (gr) { gr.g.style.opacity = p >= gr.waar - 0.01 ? 1 : 0; });
        }
      });
    }
  }

  /* ---------- HOOFDSTUK 6: carnaval ---------- */
  var C = window.CARNAVAL;
  if (C) {
    $("[data-carnaval-boven]").textContent = "Carnaval " + C.jaar + " in De Brouwer, samen met " + C.vereniging + ".";
    $("[data-motto]").innerHTML = '<span class="sr-only">Carnaval ' + C.jaar + ", motto: </span>" +
      C.motto.map(function (r, i) { return '<span class="carnaval__regel carnaval__regel--' + (i + 1) + '"><span>' + esc(r) + "</span></span>"; }).join(" ");
    $("[data-dagen]").innerHTML = C.dagen.map(function (d) {
      return '<li><p class="cd-dag">' + esc(d.dag) + '</p><p class="cd-datum">' + esc(d.datum) + '</p><p class="cd-wat">' + esc(d.wat) + '</p><p class="cd-wie">' + esc(d.wie) + "</p></li>";
    }).join("");
    $("[data-embleem]").textContent = C.embleem;

    if (beweging) {
      var regels = $$(".carnaval__regel > span");
      var dagen = $$(".carnaval__dagen li");
      gsap.set(regels, { yPercent: 105 });
      gsap.set(dagen, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: "[data-carnaval]", start: "top 62%", once: true,
        onEnter: function () {
          // hier gaat het tempo omhoog: sneller, groter, een kort moment confetti
          gsap.to(regels, { yPercent: 0, duration: 0.62, ease: "power4.out", stagger: 0.09 });
          gsap.to(dagen, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06, delay: 0.35 });
          confetti($("[data-confetti]"));
        }
      });
    }
  }

  function confetti(canvas) {
    var ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var kleuren = ["#F4EEE2", "#2E8B4F", "#F0C36A", "#E2414B", "#F4EEE2"];
    var stukjes = [];
    var aantal = w < 600 ? 40 : 80;
    for (var i = 0; i < aantal; i++) {
      stukjes.push({
        x: w * (0.05 + Math.random() * 0.9), y: -20 - Math.random() * h * 0.25,
        vx: (Math.random() - 0.5) * 60, vy: 180 + Math.random() * 220,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 9,
        b: 5 + Math.random() * 5, l: 8 + Math.random() * 8, k: kleuren[i % kleuren.length], f: Math.random() * 6
      });
    }
    var start = performance.now(), vorige = start, duur = 2600;
    (function frame(nu) {
      var dt = Math.min(0.04, (nu - vorige) / 1000); vorige = nu;
      var t = nu - start;
      ctx.clearRect(0, 0, w, h);
      var alpha = t > duur - 700 ? Math.max(0, (duur - t) / 700) : 1;
      stukjes.forEach(function (s) {
        s.vy += 60 * dt; s.x += (s.vx + Math.sin(t / 300 + s.f) * 30) * dt; s.y += s.vy * dt; s.r += s.vr * dt;
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(s.x, s.y); ctx.rotate(s.r);
        ctx.scale(1, Math.abs(Math.cos(t / 180 + s.f)) * 0.8 + 0.2);
        ctx.fillStyle = s.k; ctx.fillRect(-s.b / 2, -s.l / 2, s.b, s.l); ctx.restore();
      });
      if (t < duur) requestAnimationFrame(frame); else ctx.clearRect(0, 0, w, h);
    })(start);
  }

  /* ---------- HOOFDSTUK 7: feesten ---------- */
  var beeld = $("[data-feestbeeld]"), licht = $("[data-feestlicht]");
  if (beweging && window.matchMedia("(pointer: fine)").matches) {
    var doel = { x: 40, y: 35 }, nu = { x: 40, y: 35 }, loopt = false;
    beeld.addEventListener("pointermove", function (e) {
      var r = beeld.getBoundingClientRect();
      doel.x = ((e.clientX - r.left) / r.width) * 100; doel.y = ((e.clientY - r.top) / r.height) * 100;
      if (!loopt) { loopt = true; requestAnimationFrame(volg); }
    });
    function volg() {
      nu.x += (doel.x - nu.x) * 0.08; nu.y += (doel.y - nu.y) * 0.08;
      licht.style.setProperty("--mx", nu.x.toFixed(1) + "%"); licht.style.setProperty("--my", nu.y.toFixed(1) + "%");
      if (Math.abs(doel.x - nu.x) + Math.abs(doel.y - nu.y) > 0.2) requestAnimationFrame(volg); else loopt = false;
    }
  }

  var form = $("[data-feestformulier]");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fouten = [];
    [["f-naam", function (v) { return v.trim().length > 1; }], ["f-mail", function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }]].forEach(function (c) {
      var veld = document.getElementById(c[0]), fout = document.getElementById(c[0] + "-fout");
      var goed = c[1](veld.value);
      veld.setAttribute("aria-invalid", goed ? "false" : "true");
      if (goed) { fout.hidden = true; veld.removeAttribute("aria-describedby"); }
      else { fout.hidden = false; veld.setAttribute("aria-describedby", fout.id); fouten.push(veld); }
    });
    if (fouten.length) { fouten[0].focus(); return; }

    // DEMO: er wordt niets verstuurd. Later koppelen aan FormSubmit of een eigen mailscript.
    var data = new FormData(form);
    var naam = String(data.get("naam")).trim().split(" ")[0];
    var datum = data.get("datum") ? " op " + new Date(data.get("datum") + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" }) : "";
    var klaar = $("[data-klaar]");
    $$(".veld, .formulier__actie", form).forEach(function (v) { v.hidden = true; });
    klaar.innerHTML = "<strong>Bedankt, " + esc(naam) + ".</strong> Je aanvraag voor een " + esc(String(data.get("soort")).toLowerCase()) + esc(datum) +
      " is binnen. Familie De Brouwer neemt contact met je op.<br><em style=\"color:var(--kurk);font-size:.9rem\">Demo: deze aanvraag is niet echt verstuurd.</em>";
    klaar.hidden = false; klaar.focus();
  });

  /* ---------- HOOFDSTUK 8: het licht gaat langzaam uit ---------- */
  var eindlamp = $("[data-eindlamp]");
  if (eindlamp) {
    eindlamp.style.setProperty("--on", 1);
    if (beweging) {
      gsap.fromTo(eindlamp, { "--on": 1 }, {
        "--on": 0.35, ease: "none",
        scrollTrigger: { trigger: "[data-totziens]", start: "top 60%", end: "bottom bottom", scrub: true }
      });
    }
  }

  if (beweging) ScrollTrigger.refresh();
})();
