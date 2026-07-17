// Generates one changelog page per release from the repo-root `changelog.md`.
//
// Usage:  npm run changelog
//
// It splits `changelog.md` on `## [version]` headers, writes a page per numbered
// release into content/updates/changelog/, merges all `[Unreleased]` blocks into a
// single "Unreleased / Dev" page, rebuilds the _meta.js order and the All-Releases
// index. Content is sanitised so it renders safely as MDX.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'changelog.md')
const OUT = path.join(ROOT, 'content', 'updates', 'changelog')
const THUMBS = path.join(ROOT, 'public', 'changelog')
const OGDIR = path.join(ROOT, 'public', 'og')

// Rasterise a card SVG → 1200×630 PNG. Social scrapers (Discord, WhatsApp, X, …)
// don't render SVG, so every share image ships as PNG. Rendered at 2× then
// downscaled for crisp text. Fonts fall back to the SVG's system stack (Chakra
// Petch isn't installed at build time) — visually clean, verified.
async function renderPNG(svg, outFile) {
  await sharp(Buffer.from(svg), { density: 144 })
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toFile(outFile)
}

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

// Split a changelog header line into its title and (optional) date.
//   "[3.2.5] – Security & fairness hardening pass"        → { title, date: '' }
//   "[3.0.5h] – 2026-06-14 — Profilsystem: … "            → { title, date: '2026-06-14' }
function parseHeader(headerLine) {
  let rest = headerLine.replace(/^\[[^\]]+\]\s*[–—-]?\s*/, '')
  let date = ''
  const m = rest.match(/^(\d{4}-\d{2}-\d{2})\s*[–—-]?\s*/)
  if (m) { date = m[1]; rest = rest.slice(m[0].length) }
  return { title: rest.trim(), date }
}

