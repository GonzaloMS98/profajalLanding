import {defineQuery} from 'next-sanity'

export const PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && active == true] | order(name asc) {
    _id, name, slug, category, ingredient, laboratory, presentation,
    description, sku, audience, "imageUrl": image.asset->url
  }
`)

export const PRODUCT_QUERY = defineQuery(`
  *[_type == "product" && active == true && slug.current == $slug][0] {
    _id, name, slug, category, ingredient, laboratory, presentation,
    description, sku, audience, "imageUrl": image.asset->url
  }
`)
