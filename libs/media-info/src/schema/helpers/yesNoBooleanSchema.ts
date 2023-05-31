import z from 'zod'

export const yesNoBooleanSchema = z.union([z.literal('Yes'), z.literal('No')]).transform((e) => e === 'Yes')
