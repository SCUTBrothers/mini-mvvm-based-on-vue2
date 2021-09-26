import { compileToRenderFunction } from '../compile/index.js'
import { initState } from '../state.js'
import { mountComponent } from './lifecycle.js'

let uid = 0
export function initMixin(Vue) {
  Vue.prototype._init = function _init(options) {
    const vm = this

    vm.$options = options
    this._uid = uid++

    // beforeCreated hook, 数据初始化前
    initState(vm)

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

    // "beforeMount" hook
    mountComponent(vm, el)
  }
}
