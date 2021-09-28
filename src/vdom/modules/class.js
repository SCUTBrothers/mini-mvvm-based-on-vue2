function updateClass(oldVnode, vnode) {
  const elm = vnode.elm
  let oldClass = oldVnode.data.class
  let klass = vnode.data.class
  console.log(oldVnode, vnode)

  if (!oldClass && !klass) return
  if (oldClass && klass) return
  oldClass = oldClass || {}
  klass = klass || {}

  // 移除oldClass - klass差集中的classname
  for (let name in oldClass) {
    // ? 这里为什么要用Obj.hasOwnPropertye.call ?
    // * 因为klass[name]可能为false, 而这里是为了判断, klass是否不含有这个属性
    if (oldClass[name] && !Object.prototype.hasOwnProperty.call(klass, name)) {
      elm.classList.remove(name)
    }
  }

  let cur
  for (let name in klass) {
    cur = klass[name]
    // 当klass[name]和oldClass[name]值不同时, 根据cur是true还是false来移除类
    if (cur !== oldClass[name]) [elm.classList[cur ? 'add' : 'remove'](name)]
  }
}

// 在init.js中的createElement创建阶段, 调用create(emptyVnode, vnode), 传入空节点
export const classModule = { create: updateClass, update: updateClass }
