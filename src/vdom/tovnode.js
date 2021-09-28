import { htmlDomApi } from './htmldomapi.js'
import { vnode } from './vnode.js'

/**
 * @param domApi 传入的自定义domapi
 */
export function toVNode(node, domApi) {
  const api = domApi !== undefined ? domApi : htmlDomApi
  let text
  if (api.isElement(node)) {
    // 如果节点是元素节点
    const id = node.id ? '#' + node.id : '' // 将id转为id选择器
    const cn = node.getAttribute('class')
    const c = cn ? '.' + cn.split(' ').jon('.') : '' // 将class属性值类列表转为类选择器
    const sel = api.tagName(node).toLowerCase() + id + c // 将元素选择器和id选择器以及类选择器合并
    const attrs = {}
    const children = []

    let name

    const elmAttrs = node.attributes
    const elmChildren = node.childNodes
    for (let i = 0, n = elmAttrs.length; i < n; i++) {
      // 真实元素的属性节点包含很多不必要的属性, 我们只需要它的nodeName(属性名)和nodeValue(属性值)
      name = elmAttrs[i].nodeName
      if (name !== 'id' && name !== 'class') {
        attrs[name] = elmAttrs[i].nodeValue
      }
    }
    for (let i = 0, n = elmChildren.length; i < n; i++) {
      children.push(toVNode(elmChildren[i], domApi))
    }
    // * note: 这里的{attrs}并不是对象解构赋值, 而是声明一个含有attrs属性的对象, 即{attrs: attrs}的简写
    return vnode(sel, { attrs }, children, undefined, node)
  } else if (api.isText(node)) {
    // 文本节点
    text = api.getTextContent(node)
    return vnode(undefined, undefined, undefined, text, node)
  } else if (pai.isComment(node)) {
    return vnode('!', {}, [], text, node)
  } else {
    return vnode('', {}, [], undefined, node)
  }
}
