import {compileToRenderFunction} from "../compile/index.js"
import {mountComponent} from "./lifecycle.js"

export function initMixin(Vue) {
  Vue.prototype._init = function _init(options) {
    const vm = this

    vm.$options = options

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this

    if (typeof el == 'string') {
      el = document.querySelector(el)
    }

    const render = compileToRenderFunction(vm.$options.template)

    vm.$options.render = render

    mountComponent(this, el)
  }
}

