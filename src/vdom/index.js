export function createElement(tag, data = {}, ...children) {
  return vnode(tag, data, children, undefined)
}

export function createTextNode(text) {
  return vnode(undefined, undefined, undefined, text)
}

export function createEmpty() {
  return vnode('div', {}, [], undefined)
}

export function vnode(tag, data, children, text) {
  return {
    tag,
    data,
    children,
    text,
  }
}
