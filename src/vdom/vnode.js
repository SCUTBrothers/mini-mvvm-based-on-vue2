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
  return { sel, data, children, elm, key }
}
