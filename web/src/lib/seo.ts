import { brand } from '@projeto-sete/shared'

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://projetosete.com.br'

export interface SeoInput {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: object
}

export function buildSeo(input: SeoInput) {
  const title = input.title ?? `${brand.name} — ${brand.tagline}`
  const description = input.description ?? brand.description
  const path = input.path ?? '/'
  const url = `${SITE_URL}${path === '/' ? '' : path}`
  const image = input.image ?? `${SITE_URL}/og-default.webp`
  const type = input.type ?? 'website'

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brand.legalName,
    description: brand.description,
    url: SITE_URL,
    telephone: brand.contact.phoneRaw,
    email: brand.contact.email,
    image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: brand.address.street,
      addressLocality: brand.address.city,
      addressRegion: brand.address.state,
      postalCode: brand.address.zip,
      addressCountry: brand.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: brand.address.geo.lat,
      longitude: brand.address.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
    ],
    sameAs: [brand.social.instagram.url],
    foundingDate: String(brand.foundedYear),
  }

  return {
    title,
    description,
    url,
    image,
    type,
    og: {
      'og:title': title,
      'og:description': description,
      'og:type': type,
      'og:url': url,
      'og:image': image,
      'og:locale': 'pt_BR',
      'og:site_name': brand.name,
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
    },
    jsonLd: input.jsonLd ?? localBusinessLd,
    noindex: input.noindex ?? false,
  }
}
