/**
 * @param   sel: string | undefined
 * @param   data: any | undefined
 * @param   children: Array<VNode | string> | undefined
 * @param   text: string | undefined
 * @param   elm: Element | Text | undefinde
 *  
 * @returns VNode
    VNode {
    sel: string | undefined;
    data: VNodeData | undefined;
    children: Array<VNode | string> | undefined;
    elm: Node | undefined;
    text: string | undefined;
    key: Key | undefined;
    }

    VNodeData {
    props?: Props;
    attrs?: Attrs;
    class?: Classes;
    style?: VNodeStyle;
    dataset?: Dataset;
    on?: On;
    attachData?: AttachData;
    hook?: Hooks;
    key?: Key;
    ns?: string; // for SVGs
    fn?: () => VNode; // for thunks
    args?: any[]; // for thunks
    is?: string; // for custom elements v1
    [key: string]: any; // for any other 3rd party module
    }
 */
export function vnode(sel, data, children, text, elm) {
  const key = data === undefined ? undefined : data.key
  return { sel, data, children, text, elm, key }
}

// * 不同节点类型对应的vnode参数, 以及输出的vnode
/**
 * 1. 空节点emptyNodeAt(elm), init当中定义
 *  vnode(elmTag, {}, [], undefined, elm)
 * 2. 元素节点(data默认为{})
 *  2.1 包含子元素, 不包含内部文本, 对应h.js中的4, 5, 7, 8, 9
 *  vnode("div[#cotainer[.red]]", data = {}, children = [], string | undefined, elm)
 *  2.2 包含内部文本, 不包含子元素, 对应3, 6
 *  2.3 不包含子元素, 也不包含内部文本, 对应h.js中的1, 2
 * 3. 文本节点
 *  vnode(undefined, undefined, undefined, text, textElm)
 * 4. 注释节点
 *  vnode("!", {}, [], string | undefined, commentElm)
 * 5. 空节点
 *  vnode("", {}, [], undefined, node)
 *  最终会被转换为vnode.elm = createTextNode(undefined)的文本节点
 */
