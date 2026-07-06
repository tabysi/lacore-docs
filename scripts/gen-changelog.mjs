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
  const page = `---\ntitle: ${yaml(sec.bracket)}\n---\n\n# ${sanitize(sec.headerLine)}\n\n${sanitize(sec.body)}\n`
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

// index.mdx — table of every version
const rows = sections.filter((s) => !/^unreleased$/i.test(s.bracket)).map((s) => {
  const slug = slugFor(s.bracket)
  const desc = s.headerLine.replace(/^\[[^\]]+\]\s*[–-]?\s*/, '').trim().replace(/\|/g, '\\|')
  return `| [${s.bracket}](/updates/changelog/${slug}) | ${desc} |`
}).join('\n')
const idx = `---\ntitle: All Releases\n---\n\n# Changelog — All Releases\n\nEvery LACORE release has its own page with the complete notes. Pick a version below.\n\n| Version | Notes |\n| --- | --- |\n${rows}\n\nDevelopment history lives on the [Unreleased / Dev](/updates/changelog/unreleased) page.\n`
fs.writeFileSync(path.join(OUT, 'index.mdx'), idx)

console.log(`Generated ${Object.keys(meta).length - 1} pages from changelog.md`)
