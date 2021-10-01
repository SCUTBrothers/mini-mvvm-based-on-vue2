import { Dep } from './reactivity/dep.js'
import { observe } from './reactivity/observe.js'
import Watcher from './reactivity/watcher.js'

export function initState(vm) {
  const options = vm.$options

  if (options.data) {
    initData(vm)
  }
  if (options.computed) {
    initComputed(vm)
  }
  if (options.methods) {
    initMethods(vm)
  }
  if (options.watch) {
    initWatch(vm)
  }
}

const noop = () => {}

/**
 * data可能是函数, 或者是对象
 */
function initData(vm) {
  let data = vm.$options.data
  if (!data) return

  vm._data = data = typeof data == 'function' ? data() : data

  observe(vm._data)

  proxy(vm._data, vm)
}

function initComputed(vm) {
  let computed = vm.$options.computed

  const watchers = (vm._computedWatchers = {})

  for (let key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get

    watchers[key] = new Watcher(vm, getter, true)

    defineComputed(vm, key, userDef)
  }
}

function defineComputed(target, key, userDef) {
  const sharedPropertyDefinition = {
    configurable: true,
    enumerable: true,
    get: noop,
    set: noop,
  }

  if (typeof userDef == 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = userDef.set
  }

  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter(key) {
  return function () {
    const vm = this
    const watcher = vm._computedWatchers[key]

    if (watcher.dirty) {
      console.log(
        `计算属性watcher(计算属性名字为${key})重新计算前: watcher deps长度为${watcher.deps.length}`
      )
      watcher.evaluate()
      console.log(
        `计算属性watcher重新计算后: watcher deps长度为${watcher.deps.length}`
      )

      if (Dep.target) {
        watcher.depend()
        console.log(`watcher depend on ${Dep.target.getter.name}`)
      }
    }

    return watcher.value
  }
}

function proxy(target, receiver) {
  Object.keys(target).forEach((key) => {
    Object.defineProperty(receiver, key, {
      configure: true,
      enumerable: true,
      set(newVal) {
        if (target[key] === newVal) return
        target[key] = newVal
      },
      get() {
        return target[key]
      },
    })
  })
}

// methods定义的函数直接挂载到vm实例上
function initMethods(vm) {
  const methods = vm.$options.methods
  for (const key in methods) {
    vm[key] = methods == null ? noop : methods[key].bind(vm)
  }
}

function initWatch(vm) {
  const watchs = vm.$options.watch
  for (const key in watchs) {
    const handler = watchs[key]
    if (Array.isArray(handler)) {
      // watchTarget: [..., ..., ...(handlers)]
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler)
      }
    } else {
      // 字符串, 数组, 对象
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler, options = {}) {
  // watchTarget: {imediate: true, sync: true, handler: () => {...}, ...}
  if (typeof handler == 'object') {
    options = handler
    handler = handler.handler
  }
  if (typeof handler == 'string') {
    // watchTarget: "some method"
    handler = vm[handler]
  }
  return vm.$watch(key, handler, options)
}

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (expOrFn, cb, options = {}) {
    // 代表是用户watcher
    options.user = true
    const watcher = new Watcher(this, expOrFn, cb, options)

    if (options.immediate) {
      cb()
    }
  }
}
