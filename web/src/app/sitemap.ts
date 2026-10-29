import type {MetadataRoute} from 'next'
import {client} from '@/sanity/lib/client'
import {PRODUCTS_QUERY} from '@/sanity/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await client.fetch(PRODUCTS_QUERY)
  return [
    {url: 'https://profajal.com.mx', changeFrequency: 'weekly', priority: 1},
    ...products.filter((product) => product.slug?.current).map((product) => ({
      url: `https://profajal.com.mx/productos/${product.slug!.current}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
