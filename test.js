import { parseHTML } from './src/compile/parse.js'
import { generate } from './src/compile/generate.js'

const template = `
<div class="todolist-wrapper">
    <ul class="todolist-container">
        <li class="done"> {{ task1 }}</li>
        <li class="todo"></li>
        <li class="todo"></li>
    </ul>
</div>`

let ast = parseHTML(template)
let code = generate(ast)

console.log(code)
