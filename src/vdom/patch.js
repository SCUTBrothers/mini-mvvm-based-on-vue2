export function patch(rootContainer, vnode) {
    let el = createElement(vnode)
    rootContainer.appendChild(el)
}

function createElement(vnode) {
    let { tag, data, children, text } = vnode
    
    if (tag) {
        vnode.el = document.createElement(tag)
        children.forEach(child => {
            vnode.el.appendChild(createElement(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }

    return vnode.el
}