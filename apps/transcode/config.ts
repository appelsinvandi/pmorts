import path from 'path'
import { appConfigSchema } from './src/appConfigSchema'
import { z } from 'zod'
import { MediaRoots } from '@lib/constants'

const mediaRoot = MediaRoots.M

const audioBaseRules = {
  codec: {
    preferred: 'AC-3',
    allowed: ['AAC', 'AC-3'],
  },
  encodingParams: {
    codec: 'aac',

    bitrate: '192K',
  },
} satisfies Partial<z.infer<typeof appConfigSchema>['mediaRoots'][number]['rules']['audio']>

const config: z.infer<typeof appConfigSchema> = {
  mediaRoots: [
    {
      name: 'movies - tuned as film',
      directories: [
        path.resolve(mediaRoot, 'movies', 'Animated - 3D'),
        path.resolve(mediaRoot, 'movies', 'Live Action'),
        path.resolve(mediaRoot, 'movies', 'Musical'),
      ],
      rules: {
        audio: { ...audioBaseRules, language: { allowed: ['eng'] } },
        general: { extension: { preferred: 'mp4', allowed: ['mp4'] } },
        video: {
          codec: { preferred: 'AVC', allowed: ['AVC'] },
          encodingParams: {
            codec: 'libx264',

            crf: 20,
            maxrate: '4M',
            preset: 'medium',
            tune: ['film'],
          },
          resolutionBoundingBox: { longEdgePx: 1280, shortEdgePx: 720 },
        },
        text: { style: 'external', language: { allowed: ['eng'] } },
      },
    },
    {
      name: 'movies - tuned as film and danish language',
      directories: [path.resolve(mediaRoot, 'movies', 'Danish')],
      rules: {
        audio: { ...audioBaseRules, language: { allowed: ['dan', 'eng'] } },
        general: { extension: { preferred: 'mp4', allowed: ['mp4'] } },
        video: {
          codec: { preferred: 'AVC', allowed: ['AVC'] },
          encodingParams: {
            codec: 'libx264',

            crf: 20,
            maxrate: '4M',
            preset: 'medium',
            tune: ['film'],
          },
          resolutionBoundingBox: { longEdgePx: 1280, shortEdgePx: 720 },
        },
        text: { style: 'external', language: { allowed: ['dan', 'eng'] } },
      },
    },
    {
      name: 'movies - tuned as animation',
      directories: [path.resolve(mediaRoot, 'movies', 'Animated - Cartoon')],
      rules: {
        audio: { ...audioBaseRules, language: { allowed: ['eng'] } },
        general: { extension: { preferred: 'mp4', allowed: ['mp4'] } },
        video: {
          codec: { preferred: 'AVC', allowed: ['AVC'] },
          encodingParams: {
            codec: 'libx264',

            crf: 20,
            maxrate: '4M',
            preset: 'medium',
            'profile:v': 'high10',
            tune: ['animation'],
          },
          resolutionBoundingBox: { longEdgePx: 1280, shortEdgePx: 720 },
        },
        text: { style: 'external', language: { allowed: ['eng'] } },
      },
    },
    {
      name: 'tv - tuned as film',
      directories: [path.resolve(mediaRoot, 'tv', 'animated_3d'), path.resolve(mediaRoot, 'tv', 'live-action')],
      rules: {
        audio: { ...audioBaseRules, language: { allowed: ['eng'] } },
        general: { extension: { preferred: 'mp4', allowed: ['mp4'] } },
        video: {
          codec: { preferred: 'AVC', allowed: ['AVC'] },
          encodingParams: {
            codec: 'libx264',

            crf: 18,
            level: '4.1',
            maxrate: '4M',
            pix_fmt: 'yuv420p',
            preset: 'medium',
            'profile:v': 'high',
            tune: ['film'],
            'x264-params': 'keyint=120',
          },
          resolutionBoundingBox: { longEdgePx: 1280, shortEdgePx: 720 },
        },
        text: { style: 'external', language: { allowed: ['eng'] } },
      },
    },
    {
      name: 'tv - tuned as film and danish language',
      directories: [path.resolve(mediaRoot, 'tv', 'danish')],
      rules: {
        audio: { ...audioBaseRules, language: { allowed: ['dan', 'eng'] } },
        general: { extension: { preferred: 'mp4', allowed: ['mp4'] } },
        video: {
          codec: { preferred: 'AVC', allowed: ['AVC'] },
          encodingParams: {
            codec: 'libx264',

            crf: 20,
            maxrate: '4M',
            preset: 'medium',
            tune: ['film'],
          },
          resolutionBoundingBox: { longEdgePx: 1280, shortEdgePx: 720 },
        },
        text: { style: 'external', language: { allowed: ['dan', 'eng'] } },
      },
    },
    {
      name: 'tv - tuned as animation',
      directories: [path.resolve(mediaRoot, 'tv', 'animated_cartoon')],
      rules: {
        audio: { ...audioBaseRules, language: { allowed: ['eng'] } },
        general: { extension: { preferred: 'mp4', allowed: ['mp4'] } },
        video: {
          codec: { preferred: 'AVC', allowed: ['AVC'] },
          encodingParams: {
            codec: 'libx264',

            crf: 20,
            maxrate: '4M',
            preset: 'medium',
            'profile:v': 'high10',
            tune: ['animation'],
          },
          resolutionBoundingBox: { longEdgePx: 1280, shortEdgePx: 720 },
        },
        text: { style: 'external', language: { allowed: ['eng'] } },
      },
    },
    {
      name: 'tv - anime',
      directories: [path.resolve(mediaRoot, 'tv', 'anime')],
      rules: {
        audio: { ...audioBaseRules, language: { allowed: ['eng', 'jpn'] } },
        general: { extension: { preferred: 'mkv', allowed: ['mkv', 'mp4'] } },
        video: {
          codec: {
            preferred: 'HEVC',
            allowed: ['HEVC'],
          },
          encodingParams: {
            codec: 'libx265',

            crf: 20,
            maxrate: '4M',
            preset: 'medium',
            tune: ['animation'],
          },
          resolutionBoundingBox: { longEdgePx: 1280, shortEdgePx: 720 },
        },
        text: { style: 'embedded', language: { allowed: ['eng', 'jpn'] } },
      },
    },
  ],
}

export default appConfigSchema.parse(config)
