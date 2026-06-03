import { Node as NodeOriginal } from 'typescript'

const getTypescriptUrl = () => {
  const defaultUrl = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/4.6.4/typescript.min.js'
  try {
    // @ts-ignore
    return __TYPESCRIPT_CUSTOM_URL__ || defaultUrl
  } catch {
    return defaultUrl
  }
}

// @ts-ignore
self.importScripts([getTypescriptUrl()])

export const Typescript = (self as any).ts

export declare namespace Typescript {
  type Node = NodeOriginal
}
