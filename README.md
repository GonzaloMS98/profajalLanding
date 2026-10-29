# PROFAJAL — Rediseño web comercial

Estado: **prototipo visual funcional**, versión móvil optimizada. Preparado para continuar en Codex.

- Sitio original: https://profajal.com.mx/
- Vista previa privada: https://profajal-redesign-2026.gonzalomonsa94.chatgpt.site
- Objetivo de negocio: convertir visitas en conversaciones de ventas por WhatsApp.
- Público: **mixto**, empresas (farmacias, hospitales, clínicas, distribuidores) y particulares.
- Catálogo objetivo: aproximadamente **100–1,000 medicamentos**.
- Dirección visual: **corporativa premium**, profesional, farmacéutica y moderna.

## Iniciar el proyecto

La versión actual es un sitio estático autónomo, sin instalación de dependencias.

1. Abrir esta carpeta en Codex / editor.
2. Servir `dist/` con un servidor HTTP estático, por ejemplo `npx serve dist` si está disponible. También puede abrirse `dist/index.html` directamente para una revisión rápida, aunque algunas capacidades del navegador requieren HTTPS o localhost.
3. Editar `dist/index.html` (contiene HTML, CSS y JavaScript).

No se ha implementado todavía Next.js ni Supabase. **No asumir que el frontend prototipo ya tiene backend.**

## Contexto del negocio

PROFAJAL se presenta como una empresa dedicada a la venta y distribución nacional de:

1. Medicamentos de patente.
2. Medicamentos genéricos intercambiables.
3. Medicamentos de alta especialidad.

Su contenido original identifica a farmacias, hospitales y distribuidores como clientes y enfatiza la atención personalizada y el surtido oportuno a nivel nacional. En el rediseño se decidió agregar atención visible a particulares, **sujeta a validación comercial y sanitaria**.

### Información institucional que debe preservarse

- Descripción de la compañía y experiencia en el ramo farmacéutico.
- Tres líneas de medicamentos.
- Distribución en México y atención a farmacias/hospitales/distribuidores.
- **Misión:** proveer medicamentos de patente y alta especialidad a clínicas, hospitales y farmacias, con compromiso de cadena de suministro nacional mediante colaboradores y socios comerciales.
- **Visión:** liderazgo en distribución, innovación tecnológica y logística, alcance nacional y bienestar de las familias mexicanas.
- **Valores:** honestidad, responsabilidad y servicio.

La página actual del prototipo incluye secciones dedicadas de misión, visión y valores; no eliminarlas por razones estéticas. Tampoco inventar certificados sanitarios, métricas, testimonios, socios ni plazos de entrega.

## Funcionalidad ya implementada

- Landing con hero, CTA de cotización, campo de búsqueda, tres categorías y secciones institucionales.
- Recorrido visual para empresas y particulares.
- Catálogo de **9 productos ficticios** claramente señalados como demostración.
- Búsqueda por texto y filtro por tipo de medicamento.
- Ficha de detalle demostrativa.
- Agregar productos al carrito de cotización y modificar cantidades.
- Estado de búsqueda sin coincidencias con **solicitud especial**.
- Solicitud especial con nombre de medicamento, presentación opcional y cantidad; se incorpora a la misma lista de cotización.
- Generación y copia de texto de WhatsApp, separando productos del catálogo y solicitudes especiales.
- Diseño responsivo, especialmente tarjetas horizontales compactas, filtros y CTA fijo inferior en móvil.

## Lo que NO está implementado

- No hay número real de WhatsApp configurado. El botón final **copia** el texto, no abre ni envía mensajes automáticamente.
- No existe persistencia, seguimiento de leads, administración ni catálogo real en Supabase.
- No hay precios, inventario en tiempo real, pagos ni checkout.
- El filtro de tipo de comprador es solo visual, pendiente de reglas reales de elegibilidad.
- Las imágenes, fichas, nombres y presentaciones actuales son demostrativos.
- No se ha realizado revisión regulatoria formal ni validación de requisitos por categoría de medicamento.
- El diseño está publicado como una vista previa privada; **no modifica el dominio original**.

## Comportamiento objetivo de conversión

1. El visitante busca un medicamento por nombre comercial o principio activo.
2. Si existe, selecciona la presentación y cantidad y lo agrega a su cotización.
3. Si no existe, se le ofrece **'Solicitar medicamento no encontrado'** con nombre, presentación y cantidad; no debe perderse la búsqueda fallida.
4. Puede combinar productos encontrados y solicitudes especiales.
5. Elige empresa o particular, indica ciudad de entrega y datos básicos de contacto.
6. Se registra la intención comercial con consentimiento y se abre `https://wa.me/<NUMERO_REAL>?text=<MENSAJE_URL_ENCODED>` para confirmar el envío en WhatsApp.
7. El mensaje debe incluir contexto de productos, cantidades, solicitud especial y un identificador de seguimiento. No solicitar diagnósticos ni datos médicos sensibles en el mensaje inicial.

