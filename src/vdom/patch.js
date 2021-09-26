export function patch(vm, newVNode) {
    // 判断是不是第一次挂载
    if (!vm.$vnode) {
        // 如果没有虚拟节点, 那么说明是第一次挂载, vm.$el指向root container (eg. #app)
        // 不比较新旧节点差异, 直接由newVNode生成element挂载到root container当中
        const el = createElement(newVNode)
        vm.$el.appendChild(el)

        vm.$el = el
        console.log(`第一次初始化时, el的parentNode为${vm.$el.parentNode}`)
        vm.$vnode = newVNode
    } else {
        const el = createElement(newVNode)
        let parentNode = vm.$el.parentNode
        parentNode.insertBefore(el, vm.$el.nextSibiling)
        parentNode.removeChild(vm.$el)

        vm.$el = el
        vm.$vnode = newVNode
    }
}

function createElement(vnode) {
    let { tag, data, children, text } = vnode
    
    if (tag) {
        vnode.el = document.createElement(tag)
        setAttributes(vnode.el, vnode.data)
        children.forEach(child => {
            vnode.el.appendChild(createElement(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }

    return vnode.el
}

function setAttributes(el, data) {
    for (const [key, value] of Object.entries(data)) {
        el.setAttribute(key, value)
    }
}