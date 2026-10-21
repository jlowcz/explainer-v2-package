// Theme Toggle — light / dark
// Cycles: light → dark → light …
// Persists preference in localStorage under 'csea-theme'.
// (A legacy 'system' preference is coerced to a concrete theme on load.)
//
// Pair with the inline init script in <head> of every page:
//   <script>/*WSL-THEME-INIT*/(function(){try{var p=localStorage.getItem('csea-theme')||'light';
//     var t=p;if(p==='system'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';}
//     document.documentElement.setAttribute('data-theme',t);
//     document.documentElement.setAttribute('data-theme-pref',p);}catch(e){}})();</script>

(function () {
  var KEY = 'csea-theme';
  var ORDER = ['light', 'dark'];

  // Read the stored preference, coercing any legacy 'system' value to a
  // concrete light/dark theme (system mode was retired for a simpler toggle).
  function pref() {
    var v;
    try { v = localStorage.getItem(KEY) || 'light'; } catch (e) { return 'light'; }
    if (v !== 'light' && v !== 'dark') {
      v = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    return v;
  }
  function setPref(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function apply(p) {
    document.documentElement.setAttribute('data-theme', p);
    document.documentElement.setAttribute('data-theme-pref', p);
  }

  // Cloudscape's light-dark glyph (a half-filled circle) is the official
  // icon for a theme control; the button's aria-label carries the state.
  function icon() { return window.CSIcons ? window.CSIcons.svg('light-dark') : ''; }
  function label(p) {
    return p === 'dark' ? 'Dark theme. Click for light.' : 'Light theme. Click for dark.';
  }

  function nextTheme(current) {
    var idx = ORDER.indexOf(current);
    return ORDER[(idx + 1) % ORDER.length];
  }

  function render(btn) {
    var p = pref();
    btn.innerHTML = icon();
    btn.setAttribute('aria-label', label(p));
    btn.title = label(p);
  }

  function build() {
    if (document.querySelector('.theme-fab')) return;
    // Normalise any legacy 'system' preference on first paint.
    var p = pref(); setPref(p); apply(p);
    var btn = document.createElement('button');
    btn.className = 'theme-fab';
    btn.type = 'button';
    btn.addEventListener('click', function () {
      var next = nextTheme(pref());
      setPref(next);
      apply(next);
      render(btn);
    });
    render(btn);
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
