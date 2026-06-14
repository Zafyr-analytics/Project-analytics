import { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   ZAFYR ANALYTICS v3
   Dual theme : DARK (vert-encre / or) · LIGHT (ivoire / forêt / or brûlé)
   Animations 3D :
     - Page-in  : rotateX(8°) → 0 avec perspective 1400px
     - Scroll   : rotateX(14°) + translateZ(-40px) → flat, par vagues
     - Cards    : tilt 3D live au survol (mousemove)
     - Hero     : widget flottant avec ombre de profondeur
     - Toggle   : icône qui fait un flip Y 180°
   ============================================================ */

/* DARK — noir profond & or champagne. Registre maison de gestion privée. */
const DARK = {
  bg:        "#0A0A0B",
  surface:   "#121214",
  surface2:  "#1A1A1D",
  line:      "#272729",
  text:      "#F4F2ED",
  muted:     "#8C8A85",
  gold:      "#C9A227",
  goldSoft:  "rgba(201,162,39,0.10)",
  pos:       "#4FB286",
  neg:       "#D1654A",
  shadow:    "rgba(0,0,0,0.72)",
};

/* LIGHT — blanc cassé tiède & or bronze. Papier épais, encre noire. */
const LIGHT = {
  bg:        "#F6F4EF",
  surface:   "#FFFFFF",
  surface2:  "#ECE9E1",
  line:      "#DCD7CC",
  text:      "#16161A",
  muted:     "#6E6B63",
  gold:      "#9A7B1F",
  goldSoft:  "rgba(154,123,31,0.09)",
  pos:       "#2E7D54",
  neg:       "#B24A2E",
  shadow:    "rgba(20,18,12,0.13)",
};

function tokens(t) {
  return `
  --bg:       ${t.bg};
  --surface:  ${t.surface};
  --surface2: ${t.surface2};
  --line:     ${t.line};
  --text:     ${t.text};
  --muted:    ${t.muted};
  --gold:     ${t.gold};
  --gold-s:   ${t.goldSoft};
  --pos:      ${t.pos};
  --neg:      ${t.neg};
  --shadow:   ${t.shadow};
  `;
}

const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root { ${tokens(DARK)} }
:root.light { ${tokens(LIGHT)} }

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

.za { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif;
  font-size:16px; line-height:1.65; -webkit-font-smoothing:antialiased;
  min-height:100vh; display:flex; flex-direction:column;
  transition: background .4s, color .4s; }
.za-main { flex:1; }
.za-con { max-width:1100px; margin:0 auto; padding:0 24px; width:100%; }

/* -------- Typography -------- */
.za-display { font-family:'Fraunces',Georgia,serif; }
.za-mono    { font-family:'IBM Plex Mono',monospace; }
.za-h1 {
  font-family:'Fraunces',serif; font-weight:400;
  font-size:clamp(34px,5.2vw,56px); line-height:1.06;
  letter-spacing:-0.015em; margin-bottom:20px;
}
.za-h1 em { font-style:italic; color:var(--gold); }
.za-h2 {
  font-family:'Fraunces',serif; font-weight:400;
  font-size:clamp(26px,3.8vw,40px); line-height:1.15; margin-bottom:16px;
}
.za-h3 { font-family:'Fraunces',serif; font-weight:400; font-size:22px; margin-bottom:12px; }
.za-lede { color:var(--muted); max-width:600px; margin-bottom:44px; }
.za-eyebrow {
  font-family:'IBM Plex Mono',monospace; font-size:11.5px;
  letter-spacing:.16em; text-transform:uppercase; color:var(--gold);
  display:flex; align-items:center; gap:12px; margin-bottom:18px;
}
.za-eyebrow::after { content:''; flex:0 0 40px; height:1px; background:var(--line); }

/* -------- Sections -------- */
.za-sec { padding:88px 0; }
.za-sec + .za-sec { border-top:1px solid var(--line); }

/* -------- Nav -------- */
.za-nav {
  position:sticky; top:0; z-index:50;
  border-bottom:1px solid var(--line);
  transition: background .4s, border-color .4s;
}
.za-nav::before {
  content:''; position:absolute; inset:0;
  background:var(--bg); opacity:.88;
  backdrop-filter:blur(14px); z-index:-1;
  transition: background .4s;
}
.za-nav-inner {
  max-width:1100px; margin:0 auto; padding:0 24px;
  height:64px; display:flex; align-items:center; justify-content:space-between;
}
.za-logo {
  font-family:'Fraunces',serif; font-weight:500; font-size:18px;
  cursor:pointer; background:none; border:none; color:var(--text);
  transition: color .3s;
}
.za-logo span { color:var(--gold); }
.za-nav-row { display:flex; gap:22px; align-items:center; }
.za-nav-link {
  background:none; border:none; color:var(--muted);
  font-family:'Inter',sans-serif; font-size:14px; cursor:pointer; padding:4px 0;
  transition:color .2s; border-bottom:2px solid transparent;
}
.za-nav-link:hover { color:var(--text); }
.za-nav-link.act { color:var(--text); border-bottom-color:var(--gold); }

/* Theme toggle */
.za-toggle {
  background:none; border:1px solid var(--line);
  border-radius:8px; width:36px; height:36px; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:17px; transition:border-color .2s;
  transform-origin:center; perspective:200px;
}
.za-toggle:hover { border-color:var(--gold); }
.za-toggle.spin { animation: toggleFlip .35s ease; }
@keyframes toggleFlip {
  0%   { transform:rotateY(0deg); }
  50%  { transform:rotateY(90deg); }
  100% { transform:rotateY(0deg); }
}

.za-nav-cta {
  background:var(--gold); color:var(--bg);
  border:none; font-family:'Inter',sans-serif; font-weight:600;
  font-size:13.5px; padding:9px 18px; border-radius:6px;
  cursor:pointer; transition:opacity .2s, transform .15s;
}
.za-nav-cta:hover { opacity:.9; transform:translateY(-1px); }

/* Burger */
.za-burger {
  display:none; background:none; border:1px solid var(--line);
  border-radius:6px; color:var(--text); font-size:17px;
  width:38px; height:38px; cursor:pointer; transition: border-color .2s;
}
.za-burger:hover { border-color: var(--gold); }
.za-mob { display:none; flex-direction:column;
  border-top:1px solid var(--line); padding:12px 24px 16px;
  background:var(--bg); transition: background .4s; }
.za-mob .za-nav-link { padding:10px 0; font-size:15px; text-align:left; }
@media(max-width:860px){
  .za-nav-row .za-nav-link,.za-nav-cta { display:none; }
  .za-burger { display:flex; align-items:center; justify-content:center; }
  .za-mob.open { display:flex; }
}

/* Breadcrumbs */
.za-crumbs {
  padding:20px 0 0;
  font-family:'IBM Plex Mono',monospace; font-size:12px;
  color:var(--muted); display:flex; flex-wrap:wrap;
  gap:8px; align-items:center;
}
.za-crumb { background:none; border:none; color:var(--muted);
  cursor:pointer; font-family:inherit; font-size:inherit; padding:0; transition:color .2s; }
.za-crumb:hover { color:var(--gold); }
.za-crumb-cur { color:var(--text); }
.za-crumb-sep { color:var(--line); }

/* -------- Buttons -------- */
.za-btn {
  background:var(--gold); color:var(--bg); border:none;
  font-family:'Inter',sans-serif; font-weight:600; font-size:15px;
  padding:13px 26px; border-radius:6px; cursor:pointer;
  transition:transform .15s, opacity .2s;
}
.za-btn:hover { opacity:.92; transform:translateY(-2px); }
.za-btn-o {
  background:transparent; color:var(--text); border:1px solid var(--line);
  font-family:'Inter',sans-serif; font-weight:500; font-size:15px;
  padding:13px 26px; border-radius:6px; cursor:pointer;
  transition:border-color .2s, background .2s, transform .15s;
}
.za-btn-o:hover { border-color:var(--gold); background:var(--gold-s); transform:translateY(-2px); }
.za-btn-g {
  background:transparent; border:1px solid var(--gold); color:var(--gold);
  font-family:'Inter',sans-serif; font-weight:600; font-size:13.5px;
  padding:9px 18px; border-radius:6px; cursor:pointer;
  transition:background .2s, color .2s;
}
.za-btn-g:hover { background:var(--gold); color:var(--bg); }

/* -------- Tags -------- */
.za-tag {
  font-family:'IBM Plex Mono',monospace; font-size:11px;
  color:var(--gold); background:var(--gold-s);
  padding:3px 8px; border-radius:4px;
}

/* -------- Hero -------- */
.za-hero { padding:80px 0 96px; overflow:hidden; }
.za-hero-grid { display:grid; grid-template-columns:1.1fr .9fr; gap:60px; align-items:center; }
@media(max-width:900px){ .za-hero-grid { grid-template-columns:1fr; gap:48px; } }
.za-hero-sub { color:var(--muted); font-size:17px; max-width:480px; margin-bottom:32px; }
.za-cta-row { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:34px; }
.za-points { display:flex; flex-wrap:wrap; gap:10px 20px; }
.za-point {
  font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--muted);
  display:flex; align-items:center; gap:7px;
}
.za-point::before { content:'▸'; color:var(--gold); font-size:9px; }

