import { vnode } from './vnode.js'

export function createElement(tag, data = {}, children) {
  return vnode(tag, data, children, undefined, undefined)
}

export function createTextNode(text) {
  return vnode(undefined, undefined, undefined, text, undefined)
}

export function createEmpty() {
  return vnode('div', {}, [], undefined, undefined)
}
