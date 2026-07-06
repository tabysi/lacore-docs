import Image from 'next/image'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import wordmark from '../public/lacore23.png'

export const metadata = {
  title: {
    default: 'LACORE Documentation',
    template: '%s — LACORE',
  },
  description:
    'Official documentation for LACORE — the all-in-one configurable roleplay core for FiveM, by @tabysi.',
}

// The wordmark is black-on-white, so give it a white badge background — stays
// readable in dark mode too.
const navLink = { fontSize: '.9rem', fontWeight: 500, whiteSpace: 'nowrap' }

const navbar = (
  <Navbar
    logo={
      <Image
        src={wordmark}
        alt="LACORE"
        height={36}
        priority
        style={{ background: '#fff', borderRadius: 6, padding: '3px 8px', width: 'auto', height: 36 }}
      />
    }
    projectLink="https://github.com/tabysi"
    chatLink="https://discord.gg/b6YbvVEvYp"
  >
    <a href="https://lacore.tebex.io/" target="_blank" rel="noreferrer" style={navLink}>Store</a>
    <a href="https://www.patreon.com/c/5mlacore/" target="_blank" rel="noreferrer" style={navLink}>Patreon</a>
  </Navbar>
)

const footerLink = { textDecoration: 'underline' }
const footer = (
  <Footer>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '.5rem' }}>
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
