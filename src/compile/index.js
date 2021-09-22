import {parseHTML} from "./parse.js"
import {generate} from "./generate.js"

export function compileToRenderFunction(template) {
  let ast = parseHTML(template)

  let code = generate(ast)

  console.log(`render function is:
  with (this) {
      return ${code}
  }`)
  let render = new Function(`with (this) {
      return ${code}
  }`)

  return render
}
