// Builds the Aaroh logo asset pack. Run with `npm run build` from aaroh-logo/.
// Change the colours or geometry in the BRAND section below and run it again: every SVG, PNG,
// icon, banner and the brand sheet are regenerated from the same shapes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';
import PDFDocument from 'pdfkit';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (...p) => path.join(ROOT, ...p);

// ---------------------------------------------------------------------------------------------
// BRAND
// ---------------------------------------------------------------------------------------------

const COLOURS = {
  teal: { name: 'Aaroh Teal', hex: '#163A37' },
  gold: { name: 'Swara Gold', hex: '#B8893A', note: 'on light backgrounds' },
  lightGold: { name: 'Light Gold', hex: '#D6AD5C', note: 'on dark backgrounds' },
  ivory: { name: 'Ivory', hex: '#F7F1E6' },
  black: { name: 'Black', hex: '#111111' },
  white: { name: 'White', hex: '#FFFFFF' },
};
const C = Object.fromEntries(Object.entries(COLOURS).map(([k, v]) => [k, v.hex]));

// "Seven Swaras": [cx, cy, r] in a 0 0 100 100 box. The last dot is the gold one.
const DOTS = [
  [12, 82, 4.0],
  [22.5, 73, 4.6],
  [33.5, 64.5, 5.2],
  [45.5, 55.5, 5.8],
  [58, 46, 6.4],
  [71, 35, 7.0],
  [86, 20, 9.5],
];
// Small-size variant (24 px and below): dots 1, 3, 5, 7, larger.
const SMALL_DOTS = [
  [12, 82, 5],
  [33.5, 64.5, 6],
  [58, 46, 7],
  [86, 20, 11],
];
// Clear space around every lockup: the gold dot's diameter, in icon units.
const CLEAR = 2 * DOTS[DOTS.length - 1][2];

const NAME = 'AAROH';
const SUB = 'ENTERTAINMENT';
const NAME_TRACKING = 0.08; // × font size
const SUB_TRACKING = 0.68; // × font size
const TEXT_GAP = 0.3; // space between AAROH and ENTERTAINMENT, × AAROH cap height
const ICON_TEXT_GAP = CLEAR; // horizontal lockup: icon to text, icon units (one gold dot)
const STACKED_ICON_WIDTH = 0.6; // stacked lockup: icon width, × wordmark width

const FONT_NAME = opentype.loadSync(out('fonts', 'CormorantGaramond-SemiBold.ttf'));
const FONT_SUB = opentype.loadSync(out('fonts', 'Jost-Medium.ttf'));

// Colour versions: dot colour, top (gold) dot colour, text colour; `bg` is only for previews.
const VERSIONS = {
  'full-colour': { dot: C.teal, top: C.gold, text: C.teal, bg: C.ivory },
  reversed: { dot: C.ivory, top: C.lightGold, text: C.ivory, bg: C.teal },
  black: { dot: C.black, top: C.black, text: C.black, bg: C.white },
  white: { dot: C.white, top: C.white, text: C.white, bg: C.teal },
};

const PNG_WIDTHS = [512, 1024, 2048];

// ---------------------------------------------------------------------------------------------
// GEOMETRY
// ---------------------------------------------------------------------------------------------

const num = (n) => String(Math.round(n * 100) / 100);

