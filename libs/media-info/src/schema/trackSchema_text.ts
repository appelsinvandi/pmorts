import { z } from 'zod'
import { languageSchema, yesNoBooleanSchema } from './helpers/index.js'

export const trackSchema_text = z
  .object({
    '@type': z.literal('Text'),
    '@typeorder': z.coerce.number().int().nonnegative().optional(),
    StreamOrder: z.union([z.coerce.number().int().nonnegative(), z.string().regex(/^\d+-\d+$/)]).optional(),
    ID: z
      .union([
        z.coerce.number().int().nonnegative().optional(),
        z.string().regex(/^\d+-\d+$/),
        z.string().regex(/^\d+-CC1$/),
      ])
      .optional(),
    UniqueID: z.string().optional(),
    OriginalSourceMedium_ID: z.coerce.number().optional(),

    Title: z.string().optional(),
    Language: languageSchema,

    Format: z.enum(['ASS', 'EIA-608', 'EIA-708', 'PGS', 'UTF-8', 'VobSub', 'S_TEXT/WEBVTT']),
    MuxingMode: z.enum(['SCTE 128 / DTVCC Transport', 'zlib']).optional(),
    MuxingMode_MoreInfo: z.string().optional(),
    CodecID: z.enum(['S_HDMV/PGS', 'S_TEXT/ASS', 'S_TEXT/UTF8', 'S_VOBSUB', 'S_TEXT/WEBVTT']).optional(),

    Duration: z.coerce.number().nonnegative().optional(),
    Duration_Start: z.coerce.number().nonnegative().optional(),
    Duration_Start_Command: z.coerce.number().nonnegative().optional(),

    BitRate: z.coerce.number().int().nonnegative().optional(),
    BitRate_Encoded: z.coerce.number().int().nonnegative().optional(),
    BitRate_Mode: z.enum(['CBR']).optional(),

    FrameRate: z.coerce.number().positive().optional(),
    FrameCount: z.coerce.number().int().nonnegative().optional(),
    ElementCount: z.coerce.number().int().nonnegative().optional(),
    FirstDisplay_Delay_Frames: z.coerce.number().int().positive().optional(),
    FirstDisplay_Type: z.enum(['PopOn']).optional(),

    Compression_Mode: z.enum(['Lossless']).optional(),
    StreamSize: z.coerce.number().int().nonnegative().optional(),
    StreamSize_Encoded: z.coerce.number().int().nonnegative().optional(),

    Default: yesNoBooleanSchema.optional(),
    Forced: yesNoBooleanSchema.optional(),

    Encoded_Library: z.string().optional(),

    extra: z.record(z.string(), z.string()).optional(),
  })
  .strict()
