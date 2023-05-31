import { z } from 'zod'
import { languageSchema } from './helpers'

export const trackSchema_menu = z
  .object({
    '@type': z.literal('Menu'),
    '@typeorder': z.coerce.number().int().nonnegative().optional(),
    StreamOrder: z.union([z.coerce.number().int().nonnegative(), z.string().regex(/^\d+-\d+$/)]).optional(),
    ID: z.coerce.number().int().nonnegative().optional(),
    MenuID: z.coerce.number().int().nonnegative().optional(),

    Language: languageSchema.optional(),

    Format: z.enum(['AVC / AAC', 'Timed Text']).optional(),
    CodecID: z.enum(['text']).optional(),

    Duration: z.coerce.number().positive().optional(),
    Delay: z.coerce.number().nonnegative().optional(),

    List_StreamKind: z.enum(['1 / 2']).optional(),
    List_StreamPos: z.enum(['0 / 0']).optional(),

    ServiceName: z.string().optional(),
    ServiceProvider: z.enum(['FFmpeg']).optional(),
    ServiceType: z.enum(['digital television']).optional(),

    extra: z.record(z.string(), z.string()).optional(),
  })
  .strict()
