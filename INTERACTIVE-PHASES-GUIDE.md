# Interactive Phase Sections with Play/Pause - Implementation Guide

## What You Saw in m9-incident-response.html

The **phase section with dots and a pause button** that steps through a walkthrough automatically.

## How It Works

### 1. HTML Structure

```html
<div class="fg nf" id="yourFigureId">
  <div class="fg-bar">
    <!-- Label -->
    <b class="fg-lbl">phase</b>
    
    <!-- Phase dots (navigation) -->
    <div class="fg-dots" role="group" aria-label="Lifecycle phase">
      <button type="button" class="fg-dot on" title="Preparation" aria-label="Step 1 — Preparation"></button>
      <button type="button" class="fg-dot" title="Detect and analyze" aria-label="Step 2 — Detect and analyze"></button>
      <button type="button" class="fg-dot" title="Contain" aria-label="Step 3 — Contain"></button>
      <button type="button" class="fg-dot" title="Eradicate" aria-label="Step 4 — Eradicate"></button>
      <button type="button" class="fg-dot" title="Post-incident" aria-label="Step 5 — Post-incident"></button>
    </div>
    
    <!-- Fixed label -->
    <span class="nf-fixed">one incident · unusual traffic from app-01</span>
    
    <!-- Play/Pause button -->
    <button type="button" class="fg-play" aria-label="Pause the walkthrough">
      <span class="cs-inline">
        <svg class="cs-ico" viewBox="0 0 16 16">
          <!-- Pause icon SVG paths -->
          <path d="M5 2V14"></path>
          <path d="M11 2V14"></path>
        </svg>
      </span>
      Pause
    </button>
  </div>
  
  <!-- Visual stage (SVG diagram that changes with each phase) -->
  <div class="nf-wrap under">
    <div class="nf-stage" id="yourStage" aria-hidden="true">
      <svg viewBox="0 0 1000 250" role="img">
        <!-- SVG content here - elements have data-layer attributes -->
        <g class="node on" data-k="prep">...</g>
        <g class="node hide" data-k="detect" data-layer="detect">...</g>
        <!-- etc -->
      </svg>
    </div>
    
    <!-- Side cards that explain current phase -->
    <div class="nf-side">
      <div class="nf-card" id="card1">
        <div class="nf-card-h">What happens</div>
        <table class="nf-rt">
          <tbody>
            <tr><td>People</td><td>named and trained</td></tr>
            <tr><td>Process</td><td>plans and playbooks</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <!-- Narration text that updates -->
  <p class="fg-say" id="yourSay">Phase explanation text here...</p>
</div>
```

### 2. JavaScript - The `fgBeats` Function

**File**: `figures.js` (needs to be included)

```javascript
/*
 * fgBeats: Auto-playing walkthrough with beat controls
 * - Auto-plays through phases (2.9s per beat, 5.2s if beat has hold: true)
 * - Clicking a dot pauses on that beat
 * - Play/Pause button toggles animation
 * - Respects prefers-reduced-motion (parks at specific beat)
 */
function fgBeats(root, beats, render, park) {
  var dots = [].slice.call(root.querySelectorAll('.fg-dot'));
  var play = root.querySelector('.fg-play');
  var i = -1, timer = null, playing = false;

  function show(n) {
    i = n;
    render(beats[n]);  // Call render function with current beat
    dots.forEach(function (d, k) { 
      d.classList.toggle('on', k === n);  // Highlight current dot
    });
  }
  
  function schedule() {
    clearTimeout(timer);
    if (!playing) return;
    // Auto-advance to next beat after delay
    timer = setTimeout(function () { 
      show((i + 1) % beats.length); 
      schedule(); 
    }, beats[i].hold ? 5200 : 2900);  // 5.2s for dramatic beats, 2.9s normal
  }
  
  function setPlaying(on) {
    playing = on;
    play.textContent = on ? 'Pause' : 'Play';
    play.setAttribute('aria-label', on ? 'Pause the walkthrough' : 'Play the walkthrough');
    if (on) { schedule(); } else { clearTimeout(timer); }
  }
  
  // Click dot = pause and show that beat
  dots.forEach(function (d, n) {
    d.addEventListener('click', function () { 
      setPlaying(false); 
      show(n); 
    });
  });
  
  // Click play/pause button
  play.addEventListener('click', function () { 
    setPlaying(!playing); 
  });

  // Respect reduced motion preference
  var still = window.matchMedia && 
              window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  show(still ? (park || 0) : 0);
  setPlaying(!still);  // Auto-play unless reduced motion
}
```

### 3. Page-Specific Implementation

