import { vnode } from './vnode.js'

export function createElement(tag, data = {}, children) {
  // children为undefined | [...](数组)
  // * 在vue中, 与snabbdom的h.js源码不同的是, 元素虚拟节点没有text属性, 只有文本虚拟节点有text属性
  // * 且data默认为{ } (在codegen的过程中, data默认生成为{ }, 传入_c函数)
  return vnode(tag, data, children, undefined, undefined)
}

export function createTextNode(text) {
  return vnode(undefined, undefined, undefined, text, undefined)
}

export function createEmpty() {
  return vnode('div', {}, [], undefined, undefined)
}
