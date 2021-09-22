import { patch } from "../vdom/patch.js"
import Watcher from "../reactivity/watcher.js"

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this

    patch(vm.$el, vnode)

  }
}

export function mountComponent(vm, el) {
  vm.$el = el

  if (!(vm.$options.template || el || vm.$options.el)) {
    console.log(
      `Failed to mount component: template or render function not defined`
    )
  }

  const updateComponent = () => {
    let vnode  = vm._render()
    vm._update(vnode)
  }

  new Watcher(vm, updateComponent)
}
