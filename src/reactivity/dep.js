export class Dep {
    constructor() {
        this.subs = new Set()
    }

    depend() {
       this.subs.add(Dep.target ) 
    }

    notify() {
        console.log(`dep.subs的长度是${this.subs.length}`)
        this.subs.forEach(watcher => {
            watcher.update()
        })
    }
}

Dep.target = null

const watcherStack = []

export function pushTarget(watcher) {
   watcherStack.push(watcher) 
    Dep.target = watcher

    console.log(`watcher(id is ${watcher.id}) is be pushed into watcher stack, now, watcher stack length is ${watcherStack.length})`)
    console.log(`Dep.target now is watcher: ${Dep.target ? Dep.target.id : "null"}`)
}

export function popTarget() {
    watcherStack.pop()
    Dep.target = watcherStack[watcherStack.length - 1] || null
    console.log(`top of watcherStack has been poped, now, watcher stack lengt is ${watcherStack.length})`)
    console.log(`Dep.target now is watcher: ${Dep.target ? Dep.target.id : "null"}`)
} 