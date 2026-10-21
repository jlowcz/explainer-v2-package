// ──────────────────────────────────────────────────────────────────────────
// Cloudscape iconography — shared icon module
//
// Icon path data is taken verbatim from the Cloudscape Design System
// (github.com/cloudscape-design/components, src/icon/icons/*.svg),
// which is open source under the Apache License 2.0. Cloudscape is the
// design system AWS uses for its own console and web applications, so
// these are the correct generic icons for this course companion.
//
// The single 'flask' glyph is custom (Cloudscape has no lab icon);
// extending the set with custom SVGs is a documented Cloudscape pattern.
//
// Usage in markup:   <span class="cc-icon" data-ico="security"></span>
// This script replaces any [data-ico] element's content with the matching
// 16x16 inline SVG. Stroke colour is inherited via currentColor, so icons
// pick up the surrounding text colour and both light/dark themes for free.
// ──────────────────────────────────────────────────────────────────────────

(function () {
  var ICONS = {
  "anchor-link": "<path d=\"M5 8H11\" class=\"stroke-linejoin-round\"/><path d=\"M7 12H5C2.79 12 1 10.21 1 8C1 5.79 2.79 4 5 4H7\" class=\"stroke-linejoin-round\"/><path d=\"M9 12H11C13.21 12 15 10.21 15 8C15 5.79 13.21 4 11 4H9\" class=\"stroke-linejoin-round\"/>",
  "angle-right": "<path d=\"M5 2L11 8L5 14\" class=\"stroke-linejoin-round\"/>",
  "arrow-right": "<path d=\"M9 3L14 8L9 13\" class=\"stroke-linejoin-round awsui-icon-glyph\"/><path d=\"M14 8H1\" class=\"stroke-linejoin-round awsui-icon-glyph\"/>",
  "bug": "<path d=\"M12 5.70996C12 3.50082 10.2091 1.70996 8 1.70996C5.79086 1.70996 4 3.50082 4 5.70996V9.70996C4 11.9191 5.79086 13.71 8 13.71C10.2091 13.71 12 11.9191 12 9.70996V5.70996Z\" /><path d=\"M15 8.70996H12\" /><path d=\"M4 8.70996H1\" /><path d=\"M12 6L4 6\" /><path d=\"M15 3.63L12 5.71\" /><path d=\"M15 13.78L12 11.71\" /><path d=\"M1 3.63L4 5.71\" /><path d=\"M1 13.78L4 11.71\" />",
  "check": "<path d=\"M1 9L5 13L15 2\" class=\"stroke-linejoin-round\"/>",
  "close": "<path d=\"M2 1.70996L14 13.71\" class=\"stroke-linejoin-round\"/><path d=\"M2 13.71L14 1.70996\" class=\"stroke-linejoin-round\"/>",
  "command-prompt": "<path d=\"M15 1H1V15H15V1Z\" class=\"stroke-linejoin-round\"/><path d=\"M12 11H9\" class=\"stroke-linejoin-round\"/><path d=\"M4.70996 11.3L7.99996 8.00002L4.70996 4.71002\" class=\"stroke-linejoin-round\"/>",
  "contact": "<path d=\"M14 12C14.55 12 15 11.55 15 11V3C15 2.45 14.55 2 14 2H2C1.45 2 1 2.45 1 3V11C1 11.55 1.45 12 2 12H6V15L10 12H14Z\" class=\"stroke-linejoin-round\"/>",
  "copy": "<path d=\"M15 5H5V15H15V5Z\" class=\"stroke-linejoin-round awsui-icon-front\"/><path d=\"M13 1H1V12\" class=\"stroke-linejoin-round awsui-icon-back\"/>",
  "download": "<path d=\"M1 15H15\" class=\"stroke-linejoin-round\"/><path d=\"M13 6L8 11L3 6\" class=\"stroke-linejoin-round awsui-icon-arrow\"/><path d=\"M8 10V1\" class=\"stroke-linejoin-round awsui-icon-arrow\"/>",
  "edit": "<path d=\"M6.19 13.275L2 13.975\" class=\"stroke-linecap-round awsui-icon-nib-b\"/><path d=\"M2 13.975L2.7 9.785\" class=\"stroke-linecap-round awsui-icon-nib-a\"/><path d=\"M2.7 9.785L9.89999 2.585C10.68 1.805 11.95 1.805 12.73 2.585L13.39 3.245C14.17 4.025 14.17 5.295 13.39 6.075L6.19 13.275\" class=\"stroke-linejoin-round stroke-linecap-round\"/><path d=\"M9 3.995L12 6.995\" class=\"stroke-linejoin-round stroke-linecap-round awsui-icon-eraser\"/>",
  "expand": "<path d=\"M14 7L14 2L9 2\" class=\"stroke-linejoin-round awsui-icon-corner-tr\"/><path d=\"M10 6L14 2\" class=\"stroke-linejoin-round awsui-icon-corner-tr\"/><path d=\"M6.99023 14L2.00024 14L2.00024 9\" class=\"stroke-linejoin-round awsui-icon-corner-bl\"/><path d=\"M6 10L2 14\" class=\"stroke-linejoin-round awsui-icon-corner-bl\"/><path d=\"M9 14L14 14L14 9\" class=\"stroke-linejoin-round awsui-icon-corner-br\"/><path d=\"M10 10L14 14\" class=\"stroke-linejoin-round awsui-icon-corner-br\"/><path d=\"M2 6.99023L2 2.00024L7 2.00024\" class=\"stroke-linejoin-round awsui-icon-corner-tl\"/><path d=\"M6 6L2 2\" class=\"stroke-linejoin-round awsui-icon-corner-tl\"/>",
  "external": "<path d=\"M13 9.01172V3.01172H7\" class=\"stroke-linejoin-round\"/><path d=\"M13.02 3L7 9.01\" class=\"stroke-linejoin-round\"/><path d=\"M3 5.01172V13.0117H9H11.01\" class=\"stroke-linejoin-round\"/>",
  "file": "<path d=\"M13 15H3V1H9L13 5V15Z\" class=\"stroke-linejoin-round\"/><path d=\"M8 1V6H13\" class=\"stroke-linejoin-round\"/>",
  "file-open": "<path d=\"M13 15H3V1H9L13 5V15Z\" class=\"stroke-linejoin-round\"/><path d=\"M8 1V6H13\" class=\"stroke-linejoin-round\"/><path d=\"M3 8L10 15\" class=\"stroke-linejoin-round\"/>",
  "filter": "<path d=\"M1 3L6 8V15L10 13V8L15 3V1H1V3Z\" class=\"stroke-linejoin-round\"/>",
  "flask": "<path class=\"stroke-linejoin-round\" d=\"M6.2 1.5h3.6\"/><path class=\"stroke-linejoin-round\" d=\"M7 1.5v3.9L3.6 12a1.1 1.1 0 0 0 1 1.6h6.8a1.1 1.1 0 0 0 1-1.6L9 5.4V1.5\"/><path d=\"M5.2 9.6h5.6\"/>",
  "folder": "<path d=\"M15 5V14H2V2H8L9 4H14C14.55 4 15 4.45 15 5Z\" class=\"stroke-linejoin-round\"/>",
  "gen-ai": "<path class=\"stroke-linejoin-round\" d=\"M6.15 10.3649L8 15.0049L9.86 10.3649L14.5 8.50488L9.86 6.65488L8 2.00488L6.15 6.65488L1.5 8.50488L6.15 10.3649Z\" /><path class=\"filled no-stroke\" d=\"M2.38 4.915C2.4 4.965 2.45 4.995 2.5 4.995C2.55 4.995 2.62 4.915 2.62 4.915L3.28 3.275L4.92 2.615C4.97 2.595 5 2.545 5 2.495C5 2.445 4.92 2.375 4.92 2.375L3.28 1.715L2.62 0.075C2.58 -0.025 2.42 -0.025 2.38 0.075L1.72 1.715L0.0799942 2.375C0.0299942 2.395 0 2.445 0 2.495C0 2.545 0.0799942 2.615 0.0799942 2.615L1.72 3.275L2.38 4.915Z\" />",
  "globe": "<circle cx=\"8\" cy=\"8\" r=\"7\" stroke-width=\"2\"/><path d=\"M8 15C9.65685 15 11 11.866 11 8C11 4.13401 9.65685 1 8 1C6.34315 1 5 4.13401 5 8C5 11.866 6.34315 15 8 15Z\" class=\"stroke-linejoin-round\"/><path d=\"M1 8H15\" class=\"stroke-linejoin-round\"/>",
  "grid-view": "<path d=\"M6 10H2V14H6V10Z\" class=\"stroke-linejoin-round\"/><path d=\"M14 10H10V14H14V10Z\" class=\"stroke-linejoin-round\"/><path d=\"M6 2H2V6H6V2Z\" class=\"stroke-linejoin-round\"/><path d=\"M14 2H10V6H14V2Z\" class=\"stroke-linejoin-round\"/>",
  "group": "<path d=\"M15 16V14C15 12.8954 14.1046 12 13 12H9C7.89543 12 7 12.8954 7 14V16\"/><circle cx=\"11.25\" cy=\"6.75\" r=\"2.25\" /><path class=\"filled\" d=\"M6.25443 8.98999H3.00012C1.89279 8.98999 0.995117 9.88766 0.995117 10.995V12.995H1.00512V10.995C1.00512 9.89318 1.89831 8.99999 3.00012 8.99999H6.26112C6.25889 8.99666 6.25666 8.99333 6.25443 8.98999Z\"/><circle cx=\"4.25\" cy=\"4.25\" r=\"2.25\" />",
  "history": "<path d=\"M1 0L1 5L6 4.95999\" class=\"stroke-linejoin-round\"/><path d=\"M1 8C1 11.87 4.13 15 8 15C11.87 15 15 11.87 15 8C15 4.13 11.87 1 8 1C5.21 1 2.80001 2.63 1.67001 5\" /><path d=\"M9 4V9H5\" class=\"stroke-linejoin-round\"/>",
  "insert-row": "<path d=\"M6 11H1V2H15V6\" class=\"stroke-linejoin-round\"/><path d=\"M12 7V15\" class=\"stroke-linejoin-round\"/><path d=\"M8 11H16\" class=\"stroke-linejoin-round\"/>",
  "internal-link": "<path d=\"M6.5 4L10.5 8L6.5 12\" class=\"stroke-linejoin-round\" /><path d=\"M2 8H10.5\" />",
  "key": "<path d=\"M10 1C7.24 1 5 3.24 5 6C5 6.69 5.13999 7.35 5.39999 7.96L1 12.36V15.01H5V13.01H8V10.59C8.61 10.86 9.29 11.01 10 11.01C12.76 11.01 15 8.77 15 6.01C15 3.25 12.76 1.01 10 1.01V1Z\" class=\"stroke-linejoin-round\"/><path d=\"M10.5 7C11.3284 7 12 6.32843 12 5.5C12 4.67157 11.3284 4 10.5 4C9.67157 4 9 4.67157 9 5.5C9 6.32843 9.67157 7 10.5 7Z\" class=\"filled no-stroke\"/>",
  "light-dark": "<circle cx=\"8\" cy=\"8\" r=\"7\" /><path d=\"M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1V15Z\" class=\"filled no-stroke\" />",
  "lock-private": "<path d=\"M12 7H4C3.44772 7 3 7.44772 3 8V14C3 14.5523 3.44772 15 4 15H12C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z\" class=\"stroke-linejoin-round\"/><path d=\"M5 7V4C5 2.35 6.35 1 8 1C9.65 1 11 2.35 11 4V7\" class=\"stroke-linejoin-round\"/>",
  "map": "<path d=\"M2 12.8V2L5.61 3.21V14L2 12.8Z\" class=\"stroke-linejoin-round\"/><path d=\"M10.4 12.8V2L14 3.05V14L10.4 12.8Z\" class=\"stroke-linejoin-round\"/><path d=\"M5.60999 14L10.4 12.8\" class=\"stroke-linejoin-round\"/><path d=\"M5.60999 3.21L10.4 2\" class=\"stroke-linejoin-round\"/>",
  "menu": "<path d=\"M15 3H1\" class=\"stroke-linejoin-round\"/><path d=\"M15 8H1\" class=\"stroke-linejoin-round\"/><path d=\"M15 13H1\" class=\"stroke-linejoin-round\"/>",
  "multiscreen": "<path class=\"stroke-linejoin-round\" d=\"M15 5H5V12H15V5Z\" /><path class=\"stroke-linejoin-round\" d=\"M11 3V1.01001L1.01 1L1 8H2.998\" /><path class=\"stroke-linejoin-round\" d=\"M10 12V15\" /><path class=\"stroke-linejoin-round\" d=\"M7 15H13\" />",
  "notification": "<path d=\"M14 12H2C1.61 12 1.36999 11.56 1.58999 11.24L4 8V5C4 2.79 5.79 1 8 1C10.21 1 12 2.79 12 5V8L14.41 11.24C14.63 11.57 14.39 12 14 12Z\" class=\"stroke-linejoin-round\"/><path d=\"M6 13C6 14.1 6.9 15 8 15C9.1 15 10 14.1 10 13\" class=\"stroke-linejoin-round\"/>",
  "pause": "<path d=\"M5 2V14\" class=\"stroke-linejoin-round\"/><path d=\"M11 2V14\" class=\"stroke-linejoin-round\"/>",
  "play": "<path d=\"M4 13.03L12 8.03003L4 3.03003V13.03Z\" class=\"stroke-linejoin-round filled\"/>",
  "refresh": "<path d=\"M15 0V5L10 4.95999\" class=\"stroke-linejoin-round\"/><path d=\"M15 8C15 11.87 11.87 15 8 15C4.13 15 1 11.87 1 8C1 4.13 4.13 1 8 1C10.79 1 13.2 2.63 14.33 5\" />",
  "script": "<path d=\"M5 4L1 8L5 12\" class=\"stroke-linejoin-round\"/><path d=\"M11 4L15 8L11 12\" class=\"stroke-linejoin-round\"/><path d=\"M7 13L9 3\" />",
  "search": "<path d=\"M11 11L15 15\" class=\"stroke-linejoin-round\"/><path d=\"M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z\" class=\"stroke-linejoin-round\"/>",
  "security": "<path d=\"M8 1C6.29 2.53 4.13 3.32 2 3.48V6.95999C2 9.00999 2.76001 10.84 3.71001 12.1C4.63001 13.32 6.03 14.31 8 15C9.97 14.31 11.37 13.32 12.29 12.1C13.24 10.84 14 9.00999 14 6.95999V3.48C11.87 3.32 9.71 2.52 8 1Z\" class=\"stroke-linejoin-round\" /><path d=\"M8.00002 4V9\" /><path d=\"M8.00002 10V12\" />",
  "send": "<path d=\"M1 1L15 7.92L1 15L4 8L1 1Z\" class=\"stroke-linejoin-round\"/><path d=\"M4 8H15\" class=\"stroke-linejoin-round\"/>",
  "settings": "<path d=\"M6.11048 1.72895C6.18048 1.30955 6.55049 1 6.97049 1H8.99048C9.42048 1 9.78047 1.30955 9.85047 1.72895L10.0205 2.72753C10.0705 3.01712 10.2605 3.25677 10.5205 3.40655C10.5805 3.43651 10.6305 3.46647 10.6905 3.50642C10.9405 3.6562 11.2505 3.70614 11.5305 3.60628L12.4805 3.25677C12.8805 3.10699 13.3305 3.25678 13.5505 3.63624L14.5605 5.38374C14.7705 5.75321 14.6905 6.22254 14.3605 6.49216L13.5805 7.13125C13.3505 7.32097 13.2405 7.61055 13.2505 7.90014V8.09986C13.2505 8.38945 13.3605 8.67903 13.5805 8.86875L14.3605 9.50784C14.6905 9.77746 14.7805 10.2468 14.5605 10.6163L13.5505 12.3638C13.3405 12.7332 12.8905 12.893 12.4905 12.7432L11.5405 12.3937C11.2605 12.2939 10.9605 12.3338 10.7005 12.4936C10.6405 12.5235 10.5905 12.5635 10.5305 12.5934C10.2705 12.7332 10.0805 12.9829 10.0305 13.2725L9.86048 14.271C9.79048 14.6904 9.42049 15 9.00049 15H6.98047C6.55047 15 6.19049 14.6904 6.12049 14.271L5.95047 13.2725C5.90047 12.9829 5.71047 12.7432 5.45047 12.5934C5.39047 12.5635 5.34049 12.5335 5.28049 12.4936C5.03049 12.3438 4.72049 12.2939 4.44049 12.3937L3.49048 12.7432C3.09048 12.893 2.64048 12.7432 2.43048 12.3638L1.42047 10.6163C1.21047 10.2468 1.29049 9.77746 1.62049 9.50784L2.40048 8.86875C2.63048 8.67903 2.74047 8.38945 2.73047 8.09986V7.90014C2.73047 7.60056 2.62048 7.32097 2.40048 7.13125L1.62049 6.49216C1.29049 6.22254 1.20047 5.75321 1.42047 5.38374L2.43048 3.63624C2.64048 3.26676 3.09049 3.10699 3.50049 3.25677L4.45047 3.60628C4.73047 3.70614 5.03047 3.66619 5.29047 3.50642C5.35047 3.47646 5.40048 3.43651 5.46048 3.40655C5.72048 3.26675 5.91048 3.0271 5.96048 2.72753L6.11048 1.72895Z\" class=\"stroke-linecap-round stroke-linejoin-round\"/><path d=\"M10 8C10 9.1 9.1 10 8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8Z\" class=\"stroke-linecap-round stroke-linejoin-round\"/>",
  "share": "<path d=\"M3.5 11C4.88071 11 6 9.88071 6 8.5C6 7.11929 4.88071 6 3.5 6C2.11929 6 1 7.11929 1 8.5C1 9.88071 2.11929 11 3.5 11Z\" /><path d=\"M12.5 6C13.8807 6 15 4.88071 15 3.5C15 2.11929 13.8807 1 12.5 1C11.1193 1 10 2.11929 10 3.5C10 4.88071 11.1193 6 12.5 6Z\" /><path d=\"M12.5 15C13.8807 15 15 13.8807 15 12.5C15 11.1193 13.8807 10 12.5 10C11.1193 10 10 11.1193 10 12.5C10 13.8807 11.1193 15 12.5 15Z\" /><path d=\"M10.3261 4.70035L5.67834 7.29273\" /><path d=\"M10.2235 11.483L5.77487 9.52324\" />",
  "slash-divider": "<path d=\"M10 2L6 14\" class=\"stroke-linejoin-round\"/>",
  "status-info": "<circle cx=\"8\" cy=\"8\" r=\"7\"/><path d=\"M8 12V7\" /><path d=\"M8 6V4\" />",
  "status-negative": "<circle cx=\"8\" cy=\"8\" r=\"7\"/><path d=\"M5.5 5.5L10.5 10.5\" /><path d=\"M10.5 5.5L5.5 10.5\" />",
  "status-pending": "<circle cx=\"8\" cy=\"8\" r=\"7\" /><path d=\"M8 4V9H4\" class=\"stroke-linejoin-round\"/>",
  "status-positive": "<circle cx=\"8\" cy=\"8\" r=\"7\" /><path d=\"M4.5 7.5L7 10L11 5\" class=\"stroke-linejoin-round\"/>",
  "status-warning": "<path class=\"stroke-linejoin-round\" d=\"M8 5V9\" /><path class=\"stroke-linejoin-round\" d=\"M8 10L8 12\" /><path class=\"stroke-linejoin-round\" d=\"M6.52 1.88L1.19 11.64C1.06 11.87 1 12.14 1 12.4C1 13.28 1.71 13.99 2.59 13.99H13.4C14.28 13.99 14.99 13.28 14.99 12.4C14.99 12.13 14.92 11.87 14.8 11.64L9.48 1.88C9.18 1.34 8.62 1 8 1C7.38 1 6.82 1.34 6.52 1.88Z\" />",
  "ticket": "<path d=\"M13 7.99998C13 6.89998 13.9 5.99998 15 5.99998V3H1V5.99998C2.1 5.99998 3 6.89998 3 7.99998C3 9.09998 2.1 9.99998 1 9.99998V13H15V9.99998C13.9 9.99998 13 9.09998 13 7.99998Z\" class=\"stroke-linejoin-round\"/>",
  "transcript": "<path d=\"M15 1H1V15H15V1Z\" class=\"stroke-linejoin-round\"/><path d=\"M9 10H4\" class=\"stroke-linejoin-round\"/><path d=\"M12 6H4\" class=\"stroke-linejoin-round\"/>",
  "unlocked": "<path d=\"M11 7H3C2.44772 7 2 7.44772 2 8V14C2 14.5523 2.44772 15 3 15H11C11.5523 15 12 14.5523 12 14V8C12 7.44772 11.5523 7 11 7Z\" class=\"stroke-linejoin-round\"/><path d=\"M9 7V4C9 2.35 10.35 1 12 1C13.65 1 15 2.35 15 4\" class=\"stroke-linejoin-round\"/>",
  "upload": "<path d=\"M1 1H15\" class=\"stroke-linejoin-round\"/><path d=\"M13 10L8 5L3 10\" class=\"stroke-linejoin-round awsui-icon-arrow\"/><path d=\"M8 6V15\" class=\"stroke-linejoin-round awsui-icon-arrow\"/>",
  "user-profile": "<path d=\"M8 7C9.66 7 11 5.66 11 4C11 2.34 9.66 1 8 1C6.34 1 5 2.34 5 4C5 5.66 6.34 7 8 7Z\" /><path d=\"M2 16V13C2 11.34 3.34 10 5 10H11C12.66 10 14 11.34 14 13V16\" class=\"stroke-linejoin-round\"/>",
  "user-profile-active": "<path d=\"M8 6C9.38 6 10.5 4.88 10.5 3.5C10.5 2.12 9.38 1 8 1C6.62 1 5.5 2.12 5.5 3.5C5.5 4.88 6.62 6 8 6Z\" class=\"filled\" /><path d=\"M2 15.5V12.5C2 10.84 3.34 9.5 5 9.5H11C12.66 9.5 14 10.84 14 12.5V15.5\" class=\"filled\"/><path d=\"M2 15.5V12.5C2 10.84 3.34 9.5 5 9.5H11C12.66 9.5 14 10.84 14 12.5V15.5\" class=\"stroke-linejoin-round\"/>",
  "video-camera-on": "<path d=\"M11 6V3H1V12.97L11 13V10L15 13V3.04L11 6Z\" class=\"stroke-linejoin-round\"/>",
  "view-horizontal": "<path class=\"stroke-linejoin-round\" d=\"M15 15V1L1 1V15H15Z\" /><path class=\"filled no-stroke\" d=\"M11.5 7H4.5C4.22386 7 4 7.22386 4 7.5V11.5C4 11.7761 4.22386 12 4.5 12H11.5C11.7761 12 12 11.7761 12 11.5V7.5C12 7.22386 11.7761 7 11.5 7Z\"/>",
  "view-vertical": "<path class=\"stroke-linejoin-round\" d=\"M15 1H1V15H15V1Z\" /><path class=\"filled no-stroke\" d=\"M11.5 4H7.5C7.22386 4 7 4.22386 7 4.5V11.5C7 11.7761 7.22386 12 7.5 12H11.5C11.7761 12 12 11.7761 12 11.5V4.5C12 4.22386 11.7761 4 11.5 4Z\" />",
  "zoom-in": "<circle cx=\"7\" cy=\"7\" r=\"6\" /><path d=\"M11 11L15 15\" /><path d=\"M7 4V10\" class=\"awsui-icon-arm\"/><path d=\"M4 7L10 7.01\" class=\"awsui-icon-arm\"/>"
};

  function render(el) {
    var name = el.getAttribute('data-ico');
    var d = ICONS[name];
    if (!d) { return; }            // unknown name: leave content untouched
    el.innerHTML = '<svg class="cs-ico" viewBox="0 0 16 16" role="img" aria-hidden="true" focusable="false">' + d + '</svg>';
    el.classList.add('has-cs-ico');
  }

  function upgradeAll(root) {
    var nodes = (root || document).querySelectorAll('[data-ico]');
    for (var i = 0; i < nodes.length; i++) { render(nodes[i]); }
  }

  // Expose for dynamically-injected markup (e.g. nav-panel.js, lab verdicts).
  window.CSIcons = { names: Object.keys(ICONS), render: render, upgradeAll: upgradeAll, svg: function (name, cls) {
    var d = ICONS[name];
    if (!d) { return ''; }
    return '<svg class="cs-ico ' + (cls || '') + '" viewBox="0 0 16 16" role="img" aria-hidden="true" focusable="false">' + d + '</svg>';
  } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { upgradeAll(); });
  } else {
    upgradeAll();
  }
})();
