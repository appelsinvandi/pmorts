import z from 'zod'

export const encodableTextSchema = z.union([
  z.string(),
  z
    .object({ '@dt': z.literal('binary.base64'), '#value': z.string() })
    .transform((e) => Buffer.from(e['#value'], 'base64').toString()),
])
