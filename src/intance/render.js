import { createElement, createEmpty, createTextNode } from '../vdom/index.js'

export function renderMixin(Vue) {
  Vue.prototype._c = function (name, attrs, children) {
    return createElement(...arguments)
  }

  Vue.prototype._a = function (executableExp) {
    return executableExp()
  }

  Vue.prototype._e = function () {
    // 创建空标签, 用于v-if
    console.log(`empty called`)
    return createEmpty()
  }

  Vue.prototype._v = function (text) {
    console.log(`_v被调用, 输入的文本是${text}`)
    console.log(`_v中, 创建文本虚拟节点`)
    return createTextNode(text)
  }

  Vue.prototype._s = function (value) {
    console.log(`_s被调用, 引用的mustache中的变量值为${value}`)
    value = value || ''
    return value
  }

  Vue.prototype._render = function () {
    const vm = this
    const render = vm.$options.render
    console.log(`_render中, 获取生成好的render函数`)
    console.log(`_render中, render函数调用前`)
    let vnode = render.call(vm)
    console.log(`_render中, render函数调用结束, 生成并返回虚拟节点`)

    return vnode
  }
}
