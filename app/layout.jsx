import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './lacore-theme.css'

export const metadata = {
  title: {
    default: 'LACORE Documentation',
    template: '%s — LACORE',
  },
  description:
    'Official documentation for LACORE — the all-in-one configurable roleplay core for FiveM, by @tabysi.',
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

const footerLink = { textDecoration: 'underline' }
const footer = (
  <Footer>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '.5rem' }}>
      <a href="https://lacore.netica.dev/" target="_blank" rel="noreferrer" style={footerLink}>Website</a>
      <a href="https://lacore.tebex.io/" target="_blank" rel="noreferrer" style={footerLink}>Tebex Store</a>
      <a href="https://www.patreon.com/c/5mlacore/" target="_blank" rel="noreferrer" style={footerLink}>Patreon</a>
      <a href="https://discord.gg/b6YbvVEvYp" target="_blank" rel="noreferrer" style={footerLink}>Discord</a>
      <a href="https://github.com/tabysi" target="_blank" rel="noreferrer" style={footerLink}>GitHub</a>
    </div>
    LACORE — created by{' '}
    <a href="https://github.com/tabysi" style={footerLink}>@tabysi</a>. © {new Date().getFullYear()}.
    All rights reserved.
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
