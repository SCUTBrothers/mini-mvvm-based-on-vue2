let id = 0
export class Dep {
  constructor(name) {
    this.id = id++
    this.subs = new Set()
    this.name = name || ''
  }

  depend() {
    const watcher = Dep.target
    watcher.addDep(this)
    this.addSub(watcher)
  }

  addSub(watcher) {
    this.subs.add(watcher)
  }

  removeSub(watcher) {
    console.log(`removeSub called`)
    this.subs.delete(watcher)
  }

  notify() {
    console.log(`dep.subs的长度是${this.subs.length}`)
    this.subs.forEach((watcher) => {
      watcher.update()
    })
  }
}

Dep.target = null

const watcherStack = []

export function pushTarget(watcher) {
  watcherStack.push(watcher)
  Dep.target = watcher

  console.log(
    `watcher(id is ${watcher.id}) is be pushed into watcher stack, now, watcher stack length is ${watcherStack.length})`
  )
  console.log(
    `Dep.target now is watcher: ${Dep.target ? Dep.target.id : 'null'}`
  )
}

export function popTarget() {
  watcherStack.pop()
  Dep.target = watcherStack[watcherStack.length - 1] || null
  console.log(
    `top of watcherStack has been poped, now, watcher stack lengt is ${watcherStack.length})`
  )
  console.log(
    `Dep.target now is watcher: ${Dep.target ? Dep.target.id : 'null'}`
  )
}
