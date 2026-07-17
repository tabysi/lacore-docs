import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './lacore-theme.css'
import { SITE, BASE, SITE_NAME, DEFAULT_DESCRIPTION, share } from '../lib/seo'

export const metadata = {
  // Resolves any relative metadata URL and canonical links against the deployed
  // origin + base path (empty locally). Trailing slash matters for base-path sites.
  metadataBase: new URL(`${SITE}${BASE}/`),
  title: {
    default: SITE_NAME,
    template: '%s — LACORE',
  },
  description: DEFAULT_DESCRIPTION,
  // Site-wide share preview. Individual pages override the image (see
  // app/[[...mdxPath]]/page.jsx — changelog pages use their release card).
  ...share(),
}

// Website-matching text wordmark: LA + CORE (accent), Chakra Petch.
const logo = <span className="lac-wordmark">LA<b>CORE</b></span>

const navbar = (
  <Navbar
    logo={logo}
    projectLink="https://github.com/tabysi"
    chatLink="https://discord.gg/b6YbvVEvYp"
  >
    <a href="https://lacore.netica.dev/" target="_blank" rel="noreferrer" className="lac-nav-link">Website</a>
    <a href="https://www.patreon.com/c/5mlacore/" target="_blank" rel="noreferrer" className="lac-nav-link">Patreon</a>
    <a href="https://lacore.tebex.io/" target="_blank" rel="noreferrer" className="lac-nav-link lac-nav-cta">GET LACORE</a>
  </Navbar>
)

const footer = (
  <Footer>
    <div className="lac-footer">
      <div className="lac-footer-top">
        <div className="lac-footer-brand">
          <span className="lac-wordmark">LA<b>CORE</b></span>
          <span className="lac-footer-tag">FIVEM CORE FRAMEWORK</span>
        </div>
        <div className="lac-footer-links">
          <a href="https://lacore.netica.dev/" target="_blank" rel="noreferrer">Website</a>
          <a href="https://lacore.tebex.io/" target="_blank" rel="noreferrer">Store</a>
          <a href="https://www.patreon.com/c/5mlacore/" target="_blank" rel="noreferrer">Patreon</a>
          <a href="https://discord.gg/b6YbvVEvYp" target="_blank" rel="noreferrer">Discord</a>
          <a href="https://github.com/tabysi" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
      <div className="lac-footer-fine">
        LACORE — created by <a href="https://github.com/tabysi" target="_blank" rel="noreferrer">@tabysi</a>. © {new Date().getFullYear()}. All rights reserved.
      </div>
    </div>
  </Footer>
)

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/tabysi/lacore-docs/tree/main"
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
