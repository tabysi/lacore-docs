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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'changelog.md')
const OUT = path.join(ROOT, 'content', 'updates', 'changelog')
const THUMBS = path.join(ROOT, 'public', 'changelog')

// Brand palette (mirrors app/lacore-theme.css).
const BRAND = { ink: '#08090c', ink2: '#0a0c11', panel: '#11161e', line: '#1a2131', brand: '#4a5cff', brand2: '#6c8cff', brand3: '#9fb0ff', fg: '#eef2f8', dim: '#98a6c0', muted: '#6b7689' }

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

// A branded 1200×630 thumbnail per release — dark gradient, brand glow, big version.
function thumbnailSVG(version, title) {
  const desc = clip(title, 52)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="Segoe UI, system-ui, -apple-system, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND.ink2}"/>
      <stop offset="1" stop-color="${BRAND.panel}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.12" r="0.7">
      <stop offset="0" stop-color="${BRAND.brand}" stop-opacity="0.34"/>
      <stop offset="1" stop-color="${BRAND.brand}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="${BRAND.line}" stroke-width="1" opacity="0.55">
    <line x1="0" y1="157" x2="1200" y2="157"/>
    <line x1="0" y1="472" x2="1200" y2="472"/>
  </g>
  <rect x="0" y="0" width="12" height="630" fill="${BRAND.brand}"/>
  <text x="84" y="118" fill="${BRAND.dim}" font-size="30" font-weight="700" letter-spacing="8">LACORE</text>
  <text x="80" y="352" fill="${BRAND.fg}" font-size="150" font-weight="800" letter-spacing="-2">v${xml(version)}</text>
  <text x="84" y="438" fill="${BRAND.brand3}" font-size="42" font-weight="600">${xml(desc)}</text>
  <text x="84" y="556" fill="${BRAND.muted}" font-size="26" font-weight="500" letter-spacing="1">lacore.netica.dev  ·  Changelog</text>
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

// Fresh thumbnails dir.
fs.rmSync(THUMBS, { recursive: true, force: true })
fs.mkdirSync(THUMBS, { recursive: true })

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
  const secTitle = sec.headerLine.replace(/^\[[^\]]+\]\s*[–-]?\s*/, '').trim()
  fs.writeFileSync(path.join(THUMBS, slug + '.svg'), thumbnailSVG(sec.bracket, secTitle || sec.bracket))
  const banner = `![LACORE ${sanitize(sec.bracket)}](/changelog/${slug}.svg)\n\n`
  const page = `---\ntitle: ${yaml(sec.bracket)}\n---\n\n${banner}# ${sanitize(sec.headerLine)}\n\n${sanitize(sec.body)}\n`
  fs.writeFileSync(path.join(OUT, slug + '.mdx'), page)
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
  const desc = xml(s.headerLine.replace(/^\[[^\]]+\]\s*[–-]?\s*/, '').trim())
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

console.log(`Generated ${Object.keys(meta).length - 1} pages from changelog.md`)
