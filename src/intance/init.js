import { compileToRenderFunction } from '../compile/index.js'
import { initState } from '../state.js'
import { initLifeCycle, mountComponent } from './lifecycle.js'

let uid = 0
export function initMixin(Vue) {
  Vue.prototype._init = function _init(options) {
    const vm = this

    vm.$options = options
    this._uid = uid++

    initLifeCycle(vm)

    vm.callHook('beforeCreated')
    initState(vm)
    vm.callHook('created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  /**
   * $mount
   *
   * @param el 代表虚拟节点生成的元素的挂载容器(并不是挂载作为el的子元素
   *           el会在patch后替换. 参照snabbdom patch源码)
   */
  Vue.prototype.$mount = function $mount(el) {
    const vm = this
    // * options和vm.$options指针相同(引用类型赋值)
    const options = vm.$options

    if (typeof el == 'string') {
      el = document.querySelector(el)
    } else if (typeof el != 'object') {
      return
    }

    vm.$el = el

    /**
     * * 优先级: render函数 > template > el
     *
     * * 如果vm.$options当中包含有render函数, 那么就不用通过template生成render函数,
     * * 后面直接通过vm.$options.render获取render函数
     * * 如果vm.$options当中没有render函数, 那么通过template去生成render函数
     *    * 如果没有template, 那么将el的outerHTML作为template
     */
    if (!options.render) {
      let template = options.template
      if (template) {
        /**
         * template的指定方式
         * 1. 字符串
         *  1.1 id选择器"#xxx", 指向元素<template id="xxx">...(template inner></template>
         *  2.1 字符串模板 eg. <div> ... </div>
         * 2. dom元素
         *  template: document.querySelector("<selector>")
         */
        if (typeof template == 'string') {
          if (template[0] === '#') {
            // 1.1情形
            template = document.querySelector(template).innerHTML
          }
          // 不包含"#"则认为是情形1.2
        } else if (template.nodeType) {
          // 情形2
          template = template.innerHTML
        }
      } else if (el) {
        template = el.outerHTML
      }
      const render = compileToRenderFunction(template, vm)
      options.render = render
    }

    vm.callHook('beforeMount')
    mountComponent(vm, el)
  }
}
