import { mediaInfoOutputSchema } from './schema'
import z from 'zod'

export type MediaInfoOutput = z.infer<typeof mediaInfoOutputSchema>
