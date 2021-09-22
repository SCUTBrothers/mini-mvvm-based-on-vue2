import { createElement, createTextNode } from "../vdom/index.js"

export function renderMixin(Vue) {
  Vue.prototype._c = function (name, attrs, ...children) {
    return createElement(...arguments)
  }

  Vue.prototype._v = function (text) {
    return createTextNode(text)
  }

  Vue.prototype._s = function (value) {
    return value ? '' : value
  }

  Vue.prototype._render = function () {
    const vm = this
    const render = vm.$options.render

    let vnode = render.call(vm)

    return vnode
  }
}
