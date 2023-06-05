import { z } from 'zod'
import fs from 'fs'
import _ from 'lodash'

const generalEncoding = z.object({})
const audioEncodingSchema = z.discriminatedUnion('codec', [
  z.object({
    codec: z.literal('aac'),

    bitrate: z
      .string()
      .regex(/\d+(K|M|G)?/, 'Invalid format, example: "4M"')
      .optional(),
  }),
  z.object({
    codec: z.literal('ac3'),

    bitrate: z
      .string()
      .regex(/\d+(K|M|G)?/, 'Invalid format, example: "4M"')
      .optional(),
  }),
])
const videoEncodingSettingsSchema = z.discriminatedUnion('codec', [
  z
    .object({
      codec: z.literal('libx264'),

      crf: z.number().int().min(0).max(51).optional(),
      level: z.enum(['4.1']).optional(),
      maxrate: z
        .string()
        .regex(/\d+(K|M|G)?/, 'Invalid format, example: "4M"')
        .optional(),
      minrate: z
        .string()
        .regex(/\d+(K|M|G)?/, 'Invalid format, example: "4M"')
        .optional(),
      pix_fmt: z.enum(['yuv420p']).optional(),
      preset: z
        .enum([
          'ultrafast',
          'superfast',
          'veryfast',
          'faster',
          'fast',
          'medium',
          'slow',
          'slower',
          'veryslow',
          'placebo',
        ])
        .optional(),
      'profile:v': z
        .enum(['baseline', 'main', 'high', 'high10', 'high422', 'high444'])
        .optional(),
      tune: z
        .enum([
          'film',
          'animation',
          'grain',
          'stillimage',
          'fastdecode',
          'zerolatency',
          'psnr',
          'ssim',
        ])
        .array()
        .transform(_.uniq)
        .optional(),
      'x264-params': z.string().optional(),
    })
    .strict(),
  z
    .object({
      codec: z.literal('libx265'),

      crf: z.number().int().min(0).max(51).optional(),
      maxrate: z
        .string()
        .regex(/\d+(K|M|G)?/, 'Invalid format, example: "4M"')
        .optional(),
      minrate: z
        .string()
        .regex(/\d+(K|M|G)?/, 'Invalid format, example: "4M"')
        .optional(),
      preset: z
        .enum([
          'ultrafast',
          'superfast',
          'veryfast',
          'faster',
          'fast',
          'medium',
          'slow',
          'slower',
          'veryslow',
          'placebo',
        ])
        .optional(),
      'profile:v': z
        .enum([
          'main-intra',
          'main',
          'main10-intra',
          'main10',
          'main12-intra',
          'main12',
          'main422-10-intra',
          'main422-10',
          'main422-12-intra',
          'main422-12',
          'main444-10-intra',
          'main444-10',
          'main444-12-intra',
          'main444-12',
          'main444-8',
          'main444-intra',
          'main444-stillpicture',
          'mainstillpicture',
        ])
        .optional(),
      tune: z
        .enum([
          'animation',
          'grain',
          'fastdecode',
          'zerolatency',
          'psnr',
          'ssim',
        ])
        .array()
        .transform(_.uniq)
        .optional(),
      'x265-params': z.string().optional(),
    })
    .strict(),
])

const audioCodecSchema = z.enum(['AAC', 'AC-3', 'FLAC', 'Opus', 'Vorbis'])
const containerExtensionsSchema = z.enum(['mkv', 'mp4'])
const languageCodeSchema = z.string().length(3)
const videoCodecSchema = z.enum(['AV1', 'AVC', 'HEVC'])

export const rulesSchema = z
  .object({
    audio: z.object({
      codec: z
        .object({
          preferred: audioCodecSchema,
          allowed: audioCodecSchema.array(),
        })
        .transform((e) => ({
          ...e,
          allowed: [...new Set([...e.allowed, e.preferred])],
        })),
      encodingParams: audioEncodingSchema,
      language: z.object({
        allowed: languageCodeSchema
          .array()
          .transform((e) => [...new Set([...e, 'und', 'unk'])]),
      }),
    }),
    general: z.object({
      extension: z
        .object({
          preferred: containerExtensionsSchema,
          allowed: containerExtensionsSchema.array(),
        })
        .transform((e) => ({
          ...e,
          allowed: [...new Set([...e.allowed, e.preferred])],
        })),
    }),
    video: z.object({
      codec: z
        .object({
          preferred: videoCodecSchema,
          allowed: videoCodecSchema.array(),
        })
        .transform((e) => ({
          ...e,
          allowed: [...new Set([...e.allowed, e.preferred])],
        })),
      encodingParams: videoEncodingSettingsSchema,
      resolutionBoundingBox: z.object({
        longEdgePx: z.number().int().positive(),
        shortEdgePx: z.number().int().positive(),
      }),
    }),
    text: z.object({
      language: z.object({
        allowed: languageCodeSchema
          .array()
          .transform((e) => [...new Set([...e, 'und', 'unk'])]),
      }),
      style: z.enum(['embedded', 'external']),
    }),
  })
  .strict()

export const appConfigSchema = z
  .object({
    mediaRoots: z
      .object({
        name: z.string().min(1),
        directories: z
          .string()
          .min(1)
          .refine((a) => fs.existsSync(a), { message: 'Path does not exist.' })
          .array()
          .min(1),
        rules: rulesSchema.optional(),
      })
      .strict()
      .array()
      .min(1),
  })
  .strict()
