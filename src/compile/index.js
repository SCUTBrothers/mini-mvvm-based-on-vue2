import {parseHTML} from "./parse.js"
import {generate} from "./generate.js"

export function compileToRenderFunction(template) {
  let ast = parseHTML(template)

  let code = generate(ast)

  console.log(code)
  let render = new Function(`with (this) {
      return ${code}
  }`)

  return render
}
