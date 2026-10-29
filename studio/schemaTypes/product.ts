import {PackageIcon} from '@sanity/icons/Package'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Producto',
  type: 'document',
  icon: PackageIcon,
  groups: [
    {name: 'identity', title: 'Identificación', default: true},
    {name: 'catalog', title: 'Catálogo'},
    {name: 'commercial', title: 'Control comercial'},
  ],
  fields: [
    defineField({name: 'name', title: 'Nombre comercial', type: 'string', group: 'identity', validation: (rule) => rule.required().max(160)}),
    defineField({
      name: 'slug',
      title: 'URL del producto',
      type: 'slug',
      group: 'identity',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'active', title: 'Visible en catálogo', type: 'boolean', group: 'commercial', initialValue: true, validation: (rule) => rule.required()}),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      group: 'identity',
      options: {
        list: [
          {title: 'Medicamento de patente', value: 'Patente'},
          {title: 'Genérico intercambiable', value: 'Genérico'},
          {title: 'Alta especialidad', value: 'Alta especialidad'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'ingredient', title: 'Principio activo', type: 'string', group: 'identity', validation: (rule) => rule.max(160)}),
    defineField({name: 'laboratory', title: 'Laboratorio', type: 'string', group: 'identity', validation: (rule) => rule.max(160)}),
    defineField({name: 'presentation', title: 'Presentación', type: 'string', group: 'identity', validation: (rule) => rule.required().max(160)}),
    defineField({name: 'description', title: 'Descripción para catálogo', type: 'text', group: 'catalog', rows: 4, validation: (rule) => rule.max(1000)}),
    defineField({
      name: 'sku',
      title: 'Código interno / SKU',
      type: 'string',
      group: 'commercial',
      validation: (rule) => rule.max(100).regex(/^[A-Za-z0-9._-]+$/).warning('Usa únicamente letras, números, punto, guion o guion bajo.'),
    }),
    defineField({
      name: 'audience',
      title: 'Compradores permitidos',
      type: 'array',
      group: 'commercial',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: 'Farmacias, hospitales y distribuidores', value: 'Farmacias y hospitales'},
          {title: 'Particulares', value: 'Particulares'},
        ],
      },
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: 'image',
      title: 'Imagen autorizada',
      type: 'image',
      group: 'catalog',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Describe el producto para personas que no pueden ver la imagen.',
          validation: (rule) => rule.required().max(160),
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', presentation: 'presentation', category: 'category', active: 'active', media: 'image'},
    prepare({title, presentation, category, active, media}) {
      return {
        title,
        subtitle: `${active === false ? 'Oculto · ' : ''}${category || 'Sin categoría'} · ${presentation || 'Sin presentación'}`,
        media,
      }
    },
  },
})
