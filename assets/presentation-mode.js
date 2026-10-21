// ─────────────────────────────────────────────────────────────
// presentation-mode.js — self-contained "Present" mode for the
// explainer pages. Injects a floating Present button; enters browser
// fullscreen; hides ALL chrome (nav cluster, side panel, rail, theme
// fab, page footer nav); scales type for a projector.
//
// Present mode is deliberately chrome-free — nothing overlays the slide,
// so the recording is clean edge to edge. Navigation is keyboard-only:
// → / Space next · ← / PageUp prev · Esc exit · N presenter notes.
// F toggles present mode from anywhere on the page.
//
// Zero per-page markup. Load near the other shared scripts; pair with
// presentation-mode.css.
// ─────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var body = document.body;
  var fab = null, sections = [];                 // TAB BUTTONS, not .section elements (historical)
  var keyHandler = null, resizeHandler = null;

  // ── Section-slide model (present mode only) ────────────────────────────
  // The tab strip is one axis; within each tab, the .section children are the
  // other. slideEls[tabIdx] holds that tab's section elements in DOM order;
  // slideIdx[tabIdx] holds the current one for that tab, so switching tabs
  // and coming back preserves position. Rebuilt every enter() so a page that
  // hot-swaps its markup between takes still works.
  var slideEls = [];
  var slideIdx = [];

  // Pin the section-nav directly beneath the sticky title, and the sub-nav
  // directly beneath THAT: measure both heights so the CSS can stack them
  // without magic numbers. --pm-tabnav-h stays 0 on pages without a tab strip
  // (module pages that use .section-nav also feed it, since the query matches
  // either) — the sub-nav is empty there so it costs nothing.
  function measureHero() {
    requestAnimationFrame(function () {
      var hero = document.querySelector('.module-hero, .hero');
      var h = hero ? Math.round(hero.getBoundingClientRect().height) : 0;
      document.body.style.setProperty('--pm-hero-h', h + 'px');
      var nav = document.querySelector('.section-nav, .tab-nav');
      var nh = nav ? Math.round(nav.getBoundingClientRect().height) : 0;
      document.body.style.setProperty('--pm-tabnav-h', nh + 'px');
    });
  }

  // ── Fullscreen helpers (vendor-prefixed for Safari) ──
  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function requestFS() {
    var el = document.documentElement;
    var fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (fn) { try { fn.call(el); } catch (e) {} }
  }
  function exitFS() {
    if (!fsElement()) return;
    var fn = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (fn) { try { fn.call(document); } catch (e) {} }
  }

  // ── Section tabs: reuse whatever tab strip the page already has ──
  // Module pages use `.section-nav`; the course landing page (index.html) uses
  // `.tab-nav`. Same contract either way — a row of <button>s where the current
  // one carries `.active` — so present mode drives both without knowing which.
  function getSections() {
    var nav = document.querySelector('.section-nav, .tab-nav');
    if (!nav) return [];
    return Array.prototype.slice.call(nav.querySelectorAll('button'));
  }
  function activeIndex() {
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].classList.contains('active')) return i;
    }
    return 0;
  }
  function go(i) {
    if (!sections.length) return;
    i = Math.max(0, Math.min(sections.length - 1, i));
    sections[i].click();
  }
  // ── Scroll mode (present-mode long-form) ──────────────────────────────
  // A second present-mode view: every section stacks on one scrollable page.
  // The L key flips between slide and scroll while presenting; arrows scroll
  // the page instead of switching slides. Same type sizes, same chrome hiding
  // — just no pagination. Useful when you want to pace a take manually.
  function toggleScrollMode() {
    if (!body.classList.contains('presenting')) return;
    body.classList.toggle('pm-scroll');
    // When flipping back to slide mode, repaint so the tracked slide re-shows.
    // Flipping into scroll mode doesn't need a repaint — the CSS override
    // makes every wrapper visible on its own.
    if (!body.classList.contains('pm-scroll')) paintSlide();
  }

  // In present mode the arrows walk sections first, then span tabs at the
  // edges — one continuous deck. Off-projector (fab click never happened) we
  // fall back to the original tab-only behaviour, so module pages behave the
  // same as before. Nothing wraps at the very ends: a projector should stop
  // at the last slide, not silently loop.
  function next() {
    // Scroll mode: arrows just scroll the page. 85% of viewport is what
    // section-navigation elsewhere in the code base already uses as a
    // "one screen down" pace, so it feels the same to a user's hand.
    if (body.classList.contains('pm-scroll')) {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
      return;
    }
    if (body.classList.contains('presenting') && slideEls.length) {
      var ti = activeIndex();
      var arr = slideEls[ti] || [];
      var si = slideIdx[ti] || 0;
      if (si < arr.length - 1) { slideIdx[ti] = si + 1; paintSlide(); return; }
      if (ti < sections.length - 1) {
        // Roll into the next tab at its FIRST section. Set slideIdx BEFORE
        // clicking so the observer-driven paintSlide sees the right index.
        slideIdx[ti + 1] = 0;
        go(ti + 1);
        return;
      }
      return;  // at the last section of the last tab: stop here
    }
    if (sections.length) go(activeIndex() + 1);
    else window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  }
  function prev() {
    if (body.classList.contains('pm-scroll')) {
      window.scrollBy({ top: -window.innerHeight * 0.85, behavior: 'smooth' });
      return;
    }
    if (body.classList.contains('presenting') && slideEls.length) {
      var ti = activeIndex();
      var si = slideIdx[ti] || 0;
      if (si > 0) { slideIdx[ti] = si - 1; paintSlide(); return; }
      if (ti > 0) {
        // Roll into the previous tab at its LAST section, so a back-step lands
        // on the section the reader would expect to have just seen.
        var pt = ti - 1;
        slideIdx[pt] = Math.max(0, (slideEls[pt] || []).length - 1);
        go(pt);
        return;
      }
      return;
    }
    if (sections.length) go(activeIndex() - 1);
    else window.scrollBy({ top: -window.innerHeight * 0.85, behavior: 'smooth' });
  }

  // ── Section-slide plumbing ─────────────────────────────────────────────
  // Present mode paints exactly ONE .section per tab as .pm-current; the CSS
  // hides the rest. buildSlideModel indexes the DOM once per enter(); paintSlide
  // is the single write path (arrow keys AND tab clicks both funnel through it).
  function buildSlideModel() {
    slideEls = [];
    slideIdx = [];
    // Two page shapes are supported:
    //   Landing page — `.tab-panel > .section` (each section IS a slide).
    //   Module pages — `.panel > .section > .pm-slide` (opt-in wrappers). If a
    //     module panel has no wrappers we fall back to "the whole .section is
    //     one slide", so migration is progressive: unwrapped panels behave
    //     exactly as they do today.
    // A page uses one shape or the other; the first non-empty match wins so a
    // hypothetical page carrying both wouldn't double-count.
    var tabPanels = document.querySelectorAll('.tab-panel');
    var panels = tabPanels.length ? tabPanels : document.querySelectorAll('.panel');
    for (var i = 0; i < panels.length; i++) {
      var c = panels[i];
      var slides;
      if (c.classList.contains('tab-panel')) {
        slides = Array.prototype.slice.call(c.querySelectorAll(':scope > .section'));
      } else {
        var explicit = c.querySelectorAll(':scope > .section > .pm-slide:not(.pm-hide)');
        if (explicit.length) {
          slides = Array.prototype.slice.call(explicit);
        } else {
          var wholeSection = c.querySelector(':scope > .section');
          slides = wholeSection ? [wholeSection] : [];
        }
      }
      slideEls.push(slides);
      slideIdx.push(0);
    }
  }
  function clearSlideMarks() {
    var marked = document.querySelectorAll('.pm-current');
    for (var i = 0; i < marked.length; i++) marked[i].classList.remove('pm-current');
  }
  function paintSlide() {
    if (!body.classList.contains('presenting')) return;
    if (!slideEls.length) return;
    var ti = activeIndex();
    var arr = slideEls[ti] || [];
    var si = Math.max(0, Math.min(arr.length - 1, slideIdx[ti] || 0));
    slideIdx[ti] = si;
    // Only clear marks in the current panel — otherwise switching tabs would
    // wipe the marker on the tab we just left and forget its position. Which
    // it wouldn't visually matter (that tab isn't on screen), but the CSS
    // fallback `.tab-panel.active > .section:not(.pm-current)` would flash the
    // stale one for a frame if the tab is re-shown before paintSlide fires.
    for (var k = 0; k < arr.length; k++) {
      arr[k].classList.toggle('pm-current', k === si);
    }
    paintSubNav();
  }

  // ── Sub-nav strip ──────────────────────────────────────────────────────
  // Slim indicator directly under the pinned tab strip. Dots represent the
  // sections in the current tab; the current one is filled. Clicking a dot
  // jumps within the tab. Hidden on tabs with <=1 section (the only tab that
  // needs it on index.html is Overview), so the four single-section tabs on
  // module pages stay clean.
  var subNav = null;
  function buildSubNav() {
    if (subNav) return;
    var anchor = document.querySelector('.section-nav, .tab-nav');
    if (!anchor || !anchor.parentNode) return;
    subNav = document.createElement('div');
    subNav.className = 'pm-subnav';
    subNav.setAttribute('role', 'group');
    subNav.setAttribute('aria-label', 'Sections in this tab');
    anchor.parentNode.insertBefore(subNav, anchor.nextSibling);
  }
  function paintSubNav() {
    if (!subNav) return;
    var ti = activeIndex();
    var arr = slideEls[ti] || [];
    var si = slideIdx[ti] || 0;
    if (arr.length <= 1) { subNav.hidden = true; subNav.innerHTML = ''; return; }
    subNav.hidden = false;
    // Rebuild in place. Small N (<=4 today), so full replace is cheaper than
    // diffing and it can't leave stale click handlers referencing the wrong
    // index after the tab changes.
    subNav.innerHTML = '';
    for (var k = 0; k < arr.length; k++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'pm-sub-dot' + (k === si ? ' on' : '');
      var h = arr[k].querySelector('h2, h3');
      var label = h ? h.textContent.trim() : ('Section ' + (k + 1));
      dot.title = label;
      dot.setAttribute('aria-label', label);
      dot.setAttribute('aria-current', k === si ? 'true' : 'false');
      (function (idx) {
        dot.addEventListener('click', function () {
          slideIdx[activeIndex()] = idx;
          paintSlide();
        });
      })(k);
      subNav.appendChild(dot);
    }
  }

  // ── Build the launch button ──
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z"/></svg>';

  function buildFab() {
    if (document.querySelector('.present-fab')) return;
    fab = document.createElement('button');
    fab.className = 'present-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Enter presentation mode');
    fab.title = 'Presentation mode (F)';
    fab.innerHTML = PLAY;
    fab.addEventListener('click', enter);
    body.appendChild(fab);
  }

  // ── Enter / exit ──
  // No control dock, no overlay, no hint: present mode puts nothing on top of
  // the slide. Arrow keys move between section tabs, Esc leaves.
  function enter() {
    if (body.classList.contains('presenting')) return;
    sections = getSections();
    buildSlideModel();
    buildSubNav();
    body.classList.add('presenting');
    // Paint the initial slide AFTER adding .presenting, so the CSS rule
    // hiding non-current sections is already live — otherwise every section
    // is briefly on screen. Painting is synchronous, so no flash.
    paintSlide();
    requestFS();
    bindKeys();
    measureHero();
    resizeHandler = function () { measureHero(); };
    window.addEventListener('resize', resizeHandler);
  }

  function exit() {
    if (!body.classList.contains('presenting')) return;
    body.classList.remove('presenting');
    // Also drop pm-scroll so a next enter() starts clean in slide mode.
    body.classList.remove('pm-scroll');
    // Drop the slide marks so a non-present visitor sees the normal stack.
    clearSlideMarks();
    if (subNav) { subNav.hidden = true; subNav.innerHTML = ''; }
    unbindKeys();
    if (resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
    document.body.style.removeProperty('--pm-hero-h');
    document.body.style.removeProperty('--pm-tabnav-h');
    exitFS();
  }

  // ── Presenter-notes link ────────────────────────────────────────────────
  // Announces which section tab is showing so presenter.html (opened on the
  // other monitor) can display the matching part of the recording script.
  // Runs whether or not we're presenting, so the notes window also follows
  // ordinary tab clicks while you rehearse.
  //
  // BroadcastChannel is the transport; localStorage mirrors it for contexts
  // where BroadcastChannel is unavailable. Both are same-origin, so this needs
  // the pages served over http (local_server.py), not opened as file://.
  var LINK_CHANNEL = 'agentcore-present';
  var LINK_LS = 'agentcore-present-state';
  var NOTES_WIN = 'agentcore-presenter';
  var bc = null, linkMo = null;

  function pageSlug() {
    var f = (location.pathname.split('/').pop() || 'index.html');
    return f.replace(/\.html?$/i, '') || 'index';
  }

  function tabLabels() {
    return getSections().map(function (b) {
      return (b.textContent || '').replace(/\s+/g, ' ').trim();
    });
  }

  function linkSend(msg) {
    msg.src = 'deck';
    if (bc) { try { bc.postMessage(msg); } catch (e) {} }
    try {
      localStorage.setItem(LINK_LS + '-deck', JSON.stringify({ m: msg, at: Date.now() }));
    } catch (e) {}
  }

  function broadcastState() {
    var btns = getSections();
    if (!btns.length) return;
    var idx = 0;
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].classList.contains('active')) { idx = i; break; }
    }
    linkSend({
      type: 'state', page: pageSlug(), tab: idx,
      count: btns.length, labels: tabLabels()
    });
  }

  // Absolute index, so an echo can never double-advance the deck.
  function gotoTab(i) {
    var btns = getSections();
    if (!btns.length) return;
    i = Math.max(0, Math.min(btns.length - 1, i));
    btns[i].click();
  }

  function onLinkMessage(msg) {
    if (!msg || msg.src !== 'notes') return;
    if (msg.type === 'hello') { broadcastState(); return; }
    if (msg.type === 'goto' && typeof msg.tab === 'number') { gotoTab(msg.tab); }
  }

  function openNotes() {
    // Same window name every time: a second press focuses the existing window
    // rather than opening a duplicate.
    var url = 'presenter.html?page=' + encodeURIComponent(pageSlug());
    var w = window.open(url, NOTES_WIN,
      'width=620,height=940,menubar=no,toolbar=no,location=no');
    if (!w) {
      // Popup blocked — tell the user where to go instead of failing silently.
      window.alert('The notes window was blocked by the browser.\n\n' +
        'Allow pop-ups for this site, or open it yourself:\n' + location.origin + '/' + url);
      return;
    }
    try { w.focus(); } catch (e) {}
    // It asks for state on load, but announce anyway in case it was already open.
    setTimeout(broadcastState, 250);
  }

  function linkInit() {
    try { bc = ('BroadcastChannel' in window) ? new BroadcastChannel(LINK_CHANNEL) : null; }
    catch (e) { bc = null; }
    if (bc) { bc.onmessage = function (e) { onLinkMessage(e.data); }; }
    window.addEventListener('storage', function (e) {
      if (e.key !== LINK_LS + '-notes' || !e.newValue) return;
      try { onLinkMessage(JSON.parse(e.newValue).m); } catch (err) {}
    });

    var btns = getSections();
    if (btns.length && 'MutationObserver' in window) {
      // Tab click → paint the new tab's remembered slide, then broadcast.
      // Painting FIRST prevents a blank frame: the CSS hides everything until
      // .pm-current lands, and the observer fires before the browser paints.
      linkMo = new MutationObserver(function () {
        if (body.classList.contains('presenting')) paintSlide();
        broadcastState();
      });
      btns.forEach(function (b) {
        linkMo.observe(b, { attributes: true, attributeFilter: ['class'] });
      });
    }
    window.addEventListener('pagehide', function () { linkSend({ type: 'bye' }); });
    broadcastState();
  }

  function bindKeys() {
    keyHandler = function (e) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); toggleScrollMode(); }
      else if (e.key === 'Escape') { if (!fsElement()) exit(); } // if in FS, browser exits FS → fschange handles it
    };
    document.addEventListener('keydown', keyHandler);
  }
  function unbindKeys() {
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
  }

  // Leaving fullscreen (Esc, F11, etc.) also leaves presentation mode.
  function onFsChange() {
    if (!fsElement() && body.classList.contains('presenting')) exit();
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  // Global shortcuts, available before entering: F toggles present mode,
  // N opens the presenter-notes window (recommended order is N first, move it
  // to the second monitor, then F on the monitor you're recording).
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'f' || e.key === 'F') {
      if (body.classList.contains('presenting')) exit(); else enter();
    }  // N (presenter notes) is disabled: this site has no presenter.html
  });

  function boot() { buildFab(); linkInit(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