// A branded 1200×630 release card per release (lacore-release-card-template.svg).
function thumbnailSVG({ version, title, date }) {
  const ver = xml('v' + version)
  const t = xml(clip(title, 44))
  const d = xml(date || '')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="'Chakra Petch', 'Segoe UI', system-ui, -apple-system, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#08090c"/>
      <stop offset="1" stop-color="#0e131c"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.16" r="0.72">
      <stop offset="0" stop-color="#4a5cff" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#4a5cff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="core" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#9fb0ff"/>
      <stop offset="0.45" stop-color="#4a5cff"/>
      <stop offset="1" stop-color="#2a35b0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#4a5cff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="#4a5cff" stroke-width="3" fill="none">
    <path d="M40 74 V40 H74"/>
    <path d="M1160 556 V590 H1126"/>
  </g>
  <g stroke="#2c3650" stroke-width="3" fill="none">
    <path d="M1160 74 V40 H1126"/>
    <path d="M40 556 V590 H74"/>
  </g>
  <rect x="40" y="40" width="6" height="550" fill="#4a5cff"/>
  <g transform="translate(1006 150)">
    <g transform="translate(-90 -90)">
      <polygon points="90,10 156,48 156,124 90,162 24,124 24,48" fill="#0e1220" stroke="#2c3650" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="90,10 156,48 156,124 90,162 24,124 24,48" fill="none" stroke="#4a5cff" stroke-width="1.5" stroke-linejoin="round" opacity="0.4"/>
      <circle cx="90" cy="86" r="44" fill="none" stroke="#4a5cff" stroke-width="1.6" stroke-dasharray="5 9" opacity="0.55"/>
      <circle cx="90" cy="86" r="29" fill="none" stroke="#6c8cff" stroke-width="3.4"/>
      <circle cx="90" cy="86" r="10.5" fill="url(#core)"/>
      <g stroke="#9fb0ff" stroke-width="3.4" stroke-linecap="round">
        <line x1="90" y1="43" x2="90" y2="54"/>
        <line x1="90" y1="118" x2="90" y2="129"/>
        <line x1="47" y1="86" x2="58" y2="86"/>
        <line x1="122" y1="86" x2="133" y2="86"/>
      </g>
    </g>
  </g>
  <g stroke="#1a2131" stroke-width="1" opacity="0.7">
    <line x1="84" y1="392" x2="1116" y2="392"/>
    <line x1="84" y1="496" x2="1116" y2="496"/>
  </g>
  <text x="84" y="112" fill="#e7ecf5" font-size="30" font-weight="700" letter-spacing="7">LA<tspan fill="#6c8cff">CORE</tspan></text>
  <g>
    <rect x="84" y="150" width="150" height="30" rx="5" fill="none" stroke="#2c3650"/>
    <text x="100" y="171" fill="#9fb0ff" font-size="15" font-weight="700" letter-spacing="3">RELEASE</text>
  </g>
  <text x="80" y="342" fill="#eef2f8" font-size="168" font-weight="700" letter-spacing="-4">${ver}</text>
  <text x="84" y="452" fill="#9fb0ff" font-size="40" font-weight="600">${t}</text>
  <text x="84" y="548" fill="#6b7689" font-size="24" font-weight="500" letter-spacing="1">lacore.netica.dev</text>
  <text x="1116" y="548" fill="#4d5872" font-size="22" font-weight="500" letter-spacing="2" text-anchor="end">${d}</text>
</svg>
`
}

// The site-wide default card — same frame/hexagon as the release cards, but the
// LACORE wordmark instead of a version. Shown when a shared page has no card of
// its own (every page except a specific changelog version).
function defaultCardSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="'Chakra Petch', 'Segoe UI', system-ui, -apple-system, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#08090c"/>
      <stop offset="1" stop-color="#0e131c"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.16" r="0.72">
      <stop offset="0" stop-color="#4a5cff" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#4a5cff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="core" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#9fb0ff"/>
      <stop offset="0.45" stop-color="#4a5cff"/>
      <stop offset="1" stop-color="#2a35b0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#4a5cff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="#4a5cff" stroke-width="3" fill="none">
    <path d="M40 74 V40 H74"/>
    <path d="M1160 556 V590 H1126"/>
  </g>
  <g stroke="#2c3650" stroke-width="3" fill="none">
    <path d="M1160 74 V40 H1126"/>
    <path d="M40 556 V590 H74"/>
  </g>
  <rect x="40" y="40" width="6" height="550" fill="#4a5cff"/>
  <g transform="translate(1006 200)">
    <g transform="translate(-90 -90)">
      <polygon points="90,10 156,48 156,124 90,162 24,124 24,48" fill="#0e1220" stroke="#2c3650" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="90,10 156,48 156,124 90,162 24,124 24,48" fill="none" stroke="#4a5cff" stroke-width="1.5" stroke-linejoin="round" opacity="0.4"/>
      <circle cx="90" cy="86" r="44" fill="none" stroke="#4a5cff" stroke-width="1.6" stroke-dasharray="5 9" opacity="0.55"/>
      <circle cx="90" cy="86" r="29" fill="none" stroke="#6c8cff" stroke-width="3.4"/>
      <circle cx="90" cy="86" r="10.5" fill="url(#core)"/>
      <g stroke="#9fb0ff" stroke-width="3.4" stroke-linecap="round">
        <line x1="90" y1="43" x2="90" y2="54"/>
        <line x1="90" y1="118" x2="90" y2="129"/>
        <line x1="47" y1="86" x2="58" y2="86"/>
        <line x1="122" y1="86" x2="133" y2="86"/>
      </g>
    </g>
  </g>
  <g>
    <rect x="84" y="150" width="200" height="30" rx="5" fill="none" stroke="#2c3650"/>
    <text x="100" y="171" fill="#9fb0ff" font-size="15" font-weight="700" letter-spacing="3">DOCUMENTATION</text>
  </g>
  <text x="80" y="352" fill="#eef2f8" font-size="132" font-weight="700" letter-spacing="-2">LA<tspan fill="#6c8cff">CORE</tspan></text>
  <text x="84" y="440" fill="#9fb0ff" font-size="36" font-weight="600">The all-in-one FiveM roleplay core</text>
  <line x1="84" y1="492" x2="1116" y2="492" stroke="#1a2131" stroke-width="1" opacity="0.7"/>
  <text x="84" y="548" fill="#6b7689" font-size="24" font-weight="500" letter-spacing="1">lacore.netica.dev</text>
  <text x="1116" y="548" fill="#4d5872" font-size="22" font-weight="500" letter-spacing="2" text-anchor="end">DOCS</text>
</svg>
`
}

