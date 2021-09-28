import { isArray, isPrimitive } from '../utils/index.js'
import { htmlDomApi } from './htmldomapi.js'
import { vnode } from './vnode.js'

const emptyNode = vnode('', {}, [], undefined, undefined)
const hooks = ['create', 'update', 'remove', 'destory', 'pre', 'post']
/**
 * @param modules: module[]
 *  module: {
 *      create?: [],
 *      update?: [],
 *      remove?: [],
 *      destroy?: [],
 *      pre?: [],
 *      post?: [],
 * }
 *
 * todo
 * @param domApi
 */
export function init(modules, domApi) {
  const api = domApi ? domApi : htmlDomApi
  const cbs = {
    create: [],
    update: [],
    remove: [],
    destroy: [],
    pre: [],
    post: [],
  }

  // * 将模块集modules中每个module的hook, 推入相应到cbs.<hook>中, 待后面每个阶段调用
  for (const hook of hooks) {
    for (const module of modules) {
      const currentHook = module[hook]
      if (currentHook !== undefined) {
        cbs[hook].push(currentHook)
      }
    }
  }

  /**
   * createElm: 将vnode转为真实dom元素
   * @param insertedVnodeQueue 暂时没有什么作用
   */
  function createElm(vnode, insertedVnodeQueue) {
    // let data = vnode.data
    const children = vnode.children
    const sel = vnode.sel

    if (sel === '!') {
      // 创建注释节点
      if (vnode.text === undefined) {
        vnode.text = ''
      }
      // 创建空的注释节点, 并且将其作为vnode.elm(虚拟节点对应真实元素)的指向
      vnode.elm = api.createComment(vnode.text)
    } else if (sel !== undefined) {
      // * 解析选择器
      // sel !== undefined的时候, sel可能为
      // 1. div
      // 2. div#container.red
      // 3. div.red.center

      // 判定是否含有id选择器及其位置
      const hashIdx = sel.indexOf('#')
      // 判定是否含有类选择器及其位置
      const dotIdx = sel.indexOf('.', hashIdx) // indexOf(searchValue[, fromIndex]), fromIndex开始查找的位置
      const hash = hashIdx > 0 ? hashIdx : sel.length
      const dot = dotIdx > 0 ? dotIdx : sel.length
      // 从最近的位置截取得到tag
      const tag =
        hashIdx !== -1 || dotIdx !== -1
          ? sel.slice(0, Math.min(hash, dot))
          : sel

      // * 根据标签tag创建元素, 并让vnode.elm指向该元素
      // ? 暂时不考虑vnode.data
      const elm = (vnode.elm = api.createElement(tag))
      if (hash < dot) elm.setAttribute('id', sel.slice(has + 1, dot))
      // * 将".red.center"解析为"red center", 并设置给elm的class属性
      if (dotIdx > 0)
        elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '))

      // ! 元素初始化完成阶段, 触发create钩子函数集
      for (let i = 0; i < cbs.create.length; i++)
        cbs.create[i](emptyNode, vnode)
      // * 如果该虚拟节点还包含有子虚拟节点, 则递归解析, 推入其对应的元素节点的子节点列表当中
      if (isArray(children)) {
        for (let i = 0; i < children.length; i++) {
          const ch = children[i]
          api.appendChild(elm, createElm(ch, insertedVnodeQueue))
        }
      } else if (isPrimitive(vnode.text)) {
        // * 包含内部文本, 不包含子元素
        api.appendChild(elm, api.createTextNode(vnode.text))
      }
    } else {
      // 通常来说空虚拟节点emptyNode并不会走到这里, 它会作为create钩子函数的参数
      // 文本虚拟节点在这里处理
      vnode.elm = api.createTextNode(vnode.text)
    }

    return vnode.elm
  }

  /**
   * @param parentElm: Element 真实dom元素节点, 为vnodes的指向的elm的parentNode
   * @param vnodes: vnode[]
   * @param startIdx
   * @param endIdx
   */
  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; startIdx++) {
      const ch = vnodes[startIdx]
      if (ch != null) {
        if (ch.sel !== undefined) {
          // todo 移除元素节点的逻辑, 需要调用hooks和hooks中的remove等
          api.removeChild(parentElm, ch.elm)
        } else {
          api.removeChild(parentElm, ch.elm)
        }
      }
    }
  }

  function emptyNodeAt(elm) {
    const id = elm.id ? '#' + elm.id : ''

    const classes = elm.getAttribute('class')

    const c = classes ? '.' + classes.split(' ').join('.') : ''

    return vnode(
      api.tagName(elm).toLowerCase() + id + c,
      {},
      [],
      undefined,
      elm
    )
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
    let parent = oldVnode.elm.parentElement
    vnode.elm = oldVnode.elm

    if (oldVnode.children && vnode.children) {
      let oldC
      let c
      for (let i = 0; i < oldVnode.children.length; i++) {
        oldC = oldVnode.children[i]
        c = vnode.children[i]
        patchVnode(oldC, c)
      }
    }

    if (oldVnode.sel === undefined && vnode.sel == undefined) {
      if (oldVnode.text != vnode.text) {
        // 如果两者文本不同
        // * 1. 创建一个新的dom文本节点, 并且让vnode(文本虚拟节点)的elm指向该节点
        // ! 这个很重要, 因为此时vnode.elm还指向oldVnode.elm, 该元素会在第5步被移除
        // ! 如果不更新, 那么在移除以后, vnode.elm的将指向旧的elm, 且parentElement为空
        // ! 在下次patchVnode的时候, 该vnode作为oldVnode, 无法进入到第4步
        // ! 而按照逻辑, 它指向新的textNode, 则会保留旧elm的parentElement的指针, parent就不会为null
        let textNode = api.createTextNode(vnode.text)
        vnode.elm = textNode
        // * 2 获取旧虚拟节点的指向的元素
        let oldTextNode = oldVnode.elm
        // * 3 获取旧元素指向的元素的父元素
        let parent = oldTextNode.parentElement
        if (parent !== null) {
          // * 4 将新元素textNode插入到parent当中
          api.insertBefore(parent, textNode, oldTextNode)
          // * 5 将旧元素的elm从parent中移除, 移除后, elm的parentElement = parentNode = null
          api.removeChild(parent, oldTextNode)
        }
      }
    }
  }

  return function patch(oldVnode, vnode) {
    console.log('patch被调用')
    const insertedVnodeQueue = []

    for (let i = 0; i < cbs.pre.length; i++) cbs.pre[i]()

    if (!isVnode(oldVnode)) {
      /**
       * 如果旧节点不是虚拟节点, 如patch(container, vnode), container是dom元素, 不是虚拟节点,
       * 通基于元素标签,类,id, 创建一个空的指向该元素的虚拟节点
       * 通常这种情况出现在patch(container, vnode)进行挂载初始化的情况下
       * ? 文本节点的tagName是text吗? 答, 文本节点的nodeTagName是"#text", 元素节点的nodeTagName是标签的大写
       */
      oldVnode = emptyNodeAt(oldVnode)
    }

    if (sameVnode(oldVnode, vnode)) {
      // todo
      patchVnode(oldVnode, vnode, insertedVnodeQueue)
    } else {
      // * 如果不是同一个虚拟节点, 那么暴力删除
      // 先基于新的vnode, 为它创建一个elm作为它的vnode.elm的指向
      createElm(vnode, insertedVnodeQueue)
      let elm = oldVnode.elm
      let parent = api.parentNode(elm)
      if (parent !== null) {
        api.insertBefore(parent, vnode.elm, api.nextSibling(elm))
        removeVnodes(parent, [oldVnode], 0, 0)
      }
    }

    return vnode
  }
}

// 文本虚拟节点的sel属性为undefined
function isVnode(vnode) {
  return vnode.sel !== undefined
}

// todo
function sameVnode(vnode1, vnode2) {
  return vnode1.sel === vnode2.sel && vnode1.key === vnode2.key
}

// todo
function createKeyToOldIdx(children, beginIdx, endIdx) {}
