import { DateTime } from 'luxon'
import { z } from 'zod'

export const dateSchema = z
  .string()
  .transform((s) => s.split(' / ')[0])
  .pipe(
    z.union([
      z
        .string()
        .regex(/^\d{4}$/)
        .transform(genParseDateTransformer('yyyy')),
      z
        .string()
        .regex(/^(UTC )?\d{4}-\d{2}-\d{2}( UTC)?$/)
        .transform(genStripUtcTransformer())
        .transform(genParseDateTransformer('yyyy-mm-dd')),
      z
        .string()
        .regex(/^(UTC )?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z( UTC)?$/)
        .transform(genStripUtcTransformer())
        .transform(genParseDateTransformer()),
      z
        .string()
        .regex(/^(UTC )?\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}( UTC)?$/)
        .transform(genStripUtcTransformer())
        .transform(genParseDateTransformer('yyyy-mm-dd HH:mm:ss')),
      z
        .string()
        .regex(/^(UTC )?\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}( UTC)?$/)
        .transform(genStripUtcTransformer())
        .transform(genParseDateTransformer('yyyy-mm-dd HH:mm:ss.SSS')),
    ])
  )

function genStripUtcTransformer() {
  return (s: string) => s.replace(/(^UTC | UTC$)/g, '')
}

function genParseDateTransformer(format?: string) {
  return (s: string) =>
    format ? DateTime.fromFormat(s, format, { zone: 'UTC' }).toJSDate() : DateTime.fromISO(s).toJSDate()
}
