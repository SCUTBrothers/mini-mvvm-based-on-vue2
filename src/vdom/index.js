import { vnode } from './vnode.js'

export function createElement(tag, data = {}, children) {
  // children为undefined | [...](数组)
  // * 在vue中, 与snabbdom的h.js源码不同的是, 元素虚拟节点没有text属性, 只有文本虚拟节点有text属性
  // * 且data默认为{ } (在codegen的过程中, data默认生成为{ }, 传入_c函数)

  if (children !== undefined) {
    // ! children当中会包含嵌套数组(由v-for生成的虚拟节点数组)
    // 将嵌套解除, 以方便diff处理, 不会将逻辑复杂化
    let ch
    let childrenClone = children.slice()
    for (let i = 0, l = children.length; i < l; i++) {
      ch = children[i]
      if (Array.isArray(ch)) {
        childrenClone.splice(i, 1, ...ch)
      }
    }
    return vnode(tag, data, childrenClone, undefined, undefined)
  }
  return vnode(tag, data, children, undefined, undefined)
}

export function createTextNode(text) {
  return vnode(undefined, undefined, undefined, text, undefined)
}

export function createEmpty() {
  return vnode('div', {}, [], undefined, undefined)
}
