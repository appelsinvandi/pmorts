import { spawn } from 'child_process'
import path from 'path'
import { mediaInfoOutputSchema } from './schema'

export * from './types'
export * from './utils/trackTypeGuards'

export async function GetMediaInfo(filePath: string) {
  const commandArgs: string[] = []
  commandArgs.push('--Output=JSON')
  commandArgs.push(path.resolve(filePath))

  const mediaInfoStream = spawn('mediainfo', commandArgs)
  let mediaInfoOutput = ''
  for await (let chunk of mediaInfoStream.stdout) mediaInfoOutput += chunk

  const exitCode = await new Promise((r) => mediaInfoStream.once('exit', r))
  if (exitCode !== 0) throw new Error(`"mediainfo" exited with code ${exitCode}`)

  const parsedRes = JSON.parse(mediaInfoOutput)
  const validationRes = mediaInfoOutputSchema.safeParse(parsedRes)
  if (!validationRes.success) {
    throw new Error(
      'MediaInfo output validation error for: ' +
        filePath +
        '.\n\n' +
        validationRes.error.issues
          .flatMap((e) => {
            const value = e.path.reduce((acc, c) => acc[c], parsedRes as any)
            return [
              `    - ${e.path.join('.')}: ${e.message}`,
              `        - Got: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`,
            ]
          })
          .join('\n')
    )
  }

  return validationRes.data
}
