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
  />
)

const footer = (
  <Footer>
    LACORE — created by{' '}
    <a href="https://github.com/tabysi" style={{ textDecoration: 'underline' }}>@tabysi</a>. ©{' '}
    {new Date().getFullYear()}. All rights reserved.
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
