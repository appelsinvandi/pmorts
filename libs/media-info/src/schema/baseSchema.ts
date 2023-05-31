import { z } from 'zod'
import { trackSchema_audio } from './trackSchema_audio'
import { trackSchema_general } from './trackSchema_general'
import { trackSchema_menu } from './trackSchema_menu'
import { trackSchema_other } from './trackSchema_other'
import { trackSchema_text } from './trackSchema_text'
import { trackSchema_video } from './trackSchema_video'

export const mediaInfoOutputSchema = z
  .object({
    creatingLibrary: z
      .object({
        name: z.string(),
        version: z.string().regex(/^\d+\.\d+$/),
        url: z.string().url(),
      })
      .optional(),
    media: z.object({
      '@ref': z.string(),
      track: z
        .discriminatedUnion('@type', [
          trackSchema_audio,
          trackSchema_general,
          trackSchema_menu,
          trackSchema_other,
          trackSchema_text,
          trackSchema_video,
        ])
        .array(),
    }),
  })
  .strict()
