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
  // todo genStatic
  // todo el.static是用于标识那些没有绑定vm数据或者指令(v-on, v-if等)的静态节点,
  // todo 静态标识利于patch diff, 在diff的时候不会去比较新旧两个静态节点, 因为两者数据不会发生变化

  if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else {
    const data = genData(el, state)

    // * 输入的el必然是根元素ast, 所以不用判定它的type以确定是否是文本节点, 这个逻辑应放到函数genChildren()当中
    const children = genChildren(el, state)

    let code = `_c('${el.tag}'${data ? `, ${data}` : ''}${
      children ? `,${children}` : ''
    })`

    return code
  }
}

function genIf(el, state) {
  el.ifProcessed = true
  return genIfConditions(el.ifConditions.slice(), state)
}

/**
 * [{exp: <if exp>,block: <if el>}, {exp: <elseif exp>, block}, {exp: <else exp>, block}]
 *
 * 一个condtion对应生成一个不完整的三元表达式(<if exp>) ? <if el code> : (递归调用genIfConditions)
 * 直到conditions为[], ... ? ... : ... ? ... : (最后的部分)
 * 再次调用genIfConditions, 生成_e(), 填上最后的部分
 *
 * 这个递归用的挺棒的!
 */
function genIfConditions(conditions, state) {
  if (!conditions.length) {
    // _e用于生成空节点<div></div>
    return `_e()`
  }

  const condition = conditions.shift()
  if (condition.exp) {
    return `(${condition.exp})?${genTernaryExp(
      condition.block,
      state
    )}:${genIfConditions(conditions, state)}`
  } else {
    return `${genTernaryExp(condition.block, state)}`
  }
}

function genTernaryExp(el, state) {
  return genElement(el, state)
}

function genData(el, state) {
  let data = '{'

  /**
   * 先解析directives, 因为如v-model="<xxx>"这种directive, 会给el.props传value: "value", 然后给el.nativeEvents传递"input": "<xxx>"句柄
   * 而el.props和el.nativeEvents对象都将在后面的if语句中转为字符串形式
   * 所以就如前面所说的, 要先解析directives, 这样就不会漏掉
   */
  const dirs = genDirectives(el, state)
  if (dirs) data += dirs + ','

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
  return data
}

function genProps(props) {
  let staticProps = ``
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    staticProps += `${prop.name}:${prop.value},`
  }
  staticProps = `{${staticProps.slice(0, -1)}}`
  return staticProps
}

function genDirectives(el, state) {
  const dirs = el.directives
  if (!dirs) return

  let res = 'directives: ['

  let dir
  for (let i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    try {
      var gen = state.directives[dir.name]
    } catch (e) {
      console.log(state)
      var gen = state.directives[dir.name]
    }
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
      gen(el, dir)
      res += `{name: "${dir.name}", rawName:"${dir.rawName}"${
        dir.value
          ? `,value:(${dir.value}),expresion: ${JSON.stringify(dir.value)}`
          : ''
      }${dir.arg ? `,arg:"${dir.arg}"` : ''}},`
    }
  }

  // 去掉最后一个",", 如果有的话
  return res.replace(/,$/, '') + ']'
}

function genChildren(el, state) {
  const children = el.children
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
