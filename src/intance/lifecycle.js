import { patch } from '../vdom/patch.js'
import Watcher from '../reactivity/watcher.js'

const lifecycleHooks = [
  'beforeCreated',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  // todo
  // activated, deactivated(keep-alive)
  'beforeDestroy',
  'destroyed',
]

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this
    const oldVnode = vm.$vnode

    // 如果oldVnode为空, 则代表是第一次初始化挂载, 此时$el为挂载容器
    // 以容器为比较对象(容器在patch内部会被初始化为空虚拟节点, 最终被新节点vnode替换)
    // 参见snabbdom patch源码
    console.log('patch被调用前')
    console.log('旧虚拟节点为: ')
    console.log(oldVnode)

    if (!oldVnode) {
      vm.$vnode = patch(vm.$el, vnode)
    } else {
      vm.$vnode = patch(oldVnode, vnode)
    }
    console.log('patch调用结束')
    console.log('新虚拟节点为')
    console.log(vm.$vnode)
    vm.callHook('updated')
  }

  Vue.prototype.callHook = function (hookName) {
    const vm = this
    const cbs = vm.hooks[hookName]

    for (let i = 0; i < cbs.length; i++) {
      cbs[i].call(vm)
    }
  }
}

export function mountComponent(vm, el) {
  console.log(vm.$options.render)
  vm.$el = el

  // 这个逻辑好像应该放到$mount当中
  if (!(vm.$options.template || el || vm.$options.el)) {
    console.log(
      `Failed to mount component: template or render function not defined`
    )
  }

  const updateComponent = () => {
    vm._update(vm._render())
  }

  new Watcher(vm, updateComponent, () => {
    vm.callHook('beforeUpdate')
  })

  vm.callHook('mounted')
}

export function initLifeCycle(vm) {
  const hooks = (vm.hooks = {
    beforeCreated: [],
    created: [],
    beforeMount: [],
    mounted: [],
    beforeUpdate: [],
    updated: [],
    beforeDestroy: [],
    destroyed: [],
  })

  let options = vm.$options

  for (const hookName of lifecycleHooks) {
    const currentHook = options[hookName]
    if (typeof currentHook === 'function') {
      hooks[hookName].push(currentHook)
    } else if (Array.isArray(currentHook)) {
      currentHook.forEach((hookHandler) => {
        hooks[hookName].push(hookHandler)
      })
    }
  }
  console.log(hooks)
}
