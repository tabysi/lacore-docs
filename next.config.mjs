import nextra from 'nextra'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// GitHub Pages project sites are served from https://<user>.github.io/<repo>/.
// The deploy workflow sets NEXT_PUBLIC_BASE_PATH to `/<repo>` so links/assets
// resolve. Locally (no env) it stays empty so `npm run dev` works at `/`.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const withNextra = nextra({
  defaultShowCopyCode: true,
})

export default withNextra({
  reactStrictMode: true,
  // Static HTML export for GitHub Pages.
  output: 'export',
  images: { unoptimized: true },
  basePath,
  trailingSlash: true,
  // Several lockfiles exist further up the tree — pin the root so Next resolves
  // node_modules from here.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
})
