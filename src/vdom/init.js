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
          if (isArray(ch) && ch._isVList) {
            console.log(ch)
            // ! 注意: 如果是v-for生成的vnode, 那么ch不是vnode, 而是vnode数组, [vnode0, vnode1, ...]
            for (let j = 0; j < ch.length; j++) {
              api.appendChild(elm, createElm(ch[j], insertedVnodeQueue))
            }
          } else {
            api.appendChild(elm, createElm(ch, insertedVnodeQueue))
          }
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
    // ! patchVnode只有在oldVnode和vnode(sameVnode)相同的时候才会被调用或递归调用

    // ! 注意要有这一步, 因为patch最终返回的是vnode
    // ! 如果没有这一步, 那么在下次patchVnode的时候, vnode上的elm为undefined
    vnode.elm = oldVnode.elm
    // * 1.0 判断vnode是否有text属性
    if (vnode.text) {
      // * 1.0 - yes: 说明oldVnode与vnode都是文本节点

      // 1.1 判断oldVnode和vnode的text是否不同
      if (oldVnode.text !== vnode.text) {
        // 1.1 - yes: 修改oldVnode指向的elm(文本dom节点)的文本内容(通过textContent或者nodeValue)
        //          不能使用innerText, 因为文本节点没有innerText属性

        oldVnode.elm.nodeValue = vnode.text
      } else {
        // 1.1 - no: 文本内容相同, 不用修改, 直接返回
      }
    } else if (vnode.children) {
      // * 拥有children的新虚拟元素节点vnode
      if (!oldVnode.children) {
        // oldVnode没有children, 将vnode的children作为oldVnode的children
        // 保留oldVnode(因为oldVnode和vnode sameVnode判定为true, 所以不能摧毁oldVnode),
        // 初始化oldVnode的children.通过createElm将vnode及其子节点转为带有elm的vnode
        // append vnode**首层**子节点vnode的elm到oldVnode.elm的子节点当中
        oldVnode.children = []
        vnode = createElm(vnode, insertedVnodeQueue)
        vnode.children.forEach((c) => {
          oldVnode.children.push(c)
          oldVnode.elm.appendChild(c)
        })
      } else {
        // oldVnode有children
        // 保留oldVnode指向的elm, 并将其赋值给vnode. 仅处理其子节点
        vnode.elm = oldVnode.elm
        // 递归patchVnode, 比较子级的vnode和oldVnode
        let oldVnodeChildren = oldVnode.children
        let vnodeChildren = vnode.children

        let oldCh
        let ch
        for (let i = 0, l = oldVnodeChildren.length; i < l; i++) {
          oldCh = oldVnodeChildren[i]
          ch = vnodeChildren[i]
          if (sameVnode(oldCh, ch)) {
            patchVnode(oldCh, ch)
          } else {
            // 两个节点不同, 不应递归调用patchVnode, 而是直接移除替换
            // 生成带elm的vnode
            createElm(ch, insertedVnodeQueue)

            let parent = oldCh.elm.parentNode
            if (parent != null) {
              // 通常来说, 程序逻辑正确的话, parent是不等于null的
              api.insertBefore(parent, ch.elm, oldCh.elm)
              removeVnodes(parent, [oldCh], 0, 0)
            }
          }
        }
        return vnode
      }
    } else {
      // * children为undefined的虚拟元素节点vnode
      if (
        !oldVnode.children ||
        (oldVnode.children && oldVnode.children.length === 0)
      ) {
        // * 如果oldVnode.children也为空,或者children长度为0, 则直接返回
        // todo 这里没有涉及比较oldVnode.data和vnode.data的逻辑
      } else {
        // * 如果oldVnode.children不为空, 且长度不为0
        // * 有以下两种处理方法(暂不考虑data)
        // ? 1. 将oldVnode的首层子节点的elm从oldVnode.elm中移除, 然后将oldVnode.children.length设置为0(清空children)
        // ? 2. 将oldVnode.elm从oldVnode.elm.parentNode当中整个移除, 然后createElm(vnode), 将vnode.elm推入到oldVnode.elm.parentNode当中
        // * 由于sameVnode的时候, 要保留oldVnode, 所以选用第1种方法
        let parent = oldVnode.elm
        removeVnodes(parent, oldVnode.children, 0, oldVnode.children.length - 1)
        oldVnode.children.length = 0
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
  // ? 当vnode1和vnode2的标签相同, key都为undefined, 这里也返回true
  return vnode1.sel === vnode2.sel && vnode1.key === vnode2.key
}

// todo
function createKeyToOldIdx(children, beginIdx, endIdx) {}
