import { popTarget, pushTarget } from './dep.js'

let id = 0

export default class Watcher {
  constructor(vm, fn, isComputed) {
    this.vm = vm
    this.id = id++
    console.log(
      `create watcher instance, id is ${this.id}, target is ${fn.name}`
    )
    this.dirty = true
    this.getter = fn
    this.isComputed = !!isComputed

    this.deps = []
    this.depIds = []
    if (!this.isComputed) {
      this.get()
    }
  }

  get() {
    console.log(
      `get method of watcher will execute next. (target of watcher is ${this.getter.name}), id is ${this.id}`
    )

    pushTarget(this)
    let result = this.getter.call(this.vm)
    popTarget(this)

    return result
  }

  update() {
    if (this.isComputed) {
      // 如果watcher是计算属性的watcher, 那么当它的update被调用的时候, 说明该计算属性依赖的普通属性值发生了变化
      // 此时仅标记它的值发生变化(dirty = true),
      // 当render函数调用计算属性的时候, 会发现该计算属性值发生改变, 则调用evaluate获取新值
      this.dirty = true
    } else {
      queueWatcher(this)
    }
  }

  run() {
    this.get()
  }

  evaluate() {
    console.log(`watcher.evalu被调用, 计算属性的值将重新进行计算`)
    let oldDeps = this.deps.slice()
    let oldDepIds = this.depIds.slice()
    this.deps = []
    this.depIds = []

    this.value = this.get()
    this.dirty = false
    this.cleanDeps(oldDeps, oldDepIds)
  }

  depend() {
    for (let i = this.deps.length - 1; i > -1; i--) {
      this.deps[i].depend()
    }
  }

  addDep(dep) {
    if (!this.hasDep(dep)) {
      this.deps.push(dep)
      this.depIds.push(dep.id)
    }
  }

  hasDep(dep) {
    return this.depIds.indexOf(dep.id) > -1
  }

  cleanDeps(oldDeps, oldDepIds) {
    /**
     * 获取旧依赖和新依赖的不同的部分,
     * 如old[a, b, c], new[a, e, f], 获取old与new的差集[b, c], 去到差集对应的依赖中,
     * 将其从依赖的subs中移除, 后续该属性更新的时候就不会通知旧依赖
     */
    const newDepIds = this.depIds

    for (let i = 0; i < oldDepIds.length; i++) {
      if (!newDepIds.includes(oldDepIds[i])) {
        oldDeps[i].removeSub(this)
      }
    }
  }
}

let queue = []
let pending = false
let has = {}
function queueWatcher(watcher) {
  if (has[watcher.id] == null) {
    queue.push(watcher)
    has[watcher.id] = true

    if (!pending) {
      setTimeout(() => {
        queue.forEach((watcher) => {
          watcher.run()
          queue = []
          has = {}
        })
        pending = false
      }, 0)

      pending = true
    }
  }
}
