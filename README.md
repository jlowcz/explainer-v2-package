# AI Explainer Skill V2 - Interactive HTML Package

Complete package for generating interactive, presentation-style HTML explanations with professional styling.

## What's Included

- **EXPLAINER-V2-PROMPT.md** - Full AI prompt template for generating HTML explainers  
- **assets/** - All required CSS/JS files for interactive features  
- **Example structure** - Complete HTML template in the prompt

## Features

✅ Interactive navigation panels  
✅ SVG diagrams and visualizations  
✅ Light/dark theme support  
✅ Presentation mode  
✅ Responsive design  
✅ Professional course-material styling  

## Quick Start

### 1. Use the Prompt
Copy the system prompt from `EXPLAINER-V2-PROMPT.md` and ask any AI:
```
"Using the explainer V2 format, explain [your topic]"
```

### 2. Assets Setup
When generating HTML files, reference the `assets/` folder:
```html
<link rel="stylesheet" href="./assets/style.css">
<link rel="stylesheet" href="./assets/explainer.css">
<!-- ... more CSS files -->
<script src="./assets/nav-panel.js"></script>
<!-- ... more JS files -->
```

### 3. File Structure
```
your-explainer/
├── topic-name.html
└── assets/
    ├── *.css files
    └── *.js files
```

## Assets Included

### CSS (282KB total)
- `style.css` (125KB) - Base layout
- `explainer.css` (21KB) - Component styles
- `nav-panel.css` (8KB) - Navigation
- `theme-aws.css` (22KB) - Color theme
- `presentation-mode.css` (15KB) - Presentation view
- `fonts.css`, `icons.css`, `annotate.css`

### JavaScript (63KB total)
- `nav-panel.js` (11KB) - Tab navigation
- `presentation-mode.js` (20KB) - Presentation toggle
- `theme-toggle.js` (3KB) - Light/dark switch
- `icons.js` (17KB) - Icon rendering
- `annotate.js` (13KB) - Annotations

## Example Output

Generated HTML files include:
- Hero section with category, title, subtitle
- 3-5 navigation panels (Fundamentals, Concept, Implementation, Advanced, Reference)
- Multiple slides per panel
- SVG diagrams
- Comparison tables
- Code examples
- Source citations

## Version

**V2.0** - Interactive HTML with full assets  
**Based on**: AWS Security Engineering course materials  
**Created**: 2026-10-21

## Related

- **V1**: Markdown-only output (see `explainer-skill-prompt.md` in ai-explainer repo)
- **V2**: Interactive HTML (this package)

---

*Open any generated HTML file in a browser to see the interactive experience!*
