# LACORE Documentation

Documentation site for **LACORE**, built with [Nextra 4](https://nextra.site) (docs theme).

## Develop

```bash
cd website
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Structure

- `content/` — MDX pages + `_meta.js` navigation.
- `app/` — Next.js App Router (layout + Nextra catch-all route).
- `next.config.mjs`, `mdx-components.js` — Nextra wiring.

Edit or add pages under `content/`. Each folder can have a `_meta.js` to control order + titles.

## Changelog pages

The per-version changelog pages under `content/updates/changelog/` are **generated** from the
`changelog.md` at the repo root. After editing `changelog.md`, regenerate them:

```bash
npm run changelog
```

This splits `changelog.md` on `## [version]` headers into one page per release (newest first),
merges the `[Unreleased]` blocks into a single "Unreleased / Dev" page, and rebuilds `_meta.js` +
the All-Releases index. Don't hand-edit the generated files — edit `changelog.md` and re-run.

## Publish (one command)

The docs live in the **private LACORE core** under `website/`, but are hosted from the separate
**public** repo `tabysi/lacore-docs`. To publish any change (docs content, a resource changelog
update, new partner logos, …):

```bash
cd website
npm run deploy                          # auto commit message
npm run deploy -- "your commit message" # custom message
```

`scripts/deploy.mjs` does everything:

1. Pulls the latest `changelog.md` from the resource and regenerates the changelog pages.
2. Mirrors `website/` (minus `node_modules/.next/out`) into a local clone of `lacore-docs`
   (`../lacore-docs`, created on first run — override with `LACORE_DOCS_DIR`).
3. Commits + pushes to `lacore-docs`.

The push triggers the GitHub Actions workflow, which **builds and deploys to GitHub Pages
automatically** — no local build needed. Watch it at
`https://github.com/tabysi/lacore-docs/actions`; the site is live ~1–2 min later at
`https://tabysi.github.io/lacore-docs/`. Only `website/` is ever published — the private core
source never leaves your machine.

## Hosting on GitHub Pages

The site is a static export (`output: 'export'` → `out/`) and deploys automatically via
`.github/workflows/deploy.yml`.

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Source = "GitHub Actions"**.
3. Push to `main` (any change under `website/**`) — the workflow builds and deploys.
4. The site is served at `https://<user>.github.io/<repo>/`.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/<repo>` so assets/links resolve under the project-site
subpath. To build locally against that path: `NEXT_PUBLIC_BASE_PATH=/<repo> npm run build`.

> `overrides.zod` in `package.json` is required — Nextra 4.6 is incompatible with newer zod;
> removing the pin reintroduces a build error. `react-aria` is pinned so a full install ships its
> `.mjs` files.
