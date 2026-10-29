import type {Metadata} from 'next'
import {SanityLive} from '@/sanity/lib/live'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://profajal.com.mx'),
  title: 'PROFAJAL | Distribución farmacéutica nacional',
  description: 'Medicamentos de patente, genéricos intercambiables y alta especialidad. Consulta el catálogo y solicita una cotización.',
  openGraph: {
    title: 'PROFAJAL | Distribución farmacéutica nacional',
    description: 'Consulta productos y prepara una solicitud de cotización con atención personalizada.',
    locale: 'es_MX',
    type: 'website',
  },
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <SanityLive />
      </body>
    </html>
  )
}
