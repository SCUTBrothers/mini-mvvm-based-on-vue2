import { ast } from '../compile.js'
let template = `
    <h1 id="test">
        <div class="red center">
            hello, {{name}} , {{message}}
        </div>
        <p>
            some text
        </p>
    </h1>
`

let res = ast(template)
console.log(res)
