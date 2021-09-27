import { isArray, isPrimitive } from '../utils/index.js'
import { vnode } from './vnode.js'
/**
 * @param sel: string,
 * @param b?: VNodeData | null or VNodeChildren (2 param)
 * @param c?: VNodeChildren
 * example:
 *  ! 1个参数
 *  1. 不包含有属性, 内部文本和子元素的元素节点
    h(
        'div',
    )

*   ! 2个参数
    2. 不包含内部文本和子元素, 包含属性的元素节点
    h(
        "div",
        { id: 'article', class: 'center' },
    )

    3. 不包含属性和子元素, 包含内部文本的元素节点
    h(
        "div",
        "some text"
    )


    4. 不包含属性和内部文本, 包含单个子元素的元素节点
    h(
        "div",
        h('h1', { class: 'title' }, 'charpter1')
    )

    5. 不包含属性和内部文本, 包含多个子元素的元素节点
    h(
        "div",
        [
            "some text",
            h('h1', { class: 'title' }, 'charpter1')
        ]
    )

*   ! 3个参数
    6. 包含属性和内部文本的元素节点
    h(
        "div",
        { id: 'article', class: 'center' },
        'some text',
    )

    7. 包含一个子元素且带有属性的元素节点, 如果一个元素中只包含一个元素节点, 应该这样指定
    h(
        "div",
        { id: 'article', class: 'center' },
        h('h1', { class: 'title' }, 'charpter1')
    )

    8. 包含属性, 多个子元素的元素节点, 如果一个元素中包含其他元素节点或者文本节点, 应该这样指定
    h(
        "div",
        { id: 'article', class: 'center' },
        [
            'some text',
        ]
    )

    9. 包含属性, 多个子元素的元素节点, 如果一个元素中包含其他元素节点或者文本节点, 应该这样指定
    h(
        "div",
        [
            "some text",
            h('h1', { class: 'title' }, 'charpter1')
        ]
    )

 */
export function h(sel, b, ...c) {
  let data = {}
  let children
  let text
  let i

  if (c !== undefined) {
    // * 3个参数的情况, data  = b
    if (b !== null) {
      data = b
    }
    if (isArray(c)) {
      // 8, 9. 子元素
      children = c
    } else if (isPrimitive(c)) {
      // 6. 内部文本
      text = c.toString
    } else if (c && c.sel) {
      // 7. 如果c是对象, 且具有sel属性(代表是vnode)
      children = [c]
    }
  } else if (b !== undefined && b !== null) {
    // * 2个参数的情况, b对应为data或者children
    if (isArray(b)) {
      // 5. 不包含属性和内部文本, 包含多个子元素的元素节点
      children = b
    } else if (isPrimitive(b)) {
      // 3. 不包含属性和子元素, 包含内部文本的元素节点
      text = b.toString
    } else if (b && b.sel) {
      // 4. 不包含属性和内部文本, 包含单个子元素的元素节点
      // 如果是对象且具有.sel属性, 则代表b为vnode
      children = [b]
    } else {
      // 2. 不包含内部文本和子元素, 包含属性的元素节点
      // 如果不具有sel属性, 则代表b为data
      data = b
    }
  }

  if (children !== undefined) {
    // 如果包含有子元素
    for (i = 0; i < children.length; i++) {
      if (isPrimitive(children[i])) {
        // 如果子元素是字符串或者数字, 则将其转为
        children[i] = vnode(
          undefined,
          undefined,
          undefined,
          children[i],
          undefined
        )
      }
    }
  }
  // note: 如果children为undefined, 且text有值的话, 那么text是元素节点的内部文本(首个文本节点), 或者文本节点的内部文本
  return vnode(sel, data, children, text, undefined)
}
