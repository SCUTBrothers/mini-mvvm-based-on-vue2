import { isObject } from "../utils/index.js";
import { Dep } from "./dep.js";
import Watcher from "./watcher.js";

class Observer {
    constructor(value) {
        if (isObject(value)) {
            Object.defineProperty(value, "__ob__", {
                configurable: false,
                enumerable: false,
                writable: false,
                value: this
            })

            Object.keys(value).forEach(key => {
                defineReactive(value, key)
            })
        }

    }
}

function defineReactive(obj, key) {
    let value = obj[key]
    if (isObject(value)) observe(value)
    let dep = new Dep()

    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        set(newVal) {
            if (newVal === value) return
            if (isObject(newVal)) observe(newVal)
            value = newVal
            console.log(`key ${key} of value ${value} is be set: val ${value} -> newVal ${newVal}`) 
            console.log(`value of key ${key} is changed, and will notify deps next`)
            dep.notify()
        },
        get() {
            if (Dep.target) {
                console.log(`in key ${key} getter, add watcher ${Dep.target.id} to subs, watcher target is ${Dep.target.getter.name}, and will be notify to update later`)
                dep.depend()
            }
            return value
        }
    })
}


export function observe(value) {
    if (!isObject(value)) return
    
    return new Observer(value)
}