function boxOf(dots) {
  const x1 = Math.min(...dots.map(([x, , r]) => x - r));
  const y1 = Math.min(...dots.map(([, y, r]) => y - r));
  const x2 = Math.max(...dots.map(([x, , r]) => x + r));
  const y2 = Math.max(...dots.map(([, y, r]) => y + r));
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

/** The mark scaled by k with its bounding box's top-left corner at (x, y). */
function placeMark(dots, x, y, k) {
  const b = boxOf(dots);
  return dots.map(([cx, cy, r], i) => ({
    cx: x + (cx - b.x) * k,
    cy: y + (cy - b.y) * k,
    r: r * k,
    role: i === dots.length - 1 ? 'top' : 'dot',
  }));
}

/** Ink box of a string at a given size (its left/top edges relative to the origin). */
function measure(font, text, size, tracking) {
  const b = font.getPath(text, 0, 0, size, { letterSpacing: tracking }).getBoundingBox();
  return { x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2, w: b.x2 - b.x1, h: b.y2 - b.y1 };
}

/**
 * AAROH over ENTERTAINMENT, both with their ink starting at x; the block's ink top is at y.
 * ENTERTAINMENT is sized so its ink width equals AAROH's.
 */
function wordmarkLayout(size) {
  const a = measure(FONT_NAME, NAME, size, NAME_TRACKING);
  const e1 = measure(FONT_SUB, SUB, 1, SUB_TRACKING);
  const subSize = a.w / e1.w;
  const e = measure(FONT_SUB, SUB, subSize, SUB_TRACKING);
  const capA = (size * FONT_NAME.tables.os2.sCapHeight) / FONT_NAME.unitsPerEm;
  const subTop = -a.y1 + capA * TEXT_GAP; // from the block's top to ENTERTAINMENT's ink top
  return { size, subSize, a, e, width: a.w, height: subTop + e.h, subTop };
}

function placeWordmark(L, x, y) {
  const nameX = x - L.a.x1;
  const nameY = y - L.a.y1;
  const subX = x - L.e.x1;
  const subY = y + L.subTop - L.e.y1;
  return {
    paths: [
      FONT_NAME.getPath(NAME, nameX, nameY, L.size, { letterSpacing: NAME_TRACKING }).toPathData(2),
      FONT_SUB.getPath(SUB, subX, subY, L.subSize, { letterSpacing: SUB_TRACKING }).toPathData(2),
    ],
    // For the editable source files (live text).
    live: [
      {
        text: NAME,
        family: 'Cormorant Garamond',
        weight: 600,
        size: L.size,
        x: nameX,
        y: nameY,
        tracking: NAME_TRACKING,
      },
      {
        text: SUB,
        family: 'Jost',
        weight: 500,
        size: L.subSize,
        x: subX,
        y: subY,
        tracking: SUB_TRACKING,
      },
    ],
  };
}

// A lockup: { w, h, circles, text: {paths, live} | null, clear } in its own units.
function iconLockup(dots = DOTS) {
  const b = boxOf(dots);
  return {
    w: b.w + 2 * CLEAR,
    h: b.h + 2 * CLEAR,
    circles: placeMark(dots, CLEAR, CLEAR, 1),
    text: null,
    clear: CLEAR,
  };
}

function horizontalLockup() {
  const L = wordmarkLayout(100);
  const b = boxOf(DOTS);
  const k = L.height / b.h; // icon height = text block height
  const c = CLEAR * k;
  const textX = c + b.w * k + ICON_TEXT_GAP * k;
  return {
    w: textX + L.width + c,
    h: L.height + 2 * c,
    circles: placeMark(DOTS, c, c, k),
    text: placeWordmark(L, textX, c),
    clear: c,
  };
}

function stackedLockup() {
  const L = wordmarkLayout(100);
  const b = boxOf(DOTS);
  const k = (STACKED_ICON_WIDTH * L.width) / b.w;
  const c = CLEAR * k;
  const w = Math.max(L.width, b.w * k) + 2 * c;
  const textTop = c + b.h * k + CLEAR * k;
  return {
    w,
    h: textTop + L.height + c,
    circles: placeMark(DOTS, (w - b.w * k) / 2, c, k),
    text: placeWordmark(L, (w - L.width) / 2, textTop),
    clear: c,
  };
}

// Small-size icon: no clear space (it is for favicons and tiny UI), centred in a square.
function smallIcon() {
  const b = boxOf(SMALL_DOTS);
  const s = Math.max(b.w, b.h) + 6;
  return {
    w: s,
    h: s,
    circles: placeMark(SMALL_DOTS, (s - b.w) / 2, (s - b.h) / 2, 1),
    text: null,
    clear: 0,
  };
}

const LOCKUPS = {
  icon: iconLockup(),
  horizontal: horizontalLockup(),
  stacked: stackedLockup(),
};

// ---------------------------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------------------------

const TITLE = 'Aaroh Entertainment Limited';

/** Shapes only (no <svg> wrapper), placed with a transform when one is given. */
function shapes(lockup, v, { x = 0, y = 0, scale = 1 } = {}) {
  const body =
    lockup.circles
      .map(
        (d) =>
          `<circle cx="${num(d.cx)}" cy="${num(d.cy)}" r="${num(d.r)}" fill="${d.role === 'top' ? v.top : v.dot}"/>`,
      )
      .join('') + (lockup.text ? `<path fill="${v.text}" d="${lockup.text.paths.join('')}"/>` : '');
  if (x === 0 && y === 0 && scale === 1) return body;
  return `<g transform="translate(${num(x)} ${num(y)}) scale(${scale})">${body}</g>`;
}

function svgDoc(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(w)} ${num(h)}"><title>${TITLE}</title>${inner}</svg>`;
}

