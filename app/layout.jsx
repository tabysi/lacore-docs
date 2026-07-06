import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: {
    default: 'LACORE Documentation',
    template: '%s — LACORE',
  },
  description:
    'Official documentation for LACORE — the all-in-one configurable roleplay core for FiveM, by @tabysi.',
}

const navbar = (
  <Navbar
    logo={<b>LACORE</b>}
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
