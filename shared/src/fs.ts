import fs from 'node:fs/promises'
import path from 'node:path'

export type FsWriteFileParams = Parameters<typeof fs.writeFile>
export type WriteFileData = FsWriteFileParams[1]
export type WriteFileOptions = FsWriteFileParams[2] & { mkdir?: boolean | { recursive: boolean } }

export async function writeFile(file: string, data: WriteFileData, options?: WriteFileOptions) {
  if (typeof options?.mkdir === 'boolean' && options?.mkdir) {
    await fs.mkdir(path.dirname(file))
  } else if (typeof options?.mkdir === 'object' && options?.mkdir) {
    await fs.mkdir(path.dirname(file), { recursive: options?.mkdir.recursive })
  }
  await fs.writeFile(file, data)
}