```javascript
// Define your beats (phases)
var beats = [
  {
    key: 'prep',
    say: 'Preparation covers people, process and technology...',
    card1: { rows: [
      ['People', 'named and trained'],
      ['Process', 'plans and playbooks'],
      ['Technology', 'logs, alerts, access']
    ]}
  },
  {
    key: 'detect',
    say: 'Detection starts when GuardDuty flags unusual behavior...',
    card1: { rows: [
      ['Source', 'GuardDuty finding'],
      ['Trigger', 'EventBridge rule'],
      ['Action', 'Alert security team']
    ]}
  },
  {
    key: 'contain',
    hold: true,  // Linger on this beat (5.2s instead of 2.9s)
    say: 'Containment isolates the compromised resource...',
    card1: { rows: [
      ['Action', 'Swap security group'],
      ['Effect', 'Network isolated'],
      ['Evidence', 'Preserved']
    ]}
  }
  // ... more beats
];

// Render function - updates the diagram and cards for each beat
function render(beat) {
  var stage = document.querySelector('#yourStage');
  var say = document.querySelector('#yourSay');
  var card1 = document.querySelector('#card1 tbody');
  
  // Update SVG: show/hide elements based on beat.key
  stage.querySelectorAll('[data-layer]').forEach(function(el) {
    var layers = el.getAttribute('data-layer').split(' ');
    el.classList.toggle('hide', layers.indexOf(beat.key) === -1);
  });
  
  // Update nodes: highlight active ones
  stage.querySelectorAll('.node').forEach(function(node) {
    var k = node.getAttribute('data-k');
    node.classList.toggle('on', k === beat.key);
  });
  
  // Update narration text
  say.textContent = beat.say;
  
  // Update card table
  card1.innerHTML = beat.card1.rows.map(function(r) {
    return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
  }).join('');
}

// Initialize the figure
var root = document.querySelector('#yourFigureId');
fgBeats(root, beats, render, 2);  // park at beat index 2 if reduced motion
```

## Key Features

### Auto-Play
- Automatically cycles through phases
- Each beat shows for **2.9 seconds**
- Dramatic beats (with `hold: true`) show for **5.2 seconds**

### User Controls
- **Click any dot** → Pause and jump to that phase
- **Click Play/Pause** → Toggle animation
- **Accessibility**: ARIA labels, keyboard navigable

### Reduced Motion
- Respects `prefers-reduced-motion: reduce`
- Parks at a specified beat (usually the most important one)
- Controls remain functional for manual stepping

### SVG Animation
- Elements have `data-layer="beat1 beat2"` attributes
- Render function shows/hides based on current beat
- Smooth transitions via CSS

## CSS Classes

```css
.fg-bar { /* Control bar */ }
.fg-lbl { /* "phase" label */ }
.fg-dots { /* Dot container */ }
.fg-dot { /* Individual dot button */ }
.fg-dot.on { /* Active dot (highlighted) */ }
.fg-play { /* Play/Pause button */ }
.nf-fixed { /* Fixed label text */ }
.nf-stage { /* SVG diagram container */ }
.nf-side { /* Side cards container */ }
.nf-card { /* Individual card */ }
.fg-say { /* Narration text below */ }

/* SVG element states */
.node.on { /* Active node */ }
.edge.on { /* Active edge */ }
.hide { display: none; } /* Hidden elements */
```

## Required Files

1. **figures.js** - Contains `fgBeats()` function (from the original package)
2. **explainer.css** - Contains `.fg*` and `.nf*` styles
3. **netfig.css** - Additional SVG diagram styles

## Example: 5-Phase Incident Response

```html
<div class="fg nf" id="incidentFig">
  <div class="fg-bar">
    <b class="fg-lbl">phase</b>
    <div class="fg-dots">
      <button class="fg-dot on" title="Preparation"></button>
      <button class="fg-dot" title="Detection"></button>
      <button class="fg-dot" title="Containment"></button>
      <button class="fg-dot" title="Eradication"></button>
      <button class="fg-dot" title="Recovery"></button>
    </div>
    <span class="nf-fixed">one incident · compromised EC2</span>
    <button class="fg-play">Pause</button>
  </div>
  
  <div class="nf-wrap under">
    <div class="nf-stage">
      <svg viewBox="0 0 1000 300">
        <!-- Preparation phase -->
        <g class="node on" data-k="prep">
          <rect x="100" y="100" width="80" height="80" rx="8"/>
          <text x="140" y="145">Setup</text>
        </g>
        
        <!-- Detection phase (hidden initially) -->
        <g class="node hide" data-layer="detect">
          <rect x="250" y="100" width="80" height="80" rx="8"/>
          <text x="290" y="145">Alert</text>
        </g>
        
        <!-- ... more phases -->
      </svg>
    </div>
    
    <div class="nf-side">
      <div class="nf-card">
        <div class="nf-card-h">Current Phase</div>
        <table class="nf-rt">
          <tbody id="phaseDetails">
            <!-- Populated by render() -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <p class="fg-say" id="incidentSay">
    <!-- Updated by render() -->
  </p>
</div>

<script src="./assets/figures.js"></script>
<script>
  var beats = [/* your beats */];
  function render(beat) {/* your render */}
  fgBeats(document.querySelector('#incidentFig'), beats, render, 2);
</script>
```

## Summary

The phase section with play/pause is created using:

1. **HTML**: Dot buttons + play/pause button + SVG diagram
2. **JavaScript**: `fgBeats()` function (from figures.js)
3. **Beats array**: Defines each phase's content and timing
4. **Render function**: Updates SVG and text for each beat
5. **CSS**: Styles for dots, controls, and animations

**Key insight**: It's not just CSS/JS files—you need the specific `fgBeats` function and a beats array defining your phases!

---

**File Location in Original**: 
- JavaScript: `figures.js.download` (or `m9.js.download` for page-specific)
- CSS: `explainer.css`, `netfig.css`
- Usage: `m9-incident-response.html` lines 44-56
