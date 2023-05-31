import { MediaInfoOutput } from '@lib/media-info'
import { Video } from '../__generated__/prisma/client'

export type MediaCacheEntry = Video & { mediaInfo: MediaInfoOutput }