/* -------- 3D Widget -------- */
.za-widget-wrap {
  perspective:1200px;
  transform-style:preserve-3d;
}
.za-widget {
  position:relative; overflow:hidden;
  background:
    radial-gradient(120% 100% at 0% 0%, var(--gold-s), transparent 55%),
    var(--surface);
  border:1px solid var(--line);
  border-radius:14px; padding:22px;
  box-shadow:0 36px 70px var(--shadow), 0 2px 8px var(--shadow), inset 0 1px 0 rgba(255,255,255,.04);
  transform:rotateX(5deg) rotateY(-4deg);
  transition: transform .55s cubic-bezier(.22,.8,.3,1), box-shadow .55s;
}
.za-widget::after {
  content:''; position:absolute; top:0; left:-60%;
  width:50%; height:100%;
  background:linear-gradient(105deg, transparent, rgba(255,255,255,.07), transparent);
  transform:skewX(-18deg); transition:left .8s ease; pointer-events:none;
}
.za-widget-wrap:hover .za-widget {
  transform:rotateX(0deg) rotateY(0deg) translateZ(20px);
  box-shadow:0 56px 110px var(--shadow), 0 0 0 1px var(--gold-s), 0 2px 8px var(--shadow);
}
.za-widget-wrap:hover .za-widget::after { left:120%; }
.za-whead {
  display:flex; justify-content:space-between; align-items:baseline;
  margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid var(--line);
}
.za-wtitle { font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
.za-wperiod { font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--gold); }
.za-wrow { margin-bottom:16px; }
.za-wrow:last-child { margin-bottom:0; }
.za-wrow-top { display:flex; justify-content:space-between; align-items:baseline; gap:8px; flex-wrap:wrap; margin-bottom:6px; }
.za-wrow-label { font-size:13.5px; font-weight:500; }
.za-wrow-nums { font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--muted); }
.za-wdelta { font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:500; margin-left:8px; }
.pos { color:var(--pos); }
.neg { color:var(--neg); }
.za-bars { position:relative; height:18px; }
.za-bar { position:absolute; left:0; height:7px; border-radius:4px; transition:width 1.2s cubic-bezier(.22,.8,.3,1); }
.za-bar-b { top:0; background:var(--line); }
.za-bar-a { bottom:0; }
.za-bar-a.pos { background:var(--pos); }
.za-bar-a.neg { background:var(--neg); }
.za-wfoot {
  margin-top:18px; padding-top:14px; border-top:1px solid var(--line);
  display:flex; gap:16px; flex-wrap:wrap;
  font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--muted);
}
.za-leg { display:flex; align-items:center; gap:5px; }
.za-sw { width:13px; height:5px; border-radius:3px; }

/* -------- Pillars -------- */
.za-pillars { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:44px; }
@media(max-width:900px){ .za-pillars { grid-template-columns:repeat(2,1fr); } }
@media(max-width:560px){ .za-pillars { grid-template-columns:1fr; } }
.za-pillar {
  position:relative;
  background:var(--surface); border:1px solid var(--line);
  border-radius:12px; padding:24px 20px;
  transition:border-color .3s, box-shadow .35s;
  will-change:transform; transform-style:preserve-3d;
  cursor:default;
}
.za-pillar:hover { border-color:var(--gold); }
.za-pillar:hover .za-pillar-icon { text-shadow:0 0 22px var(--gold); }
.za-pillar-icon { font-size:22px; margin-bottom:14px; display:block; color:var(--gold); transition:text-shadow .35s; }
.za-pillar h3 { font-size:15px; font-weight:600; margin-bottom:8px; }
.za-pillar p { font-size:13.5px; color:var(--muted); line-height:1.55; }
.za-pillar-tags { margin-top:12px; display:flex; flex-wrap:wrap; gap:6px; }

/* -------- Certifs -------- */
.za-certs { display:flex; gap:12px; overflow-x:auto; padding-bottom:8px; }
.za-cert {
  flex:0 0 auto; background:var(--surface2); border:1px solid var(--line);
  border-radius:8px; padding:12px 18px;
  font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--muted);
  white-space:nowrap; transition: border-color .2s;
}
.za-cert:hover { border-color:var(--gold); }
.za-cert b { color:var(--text); font-weight:500; display:block; margin-bottom:2px; }

/* -------- Service cards -------- */
.za-svcs { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
@media(max-width:820px){ .za-svcs { grid-template-columns:1fr; } }
.za-svc {
  position:relative; overflow:hidden;
  background:var(--surface); border:1px solid var(--line);
  border-radius:12px; padding:28px; display:flex; flex-direction:column;
  transition:border-color .3s, box-shadow .3s;
  cursor:pointer; text-align:left; color:var(--text);
  font-family:'Inter',sans-serif; will-change:transform;
  transform-style:preserve-3d;
}
.za-svc::after {
  content:''; position:absolute; top:0; left:-70%;
  width:55%; height:100%;
  background:linear-gradient(105deg, transparent, var(--gold-s), transparent);
  transform:skewX(-18deg); transition:left .7s ease; pointer-events:none;
}
.za-svc:hover { border-color:var(--gold); }
.za-svc:hover::after { left:130%; }
.za-svc-head { display:flex; justify-content:space-between; align-items:baseline; gap:12px; margin-bottom:10px; }
.za-svc h3 { font-family:'Fraunces',serif; font-weight:400; font-size:20px; line-height:1.25; }
.za-dur { font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--gold); white-space:nowrap; }
.za-svc-desc { color:var(--muted); font-size:14px; margin-bottom:16px; }
.za-svc ul { list-style:none; margin-bottom:20px; flex:1; }
.za-svc li { font-size:13.5px; padding:5px 0 5px 18px; position:relative; }
.za-svc li::before { content:'—'; position:absolute; left:0; color:var(--gold); }
.za-svc-foot { display:flex; justify-content:space-between; align-items:center; gap:12px; }
.za-price { font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--muted); }
.za-flex-note { margin-top:20px; font-size:13px; color:var(--muted); font-style:italic; }