const lockupSvg = (lockup, v) => svgDoc(lockup.w, lockup.h, shapes(lockup, v));

/** Editable version: live text that needs the fonts in fonts/ installed. */
function editableSvg(lockup, v) {
  const text = lockup.text.live
    .map(
      (t) =>
        `  <text x="${num(t.x)}" y="${num(t.y)}" font-family="${t.family}" font-weight="${t.weight}" font-size="${num(t.size)}" letter-spacing="${num(t.size * t.tracking)}" fill="${v.text}">${t.text}</text>`,
    )
    .join('\n');
  const circles = lockup.circles
    .map(
      (d) =>
        `  <circle cx="${num(d.cx)}" cy="${num(d.cy)}" r="${num(d.r)}" fill="${d.role === 'top' ? v.top : v.dot}"/>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Editable source: live text. Needs Cormorant Garamond SemiBold and Jost Medium installed
     (see ../fonts). The final files in ../svg have the text outlined and do not. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(lockup.w)} ${num(lockup.h)}">
  <title>${TITLE}</title>
${circles}
${text}
</svg>
`;
}

// ---------------------------------------------------------------------------------------------
// RENDERING AND FILE HELPERS
// ---------------------------------------------------------------------------------------------

function render(svg, width) {
  return new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: false },
  }).render();
}

const problems = [];

/** A transparent lockup must have an empty edge (its clear space): otherwise something is clipped. */
function checkEdges(img, file) {
  const { width: w, height: h, pixels } = img;
  const alpha = (x, y) => pixels[(y * w + x) * 4 + 3];
  for (let x = 0; x < w; x++)
    if (alpha(x, 0) || alpha(x, h - 1)) return problems.push(`${file}: ink on top/bottom edge`);
  for (let y = 0; y < h; y++)
    if (alpha(0, y) || alpha(w - 1, y)) return problems.push(`${file}: ink on left/right edge`);
}

