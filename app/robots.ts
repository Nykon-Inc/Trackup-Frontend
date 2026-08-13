import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/internal/'],
    },
    sitemap: 'https://watchtower.nykon.cloud/sitemap.xml',
  }
}
