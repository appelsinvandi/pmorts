import { spawn } from 'child_process'

export async function spawnAssist(command: string, args: string[]) {
  const spawnStream = spawn(command, args, {
    stdio: 'inherit',
  })
  const exitCode = await new Promise((r) => spawnStream.once('exit', r))
  if (exitCode !== 0) throw new Error(`"${command}" exited with code ${exitCode}`)
}
