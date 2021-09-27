// import { parseHTML } from './parse.js'
// import { generate } from './generate.js'

import { codeGen } from './codegen.js'
import { ast } from './compile.js'

export function compileToRenderFunction(template) {
  const elm = ast(template)

  const render = codeGen(elm)

  return render
}
