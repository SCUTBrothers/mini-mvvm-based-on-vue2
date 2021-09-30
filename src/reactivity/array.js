const oldArrayProtoMethods = Array.prototype

export const arrayMethods = Object.create(oldArrayProtoMethods)

const methods = ['push', 'pop', 'splice', 'shift', 'unshift', 'reverse', 'sort']

methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    console.log(`in array methods, 数组方法${method}被调用了`)
    const result = oldArrayProtoMethods[method].apply(this, args)
    console.log(`in array methods, 数组为 ${this}`)
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
      case 'pop':
        this.__ob__.dep.notify()
        break
      default:
        break
    }
    if (inserted) {
      this.__ob__.observeArray(inserted)
      console.log(
        `数组方法被调用, 且插入了值, 通知更新, dep长度为 ${this.__ob__.dep.subs.length}`
      )
      this.__ob__.dep.notify()
    }

    return result
  }
})
