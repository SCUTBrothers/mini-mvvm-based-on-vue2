import { observe } from "./reactivity/observe.js"

export function initState(vm) {
    const options = vm.$options

    if (options.data) {
        initData(vm)
    }
}

function initData(vm) {
    let data = vm.$options.data
    
    vm._data = data  = data || {}

    observe(vm._data)

    proxy(vm._data, vm)
}

function proxy(target, receiver) {
    Object.keys(target).forEach(key => {
        Object.defineProperty(receiver, key,{
            configure: true,
            enumerable: true,
            set(newVal) {
                if (target[key] === newVal) return
                target[key] = newVal
            },
            get() {
                return target[key]
            }
        })
    })
}