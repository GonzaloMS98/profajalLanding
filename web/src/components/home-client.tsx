'use client'

import Image from 'next/image'
import Link from 'next/link'
import {FormEvent, useEffect, useMemo, useRef, useState} from 'react'
import type {PRODUCTS_QUERY_RESULT} from '../../sanity.types'

export type CatalogProduct = PRODUCTS_QUERY_RESULT[number] & {demo?: boolean}

type SpecialRequest = {id: string; name: string; presentation: string; quantity: number}
type ContactResponse = {quoteId: string; message: string; whatsappUrl: string | null}

const demoProducts: CatalogProduct[] = Array.from({length: 9}, (_, index) => ({
  _id: `demo-${index + 1}`,
  name: `Medicamento de ejemplo ${String.fromCharCode(65 + index)}`,
  slug: {current: `demo-${index + 1}`},
  category: ['Patente', 'Genérico', 'Alta especialidad'][index % 3],
  ingredient: 'Principio activo por confirmar',
  laboratory: 'Laboratorio por confirmar',
  presentation: 'Presentación por validar',
  description: 'Producto demostrativo pendiente de información validada por PROFAJAL.',
  sku: null,
  audience: ['Farmacias y hospitales', 'Particulares'],
  imageUrl: null,
  demo: true,
}))