const written = [];
function write(rel, data) {
  const file = out(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  written.push(rel);
}

// Clean the generated folders (fonts/ and scripts/ are inputs and are left alone).
for (const dir of ['svg', 'png', 'app-icon', 'favicon', 'social', 'brand-sheet', 'source']) {
  fs.rmSync(out(dir), { recursive: true, force: true });
}

// ---------------------------------------------------------------------------------------------
// LOCKUPS: SVG + PNG
// ---------------------------------------------------------------------------------------------

for (const [name, lockup] of Object.entries(LOCKUPS)) {
  for (const [vName, v] of Object.entries(VERSIONS)) {
    const svg = lockupSvg(lockup, v);
    write(`svg/aaroh-${name}-${vName}.svg`, svg);
    for (const width of PNG_WIDTHS) {
      const rel = `png/${name}/aaroh-${name}-${vName}-${width}.png`;
      const img = render(svg, width);
      checkEdges(img, rel);
      write(rel, img.asPng());
    }
  }
}

const SMALL = smallIcon();
for (const [vName, v] of Object.entries(VERSIONS)) {
  write(`svg/aaroh-icon-small-${vName}.svg`, lockupSvg(SMALL, v));
}

// Editable sources (live text), full colour.
write(
  'source/aaroh-horizontal-editable.svg',
  editableSvg(LOCKUPS.horizontal, VERSIONS['full-colour']),
);
write('source/aaroh-stacked-editable.svg', editableSvg(LOCKUPS.stacked, VERSIONS['full-colour']));
write(
  'source/geometry.json',
  JSON.stringify(
    {
      viewBox: '0 0 100 100',
      dots: DOTS,
      smallDots: SMALL_DOTS,
      clearSpace: CLEAR,
      colours: COLOURS,
    },
    null,
    2,
  ) + '\n',
);

// ---------------------------------------------------------------------------------------------
// COMPOSED IMAGES: app icon, favicon, social
// ---------------------------------------------------------------------------------------------

/** A canvas with a background and the lockup scaled to `fit` (w, h) and centred on (cx, cy). */
function canvas(W, H, bg, lockup, v, { cx = W / 2, cy = H / 2, fitW, fitH, contentOnly = false }) {
  // contentOnly: fit the mark's own box (no clear space), e.g. "icon at 70% width".
  const box = contentOnly
    ? {
        x: lockup.clear,
        y: lockup.clear,
        w: lockup.w - 2 * lockup.clear,
        h: lockup.h - 2 * lockup.clear,
      }
    : { x: 0, y: 0, w: lockup.w, h: lockup.h };
  const scale = Math.min(fitW / box.w, fitH ? fitH / box.h : Infinity);
  const x = cx - (box.x + box.w / 2) * scale;
  const y = cy - (box.y + box.h / 2) * scale;
  return svgDoc(
    W,
    H,
    `<rect width="${W}" height="${H}" fill="${bg}"/>` +
      shapes(lockup, v, { x, y, scale: num(scale) }),
  );
}

// App icon: teal ground, reversed icon at 70% width.
const appIcon = canvas(1024, 1024, C.teal, LOCKUPS.icon, VERSIONS.reversed, {
  fitW: 1024 * 0.7,
  contentOnly: true,
});
write('app-icon/aaroh-app-icon.svg', appIcon);
write('app-icon/aaroh-app-icon-1024.png', render(appIcon, 1024).asPng());
write('app-icon/apple-touch-icon.png', render(appIcon, 180).asPng());
write('app-icon/android-chrome-192.png', render(appIcon, 192).asPng());
write('app-icon/android-chrome-512.png', render(appIcon, 512).asPng());

// Favicon: the small-size variant. The SVG switches to the reversed colours in dark mode.
const fav = VERSIONS['full-colour'];
const favSvg = svgDoc(
  SMALL.w,
  SMALL.h,
  `<style>.d{fill:${fav.dot}}.t{fill:${fav.top}}@media (prefers-color-scheme:dark){.d{fill:${VERSIONS.reversed.dot}}.t{fill:${VERSIONS.reversed.top}}}</style>` +
    SMALL.circles
      .map(
        (d) =>
          `<circle class="${d.role === 'top' ? 't' : 'd'}" cx="${num(d.cx)}" cy="${num(d.cy)}" r="${num(d.r)}"/>`,
      )
      .join(''),
);
write('favicon/favicon.svg', favSvg);
const favPngs = [16, 32, 48].map((s) => {
  const png = render(lockupSvg(SMALL, fav), s).asPng();
  write(`favicon/favicon-${s}.png`, png);
  return png;
});
write('favicon/favicon.ico', await pngToIco(favPngs));

// Social profile picture: ivory ground, full-colour icon at 60% width (fits a circle crop).
const profile = canvas(1080, 1080, C.ivory, LOCKUPS.icon, VERSIONS['full-colour'], {
  fitW: 1080 * 0.6,
  contentOnly: true,
});
write('social/aaroh-profile-1080.png', render(profile, 1080).asPng());

// Banners: teal ground, reversed horizontal lockup (with its clear space) in the safe area.
// YouTube's safe area is 1546×423 (centred). LinkedIn's profile photo covers the lower left of
// the banner, so its safe area here is a centred 860×240.
const youtube = canvas(2560, 1440, C.teal, LOCKUPS.horizontal, VERSIONS.reversed, {
  fitW: 1546 * 0.85,
  fitH: 423 * 0.85,
});
write('social/aaroh-youtube-banner-2560x1440.png', render(youtube, 2560).asPng());
const linkedin = canvas(1584, 396, C.teal, LOCKUPS.horizontal, VERSIONS.reversed, {
  fitW: 860,
  fitH: 240,
});
write('social/aaroh-linkedin-banner-1584x396.png', render(linkedin, 1584).asPng());

// ---------------------------------------------------------------------------------------------
// BRAND SHEET (PDF, A4 landscape)
// ---------------------------------------------------------------------------------------------

const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function cmykOf(hex) {
  // Uncalibrated conversion: a starting point; confirm with the printer's profile.
  const [r, g, b] = rgbOf(hex).map((n) => n / 255);
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map((n) =>
    Math.round(n * 100),
  );
}

const MM = 72 / 25.4;

async function brandSheet() {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 0,
    info: { Title: `${TITLE} — Brand sheet`, Author: TITLE },
  });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on('end', resolve));

  doc.registerFont('serif', out('fonts', 'CormorantGaramond-SemiBold.ttf'));
  doc.registerFont('sans', out('fonts', 'Jost-Regular.ttf'));
  doc.registerFont('sans-medium', out('fonts', 'Jost-Medium.ttf'));

  const W = doc.page.width;
  const H = doc.page.height;
  const M = 36;

  // Draws a lockup with its top-left (including clear space) at (x, y), `width` points wide.
  function draw(lockup, v, x, y, width, { content = false } = {}) {
    const s = content ? width / (lockup.w - 2 * lockup.clear) : width / lockup.w;
    const ox = content ? x - lockup.clear * s : x;
    const oy = content ? y - lockup.clear * s : y;
    doc.save().translate(ox, oy).scale(s);
    for (const d of lockup.circles)
      doc.circle(d.cx, d.cy, d.r).fill(d.role === 'top' ? v.top : v.dot);
    if (lockup.text) doc.path(lockup.text.paths.join('')).fill(v.text);
    doc.restore();
    return { w: width, h: (content ? lockup.h - 2 * lockup.clear : lockup.h) * s };
  }
  const label = (text, x, y, opts = {}) =>
    doc
      .font('sans-medium')
      .fontSize(7)
      .fillColor(C.teal)
      .text(text.toUpperCase(), x, y, { characterSpacing: 1.2, lineBreak: false, ...opts });
  const body = (text, x, y, width, size = 8.5) =>
    doc.font('sans').fontSize(size).fillColor('#3d4f4c').text(text, x, y, { width, lineGap: 2 });
  const panel = (x, y, w, h, fill) => doc.rect(x, y, w, h).fill(fill);
  const header = (title, page) => {
    panel(0, 0, W, H, C.ivory);
    doc
      .font('serif')
      .fontSize(22)
      .fillColor(C.teal)
      .text(title, M, M - 6, { lineBreak: false });
    label(`${TITLE} · Brand sheet · ${page}`, W - M - 260, M + 2, { width: 260, align: 'right' });
    doc
      .moveTo(M, M + 26)
      .lineTo(W - M, M + 26)
      .lineWidth(0.5)
      .strokeColor('#d8cfbf')
      .stroke();
  };

  // ---- Page 1: mark, lockups, colours, fonts ----
  header('The Aaroh identity', '1/2');
  const top = M + 44;

  // The mark
  label('The mark: Seven Swaras', M, top);
  draw(LOCKUPS.icon, VERSIONS['full-colour'], M + 10, top + 24, 150, { content: true });
  body(
    'Seven notes rising, like the seven swaras of the ascending scale (Sa Re Ga Ma Pa Dha Ni), each a little larger than the last. The seventh, in gold, is the arrival.',
    M,
    top + 170,
    200,
  );

  // Lockups
  const lx = M + 240;
  label('Lockups', lx, top);
  const hzW = (W - M - lx - 16) / 2; // two horizontal lockups side by side
  const hzH = hzW * (LOCKUPS.horizontal.h / LOCKUPS.horizontal.w);
  draw(LOCKUPS.horizontal, VERSIONS['full-colour'], lx, top + 14, hzW);
  panel(lx + hzW + 16, top + 14, hzW, hzH, C.teal);
  draw(LOCKUPS.horizontal, VERSIONS.reversed, lx + hzW + 16, top + 14, hzW);
  const rowY = top + 14 + hzH + 16;
  const stW = 120;
  const stH = stW * (LOCKUPS.stacked.h / LOCKUPS.stacked.w);
  draw(LOCKUPS.stacked, VERSIONS['full-colour'], lx, rowY, stW);
  panel(lx + 130, rowY, stW, stH, C.teal);
  draw(LOCKUPS.stacked, VERSIONS.reversed, lx + 130, rowY, stW);
  draw(LOCKUPS.icon, VERSIONS.black, lx + 270, rowY + 6, 70);
  panel(lx + 350, rowY, 80, stH * 0.62, C.black);
  draw(LOCKUPS.icon, VERSIONS.white, lx + 355, rowY + 6, 70);
  body(
    'Black and white one-colour versions, for single-colour print, embossing and engraving.',
    lx + 270,
    rowY + stH * 0.62 + 8,
    200,
    7.5,
  );
  body(
    'Horizontal for headers and documents; stacked for square and centred layouts; the icon alone for avatars, app icons and favicons.',
    lx + 440,
    rowY + 4,
    100,
    7.5,
  );

  // Colours
  const cy = 330;
  label('Colours', M, cy);
  const swatches = ['teal', 'gold', 'lightGold', 'ivory'];
  const sw = (W - 2 * M - 3 * 12) / 4;
  swatches.forEach((key, i) => {
    const col = COLOURS[key];
    const x = M + i * (sw + 12);
    doc.rect(x, cy + 16, sw, 46).fill(col.hex);
    if (key === 'ivory')
      doc
        .rect(x, cy + 16, sw, 46)
        .lineWidth(0.5)
        .strokeColor('#d8cfbf')
        .stroke();
    doc
      .font('serif')
      .fontSize(13)
      .fillColor(C.teal)
      .text(col.name, x, cy + 68, { lineBreak: false });
    const [r, g, b] = rgbOf(col.hex);
    const [c, m, y, k] = cmykOf(col.hex);
    body(
      `HEX ${col.hex}\nRGB ${r} ${g} ${b}\nCMYK ${c} ${m} ${y} ${k}${col.note ? `\nUse ${col.note}` : ''}`,
      x,
      cy + 86,
      sw,
      8,
    );
  });

  // Fonts
  const fy = 486;
  label('Typefaces', M, fy);
  doc
    .font('serif')
    .fontSize(26)
    .fillColor(C.teal)
    .text('AAROH', M, fy + 14, { characterSpacing: 26 * NAME_TRACKING, lineBreak: false });
  body('Cormorant Garamond SemiBold (600), letter-spacing 8%. The name.', M, fy + 50, 240, 8);
  doc
    .font('sans-medium')
    .fontSize(11)
    .fillColor(C.teal)
    .text('ENTERTAINMENT', M + 300, fy + 22, {
      characterSpacing: 11 * SUB_TRACKING,
      lineBreak: false,
    });
  body(
    'Jost Medium (500), capitals, letter-spacing 68%, set to the width of AAROH.',
    M + 300,
    fy + 50,
    260,
    8,
  );
  body(
    'Both are free under the SIL Open Font License (Google Fonts); copies and licences are in fonts/.',
    M + 580,
    fy + 22,
    190,
    8,
  );

  // ---- Page 2: clear space, minimum sizes, do and don't ----
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 0 });
  header('Using the logo', '2/2');

  // Clear space
  label('Clear space', M, top);
  const csW = 300;
  const hz = LOCKUPS.horizontal;
  const s = csW / hz.w;
  const csY = top + 20;
  doc.rect(M, csY, csW, hz.h * s).fill('#efe6d6');
  doc
    .rect(M + hz.clear * s, csY + hz.clear * s, csW - 2 * hz.clear * s, (hz.h - 2 * hz.clear) * s)
    .fill(C.ivory);
  draw(hz, VERSIONS['full-colour'], M, csY, csW);
  // Show the unit: the gold dot's diameter.
  const gold = hz.circles[hz.circles.length - 1];
  doc.save().translate(M, csY).scale(s);
  doc
    .circle(gold.cx, gold.cy, gold.r)
    .lineWidth(0.6 / s)
    .strokeColor('#a23b2a')
    .stroke();
  doc.restore();
  const x = hz.clear * s;
  const dim = (x1, y1, x2, y2) =>
    doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(0.6).strokeColor('#a23b2a').stroke();
  dim(M, csY + hz.h * s * 0.5, M + x, csY + hz.h * s * 0.5); // left margin
  dim(M + csW * 0.5, csY, M + csW * 0.5, csY + x); // top margin
  doc.font('serif').fontSize(10).fillColor('#a23b2a');
  doc.text('x', M + x * 0.38, csY + hz.h * s * 0.5 - 12, { lineBreak: false });
  doc.text('x', M + csW * 0.5 + 3, csY + x * 0.2, { lineBreak: false });
  doc.text('x', (gold.cx + gold.r) * s + M + 3, csY + gold.cy * s - 6, { lineBreak: false });
  body(
    'x = the diameter of the gold dot at the size the logo is used. Keep a margin of x on every side; nothing else (text, edges, other logos) goes inside it.',
    M,
    csY + hz.h * s + 10,
    csW,
  );

  // Minimum sizes
  const mx = M + 360;
  label('Minimum sizes', mx, top);
  draw(smallIcon(), VERSIONS['full-colour'], mx, top + 26, 6 * MM);
  body(
    'Icon: 16 px on screen, 6 mm in print. At 24 px and below use the small-size variant (four dots).',
    mx + 28,
    top + 22,
    150,
    8,
  );
  draw(LOCKUPS.horizontal, VERSIONS['full-colour'], mx + 200, top + 22, 30 * MM, { content: true });
  body('Horizontal lockup: 120 px wide on screen, 30 mm in print.', mx + 200, top + 46, 180, 8);
  doc
    .font('sans')
    .fontSize(7)
    .fillColor('#7a8784')
    .text('Shown at actual print size.', mx, top + 78, { lineBreak: false });

  // Do / don't
  const dy = 250;
  label("Do and don't", M, dy);
  const tile = (W - 2 * M - 5 * 10) / 6;
  const tileH = 130;
  const cases = [
    {
      title: 'Do: use the supplied files',
      ok: true,
      drawMark: (x, y, w) =>
        draw(LOCKUPS.icon, VERSIONS['full-colour'], x, y, w, { content: true }),
    },
    {
      title: "Don't recolour",
      drawMark: (x, y, w) =>
        draw(LOCKUPS.icon, { dot: '#7b4bb3', top: '#e0457b', text: '#000' }, x, y, w, {
          content: true,
        }),
    },
    {
      title: "Don't stretch",
      drawMark: (x, y, w) => {
        doc.save().translate(x, y).scale(1.35, 0.7);
        draw(LOCKUPS.icon, VERSIONS['full-colour'], 0, 0, w * 0.75, { content: true });
        doc.restore();
      },
    },
    {
      title: "Don't rotate",
      drawMark: (x, y, w) => {
        doc.save().rotate(-28, { origin: [x + w / 2, y + w * 0.43] });
        draw(LOCKUPS.icon, VERSIONS['full-colour'], x, y, w, { content: true });
        doc.restore();
      },
    },
    {
      title: "Don't add effects",
      drawMark: (x, y, w) => {
        doc.save().opacity(0.35);
        draw(LOCKUPS.icon, { dot: '#000', top: '#000', text: '#000' }, x + 5, y + 6, w, {
          content: true,
        });
        doc.restore();
        draw(LOCKUPS.icon, VERSIONS['full-colour'], x, y, w, { content: true });
        const k = w / (LOCKUPS.icon.w - 2 * LOCKUPS.icon.clear);
        doc
          .save()
          .translate(x - LOCKUPS.icon.clear * k, y - LOCKUPS.icon.clear * k)
          .scale(k);
        for (const d of LOCKUPS.icon.circles)
          doc
            .circle(d.cx, d.cy, d.r + 1.6)
            .lineWidth(1.2)
            .strokeColor('#e8c552')
            .stroke();
        doc.restore();
      },
    },
    {
      title: "Don't rearrange the dots",
      drawMark: (x, y, w) => {
        const shuffled = [DOTS[3], DOTS[0], DOTS[5], DOTS[1], DOTS[6], DOTS[2], DOTS[4]].map(
          ([, , r], i) => [DOTS[i][0], DOTS[i][1], r],
        );
        const L = {
          ...LOCKUPS.icon,
          circles: placeMark(shuffled, CLEAR, CLEAR, 1).map((d, i) => ({
            ...d,
            role: shuffled[i] === shuffled[4] ? 'top' : 'dot',
          })),
        };
        draw(L, VERSIONS['full-colour'], x, y, w, { content: true });
      },
    },
  ];
  cases.forEach((cs, i) => {
    const x = M + i * (tile + 10);
    const y = dy + 16;
    doc.rect(x, y, tile, tileH).fill('#ffffff');
    doc.save().rect(x, y, tile, tileH).clip();
    cs.drawMark(
      x + tile * 0.2,
      y + (tileH - tile * 0.6 * (boxOf(DOTS).h / boxOf(DOTS).w)) / 2,
      tile * 0.6,
    );
    doc.restore();
    doc.rect(x, y + tileH, tile, 4).fill(cs.ok ? '#3f7a5a' : '#a23b2a');
    doc
      .font('sans-medium')
      .fontSize(8)
      .fillColor(cs.ok ? '#3f7a5a' : '#a23b2a')
      .text(cs.title, x, y + tileH + 10, { width: tile, align: 'center' });
  });
  body(
    'Always use the supplied files. Keep the dots, their sizes, order and spacing, the colours and the proportions exactly as drawn: no recolouring, stretching, rotating, shadows, glows, outlines or rearranging. On photographs, use the reversed or one-colour version where it reads clearly.',
    M,
    dy + tileH + 44,
    W - 2 * M,
  );

  doc.end();
  await done;
  return Buffer.concat(chunks);
}

