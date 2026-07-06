// One-command docs publish: sync this `website/` folder into the public
// `lacore-docs` repo and push. GitHub Actions (.github/workflows/deploy.yml)
// then builds + deploys to GitHub Pages automatically — no manual build needed.
//
// Usage:
//   npm run deploy                 # auto commit message (timestamp)
//   npm run deploy -- "my message" # custom commit message
//
// What it does:
//   1. Pull the latest `changelog.md` from the resource (repo root) and
//      regenerate the per-version changelog pages, so a resource update is
//      reflected in the docs.
//   2. Mirror `website/` (minus node_modules/.next/out) into a local clone of
//      the lacore-docs repo, preserving that clone's .git.
//   3. commit + push. Pushing triggers the Pages build/deploy workflow.
//
// The private LACORE core is never published — only this website/ folder.

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEBSITE = path.resolve(__dirname, '..')       // website/
const CORE = path.resolve(WEBSITE, '..')            // private core repo root
const REMOTE = 'https://github.com/tabysi/lacore-docs.git'

// Persistent working clone of the public docs repo, kept OUTSIDE both the core
// and the website/ folder so it is never itself published. Override with env.
const CLONE = process.env.LACORE_DOCS_DIR || path.resolve(CORE, '..', 'lacore-docs')

// Never copy build output or dependencies into the published repo.
const EXCLUDE = new Set(['node_modules', '.next', 'out', '.git', '.turbo', '.vercel'])

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' })
const out = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8' }).trim()
const log = (m) => console.log(`\x1b[36m›\x1b[0m ${m}`)

// ── 1. refresh changelog from the resource, then regenerate the pages ────────
const coreChangelog = path.join(CORE, 'changelog.md')
const webChangelog = path.join(WEBSITE, 'changelog.md')
if (fs.existsSync(coreChangelog)) {
  fs.copyFileSync(coreChangelog, webChangelog)
  log('Pulled changelog.md from the resource.')
}
log('Regenerating changelog pages …')
run('node scripts/gen-changelog.mjs', WEBSITE)

// ── 2. ensure the docs clone exists and is up to date ────────────────────────
if (!fs.existsSync(path.join(CLONE, '.git'))) {
  log(`Cloning ${REMOTE}`)
  log(`     → ${CLONE}`)
  run(`git clone "${REMOTE}" "${CLONE}"`, CORE)
} else {
  log('Updating existing docs clone …')
  try { run('git pull --ff-only', CLONE) } catch {
    console.warn('  (pull skipped — continuing with local state)')
  }
}

// ── 3. mirror website/ → clone (preserve the clone's .git) ───────────────────
log('Syncing website/ → docs repo …')
for (const entry of fs.readdirSync(CLONE)) {
  if (entry === '.git') continue
  fs.rmSync(path.join(CLONE, entry), { recursive: true, force: true })
}
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true })
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue
    const s = path.join(src, e.name)
    const d = path.join(dst, e.name)
    if (e.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}
copyDir(WEBSITE, CLONE)
// GitHub Pages needs .nojekyll so /_next assets are served.
fs.writeFileSync(path.join(CLONE, '.nojekyll'), '')

// ── 4. commit + push (skip if nothing changed) ───────────────────────────────
run('git add -A', CLONE)
if (!out('git status --porcelain', CLONE)) {
  log('No changes to publish — docs already up to date.')
  process.exit(0)
}
const msg = process.argv.slice(2).join(' ').trim() ||
  `docs: update ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`
run(`git -c commit.gpgsign=false commit -m "${msg.replace(/"/g, '\\"')}"`, CLONE)
log('Pushing to lacore-docs …')
run('git push origin HEAD:main', CLONE)

console.log('\n\x1b[32m✓ Pushed.\x1b[0m GitHub Actions is now building + deploying:')
console.log('  https://github.com/tabysi/lacore-docs/actions')
console.log('  Live in ~1–2 min → https://tabysi.github.io/lacore-docs/')
