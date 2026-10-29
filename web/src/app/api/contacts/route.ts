import {NextResponse} from 'next/server'
import {client} from '@/sanity/lib/client'

const MAX_BODY_BYTES = 32_768
const MAX_ITEMS = 50

type QuoteItem = {
  kind: 'product' | 'special'
  productId?: string
  name: string
  presentation?: string
  quantity: number
}

function value(input: unknown, maxLength: number): string {
  return typeof input === 'string' ? input.trim().slice(0, maxLength) : ''
}

function parseItems(input: unknown): QuoteItem[] | null {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_ITEMS) return null
  const items: QuoteItem[] = []
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') return null
    const item = raw as Record<string, unknown>
    const kind = item.kind === 'product' || item.kind === 'special' ? item.kind : null
    const name = value(item.name, 160)
    const presentation = value(item.presentation, 160)
    const productId = value(item.productId, 160)
    const quantity = Number(item.quantity)
    if (!kind || !name || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999999) return null
    items.push({kind, name, quantity, ...(presentation ? {presentation} : {}), ...(productId ? {productId} : {})})
  }
  return items
}

function buildMessage(input: {quoteId: string; customerType: string; name: string; phone: string; city: string; items: QuoteItem[]}) {
  const products = input.items.map((item) => `• ${item.name} — ${item.presentation || 'Presentación por confirmar'} — Cantidad: ${item.quantity}`).join('\n')
  return [
    'Hola, quisiera solicitar información y cotización con PROFAJAL.',
    `Folio: ${input.quoteId}`,
    `Tipo de cliente: ${input.customerType}`,
    `Nombre/empresa: ${input.name}`,
    `Teléfono: ${input.phone}`,
    `Ciudad: ${input.city}`,
    'Productos y solicitudes:',
    products,
    'Por favor confirmen disponibilidad, requisitos y condiciones de atención.',
  ].join('\n')
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({error: 'La solicitud es demasiado grande.'}, {status: 413})
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return NextResponse.json({error: 'Se requiere contenido JSON.'}, {status: 415})
  }

  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return NextResponse.json({error: 'La solicitud es demasiado grande.'}, {status: 413})

  let body: Record<string, unknown>
  try {
    body = JSON.parse(text) as Record<string, unknown>
  } catch {
    return NextResponse.json({error: 'JSON inválido.'}, {status: 400})
  }

  const customerType = body.customerType === 'Particular' ? 'Particular' : body.customerType === 'Empresa' ? 'Empresa' : ''
  const name = value(body.name, 120)
  const phone = value(body.phone, 30)
  const email = value(body.email, 160)
  const city = value(body.city, 120)
  const consent = body.consent === true
  const items = parseItems(body.items)

  if (!customerType || !name || !phone || !city || !consent || !items) {
    return NextResponse.json({error: 'Completa los campos requeridos y agrega al menos un producto.'}, {status: 422})
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({error: 'El correo no es válido.'}, {status: 422})
  }

  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!token) return NextResponse.json({error: 'La recepción de contactos aún no está configurada.'}, {status: 503})

  const quoteId = crypto.randomUUID()
  const submittedAt = new Date().toISOString()
  const writeClient = client.withConfig({token, useCdn: false})

  try {
    await writeClient.create({
      _type: 'contact',
      quoteId,
      submittedAt,
      status: 'new',
      source: 'website',
      customerType,
      name,
      phone,
      ...(email ? {email} : {}),
      city,
      consent,
      items: items.map((item) => ({_type: 'quoteItem', _key: crypto.randomUUID(), ...item})),
    })
  } catch (error) {
    console.error(JSON.stringify({event: 'sanity_contact_failed', quoteId, error: error instanceof Error ? error.name : 'unknown'}))
    return NextResponse.json({error: 'No fue posible registrar la solicitud. Inténtalo de nuevo.'}, {status: 502})
  }

  const message = buildMessage({quoteId, customerType, name, phone, city, items})
  const digits = (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '')
  console.info(JSON.stringify({event: 'contact_created', quoteId}))
  return NextResponse.json({quoteId, message, whatsappUrl: digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null}, {status: 201})
}
