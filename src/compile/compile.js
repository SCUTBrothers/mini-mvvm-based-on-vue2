import { makeAttrsMap, setELAttrs, setElDirective } from './helper.js'
import { HTMLParser } from './parse.js'
import { TextParser } from './text-parser.js'

function compileToFunction(template, vm) {
  let options = vm.$options
  let hooks = vm.hooks

  let root
  let currentParent
  const stack = []

  HTMLParser(template, {
    /**
     * @param tag: String 标签名, 如div, br, input, ...
     * @param attrs: attr[], attr {name: <attr name>, value: <attr value>, ...},
     *              ? <attr name>应是字符串, 而<attr value>应是用引号包含的字符串,
     *              ? 如class = "done", name = "class", value = '"done"'
     * @param unary: Boolean 说明该标签是否是空标签
     */
    start: function (tag, attrs, unary) {
      const element = {
        vm: vm,
        type: 1,
        tag,
        attrsList: attrs, // 数组形式的属性 [{name: key, value: value}, ..]
        attrsMap: makeAttrsMap(attrs), // 对象形式的属性{key: value, ...}
        parent: currentParent,
        children: [],
        style: null,
      }

      setElDirective(el, attrs)

      //todo
      setELAttrs(el)

      if (!root) {
        // ? 这里应该是$ast, 而不是$vnode, 因为当前正处于ast解析的阶段
        // ? vnode在render函数运行的阶段生成的
        vm.$vnode = root = element
        // root被赋值以后, !root则一直为false, 所以第一个解析的元素为根元素
        //todo 这里应该要加 unary为true的判定
      }

      if (currentParent) {
        currentParent.children.push(element)
      }

      if (!unary) {
        currentParent = element
        stack.push(element)
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
            type: 2,
            expression,
          })
      } else {
        // 如果没有mustache语法, 则直接将text推入currentParent当中
        currentParent &&
          currentParent.children.push({
            type: 3,
            text,
          })
      }
    },
  })
}
