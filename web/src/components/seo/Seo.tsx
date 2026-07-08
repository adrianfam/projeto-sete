import { Helmet } from 'react-helmet-async'
import { buildSeo, type SeoInput } from '@/lib/seo'

/** Emite title/meta/OG/Twitter/JSON-LD por página. */
export function Seo(input: SeoInput) {
  const seo = buildSeo(input)
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      {seo.noindex && <meta name="robots" content="noindex,nofollow" />}

      {Object.entries(seo.og).map(([k, v]) => (
        <meta key={k} property={k} content={String(v)} />
      ))}
      {Object.entries(seo.twitter).map(([k, v]) => (
        <meta key={k} name={k} content={String(v)} />
      ))}

      <script type="application/ld+json">{JSON.stringify(seo.jsonLd)}</script>
    </Helmet>
  )
}