/* -------- Projects -------- */
.za-projs { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
@media(max-width:820px){ .za-projs { grid-template-columns:1fr; } }
.za-proj {
  background:var(--surface); border:1px solid var(--line);
  border-radius:12px; overflow:hidden; transition:border-color .2s, box-shadow .3s;
  will-change:transform; transform-style:preserve-3d;
}
.za-proj:hover { border-color:var(--gold); }
.za-proj-vis {
  height:176px; border-bottom:1px solid var(--line);
  background:var(--surface2); display:flex; align-items:flex-end;
  gap:7px; padding:20px;
}
.za-mbar { flex:1; border-radius:3px 3px 0 0; background:var(--line); }
.za-mbar.g { background:var(--gold); opacity:.8; }
.za-mbar.p { background:var(--pos); opacity:.7; }
.za-proj-body { padding:24px; }
.za-proj h3 { font-family:'Fraunces',serif; font-weight:400; font-size:19px; margin-bottom:9px; }
.za-proj p { font-size:14px; color:var(--muted); margin-bottom:13px; }
.za-proj-impact { font-size:13px; margin-bottom:15px; padding-left:14px; border-left:2px solid var(--gold); }
.za-proj-tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:18px; }
.za-proj-link {
  background:none; border:none; color:var(--gold);
  font-family:'Inter',sans-serif; font-weight:600; font-size:14px;
  cursor:pointer; padding:0; transition: opacity .2s;
}
.za-proj-link:hover { opacity:.7; }

/* -------- Detail page -------- */
.za-dhero { padding:56px 0 44px; border-bottom:1px solid var(--line); }
.za-dmeta { display:flex; gap:24px; flex-wrap:wrap; margin-top:22px; }
.za-dmi { font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--muted); }
.za-dmi b { color:var(--gold); font-weight:500; display:block; margin-bottom:2px; font-size:11px; text-transform:uppercase; letter-spacing:.08em; }
.za-dgrid { display:grid; grid-template-columns:1.15fr .85fr; gap:52px; align-items:start; }
@media(max-width:860px){ .za-dgrid { grid-template-columns:1fr; gap:36px; } }
.za-steps { list-style:none; margin-top:28px; }
.za-step { position:relative; padding:0 0 28px 52px; border-left:1px solid var(--line); margin-left:17px; }
.za-step:last-child { border-left-color:transparent; padding-bottom:0; }
.za-step-n {
  position:absolute; left:-18px; top:0;
  width:36px; height:36px; border-radius:50%;
  background:var(--surface); border:1px solid var(--gold);
  color:var(--gold); font-family:'IBM Plex Mono',monospace; font-size:13px;
  display:flex; align-items:center; justify-content:center;
  transition: background .3s;
}
.za-step:hover .za-step-n { background:var(--gold); color:var(--bg); }
.za-step h4 { font-size:15.5px; font-weight:600; margin-bottom:4px; }
.za-step-when { font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--gold); margin-bottom:6px; }
.za-step p { font-size:14px; color:var(--muted); }
.za-scard {
  background:var(--surface); border:1px solid var(--line);
  border-radius:12px; padding:24px; margin-bottom:16px;
  transition: border-color .2s;
}
.za-scard:hover { border-color: var(--line); }
.za-scard h4 {
  font-family:'IBM Plex Mono',monospace; font-size:11px;
  text-transform:uppercase; letter-spacing:.1em; color:var(--gold); margin-bottom:12px;
}
.za-scard ul { list-style:none; }
.za-scard li { font-size:14px; padding:6px 0 6px 18px; position:relative; }
.za-scard li::before { content:'✓'; position:absolute; left:0; color:var(--pos); font-size:12px; }
.za-scard.who li::before { content:'▸'; color:var(--gold); }
.za-faq-item { border-bottom:1px solid var(--line); }
.za-faq-q {
  width:100%; background:none; border:none; color:var(--text);
  font-family:'Inter',sans-serif; font-size:15px; font-weight:500;
  text-align:left; padding:18px 0; cursor:pointer;
  display:flex; justify-content:space-between; align-items:center; gap:16px;
}
.za-faq-q span { color:var(--gold); font-size:18px; flex-shrink:0; }
.za-faq-a { font-size:14px; color:var(--muted); padding:0 0 18px; max-width:640px; }
.za-dcta {
  margin-top:56px; background:var(--surface); border:1px solid var(--gold);
  border-radius:12px; padding:36px;
  display:flex; justify-content:space-between; align-items:center; gap:24px; flex-wrap:wrap;
}
.za-pager { display:flex; justify-content:space-between; gap:16px; margin-top:40px; flex-wrap:wrap; }
.za-pager-btn {
  background:none; border:1px solid var(--line); border-radius:8px;
  color:var(--text); padding:14px 18px; cursor:pointer;
  font-family:'Inter',sans-serif; font-size:13.5px; text-align:left;
  transition:border-color .2s, transform .15s; flex:1; max-width:48%;
}
.za-pager-btn:hover { border-color:var(--gold); transform:translateY(-2px); }
.za-pager-btn small { display:block; font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--muted); margin-bottom:4px; }

/* -------- About -------- */
.za-agrid { display:grid; grid-template-columns:.85fr 1.15fr; gap:52px; align-items:start; }
@media(max-width:820px){ .za-agrid { grid-template-columns:1fr; gap:32px; } }
.za-portrait {
  aspect-ratio:4/5; background:var(--surface); border:1px solid var(--line);
  border-radius:12px; display:flex; align-items:center; justify-content:center;
  font-family:'Fraunces',serif; font-size:64px; color:var(--gold); max-width:300px;
  box-shadow:0 24px 48px var(--shadow);
}
.za-atext p { color:var(--muted); margin-bottom:16px; font-size:15.5px; }
.za-atext strong { color:var(--text); font-weight:600; }
.za-aquote {
  font-family:'Fraunces',serif; font-style:italic; font-size:20px;
  color:var(--text); margin:24px 0; padding-left:18px;
  border-left:2px solid var(--gold); line-height:1.45;
}
.za-socials { display:flex; gap:12px; margin-top:24px; flex-wrap:wrap; }
.za-social {
  border:1px solid var(--line); background:var(--surface); color:var(--text);
  font-family:'IBM Plex Mono',monospace; font-size:13px;
  padding:9px 18px; border-radius:6px; cursor:pointer;
  transition:border-color .2s; text-decoration:none;
}
.za-social:hover { border-color:var(--gold); }

/* -------- Contact -------- */
.za-cgrid { display:grid; grid-template-columns:.9fr 1.1fr; gap:52px; }
@media(max-width:820px){ .za-cgrid { grid-template-columns:1fr; gap:36px; } }
.za-cinfo p { color:var(--muted); margin-bottom:20px; }
.za-cemail {
  font-family:'IBM Plex Mono',monospace; font-size:15px; color:var(--gold);
  display:inline-block; margin-bottom:8px; text-decoration:none;
}
.za-cemail:hover { text-decoration:underline; }
.za-crt { font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--muted); }
.za-field { margin-bottom:16px; }
.za-field label { display:block; font-size:13px; font-weight:500; margin-bottom:6px; }
.za-field label span { color:var(--muted); font-weight:400; }
.za-inp,.za-ta,.za-sel {
  width:100%; background:var(--surface); border:1px solid var(--line);
  border-radius:7px; color:var(--text);
  font-family:'Inter',sans-serif; font-size:14.5px; padding:11px 14px;
  outline:none; transition:border-color .2s, background .3s;
}
.za-inp:focus,.za-ta:focus,.za-sel:focus { border-color:var(--gold); }
.za-ta { resize:vertical; min-height:120px; }
.za-sel { appearance:none; cursor:pointer; }
.za-form2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
@media(max-width:560px){ .za-form2 { grid-template-columns:1fr; } }
.za-err { color:var(--neg); font-size:12.5px; margin-top:4px; }
.za-ok { background:var(--surface); border:1px solid var(--pos); border-radius:10px; padding:28px; text-align:center; }
.za-ok h3 { font-family:'Fraunces',serif; font-size:22px; margin-bottom:8px; color:var(--pos); }
.za-ok p { color:var(--muted); font-size:14.5px; }

