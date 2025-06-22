import { Classification, Config as HighlighterConfig } from './worker/types'

export interface WorkerStringContainer {
  worker: string
}

export interface Config {
  /**
   * 自定义 typescript.min.js url
   * - 只在worker来源为 json 模式下生效
   */
  customTypescriptUrl?: string
}
/**
 * 高亮
 */
export class MonacoJsxSyntaxHighlight {
  private worker: Worker
  private monaco: any

  constructor(worker: string | Worker | WorkerStringContainer, monaco: any, config?: Config) {
    this.monaco = monaco
    if (typeof worker === 'string') {
      this.worker = new Worker(worker)
    } else if (
      (worker as WorkerStringContainer).worker &&
      typeof (worker as WorkerStringContainer).worker === 'string'
    ) {
      this.worker = this.createWorkerFromPureString(
        (worker as WorkerStringContainer).worker,
        config
      )
    } else {
      this.worker = worker as Worker
    }
  }

  private createWorkerFromPureString = (content: string, config?: Config) => {
    // URL.createObjectURL
    window.URL = window.URL || window.webkitURL
    let blob

    // replace the custom url
    content = content.replace(
      '__TYPESCRIPT_CUSTOM_URL__',
      config?.customTypescriptUrl ? `'${config?.customTypescriptUrl}'` : 'undefined'
    )

    try {
      blob = new Blob([content], { type: 'application/javascript' })
    } catch (e) {
      // Backwards-compatibility
      ;(window as any).BlobBuilder =
        (window as any).BlobBuilder ||
        (window as any).WebKitBlobBuilder ||
        (window as any).MozBlobBuilder
      blob = new (window as any).BlobBuilder()
      blob.append(content)
      blob = blob.getBlob()
    }

    const worker = new Worker(URL.createObjectURL(blob))
    // free
    URL.revokeObjectURL(blob)

    return worker
  }

  public highlighterBuilder = (context: { editor: any; filePath?: string }, config?: HighlighterConfig) => {
    const { editor, filePath = editor.getModel().uri.toString() } = context
    const decorationsRef = { current: [] }

    const disposeMessage = (event: MessageEvent) => {
      const { classifications, version, filePath: disposeFilePath } = event.data
      requestAnimationFrame(() => {
        // 确认为本文件，并且为最新版本
        if (disposeFilePath === filePath && version === editor.getModel().getVersionId()) {
          const preDecoration = decorationsRef.current
          decorationsRef.current = editor.deltaDecorations(
            preDecoration,
            classifications.map((classification: Classification) => ({
              range: new this.monaco.Range(
                classification.start.row,
                classification.start.column,
                classification.end.row,
                classification.end.column + 1
              ),
              options: {
                inlineClassName: classification.tokens.join(' ')
              }
            }))
          )
        }
      })
    }
    // 注册监听事件
    this.worker.addEventListener('message', disposeMessage)

    return {
      highlighter: (code?: string) => {
        requestAnimationFrame(() => {
          const disposeCode = code || editor.getModel().getValue()

          // send message to worker
          this.worker.postMessage({
            code: disposeCode,
            filePath,
            version: editor.getModel().getVersionId(),
            config
          })
        })
      },
      dispose: () => {
        this.worker.removeEventListener('message', disposeMessage)
      }
    }
  }
}

export { getWorker } from './get-worker'
