import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {defineArrayMember, defineField, defineType} from 'sanity'

const statusLabels: Record<string, string> = {
  new: 'Nuevo',
  in_progress: 'En seguimiento',
  completed: 'Atendido',
  discarded: 'Descartado',
}

export const contactType = defineType({
  name: 'contact',
  title: 'Contacto / cotización',
  type: 'document',
  icon: EnvelopeIcon,
  groups: [
    {name: 'request', title: 'Solicitud', default: true},
    {name: 'contact', title: 'Datos de contacto'},
    {name: 'followUp', title: 'Seguimiento'},
  ],
  fields: [
    defineField({name: 'quoteId', title: 'Folio', type: 'string', group: 'request', readOnly: true, validation: (rule) => rule.required()}),
    defineField({name: 'submittedAt', title: 'Fecha de solicitud', type: 'datetime', group: 'request', readOnly: true, validation: (rule) => rule.required()}),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      group: 'followUp',
      options: {list: [{title: 'Nuevo', value: 'new'}, {title: 'En seguimiento', value: 'in_progress'}, {title: 'Atendido', value: 'completed'}, {title: 'Descartado', value: 'discarded'}]},
      initialValue: 'new',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customerType',
      title: 'Tipo de cliente',
      type: 'string',
      group: 'contact',
      readOnly: true,
      options: {list: ['Empresa', 'Particular'], layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'name', title: 'Nombre o empresa', type: 'string', group: 'contact', readOnly: true, validation: (rule) => rule.required().max(120)}),
    defineField({name: 'phone', title: 'Teléfono', type: 'string', group: 'contact', readOnly: true, validation: (rule) => rule.required().max(30)}),
    defineField({name: 'email', title: 'Correo', type: 'string', group: 'contact', readOnly: true, validation: (rule) => rule.email()}),
    defineField({name: 'city', title: 'Ciudad', type: 'string', group: 'contact', readOnly: true, validation: (rule) => rule.required().max(120)}),
    defineField({
      name: 'consent',
      title: 'Consentimiento aceptado',
      type: 'boolean',
      group: 'contact',
      readOnly: true,
      validation: (rule) => rule.required().custom((accepted) => accepted === true || 'La solicitud debe incluir consentimiento.'),
    }),
    defineField({
      name: 'source',
      title: 'Origen',
      type: 'string',
      group: 'request',
      readOnly: true,
      options: {list: [{title: 'Sitio web', value: 'website'}]},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Productos y solicitudes',
      type: 'array',
      group: 'request',
      readOnly: true,
      of: [
        defineArrayMember({
          name: 'quoteItem',
          type: 'object',
          fields: [
            defineField({
              name: 'kind',
              title: 'Tipo',
              type: 'string',
              options: {list: [{title: 'Producto de catálogo', value: 'product'}, {title: 'Solicitud especial', value: 'special'}], layout: 'radio'},
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'productId', title: 'ID de producto', type: 'string', hidden: ({parent}) => parent?.kind !== 'product'}),
            defineField({name: 'name', title: 'Nombre', type: 'string', validation: (rule) => rule.required().max(160)}),
            defineField({name: 'presentation', title: 'Presentación', type: 'string', validation: (rule) => rule.max(160)}),
            defineField({name: 'quantity', title: 'Cantidad', type: 'number', validation: (rule) => rule.required().integer().min(1).max(999999)}),
          ],
          preview: {select: {title: 'name', subtitle: 'presentation'}},
        }),
      ],
      validation: (rule) => rule.required().min(1).max(50),
    }),
    defineField({name: 'internalNotes', title: 'Notas internas', type: 'text', group: 'followUp', rows: 4, validation: (rule) => rule.max(2000)}),
  ],
  preview: {
    select: {name: 'name', status: 'status', submittedAt: 'submittedAt'},
    prepare({name, status, submittedAt}) {
      const date = submittedAt ? new Intl.DateTimeFormat('es-MX', {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(submittedAt)) : 'Sin fecha'
      return {title: name || 'Contacto sin nombre', subtitle: `${statusLabels[status] || 'Sin estado'} · ${date}`}
    },
  },
})
