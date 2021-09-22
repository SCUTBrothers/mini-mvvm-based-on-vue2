import {parseHTML} from "./parse.js"
import {generate} from "./generate.js"

export function compileToRenderFunction(template) {
  let ast = parseHTML(template)

  let code = generate(ast)

  console.log(code)
  console.log(`with (this) {
      return ${code}
  }`)
  let render = new Function(`with (this) {
      return ${code}
  }`)
  console.log(render)

  return render
}
