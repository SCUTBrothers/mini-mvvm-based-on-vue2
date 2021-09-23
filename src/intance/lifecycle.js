import { patch } from '../vdom/patch.js'
import Watcher from '../reactivity/watcher.js'

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    console.log('update被调用')
    const vm = this

    patch(vm, vnode)
  }
}

export function mountComponent(vm, el) {
  // vm.$el应该指向由template生成的element, 而不是template所在的#app, 后续再优化
  vm.$el = el

  if (!(vm.$options.template || el || vm.$options.el)) {
    console.log(
      `Failed to mount component: template or render function not defined`
    )
  }

  const updateComponent = () => {
    let vnode = vm._render()
    vm._update(vnode)
  }

  new Watcher(vm, updateComponent)
}
