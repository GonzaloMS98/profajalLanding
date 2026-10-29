import {HomeClient} from '@/components/home-client'
import {sanityFetch} from '@/sanity/lib/live'
import {PRODUCTS_QUERY} from '@/sanity/lib/queries'

export default async function HomePage() {
  const {data: products} = await sanityFetch({query: PRODUCTS_QUERY})
  return <HomeClient products={products} />
}
