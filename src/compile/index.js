import { generate } from './codegen/index.js'
import { ast } from './compile.js'

export function compileToRenderFunction(template) {
  const elm = ast(template)
  const render = generate(elm)

  return render
}