write('brand-sheet/aaroh-brand-sheet.pdf', await brandSheet());

// ---------------------------------------------------------------------------------------------
// WEBSITE: the files the Aaroh site (../client) uses, written straight into it
// ---------------------------------------------------------------------------------------------

const SITE = '../client/public';

// The icon beside the name in the site header: the mark without its clear space. The site
// inlines it and sets the colours: --logo-ink for the dots, --logo-accent for the top dot. The
// fallbacks are the full-colour version.
{
  const icon = LOCKUPS.icon;
  const c = icon.clear;
  const dots = icon.circles.filter((d) => d.role === 'dot');
  const topDot = icon.circles.find((d) => d.role === 'top');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${num(c)} ${num(c)} ${num(icon.w - 2 * c)} ${num(icon.h - 2 * c)}">` +
    `<g style="fill:var(--logo-ink,${C.teal})">${dots.map((d) => `<circle cx="${num(d.cx)}" cy="${num(d.cy)}" r="${num(d.r)}"/>`).join('')}</g>` +
    `<circle style="fill:var(--logo-accent,${C.gold})" cx="${num(topDot.cx)}" cy="${num(topDot.cy)}" r="${num(topDot.r)}"/></svg>`;
  write(`${SITE}/brand/icon.svg`, svg);
}

