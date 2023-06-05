import { z } from 'zod'

export type MediaInfoTrackOther = z.infer<typeof trackSchema_other>
export const trackSchema_other = z
  .object({
    '@type': z.literal('Other'),
    '@typeorder': z.coerce.number().optional(),
    StreamOrder: z
      .union([
        z.coerce.number().int().nonnegative(),
        z.string().regex(/^\d+-\d+$/),
      ])
      .optional(),
    ID: z.coerce.number().int().nonnegative().transform(String).optional(),

    Type: z.string(),

    extra: z.record(z.string()).optional(),
  })
  .passthrough()
