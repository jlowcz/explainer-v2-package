// Top-Left Navigation Cluster — shared across all explainer pages
// Renders [menu] [overview] buttons at top-left + slide-out side panel
// listing every module. The menu button opens/closes the side panel.
// Icons come from the shared Cloudscape icon module (icons.js), which is
// loaded before this script; calls are guarded so a missing module degrades
// to an empty button rather than throwing.

(function () {
  // Determine current page for highlighting
  var currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isHomePage = (currentPage === 'index.html' || currentPage === '');

  // Navigation structure (single source of truth) — grouped.
  var navGroups = [
    { kind: 'plain', label: 'Course Home',
      items: [ { ico: 'grid-view', label: 'Overview & Modules', href: 'index.html', highlight: true } ] },
    { kind: 'collapsible', id: 'day1', label: 'Day 1 — Identity, Keys, Detection & Response',
      items: [
        { ico: 'user-profile', label: 'M1 · Identity & the CloudTrail trail', href: 'm1-identity-cloudtrail.html' },
        { ico: 'search', label: 'M2 · Detection stack & network isolation', href: 'm2-detection-network.html' },
        { ico: 'security', label: 'M3 · Containing compromised compute', href: 'm3-compute-containment.html' },
        { ico: 'key', label: 'M4 · Managing keys & secrets', href: 'm4-keys-secrets.html' },
        { ico: 'edit', label: 'Whiteboard · read by a defender', href: 'whiteboard.html' }
      ] },
    { kind: 'collapsible', id: 'day2', label: 'Day 2 — Attack Paths, Data & AgentCore',
      items: [
        { ico: 'key', label: 'M5 · Data, keys & data perimeters', href: 'm5-data-keys.html' },
        { ico: 'command-prompt', label: 'M5a · AgentCore Runtime', href: 'm5a-agentcore-runtime.html' },
        { ico: 'gen-ai', label: 'M6 · The agent authorization model', href: 'm6-agent-authz.html' },
        { ico: 'status-info', label: 'Lab · Agent identity & the seeded investigation', href: 'lab-agent-identity.html' }
      ] },
    { kind: 'collapsible', id: 'day3', label: 'Day 3 — AI Workload Security',
      items: [
        { ico: 'upload', label: 'M7 · Agents & the supply chain', href: 'm7-agents-supply-chain.html' },
        { ico: 'lock-private', label: 'M8 · Native services for AI workloads', href: 'm8-native-ai-services.html' },
        { ico: 'notification', label: 'M9 · Incident response for AI workloads', href: 'm9-incident-response.html' },
        { ico: 'file', label: 'Reference · Incident response playbooks', href: 'playbooks.html' }
        /* Lab · Incident response for an AgentCore agent: HELD 16 Oct, files in microsite/hold/. See .build_index.py. */
      ] },
    { kind: 'plain', label: 'Before the course',
      items: [
        { ico: 'file', label: 'Pre-work — Minimum & Recommended', href: 'index.html#prework', highlight: true }
      ] },
    { kind: 'plain', label: 'Reference',
      items: [
        { ico: 'anchor-link', label: 'Sources — every page, every citation', href: 'sources.html' }
      ] }
  ];

  // ── Build the top-left cluster ──
  var cluster = document.createElement('div');
  cluster.className = 'nav-cluster';

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-cluster-btn is-toggle';
  toggle.id = 'sideNavToggle';
  toggle.title = 'Open navigation menu';
  toggle.setAttribute('aria-label', 'Open navigation menu');
  toggle.innerHTML = (window.CSIcons ? window.CSIcons.svg('menu') : '');

  var home = document.createElement('a');
  home.className = 'nav-cluster-btn is-home';
  home.href = 'index.html';
  home.title = 'Back to Course Home';
  home.setAttribute('aria-label', 'Back to Course Home');
  home.innerHTML = (window.CSIcons ? window.CSIcons.svg('grid-view') : '');

  cluster.appendChild(toggle);
  if (!isHomePage) {
    cluster.appendChild(home);
  }

  // ── Build the slide-out panel ──
  var panel = document.createElement('nav');
  panel.className = 'side-nav-panel';
  panel.id = 'sideNavPanel';
  panel.setAttribute('aria-label', 'Module navigation');

  /* An item with no page renders as plain text, never a link: M4 is
     slide-led, and modules still in build carry `soon: true`. Remove the
     flag when the page lands, or every reviewer hits a 404. */
  function snpItem(item) {
    if (!item.href || item.soon) {
      return '<li><span class="snp-off">' +
             '<span class="nav-icon" data-ico="' + item.ico + '">' +
             (window.CSIcons ? window.CSIcons.svg(item.ico) : '') + '</span>' + item.label +
             '<em>' + (item.note || 'in build') + '</em></span></li>';
    }
    var cls = ((item.href.toLowerCase() === currentPage) ? ' current' : '') + (item.highlight ? ' snp-highlight' : '');
    return '<li><a href="' + item.href + '" class="' + cls.replace(/^ /, '') + '">' +
           '<span class="nav-icon" data-ico="' + item.ico + '">' +
           (window.CSIcons ? window.CSIcons.svg(item.ico) : '') + '</span>' + item.label + '</a></li>';
  }
  function snpList(items) {
    var s = '';
    for (var j = 0; j < items.length; j++) { s += snpItem(items[j]); }
    return s;
  }
  function groupHasCurrent(items) {
    for (var k = 0; k < items.length; k++) {
      if (items[k].href && !items[k].soon && items[k].href.toLowerCase() === currentPage) return true;
    }
    return false;
  }

  var html = '';
  html += '<div class="snp-header">';
  html += '<div class="snp-title">Course Navigation</div>';
  html += '<span class="snp-sub">Custom Security Engineering and Agentic AI on AWS</span>';
  html += '</div>';

  for (var g = 0; g < navGroups.length; g++) {
    var grp = navGroups[g];
    if (grp.kind === 'collapsible') {
      var expanded = true; // modules group always starts expanded (only one group)
      html += '<button type="button" class="snp-section-label snp-group-toggle' + (expanded ? ' expanded' : '') +
              '" data-group="grp-' + grp.id + '" aria-expanded="' + expanded + '" aria-controls="grp-' + grp.id + '">' +
              '<span>' + grp.label + '</span><span class="snp-chevron" aria-hidden="true">▸</span></button>';
      html += '<ul class="snp-list snp-group' + (expanded ? '' : ' collapsed') + '" id="grp-' + grp.id + '">' +
              snpList(grp.items) + '</ul>';
    } else {
      html += '<div class="snp-section-label">' + grp.label + '</div>';
      html += '<ul class="snp-list">' + snpList(grp.items) + '</ul>';
    }
  }
  panel.innerHTML = html;

  // ── Collapsible groups ──
  panel.addEventListener('click', function (e) {
    var btn = (e.target && e.target.closest) ? e.target.closest('.snp-group-toggle') : null;
    if (!btn) return;
    var grpEl = document.getElementById(btn.getAttribute('data-group'));
    if (!grpEl) return;
    var collapsed = grpEl.classList.toggle('collapsed');
    btn.classList.toggle('expanded', !collapsed);
    btn.setAttribute('aria-expanded', String(!collapsed));
  });

  // ── Soft scrim that closes the panel when clicked ──
  var scrim = document.createElement('div');
  scrim.className = 'side-nav-scrim';
  scrim.id = 'sideNavScrim';

  // ── Open / close behaviour ──
  function open() {
    panel.classList.add('open');
    scrim.classList.add('open');
    toggle.classList.add('open');
    toggle.innerHTML = (window.CSIcons ? window.CSIcons.svg('close') : '');
    toggle.setAttribute('aria-label', 'Close navigation menu');
  }
  function close() {
    panel.classList.remove('open');
    scrim.classList.remove('open');
    toggle.classList.remove('open');
    toggle.innerHTML = (window.CSIcons ? window.CSIcons.svg('menu') : '');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  }
  toggle.addEventListener('click', function () {
    if (panel.classList.contains('open')) close();
    else open();
  });
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) close();
  });

  // ── Insert into page ──
  function attach() {
    document.body.appendChild(scrim);
    document.body.appendChild(panel);
    document.body.appendChild(cluster);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();

/* ── External links always open in a new tab ──────────────────────────────
   A participant who follows a source link must be able to close the tab and
   land back on the page they were reading. Every generated page already writes
   target="_blank" rel="noopener" on its external links (the generators do it);
   this is the guard for anything that does not — a hand-edited page, a link
   injected by script, or a future generator that forgets.

   It is a delegated CAPTURE listener, so it runs before the browser follows the
   link and also covers anchors added after load. Only links that leave this
   site are touched: the in-site module links and #anchors keep opening in place,
   because the nav panel and Course Home depend on that. */
(function () {
  function external(a) {
    if (!a || !a.getAttribute) return false;
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(h)) return false;
    try { return new URL(a.href, location.href).origin !== location.origin; } catch (e) { return false; }
  }
  function mark(a) {
    a.setAttribute('target', '_blank');
    var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
    ['noopener', 'noreferrer'].forEach(function (t) { if (rel.indexOf(t) < 0) rel.push(t); });
    a.setAttribute('rel', rel.join(' '));
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (external(a)) mark(a);
  }, true);
  /* Also mark at load, so "open in new tab" from the context menu and the status
     bar behave the same way as a plain click. */
  function sweep() { [].forEach.call(document.querySelectorAll('a[href]'), function (a) { if (external(a)) mark(a); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sweep); else sweep();
})();
