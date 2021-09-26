import { HTMLParser } from './parse.js'
import { generate } from './generate.js'

// export function compileToRenderFunction(template) {
//   let ast = parseHTML(template)

//   let code = generate(ast)

//   console.log(`render function is:
//   with (this) {
//       return ${code}
//   }`)
//   let render = new Function(`with (this) {
//       return ${code}
//   }`)

//   return render
// }

export function compileToRenderFunction(template, vm) {
  HTMLParser(template, {
    // unary用于判断是否是闭合标签, true, 是, false, 不是
    start: function (tag, attrs, unary) {
      const element = {
        vm: vm,
        type: 1,
        tag,
        attrsList: attrs,
        parent: currentParent,
        children: [],
        events: {},
        nativeEvents: {},
        style: null,
        hook: {},
        props: {}, // DOM属性
        attrs: {}, // unary为true时 具有该属性, 如果为false, 则移除该属性
        //todo:
        //isComponent: !iSHTMLTag(tag) && !isSVG(tag)
      }

      // 解析指令
      // setElDirective(element, attrs)

      // 解析属性

      // ?
      if (!root) {
        vm.$vnode = root = element
      }

      // 如果不是闭合标签
      if (!unary) {
        currentParent = element
        stack.push(element)
      }
    },
  })
}
