import { type MediaInfoOutput } from '@lib/media-info'
import { type Video } from '../__generated__/prisma/client/index.js'

export type MediaCacheEntry = Video & { mediaInfo: MediaInfoOutput }
