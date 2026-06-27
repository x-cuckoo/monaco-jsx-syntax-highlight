# monaco-jsx-syntax-highlight

[![npm version](https://img.shields.io/npm/v/monaco-jsx-syntax-highlight.svg)](https://www.npmjs.com/package/monaco-jsx-syntax-highlight)
[![npm downloads](https://img.shields.io/npm/dm/monaco-jsx-syntax-highlight.svg)](https://www.npmjs.com/package/monaco-jsx-syntax-highlight)

Support monaco **jsx/tsx** syntax highlighting

Monaco only supports the jsx **syntax checker**

[Live demo](https://codesandbox.io/s/momaco-jsx-tsx-highlight-mp1sby)

## Installing

```shell
$ npm install monaco-jsx-syntax-highlight
```

## Use

The main part of this package is a worker for **analysing jsx syntax**

So we have two ways to init the **Controller class**

### Use blob create worker

```tsx
import { MonacoJsxSyntaxHighlight, getWorker } from 'monaco-jsx-syntax-highlight'

const controller = new MonacoJsxSyntaxHighlight(getWorker(), monaco)
```

When using `getWorker` return value as Worker, we can **customize the typescript compile source file url** (for the purpose of **speeding up** load time)

If not set, the default source is https://cdnjs.cloudflare.com/ajax/libs/typescript/5.9.2/typescript.min.js

```tsx
const controller = new MonacoJsxSyntaxHighlight(getWorker(), monaco, {
    customTypescriptUrl: 'https://xxx/typescript.min.js'
})
```

### Use js worker file

If your browser does not support blob workers, you can download the [worker file](https://github.com/x-glorious/monaco-jsx-syntax-highlight/releases) and save it in your project

- web worker has same-origin policy

```tsx
import { MonacoJsxSyntaxHighlight } from 'monaco-jsx-syntax-highlight'

const controller = new MonacoJsxSyntaxHighlight('https://xxxx', monaco)
```

---

### Controller

Remember, when this editor is disposed(`editor.dispose`), we should **invoke the `dispose`** function returned by the highlighterBuilder too

- `highlighter`: send latest content to worker for analysing
- `dispose`: remove event listener of the worker

```tsx
// editor is the result of monaco.editor.create
const { highlighter, dispose } = monacoJsxSyntaxHighlight.highlighterBuilder(
  { editor: editor }
)

// init hightlight
highlighter()

editor.onDidChangeModelContent(() => {
  // content change, highlight
  highlighter()
})
```

#### Dispose the worker

The `dispose` returned by `highlighterBuilder` only removes the message listener for a single editor. When the whole highlighter is no longer needed (e.g. every editor has been disposed), call the **class-level `dispose`** to terminate the underlying worker and free its thread resources.

```tsx
// when the highlighter instance is no longer needed
monacoJsxSyntaxHighlight.dispose()
```

```tsx
interface HighlighterConfig {
  /**
   * max jsx tag order loop value
   * @default 3
   */
  jsxTagCycle: number
  /**
   * open console to log some error information
   * @default false
   */
  enableConsole?: boolean
}

type HighlighterBuilder = (context: {
    editor: any;
    filePath?: string;
}, config?: HighlighterConfig) => {
    highlighter: (code?: string) => void;
    dispose: () => void;
}
```

### Highlight class

Use css class to highlight the jsx syntax

- `'jsx-tag-angle-bracket'`: `<`、`>`、`/>`
- `'jsx-tag-attribute-key'`: the attribute key
- `'jsx-expression-braces'`: the braces of attribute value
- `'jsx-text'`: the text in jsx tag content
- `'jsx-tag-name'`: the tag name of jsx tag
- `'jsx-tag-order-xxx'`: the tag order class

## FAQ

### monaco does not **check** the jsx syntax

You can try below config code

PS: the **file name must end with** `jsx` or `tsx`

```tsx
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.Preserve,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    esModuleInterop: true
})

const model = monaco.editor.createModel(
  'const test: number = 666',
  'typescript',
  monaco.Uri.parse('index.tsx')
)

editor.current = monaco.editor.create(editorElement.current)
editor.current.setModel(model)
```
