/*
  BierGlas: tekent een getapt glas pils op canvas.
  Staat volledig los van scrollen: main.js zet alleen de toestand
  (tap 0..1, vulling 0..1, rust 0..1) en dit script tekent die toestand.
*/
(function () {
  "use strict";

  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a || 0, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  function hex(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function mix(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function rgba(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + a + ")"; }

  var ZWART = [26, 12, 4], GOUD = [240, 195, 106], WIT = [247, 240, 226];

  function BierGlas(canvas, opts) {
    opts = opts || {};
    this.c = canvas;
    this.x = canvas.getContext("2d");
    this.bier = hex(opts.kleur || "#E0A43A");
    this.licht = !!opts.licht;          // mobiel: minder deeltjes, geen condens
    this.barY = opts.barY || null;      // functie die de y van de bar in canvas-px geeft
    this.doel = { tap: 0, vul: 0, rust: 0 };
    this.nu = { tap: 0, vul: 0, rust: 0, straal: 0, koud: 0 };
    this.bellen = [];
    this.t = 0;
    this.loopt = false;
    this.zaad = 7;
    this.resize();
  }

  BierGlas.prototype.rnd = function () { this.zaad = (this.zaad * 16807) % 2147483647; return (this.zaad - 1) / 2147483646; };

  BierGlas.prototype.resize = function () {
    var w = this.c.clientWidth, h = this.c.clientHeight;
    if (!w || !h) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w; this.h = h;
    this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
    this.x.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.maatvoering();
    this.maakSchuimcellen();
    this.maakDruppels();
    this.teken();
  };

  /* --- maatvoering van glas en tap --- */
  BierGlas.prototype.maatvoering = function () {
    var w = this.w, h = this.h;
    var bar = this.barY ? this.barY() : h * 0.86;
    var H = Math.min(bar * 0.62, w * 1.05, 600);
    var g = this.g = {};
    g.H = H;
    g.cx = w * (w > 560 ? 0.44 : 0.5);
    g.y1 = bar;                         // onderkant glas, staat op de bar
    g.y0 = bar - H;                     // rand
    g.wand = Math.max(2, H * 0.011);
    g.voet = H * 0.08;                  // dikke glazen bodem
    g.rTop = H * 0.205;
    g.rBot = g.rTop * 0.76;
    g.e = 0.12;                         // perspectief van ellipsen
    g.binTop = g.y0 + g.wand * 0.5;
    g.binBot = g.y1 - g.voet;
    g.rTopIn = g.rTop - g.wand;
    g.rBotIn = g.rBot - g.wand * 1.4;
    // tap
    g.kolomX = g.cx + g.rTop * 1.75;
    g.kolomB = H * 0.1;
    g.armY = g.y0 - H * 0.13;
    g.tuitX = g.cx - g.rTopIn * 0.12;
    g.tuitY = g.armY + H * 0.07;
    g.kolomTop = g.armY - H * 0.06;
  };

  BierGlas.prototype.rIn = function (y) {
    var g = this.g, t = clamp((g.binBot - y) / (g.binBot - g.binTop));
    return g.rBotIn + (g.rTopIn - g.rBotIn) * Math.pow(t, 0.92);
  };
  BierGlas.prototype.rUit = function (y) {
    var g = this.g, t = clamp((g.y1 - y) / (g.y1 - g.y0));
    return g.rBot + (g.rTop - g.rBot) * Math.pow(t, 0.92);
  };

  /* vaste willekeur: schuimcellen en condensdruppels */
  BierGlas.prototype.maakSchuimcellen = function () {
    this.zaad = 11;
    var n = this.licht ? 150 : 320;
    this.cellen = [];
    for (var i = 0; i < n; i++) {
      this.cellen.push({ u: this.rnd() * 2 - 1, v: this.rnd(), r: 0.5 + Math.pow(this.rnd(), 2.2) * 2.6 });
    }
    // onregelmatige bovenrand van de kraag
    this.bobbels = [];
    for (var j = 0; j < 26; j++) this.bobbels.push(this.rnd());
  };
  BierGlas.prototype.maakDruppels = function () {
    this.zaad = 23;
    this.druppels = [];
    if (this.licht) return;
    var g = this.g;
    for (var i = 0; i < 150; i++) {
      var u = this.rnd() * 2 - 1;
      this.druppels.push({
        u: Math.sign(u) * Math.pow(Math.abs(u), 0.6),
        y: lerp(g.y0 + g.H * 0.12, g.y1 - g.voet * 0.4, this.rnd()),
        r: 0.6 + Math.pow(this.rnd(), 3) * 2.4,
        drempel: this.rnd()
      });
    }
  };

  /* --- toestand --- */
  BierGlas.prototype.zet = function (s) {
    if (s.tap !== undefined) this.doel.tap = s.tap;
    if (s.vul !== undefined) this.doel.vul = s.vul;
    if (s.rust !== undefined) this.doel.rust = s.rust;
  };
  BierGlas.prototype.direct = function (s) {
    this.zet(s);
    this.nu.tap = this.doel.tap; this.nu.vul = this.doel.vul; this.nu.rust = this.doel.rust;
    this.nu.koud = this.doel.vul; this.nu.straal = 0;
    this.vulStilstaand();
    this.teken();
  };

  BierGlas.prototype.start = function () {
    if (this.loopt) return;
    this.loopt = true;
    var self = this, vorige = performance.now();
    (function frame(nu) {
      if (!self.loopt) return;
      var dt = Math.min(0.05, (nu - vorige) / 1000); vorige = nu;
      self.stap(dt);
      self.teken();
      requestAnimationFrame(frame);
    })(vorige);
  };
  BierGlas.prototype.stop = function () { this.loopt = false; };

  BierGlas.prototype.stap = function (dt) {
    var n = this.nu, d = this.doel;
    this.t += dt;
    var k = 1 - Math.exp(-dt * 9);
    n.tap = lerp(n.tap, d.tap, k);
    n.vul = lerp(n.vul, d.vul, k);
    n.rust = lerp(n.rust, d.rust, k);
    var stroomt = n.tap > 0.55 && d.vul < 0.995 && d.vul > 0.001 ? 1 : 0;
    n.straal = lerp(n.straal, stroomt, 1 - Math.exp(-dt * 14));
    n.koud = lerp(n.koud, n.vul > 0.05 ? n.vul : 0, 1 - Math.exp(-dt * 0.9));
    this.bellenStap(dt);
  };

  /* --- niveaus --- */
  BierGlas.prototype.niveaus = function () {
    var g = this.g, n = this.nu, Hi = g.binBot - g.binTop;
    var vloeistof = 0.79 * n.vul + 0.05 * n.rust;
    var kraag = Hi * (0.012 + 0.125 * Math.pow(n.vul, 1.5) - 0.022 * n.rust);
    var ys = g.binBot - Hi * vloeistof;
    return { ys: ys, ft: ys - (n.vul > 0.002 ? kraag : 0), Hi: Hi };
  };

  /* --- bubbels --- */
  BierGlas.prototype.bellenStap = function (dt) {
    var g = this.g, n = this.nu, lv = this.niveaus();
    var max = this.licht ? 90 : 230;
    if (n.vul > 0.02) {
      // vaste kiemplekken op de bodem geven bellenrijen
      var kiemen = [-0.42, -0.08, 0.31];
      var kans = dt * (this.licht ? 14 : 26);
      for (var i = 0; i < kiemen.length; i++) {
        if (Math.random() < kans && this.bellen.length < max) {
          this.bellen.push({ u: kiemen[i] + (Math.random() - 0.5) * 0.04, y: g.binBot - 2, r: 0.5 + Math.random() * 0.8, v: 26 + Math.random() * 16, f: Math.random() * 6 });
        }
      }
      var los = dt * (this.licht ? 8 : 20);
      while (los > 0) {
        if (Math.random() < los && this.bellen.length < max) {
          this.bellen.push({ u: Math.random() * 1.8 - 0.9, y: lerp(lv.ys, g.binBot, 0.3 + Math.random() * 0.7), r: 0.4 + Math.random() * 1.1, v: 18 + Math.random() * 22, f: Math.random() * 6 });
        }
        los -= 1;
      }
      // tijdens het tappen: wolk van belletjes rond de straal
      var wolk = n.straal * dt * (this.licht ? 70 : 170);
      while (wolk > 0) {
        if (Math.random() < wolk && this.bellen.length < max) {
          var diepte = Math.random();
          this.bellen.push({ u: (g.tuitX - g.cx) / g.rTopIn + (Math.random() - 0.5) * 0.7 * diepte, y: lerp(lv.ys, g.binBot, diepte * 0.85), r: 0.5 + Math.random() * 1.6, v: 40 + Math.random() * 50, f: Math.random() * 6 });
        }
        wolk -= 1;
      }
    }
    for (var j = this.bellen.length - 1; j >= 0; j--) {
      var b = this.bellen[j];
      b.v += dt * 18;                      // bellen versnellen terwijl ze stijgen
      b.y -= b.v * dt;
      if (b.y < lv.ys + 1.5) this.bellen.splice(j, 1);
    }
  };
  BierGlas.prototype.vulStilstaand = function () {
    // voor minder beweging: een vaste verdeling van belletjes
    var g = this.g, lv = this.niveaus();
    this.bellen = [];
    this.zaad = 41;
    for (var i = 0; i < (this.licht ? 40 : 90); i++) {
      this.bellen.push({ u: this.rnd() * 1.8 - 0.9, y: lerp(lv.ys + 4, g.binBot - 2, this.rnd()), r: 0.4 + this.rnd() * 1.1, v: 0, f: this.rnd() * 6 });
    }
  };

  /* --- paden --- */
  BierGlas.prototype.wandPad = function (ctx, yTop, yBot, rFn, voorkantOnder, achterkantBoven, golf) {
    var g = this.g, cx = g.cx, e = g.e, stappen = 24, i, y;
    ctx.beginPath();
    // linkerwand omlaag
    for (i = 0; i <= stappen; i++) { y = lerp(yTop, yBot, i / stappen); ctx.lineTo(cx - rFn.call(this, y), y); }
    // onderkant: voorste helft van de ellips
    var rb = rFn.call(this, yBot);
    if (voorkantOnder) {
      for (i = 0; i <= 28; i++) {
        var a = Math.PI - (i / 28) * Math.PI;
        var w = golf ? golf(a) : 0;
        ctx.lineTo(cx + Math.cos(a) * rb, yBot + Math.sin(a) * rb * e + w);
      }
    } else ctx.lineTo(cx + rb, yBot);
    // rechterwand omhoog
    for (i = stappen; i >= 0; i--) { y = lerp(yTop, yBot, i / stappen); ctx.lineTo(cx + rFn.call(this, y), y); }
    // bovenkant: achterste helft van de ellips
    var rt = rFn.call(this, yTop);
    if (achterkantBoven) {
      var extra = typeof achterkantBoven === "function" ? achterkantBoven : null;
      for (i = 0; i <= 40; i++) {
        var a2 = (i / 40) * Math.PI;
        ctx.lineTo(cx + Math.cos(a2) * rt, yTop - Math.sin(a2) * rt * e - (extra ? extra(a2) : 0));
      }
    }
    ctx.closePath();
  };

  /* --- tekenen --- */
  BierGlas.prototype.teken = function () {
    if (!this.g) return;
    var ctx = this.x, g = this.g, n = this.nu, lv = this.niveaus();
    ctx.clearRect(0, 0, this.w, this.h);
    this.tekenSchaduw(ctx, lv);
    this.tekenTapKolom(ctx);
    this.tekenGlasAchter(ctx);
    if (n.vul > 0.002) {
      this.tekenBier(ctx, lv);
      this.tekenKraag(ctx, lv);
    }
    this.tekenStraal(ctx, lv);
    this.tekenGlasVoor(ctx, lv);
    this.tekenTapArm(ctx);
  };

  BierGlas.prototype.tekenSchaduw = function (ctx, lv) {
    var g = this.g, n = this.nu, rx = g.rBot * 1.9, ry = g.rBot * 0.22;
    var gr = ctx.createRadialGradient(g.cx, g.y1, 0, g.cx, g.y1, rx);
    gr.addColorStop(0, "rgba(8,4,2,.75)"); gr.addColorStop(1, "rgba(8,4,2,0)");
    ctx.save(); ctx.translate(g.cx, g.y1); ctx.scale(1, ry / rx); ctx.translate(-g.cx, -g.y1);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(g.cx, g.y1, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // licht dat door het bier op de bar valt
    if (n.vul > 0.02) {
      var cy = g.y1 + ry * 1.1, crx = g.rBot * 1.5;
      var c2 = ctx.createRadialGradient(g.cx - g.rBot * 0.2, cy, 0, g.cx - g.rBot * 0.2, cy, crx);
      c2.addColorStop(0, rgba(mix(this.bier, GOUD, 0.4), 0.42 * n.vul)); c2.addColorStop(1, rgba(this.bier, 0));
      ctx.save(); ctx.translate(g.cx, cy); ctx.scale(1, 0.18); ctx.translate(-g.cx, -cy);
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(g.cx - g.rBot * 0.2, cy, crx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  };

  function chroom(ctx, x0, y0, x1, y1) {
    var gr = ctx.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, "#1c140e"); gr.addColorStop(0.18, "#5a4a3c"); gr.addColorStop(0.38, "#e9d6b0");
    gr.addColorStop(0.5, "#fff3da"); gr.addColorStop(0.62, "#8a765f"); gr.addColorStop(0.85, "#2e231a"); gr.addColorStop(1, "#130d09");
    return gr;
  }

  BierGlas.prototype.tekenTapKolom = function (ctx) {
    var g = this.g, B = g.kolomB, x = g.kolomX - B / 2;
    // kolom staat op de bar, achter het glas
    ctx.fillStyle = chroom(ctx, x, 0, x + B, 0);
    ctx.beginPath(); ctx.rect(x, g.kolomTop, B, g.y1 - g.kolomTop - 2); ctx.fill();
    // voetplaat
    ctx.fillStyle = chroom(ctx, x - B * 0.35, 0, x + B * 1.35, 0);
    ctx.beginPath(); ctx.ellipse(g.kolomX, g.y1 - 2, B * 0.85, B * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    // kap bovenop
    ctx.beginPath(); ctx.ellipse(g.kolomX, g.kolomTop, B / 2, B * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#f3e4c5"; ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
    // naad
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(x, g.armY + g.H * 0.03, B, 1.5);
  };

  BierGlas.prototype.tekenTapArm = function (ctx) {
    var g = this.g, n = this.nu, H = g.H, d = H * 0.036;
    // arm van kolom naar tuit
    ctx.fillStyle = chroom(ctx, 0, g.armY - d / 2, 0, g.armY + d / 2);
    ctx.beginPath();
    ctx.moveTo(g.kolomX, g.armY - d / 2);
    ctx.lineTo(g.tuitX + d * 0.3, g.armY - d / 2);
    ctx.quadraticCurveTo(g.tuitX - d * 0.6, g.armY - d / 2, g.tuitX - d * 0.6, g.armY + d * 0.6);
    ctx.lineTo(g.tuitX + d * 0.6, g.armY + d * 0.6);
    ctx.quadraticCurveTo(g.tuitX + d * 0.6, g.armY + d / 2, g.tuitX + d * 0.9, g.armY + d / 2);
    ctx.lineTo(g.kolomX, g.armY + d / 2);
    ctx.closePath(); ctx.fill();
    // tuit
    var tw = H * 0.03;
    ctx.fillStyle = chroom(ctx, g.tuitX - tw / 2, 0, g.tuitX + tw / 2, 0);
    ctx.beginPath();
    ctx.moveTo(g.tuitX - tw * 0.55, g.armY + d * 0.5);
    ctx.lineTo(g.tuitX + tw * 0.55, g.armY + d * 0.5);
    ctx.lineTo(g.tuitX + tw * 0.38, g.tuitY);
    ctx.lineTo(g.tuitX - tw * 0.38, g.tuitY);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(10,6,3,.9)"; ctx.beginPath();
    ctx.ellipse(g.tuitX, g.tuitY, tw * 0.38, tw * 0.1, 0, 0, Math.PI * 2); ctx.fill();

    // tapknop: draait naar voren als de tap open gaat
    var px = g.kolomX, py = g.kolomTop - H * 0.01;
    var L = H * 0.2, hoek = -n.tap * 0.62;
    ctx.save(); ctx.translate(px, py); ctx.rotate(hoek);
    // ring
    ctx.fillStyle = chroom(ctx, -g.kolomB * 0.32, 0, g.kolomB * 0.32, 0);
    ctx.fillRect(-g.kolomB * 0.32, -H * 0.03, g.kolomB * 0.64, H * 0.03);
    // hendel: donker hout
    var hw = H * 0.05;
    var hg = ctx.createLinearGradient(-hw / 2, 0, hw / 2, 0);
    hg.addColorStop(0, "#120a05"); hg.addColorStop(0.35, "#4b2e1a"); hg.addColorStop(0.55, "#6b4426"); hg.addColorStop(1, "#160c06");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.32, -H * 0.03);
    ctx.lineTo(-hw * 0.5, -L);
    ctx.quadraticCurveTo(0, -L - hw * 0.45, hw * 0.5, -L);
    ctx.lineTo(hw * 0.32, -H * 0.03);
    ctx.closePath(); ctx.fill();
    // emaille schild in het groen van het logo
    var sy = -L * 0.72, sr = hw * 0.36;
    ctx.fillStyle = "#23402C";
    ctx.beginPath(); ctx.ellipse(0, sy, sr, sr * 1.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(240,195,106,.85)"; ctx.lineWidth = Math.max(1, H * 0.003); ctx.stroke();
    ctx.fillStyle = "rgba(240,195,106,.8)";
    ctx.beginPath(); ctx.ellipse(0, sy, sr * 0.36, sr * 0.36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  BierGlas.prototype.tekenGlasAchter = function (ctx) {
    var g = this.g;
    // binnenkant van het glas: heel zacht
    this.wandPad(ctx, g.y0, g.y1, this.rUit, true, true);
    ctx.fillStyle = "rgba(255,240,215,.035)"; ctx.fill();
    // achterste rand van de opening
    ctx.beginPath(); ctx.ellipse(g.cx, g.y0, g.rTop, g.rTop * g.e, 0, Math.PI, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,245,228,.22)"; ctx.lineWidth = 1; ctx.stroke();
  };

  BierGlas.prototype.tekenBier = function (ctx, lv) {
    var g = this.g, n = this.nu, cx = g.cx, ys = lv.ys;
    var self = this;
    var golf = function (a) {
      var amp = 0.4 + n.straal * 2.2;
      return Math.sin(a * 5 + self.t * 7) * amp * 0.5 + Math.sin(a * 9 - self.t * 11) * amp * 0.3;
    };
    ctx.save();
    // vloeistof: voorkant onderaan (bodem), bovenkant = vloeistofspiegel
    this.wandPad(ctx, ys, g.binBot, this.rIn, true, true);
    ctx.clip();

    var diep = mix(this.bier, ZWART, 0.42), hel = mix(this.bier, GOUD, 0.28);
    var v = ctx.createLinearGradient(0, ys, 0, g.binBot);
    v.addColorStop(0, rgba(hel, 1)); v.addColorStop(0.45, rgba(this.bier, 1)); v.addColorStop(1, rgba(diep, 1));
    ctx.fillStyle = v; ctx.fillRect(cx - g.rTop * 1.2, ys - g.rTop, g.rTop * 2.4, g.binBot - ys + g.rTop * 2);

    // licht valt door het midden, de randen zijn dieper van kleur
    var r = g.rTopIn;
    var hz = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    hz.addColorStop(0, "rgba(30,12,2,.55)"); hz.addColorStop(0.2, "rgba(30,12,2,.12)");
    hz.addColorStop(0.42, "rgba(255,226,160,.16)"); hz.addColorStop(0.55, "rgba(255,226,160,.05)");
    hz.addColorStop(0.8, "rgba(30,12,2,.18)"); hz.addColorStop(1, "rgba(30,12,2,.6)");
    ctx.fillStyle = hz; ctx.fillRect(cx - g.rTop * 1.2, ys - g.rTop, g.rTop * 2.4, g.binBot - ys + g.rTop * 2);

    // belletjes
    for (var i = 0; i < this.bellen.length; i++) {
      var b = this.bellen[i];
      var rr = this.rIn(b.y) * 0.92;
      var bx = cx + b.u * rr + Math.sin(this.t * 3 + b.f) * 0.6;
      var a = 0.5 * smooth(0, 14, b.y - ys);
      ctx.fillStyle = "rgba(255,238,196," + a + ")";
      ctx.beginPath(); ctx.arc(bx, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      if (b.r > 1) { ctx.fillStyle = "rgba(255,255,240," + a * 0.9 + ")"; ctx.fillRect(bx - b.r * 0.35, b.y - b.r * 0.45, 0.8, 0.8); }
    }
    ctx.restore();

    // vloeistofspiegel (alleen zichtbaar als de kraag nog dun is)
    var rs = this.rIn(ys);
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, ys, rs, rs * g.e, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(mix(hel, WIT, 0.25), 0.9); ctx.fill();
    ctx.restore();
    this._golf = golf;
  };

  BierGlas.prototype.tekenKraag = function (ctx, lv) {
    var g = this.g, n = this.nu, cx = g.cx, ys = lv.ys, ft = lv.ft;
    if (ys - ft < 0.5) return;
    var self = this;
    ctx.save();
    // bovenrand van de kraag: achterste helft van een bobbelige ellips
    var rt = this.rIn(ft), N = this.bobbels.length;
    var bob = function (a) {
      var i = Math.floor((a / Math.PI) * (N - 1)), f = (a / Math.PI) * (N - 1) - i;
      var b0 = self.bobbels[i] || 0, b1 = self.bobbels[Math.min(N - 1, i + 1)] || 0;
      return lerp(b0, b1, f * f * (3 - 2 * f));
    };
    var hoogte = Math.min(4, (ys - ft) * 0.25);
    this.wandPad(ctx, ft, ys, this.rIn, true, function (a) { return (bob(a) - 0.5) * hoogte; }, this._golf);
    ctx.clip();

    var gr = ctx.createLinearGradient(0, ft - rt * g.e, 0, ys + rt * g.e);
    gr.addColorStop(0, "#FBF5EA"); gr.addColorStop(0.55, "#EFE1C4"); gr.addColorStop(0.86, "#DEC08A"); gr.addColorStop(1, rgba(mix(this.bier, WIT, 0.45), 1));
    ctx.fillStyle = gr; ctx.fillRect(cx - g.rTop * 1.2, ft - g.rTop, g.rTop * 2.4, ys - ft + g.rTop * 2);
    // zijkanten iets donkerder: de kraag is rond
    var hz = ctx.createLinearGradient(cx - rt, 0, cx + rt, 0);
    hz.addColorStop(0, "rgba(90,58,24,.32)"); hz.addColorStop(0.25, "rgba(90,58,24,0)"); hz.addColorStop(0.75, "rgba(90,58,24,0)"); hz.addColorStop(1, "rgba(90,58,24,.38)");
    ctx.fillStyle = hz; ctx.fillRect(cx - g.rTop * 1.2, ft - g.rTop, g.rTop * 2.4, ys - ft + g.rTop * 2);
    // schuimcellen
    ctx.lineWidth = 0.6;
    for (var i = 0; i < this.cellen.length; i++) {
      var c = this.cellen[i];
      var y = lerp(ft - rt * g.e, ys + rt * g.e * 0.6, c.v);
      var x = cx + c.u * this.rIn(y) * 0.98;
      ctx.strokeStyle = "rgba(120,86,46," + (0.08 + c.v * 0.1) + ")";
      ctx.beginPath(); ctx.arc(x, y, c.r * (0.6 + c.v * 0.6), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    // bovenkant van de kraag, van bovenaf gezien
    ctx.save();
    ctx.beginPath();
    for (var j = 0; j <= 72; j++) {
      var a2 = (j / 72) * Math.PI * 2;
      var am = a2 <= Math.PI ? a2 : Math.PI * 2 - a2;
      var hb = (bob(am) - 0.5) * Math.min(4, (ys - ft) * 0.25);
      ctx.lineTo(cx + Math.cos(a2) * rt, ft - Math.sin(a2) * rt * g.e - (a2 <= Math.PI ? hb : 0));
    }
    ctx.closePath();
    var tg = ctx.createRadialGradient(cx - rt * 0.2, ft - rt * g.e * 0.4, 0, cx, ft, rt);
    tg.addColorStop(0, "#FFFBF2"); tg.addColorStop(0.7, "#F3E8D2"); tg.addColorStop(1, "#D9C29A");
    ctx.fillStyle = tg; ctx.fill();
    ctx.clip();
    ctx.lineWidth = 0.5;
    for (var m = 0; m < this.cellen.length; m += 2) {
      var cc = this.cellen[m];
      ctx.strokeStyle = "rgba(150,112,64,.13)";
      ctx.beginPath(); ctx.arc(cx + cc.u * rt, ft + (cc.v - 0.5) * 2 * rt * g.e, cc.r * 0.8, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  };

  BierGlas.prototype.tekenStraal = function (ctx, lv) {
    var g = this.g, n = this.nu;
    if (n.straal < 0.02) return;
    var eind = n.vul > 0.002 ? lv.ft - this.rIn(lv.ft) * g.e * 0.3 : g.binBot;
    var w = Math.max(1.6, g.H * 0.014) * n.straal;
    var x = g.tuitX + Math.sin(this.t * 23) * 0.35;
    var gr = ctx.createLinearGradient(x - w, 0, x + w, 0);
    var kl = mix(this.bier, GOUD, 0.2);
    gr.addColorStop(0, rgba(mix(this.bier, ZWART, 0.3), 0.9)); gr.addColorStop(0.4, rgba(kl, 0.95));
    gr.addColorStop(0.55, "rgba(255,240,200,.95)"); gr.addColorStop(1, rgba(mix(this.bier, ZWART, 0.25), 0.9));
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.42, g.tuitY);
    ctx.lineTo(x + w * 0.42, g.tuitY);
    ctx.lineTo(x + w * 0.5, eind);
    ctx.lineTo(x - w * 0.5, eind);
    ctx.closePath(); ctx.fill();
    // glinsteringen die mee naar beneden lopen
    ctx.fillStyle = "rgba(255,248,225,.7)";
    var lengte = eind - g.tuitY;
    for (var i = 0; i < 4; i++) {
      var p = ((this.t * 1.6 + i / 4) % 1);
      ctx.fillRect(x - w * 0.12, g.tuitY + p * lengte, Math.max(0.8, w * 0.22), 5);
    }
  };

  BierGlas.prototype.tekenGlasVoor = function (ctx, lv) {
    var g = this.g, n = this.nu, cx = g.cx, H = g.H;
    // dikke bodem: breekt de kleur van het bier
    ctx.save();
    this.wandPad(ctx, g.binBot, g.y1, this.rUit, true, false);
    var bg = ctx.createLinearGradient(0, g.binBot, 0, g.y1);
    var bk = n.vul > 0.002 ? mix(this.bier, GOUD, 0.2) : [210, 190, 160];
    bg.addColorStop(0, rgba(bk, 0.16 + 0.32 * n.vul)); bg.addColorStop(1, rgba(bk, 0.06 + 0.1 * n.vul));
    ctx.fillStyle = bg; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(cx, g.y1, g.rBot, g.rBot * g.e, 0, 0, Math.PI);
    ctx.strokeStyle = "rgba(255,240,215,.45)"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, g.binBot, this.rIn(g.binBot), this.rIn(g.binBot) * g.e, 0, 0, Math.PI);
    ctx.strokeStyle = "rgba(255,240,215,.16)"; ctx.lineWidth = 1; ctx.stroke();

    // buitenwanden
    var zijde = function (s, alpha) {
      ctx.beginPath();
      for (var i = 0; i <= 30; i++) { var y = lerp(g.y0, g.y1, i / 30); ctx.lineTo(cx + s * this.rUit(y), y); }
      ctx.strokeStyle = "rgba(255,244,226," + alpha + ")"; ctx.lineWidth = 1.1; ctx.stroke();
    }.bind(this);
    zijde(-1, 0.38); zijde(1, 0.26);

    // lange reflectie links, smalle gouden reflectie rechts (licht van de lampen)
    ctx.save();
    ctx.beginPath();
    var t0 = g.y0 + H * 0.07, t1 = g.y1 - g.voet * 0.6;
    for (var i = 0; i <= 20; i++) { var y = lerp(t0, t1, i / 20); ctx.lineTo(cx - this.rUit(y) * 0.8, y); }
    for (var j = 20; j >= 0; j--) { var y2 = lerp(t0, t1, j / 20); ctx.lineTo(cx - this.rUit(y2) * 0.64, y2); }
    ctx.closePath();
    var rg = ctx.createLinearGradient(0, t0, 0, t1);
    rg.addColorStop(0, "rgba(255,250,240,0)"); rg.addColorStop(0.15, "rgba(255,250,240,.26)"); rg.addColorStop(0.7, "rgba(255,250,240,.12)"); rg.addColorStop(1, "rgba(255,250,240,0)");
    ctx.fillStyle = rg; ctx.fill();
    ctx.beginPath();
    for (var k = 0; k <= 20; k++) { var y3 = lerp(t0 + H * 0.05, t1 - H * 0.1, k / 20); ctx.lineTo(cx + this.rUit(y3) * 0.86, y3); }
    ctx.strokeStyle = "rgba(240,195,106,.35)"; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();

    // condens op het koude glas, alleen onder het bierpeil
    if (this.druppels.length && n.koud > 0.02) {
      for (var d = 0; d < this.druppels.length; d++) {
        var dr = this.druppels[d];
        if (dr.y < lv.ys + 6 || dr.drempel > n.koud * 1.1) continue;
        var dx = cx + dr.u * this.rUit(dr.y) * 0.97;
        var a = smooth(dr.drempel, dr.drempel + 0.25, n.koud);
        ctx.fillStyle = "rgba(40,18,4," + 0.22 * a + ")";
        ctx.beginPath(); ctx.arc(dx, dr.y + dr.r * 0.25, dr.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,246,226," + 0.55 * a + ")";
        ctx.beginPath(); ctx.arc(dx - dr.r * 0.3, dr.y - dr.r * 0.3, Math.max(0.5, dr.r * 0.35), 0, Math.PI * 2); ctx.fill();
      }
    }

    // voorste rand van de opening
    ctx.beginPath(); ctx.ellipse(cx, g.y0, g.rTop, g.rTop * g.e, 0, 0, Math.PI);
    ctx.strokeStyle = "rgba(255,247,232,.55)"; ctx.lineWidth = 1.3; ctx.stroke();
  };

  /* waar het bier zit, voor de duik: midden van de vloeistof in % van het canvas */
  BierGlas.prototype.duikpunt = function () {
    var g = this.g;
    var Hi = g.binBot - g.binTop;
    var y = g.binBot - Hi * 0.42;
    return { x: (g.cx / this.w) * 100, y: (y / this.h) * 100 };
  };

  window.BierGlas = BierGlas;
})();
