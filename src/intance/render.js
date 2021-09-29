import { isObject } from '../utils/index.js'
import { createElement, createEmpty, createTextNode } from '../vdom/index.js'

export function renderMixin(Vue) {
  Vue.prototype._c = function (name, attrs, children) {
    // * 对于无子元素的节点, 在codegen的时候, children为undefined(没有第三个参数)
    // * 对于有元素的节点, 在codegen的时候, chidren是一个数组[...]
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
    console.log(`_v被调用, 输入的文本是${text}, 创建文本虚拟节点`)
    return createTextNode(text)
  }

  Vue.prototype._s = function (value) {
    console.log(`_s被调用, 引用的mustache中的变量值为${value}`)
    value = value || ''
    return value
  }

  Vue.prototype._l = function (value, renderList) {
    // renderList(alias[iterator1[,iterator2]])
    let ret
    if (Array.isArray(value) || typeof value === 'string') {
      ret = new Array(value.length)
      for (let i = 0, l = value.length; i < l; i++) {
        ret[i] = renderList(value[i], i)
      }
    } else if (typeof value === 'number') {
      ret = new Array(value)
      for (let i = 0; i < value; i++) {
        // 内部的alias从1开始, 一直到该数字(包括该数字)
        ret[i] = renderList(i + 1, i)
      }
    } else if (isObject(value)) {
      keys = Object.keys(value)
      ret = new Array(keys.length)
      for (let i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        ret[i] = renderList(value[key], key, i)
      }
    }

    if (ret == undefined) {
      ret = []
    }

    ret._isVList = true
    // ! 注意返回的是vnode数组, 在patchVnode和patch的createElm需要注意这一点
    return ret
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
