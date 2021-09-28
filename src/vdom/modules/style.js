function updateStyle(oldVnode, vnode) {
  const elm = vnode.elm
  let oldStyle = oldVnode.data.style
  let style = vnode.data.style

  if (!oldStyle && !style) return
  if (oldStyle === style) return
  oldStyle = oldStyle || {}
  style = style || {}

  for (let name in oldStyle) {
    if (!style[name]) {
      if (name[0] === '-' && name[1] === '-') {
        elm.style.rmeoveProperty(name)
      }
    } else {
      // oldStyle and style
      elm.style[name] = ''
    }
  }

  let cur
  for (let name in style) {
    cur = style[name]
    if (name !== 'remove' && cur !== oldStyle[name]) {
      if (name[0] == '-' && name[1] === '-') {
        elm.style.setProperty(name, cur)
      } else {
        elm.style[name] = cur
      }
    }
  }
}

export const styleModule = {
  create: updateStyle,
}