const raw = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n')
const lines = raw.split('\n')

const starts = []
lines.forEach((l, i) => { if (/^## \[/.test(l)) starts.push(i) })

// Escape MDX-breaking chars outside fenced code blocks + inline code.
function sanitize(md) {
  let inFence = false
  return md.split('\n').map((line) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return line }
    if (inFence) return line
    return line.split(/(`[^`]*`)/g).map((p) => {
      if (p.startsWith('`') && p.endsWith('`')) return p
      return p.replace(/</g, '&lt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
    }).join('')
  }).join('\n')
}

// Pull warning blockquotes out of a section body so they can be promoted to an
// alert banner at the very top of the page (under the title + description). Matches
// GitHub-style `> [!WARNING]`, a bare `> ⚠️ …`, or a `> **Config change …` note —
// the convention for flagging that a config file changed. Returns the extracted
// texts (marker stripped) and the body with those blocks removed.
function splitWarnings(body) {
  const lines = body.split('\n')
  const warnings = []
  const kept = []
  const isWarnStart = (l) => /^>\s*(\[!WARNING\]|⚠️|\*\*Config change)/i.test(l)
  let i = 0
  while (i < lines.length) {
    if (isWarnStart(lines[i])) {
      const block = []
      while (i < lines.length && /^>/.test(lines[i])) { block.push(lines[i].replace(/^>\s?/, '')); i++ }
      const text = block.join('\n').trim().replace(/^\[!WARNING\]\s*/i, '').replace(/^⚠️\s*/, '').trim()
      if (text) warnings.push(text)
      if (i < lines.length && lines[i].trim() === '') i++ // consume one trailing blank
      continue
    }
    kept.push(lines[i]); i++
  }
  return { warnings, body: kept.join('\n').replace(/\n{3,}/g, '\n\n').trim() }
}

const yaml = (s) => '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
const slugFor = (ver) => 'v' + ver.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')

const sections = []
for (let s = 0; s < starts.length; s++) {
  const from = starts[s]
  const to = s + 1 < starts.length ? starts[s + 1] : lines.length
  const headerLine = lines[from].replace(/^## /, '').trim()
  const body = lines.slice(from + 1, to).join('\n').replace(/\n+$/, '')
  const bracket = (headerLine.match(/^\[([^\]]+)\]/) || [])[1] || headerLine
  sections.push({ headerLine, body, bracket })
}

// Clean any old generated pages (keep nothing but what we regenerate).
for (const f of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, f))

// Fresh thumbnails dir (SVG banners + PNG share cards).
fs.rmSync(THUMBS, { recursive: true, force: true })
fs.mkdirSync(THUMBS, { recursive: true })
fs.mkdirSync(OGDIR, { recursive: true })

const meta = { index: "'All Releases'" }
const unreleased = []
let unreleasedPlaced = false

for (const sec of sections) {
  if (/^unreleased$/i.test(sec.bracket)) {
    unreleased.push('## ' + sec.headerLine + '\n\n' + sec.body)
    if (!unreleasedPlaced) { meta['unreleased'] = "'Unreleased / Dev'"; unreleasedPlaced = true }
    continue
  }
  const slug = slugFor(sec.bracket)
  meta[slug] = "'" + sec.bracket + "'"
  const { title: secTitle, date: secDate } = parseHeader(sec.headerLine)
  const cardSVG = thumbnailSVG({ version: sec.bracket, title: secTitle || sec.bracket, date: secDate })
  fs.writeFileSync(path.join(THUMBS, slug + '.svg'), cardSVG)   // crisp in-page banner
  await renderPNG(cardSVG, path.join(THUMBS, slug + '.png'))    // PNG share card for OG
  // Warnings (e.g. config changes) become a <Callout> alert banner at the top,
  // right under the title + description; the rest of the body follows.
  const { warnings, body: cleanBody } = splitWarnings(sec.body)
  const nl2 = cleanBody.indexOf('\n\n')
  const intro = nl2 >= 0 ? cleanBody.slice(0, nl2) : cleanBody
  const rest = nl2 >= 0 ? cleanBody.slice(nl2 + 2) : ''
  const callouts = warnings.map((w) => `<Callout type="warning">\n${sanitize(w)}\n</Callout>`).join('\n\n')

  const parts = [`---\ntitle: ${yaml(sec.bracket)}\n---`]
  if (warnings.length) parts.push(`import { Callout } from 'nextra/components'`)
  parts.push(`![LACORE ${sanitize(sec.bracket)}](/changelog/${slug}.svg)`)
  parts.push(`# ${sanitize(sec.headerLine)}`)
  if (intro.trim()) parts.push(sanitize(intro))
  if (callouts) parts.push(callouts)
  if (rest.trim()) parts.push(sanitize(rest))
  fs.writeFileSync(path.join(OUT, slug + '.mdx'), parts.join('\n\n') + '\n')
}

if (unreleased.length) {
  const page = `---\ntitle: "Unreleased / Development"\n---\n\n# Unreleased & Development Notes\n\nPre-release development history (multiple \`Unreleased\` blocks from the changelog).\n\n${sanitize(unreleased.join('\n\n---\n\n'))}\n`
  fs.writeFileSync(path.join(OUT, 'unreleased.mdx'), page)
}

// _meta.js
const metaBody = 'export default {\n' + Object.entries(meta)
  .map(([k, v]) => `  ${/^[a-zA-Z_$][\w$]*$/.test(k) ? k : "'" + k + "'"}: ${v},`)
  .join('\n') + '\n}\n'
fs.writeFileSync(path.join(OUT, '_meta.js'), metaBody)

// index.mdx — card grid with a thumbnail per version.
const cards = sections.filter((s) => !/^unreleased$/i.test(s.bracket)).map((s) => {
  const slug = slugFor(s.bracket)
  const desc = xml(parseHeader(s.headerLine).title)
  return `  <a href="/updates/changelog/${slug}" style={{ display: 'block', border: '1px solid var(--lac-line, #1a2131)', borderRadius: '12px', overflow: 'hidden', textDecoration: 'none', background: 'var(--lac-panel, #0d1017)' }}>
    <img src="/changelog/${slug}.svg" alt="LACORE ${xml(s.bracket)}" style={{ display: 'block', width: '100%', height: 'auto' }} />
    <span style={{ display: 'block', padding: '12px 16px', color: 'var(--lac-fg, #d7deea)', fontWeight: 600 }}>${desc}</span>
  </a>`
}).join('\n')
const idx = `---
title: All Releases
---

# Changelog — All Releases

Every LACORE release has its own page with the complete notes. Pick a version below.

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px', marginTop: '28px' }}>
${cards}
</div>

Development history lives on the [Unreleased / Dev](/updates/changelog/unreleased) page.
`
fs.writeFileSync(path.join(OUT, 'index.mdx'), idx)

// Site-wide default share card (shown for every non-version page).
await renderPNG(defaultCardSVG(), path.join(OGDIR, 'default.png'))

console.log(`Generated ${Object.keys(meta).length - 1} pages + ${sections.length - (unreleased.length ? 1 : 0)} PNG cards + default OG from changelog.md`)
