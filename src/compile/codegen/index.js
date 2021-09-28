import baseDirectives from '../directive/index.js'
import { genHandlers } from './events.js'

class CodegenState {
  constructor() {
    //  暂时按照vue2源码实现简单的CodegenState,
    //  CodegenState实例state目前只有在genDirectives当中会用到
    this.directives = baseDirectives
  }
}

export function generate(ast) {
  const state = new CodegenState()
  const code = ast ? genElement(ast, state) : "_c('div')"

  console.log(`in generate函数, render函数代码code生成完成, code为${code}`)
  const render = new Function(`with (this) {return ${code}}`)

  return render
}

function genElement(el, state) {
  const data = genData(el, state)

  // * 输入的el必然是根元素ast, 所以不用判定它的type以确定是否是文本节点, 这个逻辑应放到函数genChildren()当中
  const children = genChildren(el, state)

  let code = `_c('${el.tag}'${data ? `, ${data}` : ''}${
    children ? `,${children}` : ''
  })`

  return code
}

function genData(el) {
  let data = '{'

  if (el.nativeEvents) {
    // 单种事件, v-on: click = "clickHandler"
    //  arg = "click", expression = "clickHandler"
    // 多种事件, v-on = "{click: clickHandler, mousemove: mouseMoveHandler}"
    //  arg = "", expression = "{click: clickHandler, mousemove: mouseMoveHandler}"
    data += `${genHandlers(el.nativeEvents, true)},`
  }

  if (el.props) {
    data += `domProps:${genProps(el.props)},`
  }

  // 将最后的","通过正则替换删掉
  data = data.replace(/,$/, '') + '}'
  console.log(`data is ${data}`)
  return data
}

function genProps(props) {
  let staticProps = ``
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    console.log(`----prop is ${prop}`)
    console.log(prop)
    staticProps += `${prop.name}:${prop.value},`
  }
  staticProps = `{${staticProps.slice(0, -1)}}`
  return staticProps
}

function genDirectives(el, state) {
  const dirs = el.directives
  if (!dirs) return

  let res = 'directives: ['

  for (let i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    // gen: DirectiveFunction 用于生成相应的指令的赋值代码, 如on => _g(...), bind => _b(...)
    const gen = state.directives[dir.name]
    /**
     * res = [{
        name: "on",
        rawName: "v-on",
        value: ...,
        expression: "clickMethod", 待处理
        arg: "click",
        modifiers: {...}
        }, { ... }, { ... }, ...more directives
      ] 
      * ? todo: ❓ expression是什么?
      * * 这里暂时不处理modifiers
     * 
     */

    if (gen) {
      res += `{name: "${dir.name}", rawName:"${dir.rawName}"${
        dir.value
          ? `,value:(${dir.value}),expresion: ${JSON.stringify(dir.value)}`
          : ''
      }${dir.arg ? `,arg:"${dir.arg}"` : ''}},`
    }
  }

  // res.slice(0, -1) 相当于res.slice(0, res.length - 1), 最后一个,不会被保留
  return res.slice(0, -1) + ']'
}

function genChildren(el, state) {
  const children = el.children
  if (!children) {
    console.log(el)
  }
  if (children.length) {
    return `[${children
      .map((c) => {
        return genNode(c, state)
      })
      .join(',')}]`
  }
}

// ? 为什么不递归调用genElement而是递归调用genNode呢?
// * 因为genElement是生成根元素的入口, 而genNode用于生成文本节点和元素节点,
// * 同时包含两种元素的逻辑, 所以使用genNode与要完成的任务更加的匹配
function genNode(node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } else if (node.type === 3) {
    return genText(node)
  }
}

export function genText(textNode) {
  // * vue是将带有mustach{{}}语法的文本type设置为2, 普通文本type设置为3,
  // * 我暂时不想对JSON数据进行处理, 所以全部设置为3
  if (textNode.type === 3) {
    return `_v(${textNode.text})`
  }
}