/* -------- Footer -------- */
.za-footer { border-top:1px solid var(--line); padding:56px 0 36px; }
.za-sitemap { display:grid; grid-template-columns:1.2fr repeat(3,1fr); gap:32px; margin-bottom:44px; }
@media(max-width:820px){ .za-sitemap { grid-template-columns:1fr 1fr; } }
@media(max-width:520px){ .za-sitemap { grid-template-columns:1fr; } }
.za-sitemap h5 {
  font-family:'IBM Plex Mono',monospace; font-size:11.5px;
  text-transform:uppercase; letter-spacing:.1em; color:var(--gold); margin-bottom:14px;
}
.za-sitemap-brand p { color:var(--muted); font-size:13.5px; max-width:240px; margin-top:10px; }
.za-sitemap ul { list-style:none; }
.za-sitemap li { margin-bottom:8px; }
.za-slink {
  background:none; border:none; color:var(--muted);
  font-family:'Inter',sans-serif; font-size:13.5px;
  cursor:pointer; padding:0; text-align:left; transition:color .2s; text-decoration:none; display:inline-block;
}
.za-slink:hover { color:var(--text); }
.za-fbot {
  border-top:1px solid var(--line); padding-top:22px;
  display:flex; justify-content:space-between; align-items:center;
  gap:16px; flex-wrap:wrap;
  font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--muted);
}

/* -------- 3D scroll reveal -------- */
.za-3d {
  opacity:0;
  transform:perspective(1000px) rotateX(14deg) translateZ(-30px) translateY(20px);
  transition:opacity .75s ease, transform .85s cubic-bezier(.22,.8,.3,1);
  transition-delay:var(--delay,0s);
}
.za-3d.in {
  opacity:1;
  transform:perspective(1000px) rotateX(0deg) translateZ(0) translateY(0);
}

/* -------- Page transition -------- */
.za-page {
  animation:pageIn .55s cubic-bezier(.22,.8,.3,1) both;
}
@keyframes pageIn {
  from {
    opacity:0;
    transform:perspective(1400px) rotateX(8deg) translateY(28px);
  }
  to {
    opacity:1;
    transform:perspective(1400px) rotateX(0deg) translateY(0);
  }
}

