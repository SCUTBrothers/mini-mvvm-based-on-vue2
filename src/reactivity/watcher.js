import { popTarget, pushTarget } from "./dep.js"

let id = 0

export default class Watcher {
    constructor(vm, fn, callback) {
    this.id = id++        
    console.log(`create watcher instance, id is ${this.id}, target is ${fn.name}`)

    this.getter = fn.bind(vm)
    this.get()
    }

    get() {
        console.log(`get method of watcher will execute next. (target of watcher is ${this.getter.name}), id is ${this.id}`)

        pushTarget(this)
        this.getter()
        popTarget(this)
    }

    update() {
       this.get() 
    }
}