**Nota:** abrir WhatsApp no significa que el cliente envió el mensaje. Medir por separado clics y conversaciones calificadas cuando exista integración adecuada.

## Plan técnico recomendado para Codex

Stack objetivo sugerido: **Next.js (App Router), TypeScript, Tailwind/shadcn, Supabase PostgreSQL + Storage, GA4**. Se puede portar el diseño actual por secciones o refactorizarlo a componentes.

### Fase 1 — Estructura y datos

- Migrar el HTML monolítico a componentes Next.js: `Header`, `Hero`, `ProductCatalog`, `ProductCard`, `ProductDetail`, `QuoteDrawer`, `SpecialRequestForm`, `CompanyInfo`, `Footer`.
- Crear tablas `products`, `product_categories`, `product_presentations`, `quote_requests`, `quote_items`, `special_requests` y opcional `lead_events`.
- Definir política RLS y autenticación exclusiva para administradores; el catálogo público solo debe exponer campos aprobados.
- Importar productos por CSV/Excel con normalización de marca, principio activo, laboratorio, presentación y códigos internos.
- Usar imágenes reales autorizadas con placeholders consistentes para faltantes.

### Fase 2 — Conversión

- Configurar número oficial de WhatsApp Business.
- Preparar mensajes URL-encoded; validar cantidades y longitudes.
- Capturar solicitudes de forma explícita y transparente antes de redirigir, cumpliendo privacidad/consentimiento. Diseñar fallback cuando el usuario no complete envío en WhatsApp.
- Registrar búsquedas sin resultado y solicitudes especiales (sin información médica sensible innecesaria).
- Eventos GA4: `search`, `view_item`, `add_to_quote`, `special_request_added`, `whatsapp_click`, `lead_created`.

### Fase 3 — SEO, calidad y operación

- URLs y metadata por categoría/producto, sitemap, canonical y renderizado SEO.
- Optimizar Core Web Vitals, accesibilidad y navegación con teclado.
- Pruebas reales 320/375/390/430/768/1024/1440 px y Android/iPhone.
- QA del drawer, formularios, cantidades, filtros y búsquedas sin resultado.
- Revisar con asesor regulatorio qué medicamentos pueden figurar públicamente, a quién se puede dirigir cada comunicación, avisos y requisitos correspondientes.

## Lista de pendientes con el cliente

- [ ] WhatsApp y teléfono oficial de ventas.
- [ ] Logo editable, colores corporativos y recursos de marca.
- [ ] Catálogo real (CSV/Excel), nombres, presentaciones, laboratorios e imágenes.
- [ ] Datos de contacto, domicilio, horarios y correo comercial verificables.
- [ ] Confirmar reglas comerciales B2B vs particulares, mínimos, envío y disponibilidad.
- [ ] Documentación sanitaria y textos legales aprobados, aviso de privacidad.
- [ ] Aprobación de textos institucionales y cobertura declarada.
- [ ] Definir quién administrará productos y solicitudes especiales.

## Pautas de diseño y contenido

- Mantener estilo premium (azul marino, azul clínico, turquesa, blanco), tipografía Manrope y DM Sans.
- Prioridad máxima a búsqueda, productos y CTA WhatsApp, especialmente en móvil.
- No ocultar solicitudes especiales cuando un producto no aparece.
- Preservar la información institucional significativa del sitio original.
- Evitar afirmaciones médicas, recomendaciones de automedicación o falsas garantías de inventario.
- No mostrar un checkout ni precios públicos en el MVP.

## Archivos

```
profajal-site/
  README.md
  dist/
    index.html           # Prototipo actual autónomo
  .openai/
    hosting.json         # Configuración del Site privado existente
```

`.openai/hosting.json` conserva la identidad del prototipo publicado. Si se inicia otro proyecto o despliegue, revisar esta configuración antes de publicar para no sobrescribir el mismo Site.

## Prompt sugerido para continuar en Codex

> Lee todo el README.md y analiza dist/index.html. Conserva el diseño premium y la información institucional de PROFAJAL. Refactoriza gradualmente el prototipo a Next.js + TypeScript con componentes reutilizables, catálogo real preparado para 100–1,000 productos en Supabase, lista de cotización multi-producto y solicitudes especiales cuando no haya resultados. Prioriza conversión a WhatsApp y UX móvil. No inventes datos comerciales ni sanitarios, no implementes checkout. Antes de conectar servicios, identifica variables y decisiones pendientes; documenta la configuración y añade pruebas de los flujos críticos.
