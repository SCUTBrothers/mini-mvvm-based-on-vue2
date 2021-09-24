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
}

function initData(vm) {
  let data = vm.$options.data

  vm._data = data = data || {}

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
    get: () => {},
    set: () => {},
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
