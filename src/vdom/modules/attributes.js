function updateAttrs(oldVnode, vnode) {
  const elm = vnode.elm
  let oldAttrs = oldVnode.data.attrs
  let attrs = vnode.data.attrs

  if (!oldAttrs && !attrs) return
  if (oldAttrs === attrs) return
  oldAttrs = oldAttrs || {}
  attrs = attrs || {}

  for (let key in attrs) {
    const cur = attrs[key]
    const old = oldAttrs[key]

    // ? 这里又是和props中一样, 不对old === cur的部分进行处理
    if (old !== cur) {
      if (cur === true) {
        elm.setAttribute(key, '')
      } else if (cur === false) {
        elm.removeAttribute(key)
      } else {
        elm.setAttribute(key, cur)
      }
    }

    // 移除oldAttrs和attrs的不同key
    for (let key in oldAttrs) {
      if (!(key in attrs)) {
        elm.removeAttribute(key)
      }
    }
  }
}

export const attributesModule = {
  create: updateAttrs,
  update: updateAttrs,
}
