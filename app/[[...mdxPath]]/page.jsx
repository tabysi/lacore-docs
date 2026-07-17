import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'
import { share, changelogImageFor, DEFAULT_OG_IMAGE } from '../../lib/seo'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)

  // Give every page a share preview. Changelog version pages use their own
  // release card; everything else falls back to the site default. Built from
  // the page's own title/description so the card text matches the page.
  const segments = params.mdxPath || []
  const image = changelogImageFor(segments) || DEFAULT_OG_IMAGE
  const path = segments.length ? '/' + segments.join('/') : ''

  return {
    ...metadata,
    ...share({ title: metadata.title, description: metadata.description, image, path }),
  }
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props) {
  const params = await props.params
  const result = await importPage(params.mdxPath)
  const { default: MDXContent, toc, metadata } = result
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
