import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/checkout', '/profile', '/addresses'],
      },
    ],
    sitemap: 'https://aura-store.vercel.app/sitemap.xml',
  };
}
