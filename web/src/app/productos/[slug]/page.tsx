import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {PRODUCT_QUERY} from '@/sanity/lib/queries'

type Props = {params: Promise<{slug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const {data: product} = await sanityFetch({query: PRODUCT_QUERY, params: {slug}})
  if (!product) return {title: 'Producto no encontrado | PROFAJAL'}
  return {
    title: `${product.name} | PROFAJAL`,
    description: product.description || `${product.name}: consulta presentación y disponibilidad con PROFAJAL.`,
  }
}

export default async function ProductPage({params}: Props) {
  const {slug} = await params
  const {data: product} = await sanityFetch({query: PRODUCT_QUERY, params: {slug}})
  if (!product) notFound()

  return (
    <main className="section">
      <article className="container identity-card">
        <Link href="/#catalogo">← Volver al catálogo</Link>
        <div className="tiny" style={{marginTop: 30}}>{product.category}</div>
        <h1>{product.name}</h1>
        {product.imageUrl && <Image src={product.imageUrl} width={700} height={500} alt={product.name || 'Producto farmacéutico'} style={{width: '100%', maxHeight: 420, objectFit: 'contain'}}/>}
        <p><strong>Principio activo:</strong> {product.ingredient || 'Por confirmar'}</p>
        <p><strong>Presentación:</strong> {product.presentation || 'Por confirmar'}</p>
        <p><strong>Laboratorio:</strong> {product.laboratory || 'Por confirmar'}</p>
        {product.description && <p>{product.description}</p>}
        <div className="notice">Esta ficha sirve para identificación y consulta. No sustituye indicaciones médicas; disponibilidad y requisitos están sujetos a validación.</div>
      </article>
    </main>
  )
}
