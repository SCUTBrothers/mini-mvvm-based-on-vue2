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
   * 从beginIdx开始, 将包含key的child转为键值对{key: i}加入到map中
   */
  function crateKeyToOldIdx(children, beginIdx, endIdx) {
    const map = {}
    for (let i = beginIdx; i <= endIdx; ++i) {
      const ke = children[i].key
      if (key !== undefined) {
        map[key] = i
      }
    }
    return map
  }

  function udpateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    // ! 重点, diffing算法, 比较子节点差异

    // * 新前, 新后, 旧前, 旧后
    let newStartIdx = 0
    let newEndIdx = newCh.length - 1
    let oldStartIdx = 0
    let oldEndIdx = oldCh.length - 1

    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]

    let oldKeyToIdx
    let idxInOld
    let elmToMove
    let before

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVnode == null) {
        // oldCh或newCh中可能会包含null,undefined值, 这种值直接跳过
        // 下面的else if 同理
        oldStartVnode = oldCh[++oldStartIdx]
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[++oldEndIdx]
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx]
      } else if (newEndVnode == null) {
        newEndVnode = newCh[++newEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // * 1 新前与旧前比较: 相同 (命中1)
        // ! 1, 2, 3, 4 只要命中一个, 其余都就不会处理, 如果没有命中, 则会向下去尝试其他命中
        // ! 命中后重新回到while循环开头
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // * 2 新后与旧后比较: 相同 (命中2)
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // * 3 新后与旧前比较: 相同 (命中3)
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        // * newEndVnode的**dom元素**要设置在**oldEndVnode**的elm dom节点前面,
        // * 因为顺序翻转了
        // * 注意不会oldStartVnode进行操作
        // * 因为没有必要, 操作dom即可. 然后改变oldStartIdx指针
        api.insertBefore(
          parentElm,
          oldStartVnode.elm,
          api.nextSibling(oldEndVnode.elm)
        )
        oldStartVnode = oldCh[++oldStartIdx]
        newEndIdx = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // * 新前与旧后比较: 相同 (命中4)
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        // * oldEndVnode.elm要设置在oldStartVnode.elm元素前面, 因为顺序翻转了
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // ! 四种都没有命中
        // * 使用循环, 去oldCh中查找到相同的节点, 然后提到newStartVnode的位置
        // * 新前与旧前命中, 前进
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        }
        // newStartVnode.key为undefined时, idxInOld也返回undefined
        idxInOld = oldKeyToIdx[newStartVnode.key]
        if (idxInOld === undefined) {
          // newNode <div key = "A"> , oldKeyToIdx当中没有这个key, 说明该元素是新元素
          // 插入到oldCh startVnode顶部
          // * 如果四种命中都没有成功,且没有key(如div), 那么认为newStartVnode是新元素
          // * 这是一个比较重要的点: 一个元素如果没有key,那么在四种命中都失败的情况下,
          // * 会被认为是新元素, 不会去复用oldCh当中, 可能与它相同的元素
          api.insertBefore(
            parentElm,
            createElm(newStartVnode, insertedVnodeQueue),
            oldStartVnode.elm
          )
        } else {
          // ! 如果有oldCh当中有对应的相同key的元素, 则尝试复用
          elmTomove = oldCh[idxInOld]
          if (elmTomove.sel !== newStartVnode.sel) {
            // sel(选择器不同), 则认为是不同的元素(即使key不同)
            // samevnode需要sel和key都相同
            api.insertBefore(
              parentElm,
              createElm(newStartVnode, insertedVnodeQueue),
              oldStartVnode.elm
            )
          } else {
            // 相同元素, 复用该元素. 将其移动到oldStartVnode的前面(即与newStartVnode对齐)
            patchVnode(elmTomove, newStartVnode, insertedVnodeQueue)
            // idxInOld可能处于oldStartIdx和oldEndIdx之间, 由于它已经移动了
            // 所以需要标记一下, 到时候跳过该节点
            oldCh[idxInOld] = undefined
            api.insertBefore(parentElm, elmTomove.elm, oldStartVnode.elm)
          }
        }
        // ! 更新newStartIdx指针
        newStartVnode = newCh[++newStartIdx]
      }
    }
    // while循环条件  oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx
    // 在whille循环条件不满足前:
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
      if (oldStartIdx > oldEndIdx) {
        // 如果 oldStartIdx > oldEndIdx, newStart <= newEndIdx
        // 那么代表newCh中, 还剩余有值是oldCh没有的, 其余部分都相同
        // * 因为只有水平相同, 或者翻转相同, 或者有key, idx才会同步前进, 而且方向都是向内

        // ? newCh[newEndIdx]为什么会为null ?
        // ? 不是在四种命中前, 会有undefined else if 判定吗?
        // * 我认为是不需要的
        before = newCh[newEndIdx + 1].elm
        // * 另外, 解释一下为何before是newCh[newEndIdx + 1]
        /**
         * 1. **oldCh的elm都是按照newCh的elm的顺序插入的**
         * 2. 无论是通过新前-旧前, 新后-旧后, 新后-旧前, 新前-旧后到达这一步, 然后newCh剩余部分元素
         *    结构如下:
         *    [...(匹配或翻转修改的部分), ...(头部newEndIdx+1, 其余匹配或翻转修改的部分)]
         *    [xxx(newStartIdx, newCh剩余的部分, newEndIdx)]
         * 3. 因为要保证newCh元素的顺序, 在oldCh, newCh长度均不为零的条件下(不为零才调用updateChildren函数),
         *    newEndIdx+1指向的元素必定update好了elm(before), 那么[xxx]就应该插入到newEndIdx+1指向的elm之前
         */

        // [a, b, c], [a, b, c, d] -> [] , [d]
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx)
      } else {
        // oldStartIdx <= oldEndIdx, newStartIdx > newEndIdx
        // * 此时oldCh当中有多余元素, 需要移除
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
      }
    }
  }

  /**
   * @param  {} parentElm: 父级dom元素
   * @param  {} before: 插入到parent.childNodes的某一个具体元素之前,
   * *                  如果before为null, 那么插入到parent子元素列表末尾
   * @param  {} vnodes: 虚拟节点列表
   * @param  {} startIdx: 从vnodes[startIdx]开始选取元素插入
   * @param  {} endIdx: 到达endIdx(包括endIdx)结束元素插入
   * @param  {} insertedVnodeQueue
   */
  function addVnodes(
    parentElm,
    before,
    vnodes,
    startIdx,
    endIdx,
    insertedVnodeQueue
  ) {
    for (; startIdx <= endIdx; startIdx++) {
      const ch = vnodes[startIdx]
      if (ch != null) {
        console.log(before)
        api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before)
      }
    }
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
    if (oldVnode === vnode) return

    // ! patchVnode只有在oldVnode和vnode(sameVnode)相同的时候才会被调用或递归调用

    // ! 注意要有这一步, 因为patch最终返回的是vnode
    // ! 如果没有这一步, 那么在下次patchVnode的时候, vnode上的elm为undefined
    const elm = (vnode.elm = oldVnode.elm)

    const oldCh = oldVnode.children
    const ch = vnode.children

    if (vnode.data !== undefined) {
      // * samevnode的两个vnode, 需要更新它们的data
      for (let i = 0; i < cbs.update.length; ++i) {
        // todo
        // cbs.udpate[i](oldVnode, vnode)
      }
    }

    // * 1.0 判断vnode是否有text属性
    if (vnode.text !== undefined) {
      // * 1.0 - yes: 说明oldVnode与vnode都是文本节点

      // 1.1 判断oldVnode和vnode的text是否不同
      if (oldVnode.text !== vnode.text) {
        // 1.1 - yes: 修改oldVnode指向的elm(文本dom节点)的文本内容(通过textContent或者nodeValue)
        //          不能使用innerText, 因为文本节点没有innerText属性

        elm.nodeValue = vnode.text
      } else {
        // 1.1 - no: 文本内容相同, 不用修改, 直接返回
      }
    } else if (oldCh && ch) {
      // ! oldVnode和vnode都具有children
      // 递归patchVnode, 比较子级的vnode和oldVnode
      if (oldCh !== ch) udpateChildren(elm, oldCh, ch, insertedVnodeQueue)
    } else if (ch !== undefined) {
      // oldCh = undefined, ch = [...]
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else {
      // oldCh = [...] | undefined, ch = undefined
      if (oldCh && oldCh.length !== 0) {
        // * 如果oldVnode.children不为空, 且长度不为0
        // * 有以下两种处理方法
        // ? 1. 将oldVnode的首层子节点的elm从oldVnode.elm中移除, 然后将oldVnode.children.length设置为0(清空children)
        // ? 2. 将oldVnode.elm从oldVnode.elm.parentNode当中整个移除, 然后createElm(vnode), 将vnode.elm推入到oldVnode.elm.parentNode当中
        // * 由于sameVnode的时候, 要保留oldVnode, 所以选用第1种方法
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
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
