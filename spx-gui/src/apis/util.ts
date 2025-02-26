/**
 * @desc util-related APIs of spx-backend
 */

import { client, type UniversalUrl, type UniversalToWebUrlMap } from './common'

export interface FormatError {
  column: number
  line: number
  msg: string
}

export interface FormatResponse {
  body: string
  error?: FormatError
}

export function formatSpxCode(body: string) {
  return client.post('/util/fmtcode', { body }) as Promise<FormatResponse>
}

export type UpInfo = {
  /** Uptoken */
  token: string
  /** Valid time for uptoken, unit: second */
  expires: number
  /** Maximum file size allowed in bytes */
  maxSize: number
  /** Bucket name */
  bucket: string
  /** Bucket Region */
  region: string
}

export function getUpInfo() {
  return client.get('/util/upinfo') as Promise<UpInfo>
}

export async function makeObjectUrls(objects: UniversalUrl[]): Promise<UniversalToWebUrlMap> {
  const result = (await client.post('/util/fileurls', { objects: objects })) as { objectUrls: UniversalToWebUrlMap }
  return result.objectUrls
}