/* -------- reduced motion -------- */
@media(prefers-reduced-motion:reduce){
  .za-page { animation:none; }
  .za-3d { opacity:1; transform:none; transition:none; }
  .za-bar { transition:none; }
  .za-widget { transform:none; }
}
`;

/* ============================================================  DATA  */

const VW = [
  { label:"Chiffre d'affaires", budget:1240, actual:1318, fav:true },
  { label:"Marge brute",        budget:558,  actual:601,  fav:true },
  { label:"OPEX",               budget:410,  actual:436,  fav:false },
  { label:"EBITDA",             budget:148,  actual:165,  fav:true },
];

const PILLARS = [
  { icon:"⛁", title:"Data Engineering",  desc:"Pipelines fiables, testés, documentés, versionnés.",         tags:["SQL","dbt","Python"] },
  { icon:"▦", title:"BI & Reporting",     desc:"Dashboards exécutifs conçus pour la décision.",              tags:["Power BI","DAX","Power Query"] },
  { icon:"Σ", title:"Finance & FP&A",     desc:"Budget vs réel, forecasting, variances, design KPIs.",       tags:["Budgeting","Forecasting","Variances"] },
  { icon:"⇶", title:"Cloud & Scalabilité",desc:"Entrepôt cloud + transformation dbt qui tient la croissance.",tags:["BigQuery","dbt Cloud"] },
];

const CERTS = [
  {org:"Google",name:"Data Analytics"},
  {org:"Google",name:"Advanced Data Analytics"},
  {org:"SQL",name:"Niveau consultant"},
  {org:"Python",name:"Parcours 1–4"},
  {org:"Stats",name:"Cursus complet"},
  {org:"Wharton",name:"Finance d'entreprise"},
];

const SERVICES = [
  {
    slug:"analytics-fpa", title:"Mise en place Analytics FP&A", duration:"3–4 semaines", pricing:"Devis après audit",
    desc:"L'infrastructure data complète pour piloter votre performance financière.",
    points:["Audit de vos données actuelles","Architecture dbt (staging → marts)","Modèles Budget vs Réel","Dashboard exécutif Power BI","Documentation complète"],
    detailIntro:"Votre reporting vit dans des Excel croisés par email ? Cette offre pose les fondations : infrastructure propre, modèles FP&A testés, premier dashboard exécutif. Tout est documenté pour que votre équipe garde la maîtrise.",
    who:["PME / ETI sans infrastructure data","Reporting actuel manuel","DAF qui veut industrialiser"],
    deliverables:["Infrastructure dbt opérationnelle","Modèles Budget vs Réel + variances","Dashboard exécutif Power BI","Documentation technique et métier","Session de transfert de compétences"],
    steps:[
      {title:"Audit des données",    when:"Jours 1–3",    desc:"Cartographie des sources (ERP, compta, CRM), qualité, besoins métier."},
      {title:"Architecture dbt",     when:"Semaine 1–2",  desc:"Design des couches staging et marts, pensé FP&A, pas générique."},
      {title:"Modèles FP&A",         when:"Semaine 2–3",  desc:"Budget vs Réel, variances, tests automatisés sur chaque transformation."},
      {title:"Dashboard exécutif",   when:"Semaine 3–4",  desc:"Power BI connecté aux marts, validé en itérations courtes."},
      {title:"Formation & handover", when:"Dernier jour", desc:"Session de prise en main, documentation remise, équipe autonome."},
    ],
    faq:[
      {q:"Faut-il déjà un data warehouse ?",        a:"Non. Le setup BigQuery fait partie de la mission si besoin."},
      {q:"Combien de temps mobilise-t-on votre équipe ?", a:"2 à 3 heures par semaine : cadrage, validations rapides, formation finale."},
      {q:"Qui possède le code après livraison ?",   a:"Vous. Repo Git à votre nom, accès admin transférés."},
    ],
  },
  {
    slug:"dashboard-reporting", title:"Dashboard & Reporting FP&A", duration:"2–3 semaines", pricing:"Devis selon scope",
    desc:"Un dashboard sur mesure connecté à vos données existantes.",
    points:["Design centré sur vos décisions","Intégration de vos sources","Variances, KPIs, tendances","Formation utilisateurs (30 min)","Doc + tutoriel vidéo"],
    detailIntro:"Vos données existent mais le reporting prend des jours et personne ne lit les 40 pages. Cette offre conçoit un dashboard Power BI sur mesure : chaque visuel répond à une décision réelle.",
    who:["Équipes finance avec données accessibles","Reporting lent ou illisible","Besoin d'un pilotage visuel partagé"],
    deliverables:["Dashboard Power BI sur mesure","Connexions aux sources","Documentation utilisateur","Tutoriel vidéo","Session de formation 30 min"],
    steps:[
      {title:"Cadrage des décisions",   when:"Jours 1–2",  desc:"Quelles décisions doit servir ce dashboard ? On part du besoin, pas des données."},
      {title:"Maquette validée",        when:"Jours 3–5",  desc:"Structure visuelle validée avant toute ligne de DAX."},
      {title:"Intégration des données", when:"Semaine 2",  desc:"Connexion aux sources, modèle Power BI propre, mesures DAX documentées."},
      {title:"Itérations & recette",    when:"Semaine 2–3",desc:"Deux à trois cycles de feedback courts jusqu'à validation."},
      {title:"Formation & livraison",   when:"Dernier jour",desc:"30 minutes, doc et tutoriel vidéo remis."},
    ],
    faq:[
      {q:"Quelles sources pouvez-vous connecter ?", a:"Excel, SQL, BigQuery, exports ERP/compta, Google Sheets, API selon les cas."},
      {q:"Qui maintient le dashboard ensuite ?",    a:"Votre équipe, grâce à la documentation. Un forfait de maintenance est possible."},
      {q:"Faut-il des licences Power BI ?",         a:"Oui, des licences Pro (~10 €/mois/personne). Je vous aide à dimensionner."},
    ],
  },
  {
    slug:"forecasting-variance", title:"Forecasting & Variance Analysis", duration:"~2 semaines", pricing:"Devis selon complexité",
    desc:"Des prévisions outillées et un reporting d'écarts automatisé.",
    points:["Audit du process budgétaire","Modèles forecasting (Python / dbt)","Variance reporting automatisé","Formation à l'utilisation","Rapports mensuels prêts"],
    detailIntro:"Votre forecast se fait au doigt mouillé et les écarts arrivent trop tard pour agir ? Cette offre outille votre process : modèles de prévision adaptés et reporting d'écarts qui tourne tout seul chaque mois.",
    who:["Process budgétaire manuel","Forecasts peu fiables ou lents","Écarts analysés trop tard"],
    deliverables:["Modèles forecasting Python / dbt","Variance reporting automatisé","Rapports mensuels prêts","Documentation des hypothèses","Formation à l'utilisation"],
    steps:[
      {title:"Audit du process",      when:"Jours 1–3",  desc:"Comment construisez-vous budget et forecast ? Quels irritants ?"},
      {title:"Modèles forecasting",   when:"Semaine 1–2",desc:"Saisonnalité, drivers métier, scénarios. Python et dbt, hypothèses documentées."},
      {title:"Automatisation écarts", when:"Semaine 2",  desc:"Budget vs Réel vs Forecast tourne automatiquement, plus de retraitement manuel."},
      {title:"Formation & passation", when:"Derniers jours",desc:"Votre équipe sait faire tourner les modèles et ajuster les hypothèses."},
    ],
    faq:[
      {q:"Quelle précision attendre ?",    a:"Dépend de votre activité et historique. L'audit donne une estimation honnête."},
      {q:"À quelle fréquence les rapports ?", a:"Au rythme de votre clôture : mensuel le plus souvent."},
      {q:"Quels outils faut-il avoir ?",   a:"Un accès à vos données historiques. Python et dbt sont installés si besoin."},
    ],
  },
  {
    slug:"data-engineering-dbt", title:"Data Engineering (dbt)", duration:"2–3 semaines", pricing:"Devis selon scope",
    desc:"Vos pipelines migrés vers une modélisation scalable et testée.",
    points:["Optimisation des pipelines","Migration vers dbt","Tests + documentation best practices","Setup CI/CD","Repo GitHub + dbt docs"],
    detailIntro:"Vos transformations SQL sont éparpillées ou fragiles ? Cette offre migre le tout vers dbt : modélisation versionnée, testée, documentée — une base saine pour construire.",
    who:["Pipelines SQL existants mais fragiles","Équipe data qui veut adopter dbt","Besoin de fiabiliser avant de scaler"],
    deliverables:["Pipelines migrés vers dbt","Tests automatisés","dbt docs générée","CI/CD configuré (GitHub Actions)","Repo GitHub structuré"],
    steps:[
      {title:"Audit des pipelines",   when:"Jours 1–3",  desc:"Inventaire des transformations, dépendances, points de fragilité."},
      {title:"Plan de migration",     when:"Jours 4–5",  desc:"Ordre de migration validé, sans interrompre votre production."},
      {title:"Migration dbt",         when:"Semaine 2",  desc:"Modèles staging, intermediate, marts. Conventions best practices."},
      {title:"Tests & documentation", when:"Semaine 2–3",desc:"Tests de qualité, documentation générée, lineage visible."},
      {title:"CI/CD & handover",      when:"Derniers jours",desc:"Pipeline CI/CD opérationnel, repo transféré, équipe formée."},
    ],
    faq:[
      {q:"Avec quels entrepôts dbt fonctionne-t-il ?", a:"BigQuery, Snowflake, Redshift, Postgres, Databricks…"},
      {q:"Y a-t-il une interruption de service ?",     a:"Non. Ancien et nouveau pipeline tournent en parallèle jusqu'à validation."},
      {q:"Mon équipe saura-t-elle maintenir ?",        a:"C'est l'objectif : conventions claires, documentation, formation aux workflows dbt."},
    ],
  },
];

const PROJECTS = [
  {
    title:"Budget vs Actuals Dashboard",
    desc:"Pipeline FP&A complet sur données retail synthétiques : dbt (staging/marts) → dashboard exécutif Power BI.",
    impact:"Variance analysis, suivi budgétaire et KPI trends dans un seul écran.",
    tags:["dbt","SQL","Power BI","BigQuery"],
    bars:[.45,.7,.55,.85,.6,.95],
  },
  {
    title:"Financial Analytics — données publiques",
    desc:"Budgets de collectivités françaises (data.gouv.fr) : nettoyage, modélisation dbt, restitution Power BI.",
    impact:"Transformer des données réelles et hétérogènes en analyse exploitable.",
    tags:["dbt","Power BI","Python","Open Data"],
    bars:[.8,.5,.65,.4,.9,.55],
  },
];

const PAGES = {
  home:"Accueil", expertise:"Expertise", services:"Services",
  portfolio:"Portfolio", about:"À propos", contact:"Contact",
};
const NAV = ["expertise","services","portfolio","about","contact"];

/* ============================================================  HOOKS  */

function use3DReveal(delay="0s") {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(()=>{
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e])=>{
      if (e.isIntersecting){ setVis(true); obs.disconnect(); }
    },{ threshold:.1 });
    obs.observe(el);
    return ()=>obs.disconnect();
  },[]);
  return { ref, cls:`za-3d${vis?" in":""}`, style:{"--delay":delay} };
}

function useTilt(strength=12) {
  const ref = useRef(null);
  const onMove = useCallback(e=>{
    const el = ref.current;
    if (!el) return;
    const { left,top,width,height } = el.getBoundingClientRect();
    const x = ((e.clientX-left)/width  - .5) * strength;
    const y = ((e.clientY-top) /height - .5) * strength;
    el.style.transform =
      `perspective(800px) rotateX(${-y}deg) rotateY(${x}deg) translateZ(24px) scale(1.04)`;
    el.style.boxShadow =
      `${-x*1.1}px ${y*1.1+14}px 44px var(--shadow), 0 0 0 1px var(--gold-s)`;
    el.style.zIndex = "5";
  },[strength]);
  const onLeave = useCallback(()=>{
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.boxShadow = "";
    el.style.zIndex = "";
  },[]);
  return { ref, onMouseMove:onMove, onMouseLeave:onLeave };
}

/* ============================================================  COMPONENTS  */

function R({children,delay="0s"}){
  const {ref,cls,style}=use3DReveal(delay);
  return <div ref={ref} className={cls} style={style}>{children}</div>;
}

function Crumbs({trail,go}){
  return(
    <div className="za-con">
      <nav className="za-crumbs" aria-label="Fil d'Ariane">
        {trail.map((item,i)=>{
          const last=i===trail.length-1;
          return(
            <span key={item.label} style={{display:"flex",gap:8,alignItems:"center"}}>
              {last
                ? <span className="za-crumb-cur">{item.label}</span>
                : <button className="za-crumb" onClick={()=>go(item.page,item.param)}>{item.label}</button>
              }
              {!last && <span className="za-crumb-sep">/</span>}
            </span>
          );
        })}
      </nav>
    </div>
  );
}

function Widget(){
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setLoaded(true),300); return()=>clearTimeout(t); },[]);
  const max=Math.max(...VW.map(r=>Math.max(r.budget,r.actual)));
  return(
    <div className="za-widget-wrap">
      <div className="za-widget">
        <div className="za-whead">
          <div className="za-wtitle">Budget vs Réel</div>
          <div className="za-wperiod">FY26 · YTD</div>
        </div>
        {VW.map(r=>{
          const d=((r.actual-r.budget)/r.budget)*100;
          return(
            <div className="za-wrow" key={r.label}>
              <div className="za-wrow-top">
                <span className="za-wrow-label">{r.label}</span>
                <span className="za-wrow-nums">
                  {r.budget} k€ → {r.actual} k€
                  <span className={`za-wdelta ${r.fav?"pos":"neg"}`}>{d>=0?"+":"−"}{Math.abs(d).toFixed(1)}%</span>
                </span>
              </div>
              <div className="za-bars">
                <div className="za-bar za-bar-b" style={{width:loaded?`${(r.budget/max)*100}%`:"0%"}}/>
                <div className={`za-bar za-bar-a ${r.fav?"pos":"neg"}`} style={{width:loaded?`${(r.actual/max)*100}%`:"0%"}}/>
              </div>
            </div>
          );
        })}
        <div className="za-wfoot">
          <span className="za-leg"><span className="za-sw" style={{background:"var(--line)"}}/> Budget</span>
          <span className="za-leg"><span className="za-sw" style={{background:"var(--pos)"}}/> Réel · fav.</span>
          <span className="za-leg"><span className="za-sw" style={{background:"var(--neg)"}}/> Réel · déf.</span>
        </div>
      </div>
    </div>
  );
}

function ServiceCards({go,compact}){
  return(
    <div className="za-svcs">
      {SERVICES.map(s=>{
        const tilt=useTilt(8);
        return(
          <div className="za-svc" key={s.slug} {...tilt}
            onClick={()=>go("service",s.slug)}
            role="button" tabIndex={0}
            onKeyDown={e=>e.key==="Enter"&&go("service",s.slug)}>
            <div className="za-svc-head">
              <h3>{s.title}</h3>
              <span className="za-dur">{s.duration}</span>
            </div>
            <p className="za-svc-desc">{s.desc}</p>
            {!compact && <ul>{s.points.map(pt=><li key={pt}>{pt}</li>)}</ul>}
            <div className="za-svc-foot">
              <span className="za-price">{s.pricing}</span>
              <button className="za-btn-g" onClick={e=>{e.stopPropagation();go("service",s.slug);}}>Voir l'offre →</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProjCards(){
  return(
    <div className="za-projs">
      {PROJECTS.map(p=>{
        const tilt=useTilt(6);
        return(
          <div className="za-proj" key={p.title} {...tilt}>
            <div className="za-proj-vis" aria-hidden="true">
              {p.bars.map((h,i)=>(
                <div key={i} className={`za-mbar ${i%3===1?"g":i%3===2?"p":""}`} style={{height:`${h*100}%`}}/>
              ))}
            </div>
            <div className="za-proj-body">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="za-proj-impact">{p.impact}</div>
              <div className="za-proj-tags">{p.tags.map(t=><span className="za-tag" key={t}>{t}</span>)}</div>
              <button className="za-proj-link" onClick={()=>window.open("https://github.com","_blank")}>Voir le projet ↗</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FAQ({items}){
  const [open,setOpen]=useState(null);
  return(
    <div>
      {items.map((f,i)=>(
        <div className="za-faq-item" key={f.q}>
          <button className="za-faq-q" onClick={()=>setOpen(open===i?null:i)} aria-expanded={open===i}>
            {f.q}<span>{open===i?"−":"+"}</span>
          </button>
          {open===i && <div className="za-faq-a">{f.a}</div>}
        </div>
      ))}
    </div>
  );
}

function ContactForm({initial}){
  const [form,setForm]=useState({name:"",email:"",phone:"",offer:initial||"",budget:"",message:""});
  const [errs,setErrs]=useState({});
  const [sent,setSent]=useState(false);
  const upd=f=>e=>setForm(p=>({...p,[f]:e.target.value}));
  useEffect(()=>{ if(initial) setForm(p=>({...p,offer:initial})); },[initial]);
  const submit=()=>{
    const e={};
    if(!form.name.trim()) e.name="Requis.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Email invalide.";
    if(!form.message.trim()) e.message="Décrivez votre projet.";
    setErrs(e);
    if(!Object.keys(e).length) setSent(true);
  };
  if(sent) return(
    <div className="za-ok" role="status">
      <h3>Merci, {form.name.split(" ")[0]} !</h3>
      <p>Votre demande est notée. Je vous recontacte sous 48h à <strong>{form.email}</strong>.</p>
    </div>
  );
  return(
    <div>
      <div className="za-form2">
        <div className="za-field">
          <label htmlFor="z-name">Nom</label>
          <input id="z-name" className="za-inp" value={form.name} onChange={upd("name")} placeholder="Prénom Nom"/>
          {errs.name&&<div className="za-err">{errs.name}</div>}
        </div>
        <div className="za-field">
          <label htmlFor="z-email">Email</label>
          <input id="z-email" className="za-inp" type="email" value={form.email} onChange={upd("email")} placeholder="vous@entreprise.fr"/>
          {errs.email&&<div className="za-err">{errs.email}</div>}
        </div>
      </div>
      <div className="za-form2">
        <div className="za-field">
          <label htmlFor="z-phone">Téléphone <span>(optionnel)</span></label>
          <input id="z-phone" className="za-inp" type="tel" value={form.phone} onChange={upd("phone")} placeholder="06 12 34 56 78"/>
        </div>
        <div className="za-field">
          <label htmlFor="z-offer">Offre</label>
          <select id="z-offer" className="za-sel" value={form.offer} onChange={upd("offer")}>
            <option value="">Sélectionner…</option>
            {SERVICES.map(s=><option key={s.slug} value={s.title}>{s.title}</option>)}
            <option>Autre / je ne sais pas encore</option>
          </select>
        </div>
      </div>
      <div className="za-field">
        <label htmlFor="z-budget">Budget approx. <span>(optionnel)</span></label>
        <input id="z-budget" className="za-inp" value={form.budget} onChange={upd("budget")} placeholder="ex. 3 000 – 6 000 €"/>
      </div>
      <div className="za-field">
        <label htmlFor="z-msg">Description du projet</label>
        <textarea id="z-msg" className="za-ta" value={form.message} onChange={upd("message")} placeholder="Contexte, données disponibles, objectif, échéance…"/>
        {errs.message&&<div className="za-err">{errs.message}</div>}
      </div>
      <button className="za-btn" onClick={submit}>Demander un devis</button>
    </div>
  );
}

/* ============================================================  PAGES  */

function Home({go}){
  return(
    <div className="za-page">
      <header className="za-hero">
        <div className="za-con">
          <div className="za-hero-grid">
            <div>
              <R><div className="za-eyebrow">Data Consultant FP&A</div></R>
              <R delay=".07s">
                <h1 className="za-h1">Du pipeline à <em>l'insight</em> : vos données financières, prêtes à décider.</h1>
              </R>
              <R delay=".14s">
                <p className="za-hero-sub">Solutions analytics end-to-end pour les équipes finance : de la modélisation dbt aux dashboards Power BI.</p>
                <div className="za-cta-row">
                  <button className="za-btn" onClick={()=>go("contact")}>Demander un devis</button>
                  <button className="za-btn-o" onClick={()=>go("portfolio")}>Voir mes projets</button>
                </div>
                <div className="za-points">
                  <span className="za-point">Rapide</span>
                  <span className="za-point">Rigoureux</span>
                  <span className="za-point">Scalable</span>
                  <span className="za-point">Transparent</span>
                </div>
              </R>
            </div>
            <R delay=".1s"><Widget/></R>
          </div>
        </div>
      </header>

      <section className="za-sec">
        <div className="za-con">
          <R><div className="za-eyebrow">Expertise</div>
          <h2 className="za-h2">Double compétence rare : data engineering × finance</h2>
          <p className="za-lede">La plupart des consultants font soit la donnée, soit la finance. Mon métier est de tenir les deux bouts de la chaîne.</p></R>
          <R delay=".06s">
            <div className="za-pillars">
              {PILLARS.map((p,i)=>{
                const tilt=useTilt(9);
                return(
                  <div className="za-pillar" key={p.title} {...tilt}>
                    <span className="za-pillar-icon" aria-hidden="true">{p.icon}</span>
                    <h3>{p.title}</h3><p>{p.desc}</p>
                    <div className="za-pillar-tags">{p.tags.map(t=><span className="za-tag" key={t}>{t}</span>)}</div>
                  </div>
                );
              })}
            </div>
            <button className="za-btn-o" onClick={()=>go("expertise")}>Explorer l'expertise →</button>
          </R>
        </div>
      </section>

      <section className="za-sec">
        <div className="za-con">
          <R><div className="za-eyebrow">Services</div>
          <h2 className="za-h2">Quatre offres, chacune avec sa page dédiée</h2>
          <p className="za-lede">Déroulé semaine par semaine, livrables précis, FAQ — cliquez sur une offre pour le détail complet.</p></R>
          <R delay=".06s"><ServiceCards go={go} compact/><p className="za-flex-note">Budget flexible — premier échange gratuit (30 min).</p></R>
        </div>
      </section>

      <section className="za-sec">
        <div className="za-con">
          <R><div className="za-eyebrow">Portfolio</div>
          <h2 className="za-h2">Des projets construits comme de vraies missions</h2></R>
          <R delay=".06s"><ProjCards/>
          <div style={{marginTop:28}}><button className="za-btn-o" onClick={()=>go("portfolio")}>Portfolio complet →</button></div></R>
        </div>
      </section>
    </div>
  );
}

function Expertise({go}){
  return(
    <div className="za-page">
      <section className="za-sec">
        <div className="za-con">
          <R><div className="za-eyebrow">Expertise</div>
          <h2 className="za-h2">Quatre piliers, une seule chaîne de valeur</h2>
          <p className="za-lede">De la donnée brute à la décision financière, chaque pilier couvre une étape de la chaîne — sans multiplier les intervenants.</p></R>
          <R delay=".06s">
            <div className="za-pillars">
              {PILLARS.map(p=>{
                const tilt=useTilt(9);
                return(
                  <div className="za-pillar" key={p.title} {...tilt}>
                    <span className="za-pillar-icon">{p.icon}</span>
                    <h3>{p.title}</h3><p>{p.desc}</p>
                    <div className="za-pillar-tags">{p.tags.map(t=><span className="za-tag" key={t}>{t}</span>)}</div>
                  </div>
                );
              })}
            </div>
          </R>
          <R delay=".1s"><h3 className="za-h3" style={{marginBottom:18}}>Certifications</h3>
          <div className="za-certs">{CERTS.map(c=><div className="za-cert" key={c.org+c.name}><b>{c.org}</b>{c.name}</div>)}</div></R>
          <R delay=".14s">
            <div className="za-dcta" style={{marginTop:56}}>
              <div><h3 className="za-h3">Un besoin précis ?</h3><p style={{color:"var(--muted)",fontSize:14}}>Les quatre offres détaillent comment cette expertise se traduit en mission.</p></div>
              <button className="za-btn" onClick={()=>go("services")}>Voir les offres</button>
            </div>
          </R>
        </div>
      </section>
    </div>
  );
}

function Services({go}){
  return(
    <div className="za-page">
      <section className="za-sec">
        <div className="za-con">
          <R><div className="za-eyebrow">Services — Sommaire</div>
          <h2 className="za-h2">Quatre offres, chacune avec sa page dédiée</h2>
          <p className="za-lede">Cliquez sur une offre pour le déroulé complet de la mission, les livrables exacts et les questions fréquentes.</p></R>
          <R delay=".06s"><ServiceCards go={go}/>
          <p className="za-flex-note">Budget flexible — premier échange gratuit de 30 minutes.</p></R>
        </div>
      </section>
    </div>
  );
}

function ServiceDetail({slug,go}){
  const idx=SERVICES.findIndex(s=>s.slug===slug);
  const s=SERVICES[idx]||SERVICES[0];
  const prev=SERVICES[(idx-1+SERVICES.length)%SERVICES.length];
  const next=SERVICES[(idx+1)%SERVICES.length];
  return(
    <div className="za-page" key={s.slug}>
      <header className="za-dhero">
        <div className="za-con">
          <R><div className="za-eyebrow">Offre {String(idx+1).padStart(2,"0")} / 04</div>
          <h1 className="za-h2" style={{fontSize:"clamp(28px,4.2vw,44px)"}}>{s.title}</h1>
          <p className="za-lede" style={{marginBottom:0}}>{s.detailIntro}</p>
          <div className="za-dmeta">
            <div className="za-dmi"><b>Durée</b>{s.duration}</div>
            <div className="za-dmi"><b>Tarif</b>{s.pricing}</div>
            <div className="za-dmi"><b>Premier échange</b>30 min · gratuit</div>
          </div></R>
        </div>
      </header>
      <section className="za-sec">
        <div className="za-con">
          <div className="za-dgrid">
            <R>
              <h3 className="za-h3">Déroulé de la mission</h3>
              <ol className="za-steps">
                {s.steps.map((st,i)=>(
                  <li className="za-step" key={st.title}>
                    <span className="za-step-n">{i+1}</span>
                    <h4>{st.title}</h4>
                    <div className="za-step-when">{st.when}</div>
                    <p>{st.desc}</p>
                  </li>
                ))}
              </ol>
            </R>
            <div>
              <R delay=".08s">
                <div className="za-scard who">
                  <h4>Pour qui</h4>
                  <ul>{s.who.map(w=><li key={w}>{w}</li>)}</ul>
                </div>
                <div className="za-scard">
                  <h4>Livrables</h4>
                  <ul>{s.deliverables.map(d=><li key={d}>{d}</li>)}</ul>
                </div>
              </R>
            </div>
          </div>
          <R delay=".06s">
            <h3 className="za-h3" style={{marginTop:52}}>Questions fréquentes</h3>
            <FAQ items={s.faq}/>
          </R>
          <R delay=".1s">
            <div className="za-dcta">
              <div>
                <h3 className="za-h3">Cette offre correspond ?</h3>
                <p style={{color:"var(--muted)",fontSize:14}}>Décrivez votre contexte, je reviens sous 48h.</p>
              </div>
              <button className="za-btn" onClick={()=>go("contact",s.title)}>Demander un devis</button>
            </div>
            <div className="za-pager">
              <button className="za-pager-btn" onClick={()=>go("service",prev.slug)}>
                <small>← Offre précédente</small>{prev.title}
              </button>
              <button className="za-pager-btn" style={{textAlign:"right"}} onClick={()=>go("service",next.slug)}>
                <small>Offre suivante →</small>{next.title}
              </button>
            </div>
          </R>
        </div>
      </section>
    </div>
  );
}

function Portfolio({go}){
  return(
    <div className="za-page">
      <section className="za-sec">
        <div className="za-con">
          <R><div className="za-eyebrow">Portfolio</div>
          <h2 className="za-h2">Des projets construits comme de vraies missions</h2>
          <p className="za-lede">Architecture, tests, documentation — le même standard qu'en mission, appliqué à des données publiques et synthétiques.</p></R>
          <R delay=".06s"><ProjCards/></R>
          <R delay=".12s">
            <div className="za-dcta" style={{marginTop:56}}>
              <div><h3 className="za-h3">Vous voulez ce niveau de finition sur vos données ?</h3>
              <p style={{color:"var(--muted)",fontSize:14}}>Chaque mission est livrée avec ce standard : code versionné, testé, documenté.</p></div>
              <button className="za-btn" onClick={()=>go("contact")}>Parlons-en</button>
            </div>
          </R>
        </div>
      </section>
    </div>
  );
}

function About({go}){
  const tilt=useTilt(5);
  return(
    <div className="za-page">
      <section className="za-sec">
        <div className="za-con">
          <R><div className="za-eyebrow">À propos</div>
          <h2 className="za-h2">Pourquoi je fais ça</h2></R>
          <div className="za-agrid" style={{marginTop:40}}>
            <R><div className="za-portrait" {...tilt} aria-label="Photo à venir">Z</div></R>
            <R delay=".08s">
              <div className="za-atext">
                <p>Je suis <strong>data consultant spécialisé en FP&A</strong>. Je transforme vos données brutes en dashboards exécutifs et analyses prédictives — avec une exigence : que chaque livrable serve une décision.</p>
                <p>Mon parcours combine <strong>data engineering</strong> (SQL, dbt, Python, BigQuery) et <strong>finance d'entreprise</strong> (budgeting, forecasting, variance analysis).</p>
                <div className="za-aquote">« Les données complexes ne valent rien tant qu'elles ne deviennent pas des décisions simples. »</div>
                <p>Je travaille avec les <strong>PME, ETI et startups</strong> pour automatiser leur reporting et accélérer leurs décisions financières — pricing accessible, process transparent.</p>
                <div className="za-socials">
                  <a className="za-social" href="https://github.com" target="_blank" rel="noreferrer">GitHub ↗</a>
                  <a className="za-social" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn ↗</a>
                  <button className="za-social" onClick={()=>go("contact")}>Me contacter →</button>
                </div>
              </div>
            </R>
          </div>
        </div>
      </section>
    </div>
  );
}

function Contact({initial}){
  return(
    <div className="za-page">
      <section className="za-sec">
        <div className="za-con">
          <R><div className="za-eyebrow">Contact</div>
          <h2 className="za-h2">Parlons de votre projet</h2></R>
          <div className="za-cgrid" style={{marginTop:40}}>
            <R>
              <div className="za-cinfo">
                <p>Décrivez votre besoin en quelques lignes. Je reviens sous 48h avec une proposition de premier échange — gratuit et sans engagement.</p>
                <a className="za-cemail" href="mailto:contact@zafyr-analytics.fr">contact@zafyr-analytics.fr</a>
                <div className="za-crt">Réponse sous 48h ouvrées</div>
              </div>
            </R>
            <R delay=".08s"><ContactForm initial={initial}/></R>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================  APP  */

export default function App(){
  const [route,setRoute]=useState({page:"home",param:null});
  const [dark,setDark]=useState(true);
  const [mob,setMob]=useState(false);
  const [spin,setSpin]=useState(false);

  useEffect(()=>{
    document.documentElement.classList.toggle("light",!dark);
  },[dark]);

  const go=(page,param=null)=>{
    setRoute({page,param});
    setMob(false);
    window.scrollTo({top:0,behavior:"auto"});
  };

  const toggleTheme=()=>{
    setSpin(true);
    setTimeout(()=>{ setDark(d=>!d); setSpin(false); },175);
  };

  const svc=route.page==="service"?SERVICES.find(s=>s.slug===route.param):null;
  const trail=(()=>{
    if(route.page==="home") return null;
    const b=[{label:"Accueil",page:"home"}];
    if(route.page==="service"&&svc) return [...b,{label:"Services",page:"services"},{label:svc.title}];
    return [...b,{label:PAGES[route.page]||""}];
  })();

  const page=(()=>{
    switch(route.page){
      case "expertise": return <Expertise go={go}/>;
      case "services":  return <Services go={go}/>;
      case "service":   return <ServiceDetail slug={route.param} go={go}/>;
      case "portfolio": return <Portfolio go={go}/>;
      case "about":     return <About go={go}/>;
      case "contact":   return <Contact initial={route.param}/>;
      default:          return <Home go={go}/>;
    }
  })();

  return(
    <div className="za">
      <style>{BASE_CSS}</style>

      {/* NAV */}
      <nav className="za-nav" aria-label="Navigation principale">
        <div className="za-nav-inner">
          <button className="za-logo" onClick={()=>go("home")}>Zafyr<span>·</span>Analytics</button>
          <div className="za-nav-row">
            {NAV.map(p=>(
              <button key={p}
                className={`za-nav-link${route.page===p||(p==="services"&&route.page==="service")?" act":""}`}
                onClick={()=>go(p)}>
                {PAGES[p]}
              </button>
            ))}
            <button
              className={`za-toggle${spin?" spin":""}`}
              onClick={toggleTheme}
              aria-label={dark?"Passer au thème clair":"Passer au thème sombre"}
            >
              {dark?"☀":"🌙"}
            </button>
            <button className="za-nav-cta" onClick={()=>go("contact")}>Demander un devis</button>
          </div>
          <button className="za-burger" onClick={()=>setMob(!mob)} aria-label="Menu" aria-expanded={mob}>
            {mob?"✕":"☰"}
          </button>
        </div>
        <div className={`za-mob${mob?" open":""}`}>
          <button className="za-nav-link" onClick={()=>go("home")}>Accueil</button>
          {NAV.map(p=><button key={p} className="za-nav-link" onClick={()=>go(p)}>{PAGES[p]}</button>)}
          <button className="za-nav-link" onClick={toggleTheme}>{dark?"☀ Thème clair":"🌙 Thème sombre"}</button>
        </div>
      </nav>

      {trail && <Crumbs trail={trail} go={go}/>}

      <main className="za-main">{page}</main>

      {/* FOOTER */}
      <footer className="za-footer">
        <div className="za-con">
          <div className="za-sitemap">
            <div className="za-sitemap-brand">
              <button className="za-logo" onClick={()=>go("home")}>Zafyr<span>·</span>Analytics</button>
              <p style={{marginTop:10}}>Data Consultant FP&A — analytics end-to-end pour les équipes finance, de la modélisation dbt aux dashboards Power BI.</p>
            </div>
            <div>
              <h5>Navigation</h5>
              <ul>
                {["home",...NAV].map(p=>(
                  <li key={p}><button className="za-slink" onClick={()=>go(p)}>{PAGES[p]||"Accueil"}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h5>Offres</h5>
              <ul>
                {SERVICES.map(s=><li key={s.slug}><button className="za-slink" onClick={()=>go("service",s.slug)}>{s.title}</button></li>)}
              </ul>
            </div>
            <div>
              <h5>Contact</h5>
              <ul>
                <li><a className="za-slink" href="mailto:contact@zafyr-analytics.fr">contact@zafyr-analytics.fr</a></li>
                <li><a className="za-slink" href="https://github.com" target="_blank" rel="noreferrer">GitHub ↗</a></li>
                <li><a className="za-slink" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
              </ul>
            </div>
          </div>
          <div className="za-fbot">
            <span>© 2026 Zafyr Analytics · Créé avec ❤ et dbt</span>
            <span>Réponse sous 48h ouvrées</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
