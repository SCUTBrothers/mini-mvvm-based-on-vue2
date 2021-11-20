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
      // 重新render的时候, 会调用计算属性, 发现脏值重新计算
      // evaluate先复制依赖和依赖的id, 这些依赖是计算属性依赖的那些普通属性
      // note: 计算属性不会去依赖其他计算属性的, 但是会调用它所依赖的其他计算属性. 然后假设其他计算属性
      //       是脏值, 这样会再调用它所属的watcher的evalute方法, pushTarget(watcher), 然后再popTarget(watcher)
      // 在调用evaluate的时候, 会在复制依赖之后, 清空watcher的依赖和依赖id
      // 然后再调用get方法, 去调用其计算属性的函数, 再调用它索依赖的计算属性的get函数, 以及响应式属性
      // 当响应式属性被调用(get)的时候, 会将计算属性watcher放入到dep的subs当中, 同时将dep放入到watcher的deps当中
      // 这些做完以后, watcher会有新的deps, 同时更新计算属性watcher的value值, 让它的dirty变为false
      // 然后popTarget(watcher)
      // 这样, 如果render函数调用了计算属性, 那么Dep.target会恢复到render watcher. 如果是其他计算属性调用了这个计算属性, 则其他计算属性在调用完
      // 这个计算属性之后, 会恢复到render watcher(因为watcher使用stack进行管理的)

      // 然后到最后, 会在下面的代码块当中判断Dep.target是否为空, render watcher存在的时候, Dep.target会指向这个render watcher
      // watcher.depend()的主要逻辑是循环遍历它的deps中的依赖(它所依赖的普通属性的dep), 然后将render watcher作为这些普通响应式属性的dep的subs
      // 由于普通属性的subs先添加计算属性watcher, 然后再添加render watcher
      // 所以当普通属性发生变化的时候, 会将它的subs当中的watcher进行update, 对于计算属性watcher, 将计算属性的值标记为脏值
      // 然后调用render watcher, render watcher会重新生成虚拟dom, 并重新绑定数据, 然后在重新绑定数据的时候, 会将标记为脏值的计算属性
      // 进行重新计算, 然后清除依赖
      watcher.evaluate()
      console.log(
        `计算属性watcher重新计算后: watcher deps长度为${watcher.deps.length}`
      )

      // 当watcher变为dirty的时候
      // 会
      if (Dep.target) {
        // 计算属性的依赖清除
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
  // watcher的对象配置属性
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
