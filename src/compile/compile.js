import {
  makeAttrsMap,
  addHandler,
  addProp,
  addDirective,
  addAttr,
} from './helper.js'
import HTMLParser from './html-parser.js'
import TextParser from './text-parser.js'

export const dirRE = /^v-|^@|^:|^\.\^#/
export const bindRE = /^:|^\.|^v-bind:/
export const onRE = /^@|^v-on:?/

export const argRE = /:(.*)$/

console.log('compile called')

// * vue当中该函数名字为parse
export function ast(template) {
  let root
  let currentParent
  const stack = []

  HTMLParser(template, {
    /**
     * @param tag: String 标签名, 如div, br, input, ...
     * @param attrs: attr[], attr {name: <attr name>, value: <attr value>, ...},
     *              ? <attr name>应是字符串, 而<attr value>应是用引号包含的字符串,
     *              ? 如class = "done", name = "class", value = '"done"'
     * @param unary: Boolean 说明该标签是否是空标签, true是
     */
    start: function (tag, attrs, unary) {
      const element = {
        type: 1,
        tag,
        attrsList: attrs, // 数组形式的属性 [{name: key, value: value}, ..]
        attrsMap: makeAttrsMap(attrs), // 对象形式的属性{key: value, ...}
        parent: currentParent,
        children: [],
        style: null,
        // attrs: [{name: ..., value: ...}] 在addAttr()中生成
        // events: {eventName: handlerName<string>, ...} 在addHandler()中生成
        // props: [{name: ..., value: ...}] 在addProp()中生成
        // directives: [{name: ..., rawName: ..., value: ..., arg: ...}] 在addDirective()中生成
      }

      if (!root) {
        // // ? 这里应该是$ast, 而不是$vnode, 因为当前正处于ast解析的阶段
        // // ? vnode在render函数运行的阶段生成的
        // vm.$vnode = root = element
        root = element
        // root被赋值以后, !root则一直为false, 所以第一个解析的元素为根元素
        //todo 这里应该要加 unary为true的判定
      }

      if (currentParent) {
        currentParent.children.push(element)
      }

      if (!unary) {
        currentParent = element
        stack.push(element)
      } else {
        // 对于如 input这样的空元素, 它在closeElement中被处理
        closeElement(element)
      }
    },

    end: function (tag) {
      const element = stack[stack.length - 1]
      const lastNode = element.children[element.children.length - 1]

      //? 删除最后一个空白文字节点, 这个我暂时不知道啥意思
      if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
        element.children.pop()
      }

      // 相当于pop, 但是比直接pop要解约性能
      stack.length -= 1
      currentParent = stack[stack.length - 1]

      closeElement(element)
    },

    chars: function (text) {
      if (!text.trim()) {
        return
      }

      // 解析文本节点, "hello, {{ name }}!" => '"hello" + _s(name) + "!"'
      const expression = TextParser(text)
      if (expression) {
        // 如果含有mustache语法
        currentParent &&
          currentParent.children.push({
            type: 3,
            text: expression,
          })
      } else {
        // 如果没有mustache语法, 则直接将text推入currentParent当中
        currentParent &&
          currentParent.children.push({
            type: 3,
            // ! 字符串要用双引号包裹, 否则生成render function的时候会出错
            text: `"${text}"`,
          })
      }
    },
  })

  function closeElement(element) {
    element = processElement(element)

    // 这里还有很多closeElement的逻辑, 暂时用不上
  }

  return root
}

function processElement(element) {
  processAttrs(element)

  // 还有processKey, processComponent等, 暂不了解

  return element
}

function processAttrs(element) {
  // * attrsList 数组形式的属性 [{name: key, value: value}, ..]
  const list = element.attrsList
  let name, rawName, value
  for (let i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name
    value = list[i].value

    // dirRE = /^v-|^@|^:|^\.\^#/
    if (dirRE.test(name)) {
      element.hasBindings = true
      if (bindRE.test(name)) {
        // v-bind
        // * 使用v-bind的时候, 后面的属性名和v-bind:之间不能有空格
        name = name.replace(bindRE, '')
        addProp(element, name, value)
      } else if (onRE.test(name)) {
        // v-on = "{click: clickMethod}"
        // v-on:click = "clickMethod"
        // @click = "clickMethod"
        // onRE = /^@|^v-on:?/
        // name.replace以后, name变成
        // 1. "", 2. "click"
        name = name.replace(onRE, '')
        addHandler(element, name, value)
      } else {
        // dirRE = /^v-|^@|^:|^\.|^#/
        // 对于v-model = "price", 这种, name.replace以后, 剩下model
        // v-directive:arg, name.replace => directive:arg
        name = name.replace(dirRE, '')
        // argRE = /:(.*)$/
        const argMatch = name.match(argRE)
        let arg = argMatch && argMatch[1]
        if (arg) {
          // 如果有arg, 截取arg, 获取指令名称
          // str.slice(0, -a), 相当于str.slice(0, str.length - a), 从0截取到str.length - a, 不包含str.length - a
          name = name.slice(0, -(arg.length + 1))
        }
        addDirective(element, name, rawName, value, arg)
      }
    } else {
      // 非指令属性
      addAttr(element, name, value)
    }
  }
}
