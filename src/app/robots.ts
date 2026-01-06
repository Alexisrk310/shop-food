import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thunderxis.store' // Fallback to example

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/profile/', '/api/', '/ingresar/', '/registro/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
