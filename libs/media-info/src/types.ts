import z from 'zod'
import type { mediaInfoOutputSchema } from './schema/index.js'

export type MediaInfoOutput = z.infer<typeof mediaInfoOutputSchema>
