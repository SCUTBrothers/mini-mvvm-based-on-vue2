import { isArray } from '../../utils/index.js'

/**
 * updateEventListeners
 * 
 * @param oldVnode: 旧的虚拟节点
 * @param vnode: 新的虚拟节点
 * 
 * 在该函数中, 具体处理逻辑如下
 *  1. oldVnode.data.on不为空, 即旧节点设置了事件监听, 
 *      on不为空, 也相应地说明了oldVnode.listener(一个包含有属性vnode指向其对应虚拟节点的回调函数handler)不为空
      1.1 vnode.data.on为空
        说明新虚拟节点没有设置事件, 使用for循环(for on[key])通过oldVnode.elm.removeEventListener(on[<event name>], listener)
        移除旧虚拟节点指向的元素(旧元素)相应事件的listener. 📑note: 所有事件的listener都是一个函数.
        * ? 暂时没有想明白为什么要移除旧虚拟节点对应的元素的回调函数, 毕竟旧虚拟节点被摧毁后, 它的元素也会去做销毁处理, 这样绑定的事件回调会自动消失的吧
      1.2 vnode.data.on不为空
        1.2.1 oldVnode.data.on = vnode.data.on
          直接返回
        1.2.1 oldVnode.data.on != vnode.data.on
          假设oldVnode.data.on的事件名keys数组 = A, 新虚拟节点vnode.data.on的事件名keys数组 = B
          记A - B为A对B的差集
          记B - A为B对A的差集
          将oldElm的A - B中事件的回调函数oldListener全部移除
        * * 记住, 这里不需要处理on[key]对应的回调函数, 因为回调函数listener(handle)自身有vnode属性, 可以从vnode.data.on中获取新vnode的on[key]新的的handler并触发
        * * 所有, 只需要专注于新旧节点on中不同的事件名即可
          
          复用oldListener, 并将其作为vnode.listener属性, 且将oldListener的vnode属性指向为新的vnode
          为B - A的事件添加回调函数listener, 指向为vnode.listener(实际上也就是更需了vnode属性的oldVnode)
        * * A和B的交集的事件名不需要添加回调函数, 因为两者交集的listener对应的是A中的oldListener, 而旧oldListener被复用(指针不变, 是同一个handler),
        * * 其vnode值更新了
        * ? 这里有点问题, 两者交集的listener指针相同, 但是回调函数的elm不一样吧, 一个是指向oldElm, 一个是指向新elm
          
 *  2. oldVnode.data.on为空
      2.1 vnode.data.on为空
        直接返回
      2.2 vnode.data.on不为空
        通过createListener创建一个新的listener, 并建立双向绑定vnode.listener, listener.vnode
 */
function updateEventListeners(oldVnode, vnode) {
  const oldOn = oldVnode.data.on
  const oldListener = oldVnode.listener
  const oldElm = oldVnode.elm
  // c = a && b相当于 c = a ? b : a
  const on = vnode && vnode.data.on
  const elm = vnode && vnode.elm

  // 如果两者on相同, 则代表
  // 1. oldVnode与新vnode相同, 至少我是这样认为的, 源码中说是为了复用
  // 2. oldOn = on = undefined
  if (oldOn === on) {
    return
  }

  if (oldOn && oldListener) {
    // * 如果on为空, 即新节点的没有事件, 那么就删除所有对应的的事件的listener
    // * 所有事件的listener, 如果有的话, 都是同一个具有vnode属性回调函数handler
    if (!on) {
      /**
       * * oldOn: {
       * *  <eventName>: <event callback>
       * * }
       *
       * * oldListener: oldOn指向的元素的回调函数handler, 该回调函数具有属性vnode,
       * * 值指向其绑定的vnode
       */
      for (let name in on) {
        oldElm.removeListener(name, oldListener)
      }
    } else {
      for (let name in oldOn) {
        // 如果on不为空, 则代表设置了新的事件
        // 遍历旧的事件集oldOn, 从其中删除on中没有的事件的oldListener
        // 📑 note: 这意味着oldOn和on相同事件名的oldListener会被保留,
        // 但是在后面的处理中, oldListener的vnode指向会重新赋值为新的vnode
        if (!on[name]) {
          oldElm.removeListener(name, oldListener)
        }
      }
    }
  }

  if (on) {
    // 复用原有的oldVnode的listener, 这没有什么问题, 因为listener实际上就是一个函数
    const listener = (vnode.listener = oldVnode.listener || createListener())
    // 更新listener指向的vnode为新的vnode
    listener.vnode = vnode

    if (!oldOn) {
      // 如果没有oldOn
      for (let name in on) {
        elm.addEventListener(name, listener, false)
      }
    } else {
      // 如果有oldOn
      for (let name in on) {
        // 为on中有的而oldOn中没有的添加回调函数listener
        // ? 这里对应注释中的问题, 我认为应该不需要加!oldOn[name]的判定, 将新的on中的所有事件进行事件绑定
        // ? 更进一步地, 不需要这个else
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false)
        }
      }
    }
  }
}

function createListener() {
  return function handler(event) {
    handleEvent(event, handler.vnode)
  }
}

function handleEvent(event, vnode) {
  // 判断事件类型, 根据事件类型去on中调用相应的
  const name = event.type
  const on = vnode.data.on

  // 如果on存在, 且on注册了(包含有键名)事件event.type
  if (on && on[name]) {
    invokeHandler(on[name], vnode, event)
  }
}

function invokeHandler(handler, vnode, event) {
  if (typeof handler === 'function') {
    // 原snabbdom中是handler.call(vnode, event, vnode)
    // 由于handler是methods当中获取, 而在initMethods的时候, 会进行handler.bind(vm)操作, 所以不需要.call
    handler(event, vnode)
  } else if (isArray(handler)) {
    // 如果handler为数组, 递归调用多个handler
    for (let i = 0; i < handler.length; i++) {
      invokeHandler(handler[i], vnode, event)
    }
  }
}

export const eventListenerModule = {
  // 在init.js中的createElement创建阶段, 调用create(emptyVnode, vnode), 传入空节点
  create: updateEventListeners,
  update: updateEventListeners,
  // destroy,
}
