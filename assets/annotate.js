// ─────────────────────────────────────────────────────────────
// annotate.js — ephemeral freehand annotation for PRESENT MODE only.
// A recording aid: draw over the slide on camera (circle a row, point
// at a lane), then wipe it. Pairs with annotate.css.
//
// It is deliberately a separate, self-contained module from
// presentation-mode.js so it can be added to a page with one <script>
// tag and removed just as easily. It reads present mode's own state
// (`body.presenting`) and never runs outside it.
//
// Keys (present mode only):
//   A            toggle the pen on / off  (off = clean slide, clicks pass through)
//   P / H        pen / highlighter
//   1 2 3 4      colour
//   Z            undo last stroke
//   C            clear all ink
// Ink also clears whenever you move slide/tab (→ ← Space PageUp/Down),
// so it never bleeds onto the next slide, and it is wiped on exit — nothing
// is saved, nothing is deployed.
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var body = document.body;
  var canvas = null, ctx = null, bar = null, idleT = null;
  var strokes = [], cur = null;
  var tool = 'pen', color = '#0a84ff';
  // Colours chosen to read on both the light and the dark projector theme.
  var COLORS = { '1': '#ff453a', '2': '#ffd60a', '3': '#0a84ff', '4': '#32d74b' };

  function presenting() { return body.classList.contains('presenting'); }
  function annotating() { return body.classList.contains('pm-annotating'); }
  function dpr() { return window.devicePixelRatio || 1; }

  // ── canvas ──────────────────────────────────────────────────────────
  function ensure() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'pm-annotate-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    sizeCanvas();
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    buildBar();
    window.addEventListener('resize', function () { if (canvas) sizeCanvas(); });
  }

  function sizeCanvas() {
    var w = window.innerWidth, h = window.innerHeight, r = dpr();
    canvas.width = Math.round(w * r);
    canvas.height = Math.round(h * r);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(r, 0, 0, r, 0, 0);   // draw in CSS pixels, crisp on retina
    redraw();
  }

  // ── drawing ─────────────────────────────────────────────────────────
  // Stylus sensitivity comes from three things here:
  //   1. every point carries stylus PRESSURE, and a pen stroke's width tracks
  //      it (light = thin, hard = thick), with a floor so a light touch always
  //      shows;
  //   2. getCoalescedEvents() recovers the sub-frame samples the browser
  //      batched into one move, so a fast stroke stays smooth instead of jagged;
  //   3. a pen stroke is drawn INCREMENTALLY — only the new segment is painted
  //      each move, not the whole canvas — which removes the lag that made it
  //      feel unresponsive.
  var PEN_W = 3.5;      // base pen width in CSS px, at ~mid pressure
  var lastPt = null;

  function newStroke() {
    return tool === 'highlighter'
      ? { tool: 'highlighter', color: color, baseW: 18, alpha: 0.32, points: [] }
      : { tool: 'pen', color: color, baseW: PEN_W, alpha: 1, points: [] };
  }

  // Pen width for a given pressure: 0.5x (light) .. ~1.7x (hard), floored so it
  // never disappears. Highlighter stays a constant wide line.
  function widthAt(s, p) {
    if (s.tool === 'highlighter') return s.baseW;
    var pr = (p == null || p <= 0) ? 0.5 : p;
    return s.baseW * (0.5 + 1.2 * pr);
  }
  function styleFor(s) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = s.color;
    ctx.globalAlpha = s.alpha;
  }
  function drawSegment(s, a, b) {           // pen: one pressure-weighted segment
    styleFor(s);
    ctx.lineWidth = widthAt(s, (a.p + b.p) / 2);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function drawDot(s, a) {
    styleFor(s);
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(a.x, a.y, Math.max(0.75, widthAt(s, a.p) / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  function drawStroke(s) {
    var pts = s.points;
    if (!pts.length) return;
    if (s.tool === 'highlighter') {
      // One continuous path, so the translucent ink is laid down once and
      // doesn't darken at every sample-point overlap.
      styleFor(s);
      ctx.lineWidth = s.baseW;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (pts.length === 1) ctx.lineTo(pts[0].x + 0.1, pts[0].y + 0.1);
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }
    if (pts.length === 1) { drawDot(s, pts[0]); return; }
    for (var j = 1; j < pts.length; j++) drawSegment(s, pts[j - 1], pts[j]);
  }
  function redraw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < strokes.length; i++) drawStroke(strokes[i]);
    if (cur) drawStroke(cur);
  }

  // Real pressure for a pen; a steady 0.5 for mouse/touch (whose `pressure` is
  // 0 or 0.5 and would otherwise force every line to the minimum width).
  function pressureOf(e) {
    return (e.pointerType === 'pen') ? (e.pressure || 0.5) : 0.5;
  }
  function ptOf(e) {
    return { x: e.clientX, y: e.clientY, p: pressureOf(e) };
  }

  function onDown(e) {
    if (!annotating()) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    cur = newStroke();
    lastPt = ptOf(e);
    cur.points.push(lastPt);
    if (cur.tool === 'pen') drawDot(cur, lastPt);   // immediate feedback on touch-down
    else redraw();
    wake();
  }
  function onMove(e) {
    if (!cur) return;
    e.preventDefault();
    var evs = (e.getCoalescedEvents && e.getCoalescedEvents()) || [e];
    for (var i = 0; i < evs.length; i++) {
      var pt = ptOf(evs[i]);
      cur.points.push(pt);
      if (cur.tool === 'pen') drawSegment(cur, lastPt, pt);   // incremental, no lag
      lastPt = pt;
    }
    if (cur.tool !== 'pen') redraw();   // highlighter repaints as one clean path
  }
  function onUp() {
    if (!cur) return;
    strokes.push(cur);
    cur = null;
    lastPt = null;
  }

  function clearInk() { strokes = []; cur = null; redraw(); }
  function undo() { strokes.pop(); redraw(); }

  // ── tool state ──────────────────────────────────────────────────────
  function setTool(t) { tool = t; paintBar(); wake(); }
  function setColor(c) { color = c; paintBar(); wake(); }
  function setAnnotating(on) {
    if (on) { ensure(); body.classList.add('pm-annotating'); wake(); }
    else { body.classList.remove('pm-annotating'); }
  }
  function toggle() {
    if (!presenting()) return;
    setAnnotating(!annotating());
  }

  function wake() {
    if (!bar) return;
    bar.classList.remove('idle');
    clearTimeout(idleT);
    idleT = setTimeout(function () { bar.classList.add('idle'); }, 2800);
  }

  // ── tool bar ────────────────────────────────────────────────────────
  function buildBar() {
    if (bar) return;
    bar = document.createElement('div');
    bar.className = 'pm-annotate-bar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Annotation tools');

    Object.keys(COLORS).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pm-ab-sw';
      b.dataset.color = COLORS[k];
      b.style.background = COLORS[k];
      b.title = 'Colour ' + k;
      b.setAttribute('aria-label', 'Colour ' + k);
      b.addEventListener('click', function () { setColor(COLORS[k]); });
      bar.appendChild(b);
    });
    addSep();
    addTool('pen', 'Pen', 'P');
    addTool('highlighter', 'Mark', 'H');
    addSep();
    addAct('Undo', undo);
    addAct('Clear', clearInk);
    var hint = document.createElement('span');
    hint.className = 'pm-ab-hint';
    hint.textContent = 'A to hide';
    bar.appendChild(hint);

    body.appendChild(bar);
    paintBar();

    function addSep() {
      var s = document.createElement('span');
      s.className = 'pm-ab-sep';
      bar.appendChild(s);
    }
    function addTool(t, label, key) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pm-ab-btn pm-ab-tool';
      b.dataset.tool = t;
      b.textContent = label;
      b.title = label + ' (' + key + ')';
      b.addEventListener('click', function () { setTool(t); });
      bar.appendChild(b);
    }
    function addAct(label, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pm-ab-btn';
      b.textContent = label;
      b.addEventListener('click', fn);
      bar.appendChild(b);
    }
  }

  function paintBar() {
    if (!bar) return;
    var sws = bar.querySelectorAll('.pm-ab-sw');
    for (var i = 0; i < sws.length; i++) {
      sws[i].classList.toggle('on', sws[i].dataset.color === color);
    }
    var tools = bar.querySelectorAll('.pm-ab-tool');
    for (var j = 0; j < tools.length; j++) {
      tools[j].classList.toggle('on', tools[j].dataset.tool === tool);
    }
  }

  // ── keys ────────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!presenting()) return;

    var k = e.key;
    // Any slide/tab move wipes the ink so it can't bleed onto the next slide.
    // These keys are also handled by presentation-mode.js (it moves the deck);
    // both listeners fire, which is what we want — clear, then advance.
    if (k === 'ArrowRight' || k === 'ArrowLeft' || k === 'PageUp' || k === 'PageDown' || k === ' ') {
      clearInk();
      return;
    }
    if (k === 'a' || k === 'A') { e.preventDefault(); toggle(); return; }
    if (!annotating()) return;   // the rest only apply once the pen is on
    if (k === 'p' || k === 'P') { e.preventDefault(); setTool('pen'); }
    else if (k === 'h' || k === 'H') { e.preventDefault(); setTool('highlighter'); }
    else if (k === 'z' || k === 'Z') { e.preventDefault(); undo(); }
    else if (k === 'c' || k === 'C') { e.preventDefault(); clearInk(); }
    else if (COLORS[k]) { e.preventDefault(); setColor(COLORS[k]); }
  });

  // Clicking a tab in the pinned strip (only reachable when the pen is OFF)
  // moves the deck, so wipe the ink too.
  document.addEventListener('click', function (e) {
    if (!presenting() || annotating()) return;
    var b = e.target && e.target.closest ? e.target.closest('.section-nav button, .tab-nav button') : null;
    if (b) clearInk();
  }, true);

  // Leaving present mode: drop the pen, wipe the ink, so a normal visitor and
  // the next take both start clean. The canvas hides itself via CSS.
  if ('MutationObserver' in window) {
    new MutationObserver(function () {
      if (!presenting()) {
        if (annotating()) body.classList.remove('pm-annotating');
        if (strokes.length || cur) clearInk();
      } else if (canvas) {
        sizeCanvas();  // present mode changed the layout; match the new viewport
      }
    }).observe(body, { attributes: true, attributeFilter: ['class'] });
  }
})();