write(`${SITE}/brand/favicon.svg`, favSvg);
write(`${SITE}/favicon.ico`, await pngToIco(favPngs));
write(`${SITE}/brand/apple-touch-icon.png`, render(appIcon, 180).asPng());
write(`${SITE}/brand/icon-192.png`, render(appIcon, 192).asPng());
// Also the logo in search results (Organization JSON-LD).
write(`${SITE}/brand/icon-512.png`, render(appIcon, 512).asPng());

// Default share image (pages without their own): teal, reversed horizontal lockup.
const og = canvas(1200, 630, C.teal, LOCKUPS.horizontal, VERSIONS.reversed, {
  fitW: 1200 * 0.66,
  fitH: 630 * 0.66,
});
write(`${SITE}/brand/og-default.png`, render(og, 1200).asPng());

write(
  `${SITE}/site.webmanifest`,
  JSON.stringify(
    {
      name: TITLE,
      short_name: 'Aaroh',
      icons: [
        { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: C.ivory,
      background_color: C.ivory,
      display: 'browser',
    },
    null,
    2,
  ) + '\n',
);

// ---------------------------------------------------------------------------------------------

console.log(`Wrote ${written.length} files.`);
if (problems.length) {
  console.error('Problems:\n' + problems.join('\n'));
  process.exit(1);
}
