import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: 'LACORE Documentation',
  description:
    'Documentation for LACORE — the configurable roleplay core for FiveM (Pacific Valley Roleplay).',
}

const navbar = <Navbar logo={<b>LACORE</b>} />
const footer = <Footer>© {new Date().getFullYear()} LACORE — Pacific Valley Roleplay.</Footer>

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/tabysi/lacore"
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
