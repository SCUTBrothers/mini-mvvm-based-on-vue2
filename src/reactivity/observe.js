import { isObject } from '../utils/index.js'
import { arrayMethods } from './array.js'
import { Dep } from './dep.js'

class Observer {
  constructor(value) {
    this.walk(value)
  }

  walk(value) {
    if (isObject(value)) {
      Object.defineProperty(value, '__ob__', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: this,
      })

      if (Array.isArray(value)) {
        value.__proto__ = arrayMethods
        this.observeArray(value)
      } else {
        Object.keys(value).forEach((key) => {
          defineReactive(value, key)
        })
      }
    }
  }

  observeArray(value) {
    value.forEach((item) => {
      if (isObject(item)) {
        observe(item)
      }
    })
  }
}

function defineReactive(obj, key) {
  let dep = new Dep(key)

  let value = obj[key]
  if (isObject(value)) {
    observe(value)
    console.log(`called, typeof value is array? :${Array.isArray(value)}`)
    value.__ob__.dep = dep
  }

  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    set(newVal) {
      if (newVal === value) return
      if (isObject(newVal)) observe(newVal)
      value = newVal
      console.log(
        `key ${key} of value ${value} is be set: val ${value} -> newVal ${newVal}`
      )
      console.log(`value of key ${key} is changed, and will notify deps next`)
      dep.notify()
    },
    get() {
      if (Dep.target) {
        console.log(
          `in key ${key} getter, add watcher ${Dep.target.id} to subs, watcher target is ${Dep.target.getter.name}, and will be notify to update later`
        )
        dep.depend()
      }

      return value
    },
  })
}

export function observe(value) {
  if (!isObject(value)) return
  if (value.__ob__) return

  return new Observer(value)
}