export function HomeClient({products}: {products: CatalogProduct[]}) {
  const catalog = products.length ? products : demoProducts
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [audience, setAudience] = useState('Todos los compradores')
  const [customerType, setCustomerType] = useState<'Empresa' | 'Particular'>('Empresa')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [specialRequests, setSpecialRequests] = useState<SpecialRequest[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const drawerRef = useRef<HTMLElement>(null)

  const matching = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('es')
    return catalog.filter((product) => {
      const matchesCategory = category === 'Todos' || product.category === category
      const matchesAudience = audience === 'Todos los compradores' || product.audience?.includes(audience)
      const haystack = [product.name, product.ingredient, product.laboratory, product.presentation].filter(Boolean).join(' ').toLocaleLowerCase('es')
      return matchesCategory && matchesAudience && haystack.includes(needle)
    })
  }, [audience, catalog, category, query])

  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0) + specialRequests.length

  useEffect(() => {
    document.body.classList.toggle('locked', drawerOpen)
    if (drawerOpen) window.setTimeout(() => drawerRef.current?.focus(), 0)
    return () => document.body.classList.remove('locked')
  }, [drawerOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setDrawerOpen(false)
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function addProduct(id: string) {
    setCart((current) => ({...current, [id]: (current[id] || 0) + 1}))
    setDrawerOpen(true)
  }

  function changeQuantity(id: string, delta: number) {
    setCart((current) => {
      const next = {...current, [id]: (current[id] || 0) + delta}
      if (next[id] <= 0) delete next[id]
      return next
    })
  }

  function addSpecial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('specialName') || '').trim()
    const presentation = String(form.get('specialPresentation') || '').trim()
    const quantity = Number(form.get('specialQuantity'))
    if (!name || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999999) return
    setSpecialRequests((current) => [...current, {id: crypto.randomUUID(), name, presentation, quantity}])
    setDrawerOpen(true)
    event.currentTarget.reset()
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')
    const form = new FormData(event.currentTarget)
    const items = [
      ...Object.entries(cart).map(([id, quantity]) => {
        const product = catalog.find((item) => item._id === id)
        return {kind: 'product', productId: id, name: product?.name || 'Producto', presentation: product?.presentation || '', quantity}
      }),
      ...specialRequests.map((item) => ({kind: 'special', name: item.name, presentation: item.presentation, quantity: item.quantity})),
    ]

    if (!items.length) {
      setStatus('Agrega al menos un producto o solicitud especial.')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          customerType,
          name: form.get('name'),
          phone: form.get('phone'),
          email: form.get('email'),
          city: form.get('city'),
          consent: form.get('consent') === 'on',
          items,
        }),
      })
      const result = await response.json() as ContactResponse & {error?: string}
      if (!response.ok) throw new Error(result.error || 'No fue posible registrar la solicitud.')

      setStatus(`✓ Solicitud registrada. Folio: ${result.quoteId}`)
      if (result.whatsappUrl) {
        window.location.assign(result.whatsappUrl)
      } else {
        await navigator.clipboard.writeText(result.message)
        setStatus(`✓ Solicitud ${result.quoteId} registrada y mensaje copiado.`)
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No fue posible registrar la solicitud.')
    } finally {
      setSubmitting(false)
    }
  }

  function scrollToCatalog(nextCategory?: string) {
    if (nextCategory) setCategory(nextCategory)
    document.getElementById('catalogo')?.scrollIntoView({behavior: 'smooth'})
  }

  return (
    <>
      <div className="topline"><div className="container"><span>Distribución farmacéutica · México</span><span>Atención a farmacias, hospitales, distribuidores y particulares</span></div></div>
      <header className="header">
        <div className="container nav">
          <a className="brand" href="#inicio">PROFAJAL<i>✦</i></a>
          <nav className="links" aria-label="Navegación principal"><a href="#soluciones">Nosotros</a><a href="#lineas">Líneas</a><a href="#catalogo">Catálogo</a><a href="#empresa">Empresa</a></nav>
          <button className="btn btn-dark cart-button" onClick={() => setDrawerOpen(true)}>Mi cotización <span className="count">{count}</span></button>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio"><div className="container hero-inner"><div className="hero-copy"><div className="tiny eyebrow">Tu aliado en suministro farmacéutico</div><h1>Conectamos tus necesidades con <em>soluciones farmacéuticas.</em></h1><p>Medicamentos de patente, genéricos intercambiables y alta especialidad. Atención personalizada para profesionales, instituciones y personas en todo México.</p><div className="actions"><button className="btn btn-whatsapp" onClick={() => setDrawerOpen(true)}>◉ Solicitar cotización</button><button className="btn btn-outline" onClick={() => scrollToCatalog()}>Explorar catálogo ↗</button></div><div className="hero-notes"><span><b>✓</b> Distribución nacional</span><span><b>✓</b> Atención personalizada</span><span><b>✓</b> Consulta de disponibilidad</span></div></div></div></section>

        <div className="container search-panel"><form className="search-box" onSubmit={(event) => {event.preventDefault(); scrollToCatalog()}}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="¿Qué medicamento estás buscando?" aria-label="Buscar medicamento"/><button className="btn btn-primary" type="submit">Buscar producto →</button></form></div>

        <section className="section" id="lineas"><div className="container"><div className="section-heading"><div><div className="tiny">Nuestras líneas</div><h2>Un catálogo para cada<br/>necesidad de salud.</h2></div><p>Encuentra la línea que necesitas y solicita información de disponibilidad directamente con nuestro equipo.</p></div><div className="category-grid">{[
          ['01', 'Patente', 'Medicamentos de patente', 'Productos de marca para abastecimiento y consulta.'],
          ['02', 'Genérico', 'Genéricos intercambiables', 'Alternativas farmacéuticas identificadas por presentación.'],
          ['03', 'Alta especialidad', 'Alta especialidad', 'Atención comercial para medicamentos de manejo especializado.'],
        ].map(([number, value, title, copy]) => <button className="category" key={value} onClick={() => scrollToCatalog(value)}><span className="category-number">{number} / PRODUCTOS</span><span><h3>{title}</h3><p>{copy}</p><strong>Explorar productos ↗</strong></span></button>)}</div></div></section>

        <section className="audience-section" id="soluciones"><div className="audience-photo" role="img" aria-label="Ambiente farmacéutico"/><div className="audience-copy"><div className="tiny">Atención a tu medida</div><h2>Un mismo compromiso.<br/>Distintas necesidades.</h2><p>Ya sea que administres una farmacia o busques información sobre un medicamento, canalizamos tu solicitud con un asesor.</p><div className="chips"><button className={`chip ${customerType === 'Empresa' ? 'active' : ''}`} aria-pressed={customerType === 'Empresa'} onClick={() => setCustomerType('Empresa')}>Soy empresa</button><button className={`chip ${customerType === 'Particular' ? 'active' : ''}`} aria-pressed={customerType === 'Particular'} onClick={() => setCustomerType('Particular')}>Soy particular</button></div><p>{customerType === 'Empresa' ? 'Para farmacias, hospitales, clínicas y distribuidores: comparte presentaciones y cantidades en una solicitud.' : 'Para particulares: consulta disponibilidad y los requisitos aplicables con un asesor.'}</p><button className="btn btn-dark" onClick={() => setDrawerOpen(true)}>Iniciar consulta →</button></div></section>

        <section className="section catalog" id="catalogo"><div className="container"><div className="section-heading"><div><div className="tiny">Catálogo digital</div><h2>Encuentra lo que buscas.<br/>Nosotros te ayudamos.</h2></div><p>Explora productos y arma una lista de cotización sin pagos en línea.</p></div>{!products.length && <div className="notice">Vista demostrativa: agrega productos publicados desde Sanity para sustituir estas fichas.</div>}<div className="catalog-controls"><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Buscar medicamento, ingrediente o laboratorio…"/><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Categoría"><option>Todos</option><option>Patente</option><option>Genérico</option><option>Alta especialidad</option></select><select value={audience} onChange={(event) => setAudience(event.target.value)} aria-label="Tipo de comprador"><option>Todos los compradores</option><option>Farmacias y hospitales</option><option>Particulares</option></select></div><div className="product-grid">{matching.map((product) => <article className="product" key={product._id}><div className="product-image">{product.imageUrl ? <Image src={product.imageUrl} width={500} height={350} alt={product.name || 'Producto farmacéutico'}/> : <div className="demo-box">{product.demo ? 'MUESTRA' : 'SIN IMAGEN'}</div>}</div><div className="product-body"><span className="product-type">{product.category}</span><h3>{product.name}</h3><p>{product.presentation || product.description}</p><div className="product-actions">{!product.demo && product.slug?.current ? <Link className="btn btn-outline" href={`/productos/${product.slug.current}`}>Ver ficha ↗</Link> : <span/>}<button className="btn btn-primary" onClick={() => addProduct(product._id)}>+ Cotizar</button></div></div></article>)}</div>{matching.length === 0 && <form className="special-form" onSubmit={addSpecial}><div className="tiny">Solicitud especial</div><h3>¿No encontraste el medicamento?</h3><p>Inclúyelo en tu solicitud sin prometer disponibilidad.</p><div className="special-fields"><input name="specialName" defaultValue={query} maxLength={150} required placeholder="Nombre del medicamento"/><input name="specialPresentation" maxLength={150} placeholder="Presentación (opcional)"/><input name="specialQuantity" type="number" min="1" max="999999" defaultValue="1" required/><button className="btn btn-primary" type="submit">Agregar</button></div></form>}</div></section>

        <section className="section" id="empresa"><div className="container"><div className="section-heading"><div><div className="tiny">Quiénes somos</div><h2>Abastecimiento farmacéutico nacional.</h2></div><p>PROFAJAL vende y distribuye medicamentos de patente, genéricos intercambiables y alta especialidad con atención personalizada.</p></div><div className="identity-grid"><article className="identity-card"><div className="tiny">Nuestra misión</div><h3>Abastecimiento con compromiso.</h3><p>Proveer medicamentos de patente y alta especialidad a clínicas, hospitales y farmacias, con compromiso de cadena de suministro nacional mediante colaboradores y socios comerciales.</p></article><article className="identity-card"><div className="tiny">Nuestra visión</div><h3>Innovación y alcance nacional.</h3><p>Ser una empresa líder en distribución, con innovaciones tecnológicas y logísticas que contribuyan al bienestar de las familias mexicanas.</p></article></div><div className="values"><span>Honestidad</span><span>Responsabilidad</span><span>Servicio</span></div></div></section>

        <section className="section"><div className="container"><div className="section-heading"><div><div className="tiny">Por qué PROFAJAL</div><h2>Confianza en cada etapa.</h2></div></div><div className="trust-grid"><article className="trust-item"><h3>Experiencia farmacéutica</h3><p>Un equipo con trayectoria en el ramo.</p></article><article className="trust-item"><h3>Cobertura nacional</h3><p>Atención a solicitudes en la República Mexicana.</p></article><article className="trust-item"><h3>Atención personal</h3><p>Comunicación directa para confirmar presentaciones y condiciones.</p></article></div></div></section>
      </main>

      <footer className="footer"><div className="container footer-grid"><div><div className="brand">PROFAJAL<i>✦</i></div><p>Distribución nacional de medicamentos. Prototipo sujeto a validación comercial, sanitaria y de contenido.</p></div><div><h3>Explora</h3><a href="#lineas">Productos</a><a href="#catalogo">Catálogo</a><a href="#empresa">Empresa</a></div><div><h3>Contacto</h3><button className="btn btn-whatsapp" onClick={() => setDrawerOpen(true)}>Solicitar cotización</button><p>WhatsApp oficial: pendiente de configurar</p></div></div></footer>
      <button className="btn btn-whatsapp floating" onClick={() => setDrawerOpen(true)}>◉ Cotizar por WhatsApp {count ? `(${count})` : ''}</button>

      {drawerOpen && <div className="backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDrawerOpen(false)}><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="quote-title" tabIndex={-1} ref={drawerRef}><div className="drawer-head"><div><div className="tiny">Tu solicitud</div><h2 id="quote-title">Mi cotización</h2></div><button className="close" aria-label="Cerrar cotización" onClick={() => setDrawerOpen(false)}>×</button></div><div>{Object.entries(cart).map(([id, quantity]) => {const product = catalog.find((item) => item._id === id); return <div className="quote-item" key={id}><h4>{product?.name}</h4><p>{product?.presentation}</p><div className="qty"><button aria-label="Disminuir" onClick={() => changeQuantity(id, -1)}>−</button><span>{quantity}</span><button aria-label="Aumentar" onClick={() => changeQuantity(id, 1)}>+</button><button onClick={() => changeQuantity(id, -quantity)}>Quitar</button></div></div>})}{specialRequests.map((item) => <div className="quote-item" key={item.id}><h4>{item.name}</h4><p>{item.presentation || 'Presentación por confirmar'} · Cantidad: {item.quantity}</p><button className="btn btn-outline" onClick={() => setSpecialRequests((current) => current.filter((request) => request.id !== item.id))}>Quitar</button></div>)}{count === 0 && <p>Aún no has seleccionado productos.</p>}</div><form onSubmit={submitContact}><label className="field"><span>Tipo de cliente</span><select value={customerType} onChange={(event) => setCustomerType(event.target.value as 'Empresa' | 'Particular')}><option>Empresa</option><option>Particular</option></select></label><label className="field"><span>Nombre o empresa</span><input name="name" maxLength={120} required/></label><label className="field"><span>Teléfono</span><input name="phone" type="tel" maxLength={30} required/></label><label className="field"><span>Correo (opcional)</span><input name="email" type="email" maxLength={160}/></label><label className="field"><span>Ciudad de entrega</span><input name="city" maxLength={120} required/></label><label className="consent"><input name="consent" type="checkbox" required/><span>Acepto que PROFAJAL use estos datos para atender esta solicitud. No compartiré diagnósticos ni datos médicos sensibles.</span></label><div className="notice">La solicitud se registra antes de abrir WhatsApp. Disponibilidad y condiciones quedan sujetas a confirmación.</div><button className="btn btn-whatsapp full" type="submit" disabled={submitting}>{submitting ? 'Registrando…' : 'Guardar y continuar en WhatsApp ↗'}</button><p className="status" role="status">{status}</p></form></aside></div>}
    </>
  )
}
